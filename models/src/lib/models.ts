// Shared domain models for the Pokedex app
export type PokemonType =
  | 'normal'
  | 'fire'
  | 'water'
  | 'grass'
  | 'electric'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel'
  | 'fairy';

export interface StatValue {
  name: string;
  value: number;
}

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

export interface SpeciesMeta {
  description: string;
  genderRate: number;
}

export interface EvolutionNode {
  speciesId: number;
  name: string;
  trigger?: string;
  children?: EvolutionNode[];
}

export interface EvolutionChain {
  chain: EvolutionNode[];
}

export interface PageInfo {
  limit: number;
  offset?: number;
  cursor?: string;
}

export interface SquadSlot extends PokemonSummary {
  slot: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface BoxEntry extends PokemonSummary {
  id: string;
  addedAt: string;
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

export interface Filters {
  types?: PokemonType[];
  generations?: number[];
  sort?: 'name' | 'number' | 'type' | 'generation' | 'stats';
}

export interface ListSpeciesArgs {
  offset?: number;
  limit?: number;
  filters?: Filters;
}
// Re-export for convenience
export type { PokemonSummary as SpeciesPageEntry };
