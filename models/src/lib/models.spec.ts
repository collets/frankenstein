import { z } from 'zod';
import { PokemonSummarySchema, PokemonDetailsSchema, SpeciesMetaSchema, EvolutionChainSchema } from './schemas';

describe('models schemas', () => {
  it('parses PokemonSummary', () => {
    const s = PokemonSummarySchema.parse({
      speciesId: 1,
      number: 1,
      name: 'bulbasaur',
      types: ['grass', 'poison'],
      artworkUrl: 'https://example.com/1.png',
    });
    expect(s.name).toBe('bulbasaur');
  });

  it('parses PokemonDetails', () => {
    const d = PokemonDetailsSchema.parse({
      speciesId: 1,
      number: 1,
      name: 'bulbasaur',
      types: ['grass', 'poison'],
      artworkUrl: 'https://example.com/1.png',
      stats: [
        { name: 'hp', value: 45 },
        { name: 'attack', value: 49 },
      ],
    });
    expect(d.stats.length).toBe(2);
  });

  it('parses SpeciesMeta', () => {
    const m = SpeciesMetaSchema.parse({ description: 'Seed', genderRate: 4 });
    expect(m.genderRate).toBe(4);
  });

  it('parses EvolutionChain', () => {
    const e = EvolutionChainSchema.parse({ chain: [{ speciesId: 1, name: 'bulbasaur' }] });
    expect(e.chain[0].speciesId).toBe(1);
  });
});
