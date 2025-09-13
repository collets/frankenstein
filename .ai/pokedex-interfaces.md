# Pokedex Interfaces (Pseudo-code)

This file enumerates the planned interfaces for shared models, zod validation schemas, and data-access services. Names and shapes aim to align with `.ai/pokedex-frontend.md` contracts and `.ai/pokedex-dynamodb-model.md`.

Note: Types shown in TypeScript-like pseudo-code; schemas shown as zod-like signatures.

## Models (shared)

```ts
// Core domain
export type PokemonType =
  | 'normal' | 'fire' | 'water' | 'grass' | 'electric' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic'
  | 'bug' | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

export interface StatValue { name: string; value: number; }

export interface PokemonSummary {
  speciesId: number;
  number: number;
  name: string;
  types: PokemonType[];
  artworkUrl: string;
}

export interface PokemonDetails extends PokemonSummary {
  stats: StatValue[];
}

export interface SpeciesMeta { description: string; genderRate: number; }

export interface EvolutionNode {
  speciesId: number;
  name: string;
  trigger?: string;
  children?: EvolutionNode[];
}

export interface EvolutionChain { chain: EvolutionNode[]; }

// User-centric
export interface SquadSlot extends PokemonSummary { slot: 1|2|3|4|5|6; }

export interface BoxEntry extends PokemonSummary {
  id: string;      // entryId (ULID/KSUID)
  addedAt: string; // ISO
}

export interface DexStatus {
  speciesId: number;
  seen: boolean;
  caught: boolean;
  seenAt?: string;
  caughtAt?: string;
}

export interface SessionInfo {
  userId: string | null;
  isGuest: boolean;
}

export interface PageInfo {
  limit: number;
  offset?: number;
  cursor?: string;
}

export interface Filters {
  types?: PokemonType[];
  generations?: number[];
  sort?: 'name'|'number'|'type'|'generation'|'stats';
}
```

## Zod Schemas (signatures)

```ts
// From PokeAPI
export const PokemonSchema: z.ZodType<PokemonDetails>;
export const SpeciesSchema: z.ZodType<SpeciesMeta>;
export const EvolutionChainSchema: z.ZodType<EvolutionChain>;
export const SpeciesPageEntrySchema: z.ZodType<Pick<PokemonSummary,'speciesId'|'number'|'name'|'types'>>;
export const SpeciesPageSchema: z.ZodType<{ entries: z.infer<typeof SpeciesPageEntrySchema>[], page: PageInfo }>; 

// Internal records
export const SquadSlotSchema: z.ZodType<SquadSlot>;
export const BoxEntrySchema: z.ZodType<BoxEntry>;
export const DexStatusSchema: z.ZodType<DexStatus>;

// Loader/action contracts
export const HomeDataSchema: z.ZodType<{
  session: SessionInfo;
  squad: SquadSlot[];
  hero: PokemonSummary;
}>;

export const PokedexDataSchema: z.ZodType<{
  session: SessionInfo;
  page: PageInfo;
  filters: Filters;
  entries: Array<{ speciesId: number; number: number; visibleName?: string; visibleTypes?: PokemonType[]; silhouette: boolean; }>
}>;

export const PokemonDetailsDataSchema: z.ZodType<{
  session: SessionInfo;
  pokemon: PokemonDetails;
  species: SpeciesMeta;
  evolution?: EvolutionChain;
  status: { inSquad: boolean; caught: boolean };
}>;

export const SquadDataSchema: z.ZodType<{
  session: SessionInfo;
  squad: SquadSlot[];
  latestCaught: BoxEntry[];
}>;

export const BoxDataSchema: z.ZodType<{
  session: SessionInfo;
  page: PageInfo;
  entries: BoxEntry[];
}>;

export const GenerationsDataSchema: z.ZodType<{
  session: SessionInfo;
  generations: Array<{ id: number; name: string; range: { fromNumber: number; toNumber: number } }>;
}>;

export const UserDataSchema: z.ZodType<{
  session: SessionInfo;
  profile?: { displayName?: string; email?: string };
}>;

export const SettingsDataSchema: z.ZodType<{
  session: SessionInfo;
  preferences: { theme: 'system'|'light'|'dark'; accent: string };
}>;
```

## PokeAPI Service Interfaces

```ts
// Input types
export interface ListSpeciesArgs { offset?: number; limit?: number; filters?: Filters; }

// Service
export interface PokeApiService {
  getPokemon(args: { speciesId: number }): Promise<PokemonDetails>;
  getSpecies(args: { speciesId: number }): Promise<SpeciesMeta>;
  getEvolutionChain(args: { speciesId: number }): Promise<EvolutionChain>;
  listSpeciesPage(args: ListSpeciesArgs): Promise<{ entries: PokemonSummary[]; page: PageInfo }>;
}
```

## User Data (DynamoDB) Service Interfaces

```ts
export interface SquadRepo {
  get(userId: string): Promise<SquadSlot[]>;
  setSlot(userId: string, slot: SquadSlot['slot'], species: PokemonSummary): Promise<void>;
  swap(userId: string, a: SquadSlot['slot'], b: SquadSlot['slot']): Promise<void>;
  remove(userId: string, speciesId: number): Promise<void>;
}

export interface BoxRepo {
  list(userId: string, args: { cursor?: string; limit?: number }): Promise<{ entries: BoxEntry[]; cursor?: string }>;
  latest(userId: string, args?: { limit?: number }): Promise<BoxEntry[]>;
  catch(userId: string, species: PokemonSummary): Promise<BoxEntry>;
  free(userId: string, entryId: string): Promise<void>;
}

export interface DexRepo {
  markSeen(userId: string, speciesId: number): Promise<void>;
  markCaught(userId: string, speciesId: number): Promise<void>;
}

export interface ProfileRepo {
  get(userId: string): Promise<{ displayName?: string; email?: string } | undefined>;
  upsert(userId: string, profile: { displayName?: string; email?: string }): Promise<void>;
}

export interface MigrationService {
  migrateGuestData(guestId: string, userId: string): Promise<void>;
}
```

## Errors (typed)

```ts
export interface DataAccessError extends Error {
  code: 'NotFound' | 'BadRequest' | 'UpstreamError' | 'ValidationError' | 'Conflict' | 'RateLimited' | 'Unknown';
  status?: number; // suggested HTTP status
  details?: unknown;
}
```

## Notes

- Function names map 1:1 to loader/action needs in `.ai/pokedex-frontend.md`
- Concrete implementations will live under `libs/data-access/*` with server-only boundaries
- We can generate stubs from these interfaces when we start coding
