import { LRUCache } from 'lru-cache';
import { z } from 'zod';
import {
  EvolutionChainSchema,
  PokemonDetailsSchema,
  SpeciesMetaSchema,
  SpeciesPageEntrySchema,
  SpeciesPageSchema,
  PageInfoSchema,
  type PokemonDetails,
  type SpeciesMeta,
  type EvolutionChain,
  type ListSpeciesArgs,
} from '@scdevelop/models';

// Basic token bucket limiter
class TokenBucket {
  private capacity: number;
  private tokens: number;
  private refillRatePerSec: number;
  private lastRefill: number;

  constructor(capacity: number, refillPerSec: number) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRatePerSec = refillPerSec;
    this.lastRefill = Date.now();
  }

  async take(): Promise<void> {
    this.refill();
    while (this.tokens < 1) {
      const waitMs = 50;
      await new Promise((r) => setTimeout(r, waitMs));
      this.refill();
    }
    this.tokens -= 1;
  }

  private refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    if (elapsed <= 0) return;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillRatePerSec);
    this.lastRefill = now;
  }
}

// Retry with exponential backoff and jitter
async function retry<T>(fn: () => Promise<T>, attempts = 3, baseMs = 150): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i === attempts - 1) break;
      const jitter = Math.floor(Math.random() * baseMs);
      const delay = baseMs * 2 ** i + jitter;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

type CacheEntry<T> = { data: T; staleAt: number };

const defaultTtlMs = 120_000; // 2 minutes

const cache = new LRUCache<string, CacheEntry<unknown>>({
  max: 500,
  ttl: defaultTtlMs,
});

const limiter = new TokenBucket(10, 5); // burst 10, avg 5 rps

const BASE = 'https://pokeapi.co/api/v2';

function cacheKey(url: string): string {
  return url;
}

async function doFetchJson(url: string): Promise<unknown> {
  await limiter.take();
  return retry(async () => {
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (res.status === 404) throw Object.assign(new Error('NotFound'), { code: 'NotFound', status: 404 });
    if (!res.ok) throw Object.assign(new Error(`Upstream ${res.status}`), { code: 'UpstreamError', status: res.status });
    return res.json();
  });
}

function setCache<T>(key: string, value: T, ttlMs: number = defaultTtlMs) {
  cache.set(key, { data: value, staleAt: Date.now() + ttlMs }, { ttl: ttlMs });
}

function getCache<T>(key: string): T | undefined {
  const c = cache.get(key) as CacheEntry<T> | undefined;
  if (!c) return undefined;
  if (Date.now() > c.staleAt) return undefined;
  return c.data;
}

// Image helpers
export function imageUrlForSpecies(speciesId: number): string {
  // Prefer dream-world when known to exist; we keep deterministic choice for now
  // Consumers can attempt to load dream-world first and fall back to official-artwork
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${speciesId}.svg`;
}

export function officialArtworkUrlForSpecies(speciesId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${speciesId}.png`;
}

export function placeholderSilhouetteUrl(): string {
  // Neutral silhouette asset (public domain placeholder)
  return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';
}

export async function getPokemon(args: { speciesId: number }): Promise<PokemonDetails> {
  const url = `${BASE}/pokemon/${args.speciesId}`;
  const key = cacheKey(url);
  const hit = getCache<PokemonDetails>(key);
  if (hit) return hit;

  const raw = await doFetchJson(url);
  // Map PokeAPI pokemon payload to our PokemonDetails
  const schema = z.object({
    id: z.number().int().positive(),
    name: z.string(),
    types: z.array(z.object({ type: z.object({ name: z.string() }) })),
    stats: z.array(
      z.object({
        stat: z.object({ name: z.string() }),
        base_stat: z.number().int().nonnegative(),
      }),
    ),
    sprites: z.object({ other: z.any() }).optional(),
  });
  const parsed = schema.parse(raw);

  const details: PokemonDetails = PokemonDetailsSchema.parse({
    speciesId: parsed.id,
    number: parsed.id,
    name: parsed.name,
    types: parsed.types.map((t) => t.type.name) as PokemonDetails['types'],
    artworkUrl: imageUrlForSpecies(parsed.id),
    stats: parsed.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
  });
  setCache(key, details);
  return details;
}

