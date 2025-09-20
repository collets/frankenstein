import { z } from 'zod';
import type {
  StatValue,
  EvolutionNode,
} from './models';

// Page / common
export const PageInfoSchema = z.object({
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative().optional(),
  cursor: z.string().optional(),
});

// Pokemon domain
export const PokemonTypeSchema = z.union([
  z.literal('normal'),
  z.literal('fire'),
  z.literal('water'),
  z.literal('grass'),
  z.literal('electric'),
  z.literal('ice'),
  z.literal('fighting'),
  z.literal('poison'),
  z.literal('ground'),
  z.literal('flying'),
  z.literal('psychic'),
  z.literal('bug'),
  z.literal('rock'),
  z.literal('ghost'),
  z.literal('dragon'),
  z.literal('dark'),
  z.literal('steel'),
  z.literal('fairy'),
]);

export const StatValueSchema: z.ZodType<StatValue> = z.object({
  name: z.string(),
  value: z.number().int().nonnegative(),
});

export const PokemonSummarySchema = z.object({
  speciesId: z.number().int().positive(),
  number: z.number().int().positive(),
  name: z.string(),
  types: z.array(PokemonTypeSchema),
  artworkUrl: z.string().url(),
});

export const PokemonDetailsSchema = PokemonSummarySchema.extend({
  stats: z.array(StatValueSchema),
});

export const SpeciesMetaSchema = z.object({
  description: z.string(),
  genderRate: z.number().int(),
});

export const EvolutionNodeSchema: z.ZodType<EvolutionNode> = z.lazy(() =>
  z.object({
    speciesId: z.number().int().positive(),
    name: z.string(),
    trigger: z.string().optional(),
    children: z.array(EvolutionNodeSchema).optional(),
  }),
);

export const EvolutionChainSchema = z.object({
  chain: z.array(EvolutionNodeSchema),
});

export const SpeciesPageEntrySchema = PokemonSummarySchema.pick({
  speciesId: true,
  number: true,
  name: true,
  types: true,
});

export const SpeciesPageSchema = z.object({
  entries: z.array(SpeciesPageEntrySchema),
  page: PageInfoSchema,
});

// Loader/action contracts
export const HomeDataSchema = z.object({
  session: z.object({ userId: z.string().nullable(), isGuest: z.boolean() }),
  squad: z.array(
    PokemonSummarySchema.extend({
      slot: z.union([
        z.literal(1),
        z.literal(2),
        z.literal(3),
        z.literal(4),
        z.literal(5),
        z.literal(6),
      ]),
    }),
  ),
  hero: PokemonSummarySchema,
});

export const PokedexDataSchema = z.object({
  session: z.object({ userId: z.string().nullable(), isGuest: z.boolean() }),
  page: PageInfoSchema,
  filters: z.object({
    types: z.array(PokemonTypeSchema).optional(),
    generations: z.array(z.number().int().positive()).optional(),
    sort: z.enum(['name', 'number', 'type', 'generation', 'stats']).optional(),
  }),
  entries: z.array(
    z.object({
      speciesId: z.number().int().positive(),
      number: z.number().int().positive(),
      visibleName: z.string().optional(),
      visibleTypes: z.array(PokemonTypeSchema).optional(),
      silhouette: z.boolean(),
    }),
  ),
});

export const PokemonDetailsDataSchema = z.object({
  session: z.object({ userId: z.string().nullable(), isGuest: z.boolean() }),
  pokemon: PokemonDetailsSchema,
  species: SpeciesMetaSchema,
  evolution: EvolutionChainSchema.optional(),
  status: z.object({ inSquad: z.boolean(), caught: z.boolean() }),
});

export const SquadDataSchema = z.object({
  session: z.object({ userId: z.string().nullable(), isGuest: z.boolean() }),
  squad: z.array(
    PokemonSummarySchema.extend({
      slot: z.union([
        z.literal(1),
        z.literal(2),
        z.literal(3),
        z.literal(4),
        z.literal(5),
        z.literal(6),
      ]),
    }),
  ),
  latestCaught: z.array(
    PokemonSummarySchema.extend({ id: z.string(), addedAt: z.string() }),
  ),
});

export const BoxDataSchema = z.object({
  session: z.object({ userId: z.string().nullable(), isGuest: z.boolean() }),
  page: PageInfoSchema,
  entries: z.array(
    PokemonSummarySchema.extend({ id: z.string(), addedAt: z.string() }),
  ),
});

export const GenerationsDataSchema = z.object({
  session: z.object({ userId: z.string().nullable(), isGuest: z.boolean() }),
  generations: z.array(
    z.object({
      id: z.number().int().positive(),
      name: z.string(),
      range: z.object({
        fromNumber: z.number().int().positive(),
        toNumber: z.number().int().positive(),
      }),
    }),
  ),
});

export const UserDataSchema = z.object({
  session: z.object({ userId: z.string().nullable(), isGuest: z.boolean() }),
  profile: z
    .object({ displayName: z.string().optional(), email: z.string().optional() })
    .optional(),
});

export const SettingsDataSchema = z.object({
  session: z.object({ userId: z.string().nullable(), isGuest: z.boolean() }),
  preferences: z.object({
    theme: z.enum(['system', 'light', 'dark']),
    accent: z.string(),
  }),
});

