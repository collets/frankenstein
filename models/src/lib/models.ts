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
