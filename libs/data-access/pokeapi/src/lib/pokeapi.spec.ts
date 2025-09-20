import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  getPokemon,
  getSpecies,
  listSpeciesPage,
  getEvolutionChain,
  imageUrlForSpecies,
  officialArtworkUrlForSpecies,
  placeholderSilhouetteUrl,
} from './pokeapi';

const originalFetch = global.fetch;

function responseOf(data: any, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  } as any;
}

describe('pokeapi data-access', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it('getPokemon maps and validates', async () => {
    (global as any).fetch = vi.fn().mockResolvedValueOnce(responseOf({
      id: 25,
      name: 'pikachu',
      types: [{ type: { name: 'electric' } }],
      stats: [
        { stat: { name: 'hp' }, base_stat: 35 },
        { stat: { name: 'attack' }, base_stat: 55 },
      ],
    }));
    const p = await getPokemon({ speciesId: 25 });
    expect(p.name).toBe('pikachu');
    expect(p.types).toContain('electric');
  });

  it('getSpecies maps english flavor text', async () => {
    (global as any).fetch = vi.fn().mockResolvedValueOnce(responseOf({
      gender_rate: 4,
      flavor_text_entries: [
        { flavor_text: 'Desc ES', language: { name: 'es' } },
        { flavor_text: 'Electric mouse.', language: { name: 'en' } },
      ],
    }));
    const s = await getSpecies({ speciesId: 25 });
    expect(s.description).toContain('Electric');
    expect(s.genderRate).toBe(4);
  });

  it('listSpeciesPage maps results to entries', async () => {
    (global as any).fetch = vi.fn().mockResolvedValueOnce(responseOf({
      results: [
        { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
        { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
      ],
    }));
    const page = await listSpeciesPage({ limit: 2, offset: 0 });
    expect(page.entries.length).toBe(2);
    expect(page.entries[0].speciesId).toBe(1);
  });

  it('getEvolutionChain builds chain', async () => {
    (global as any).fetch = vi
      .fn()
      // species response
      .mockResolvedValueOnce(responseOf({ evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/1/' } }))
      // chain response
      .mockResolvedValueOnce(
        responseOf({
          chain: {
            species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
            evolves_to: [
              {
                species: { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon-species/2/' },
                evolves_to: [],
                evolution_details: [{ trigger: { name: 'level-up' } }],
              },
            ],
            evolution_details: [],
          },
        }),
      );
    const evo = await getEvolutionChain({ speciesId: 1 });
    expect(evo.chain[0].children?.[0].speciesId).toBe(2);
  });

  it('image helpers produce urls', () => {
    expect(imageUrlForSpecies(1)).toContain('/dream-world/1.svg');
    expect(officialArtworkUrlForSpecies(1)).toContain('/official-artwork/1.png');
    expect(placeholderSilhouetteUrl()).toContain('/pokemon/0.png');
  });
});