export async function getSpecies(args: { speciesId: number }): Promise<SpeciesMeta> {
  const url = `${BASE}/pokemon-species/${args.speciesId}`;
  const key = cacheKey(url);
  const hit = getCache<SpeciesMeta>(key);
  if (hit) return hit;

  const raw = await doFetchJson(url);
  const schema = z.object({
    gender_rate: z.number(),
    flavor_text_entries: z.array(
      z.object({ flavor_text: z.string(), language: z.object({ name: z.string() }) }),
    ),
  });
  const parsed = schema.parse(raw);
  const english = parsed.flavor_text_entries.find((e) => e.language.name === 'en');
  const meta: SpeciesMeta = SpeciesMetaSchema.parse({
    description: (english?.flavor_text || '').replace(/\s+/g, ' ').trim(),
    genderRate: parsed.gender_rate,
  });
  setCache(key, meta, 300_000);
  return meta;
}

export async function listSpeciesPage(args: ListSpeciesArgs = {}): Promise<z.infer<typeof SpeciesPageSchema>> {
  const limit = args.limit ?? 20;
  const offset = args.offset ?? 0;
  const page = PageInfoSchema.parse({ limit, offset });

  const url = `${BASE}/pokemon?limit=${page.limit}&offset=${page.offset || 0}`;
  const key = cacheKey(url);
  const hit = getCache<z.infer<typeof SpeciesPageSchema>>(key);
  if (hit) return hit;

  const raw = await doFetchJson(url);
  const schema = z.object({
    results: z.array(z.object({ name: z.string(), url: z.string().url() })),
  });
  const parsed = schema.parse(raw);
  const entries = parsed.results.map((r) => {
    const match = r.url.match(/\/pokemon\/(\d+)\/?$/);
    if (!match) {
      throw Object.assign(new Error(`ValidationError: unable to extract speciesId from url: ${r.url}`), {
        code: 'ValidationError',
        status: 502,
      });
    }
    const id = Number(match[1]);
    return SpeciesPageEntrySchema.parse({
      speciesId: id,
      number: id,
      name: r.name,
      types: [],
      artworkUrl: imageUrlForSpecies(id),
    });
  });
  const value = SpeciesPageSchema.parse({ entries, page });
  setCache(key, value);
  return value;
}

export async function getEvolutionChain(args: { speciesId: number }): Promise<EvolutionChain> {
  // First fetch species to get evolution chain URL
  const speciesRaw = await doFetchJson(`${BASE}/pokemon-species/${args.speciesId}`);
  const speciesSchema = z.object({ evolution_chain: z.object({ url: z.string().url() }) });
  const speciesParsed = speciesSchema.parse(speciesRaw);
  const evoUrl = speciesParsed.evolution_chain.url;

  const key = cacheKey(evoUrl);
  const hit = getCache<EvolutionChain>(key);
  if (hit) return hit;

  const raw = await doFetchJson(evoUrl);
  const schema = z.object({
    chain: z.object({
      species: z.object({ name: z.string(), url: z.string().url() }),
      evolves_to: z.array(z.any()),
      evolution_details: z.array(z.object({ trigger: z.object({ name: z.string() }).optional() })).optional(),
    }),
  });
  const parsed = schema.parse(raw);

  function mapNode(node: any): { speciesId: number; name: string; trigger?: string; children?: ReturnType<typeof mapNode>[] } {
    const idMatch = node.species.url.match(/\/pokemon-species\/(\d+)\/?$/);
    if (!idMatch) {
      throw Object.assign(new Error(`ValidationError: unable to extract speciesId from url: ${node.species.url}`), {
        code: 'ValidationError',
        status: 502,
      });
    }
    const id = Number(idMatch[1]);
    const children = (node.evolves_to || []).map(mapNode);
    const trig = node.evolution_details?.[0]?.trigger?.name;
    return { speciesId: id, name: node.species.name, trigger: trig, children };
  }

  const chain = [mapNode(parsed.chain)];
  const value = EvolutionChainSchema.parse({ chain });
  setCache(key, value, 300_000);
  return value;
}

export const PokeApi = {
  getPokemon,
  getSpecies,
  listSpeciesPage,
  getEvolutionChain,
};

