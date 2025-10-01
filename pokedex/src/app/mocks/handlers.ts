import { http, HttpResponse } from 'msw';

export const handlers = [
  // List species page
  http.get('https://pokeapi.co/api/v2/pokemon', ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') || '20');
    const offset = Number(url.searchParams.get('offset') || '0');
    
    const results = Array.from({ length: Math.min(limit, 20) }, (_, i) => {
      const id = offset + i + 1;
      return {
        name: `pokemon-${id}`,
        url: `https://pokeapi.co/api/v2/pokemon/${id}/`,
      };
    });
    
    return HttpResponse.json({
      count: 1000,
      next: `https://pokeapi.co/api/v2/pokemon?offset=${offset + limit}&limit=${limit}`,
      previous: offset > 0 ? `https://pokeapi.co/api/v2/pokemon?offset=${Math.max(0, offset - limit)}&limit=${limit}` : null,
      results,
    });
  }),
  
  // Get pokemon by ID
  http.get('https://pokeapi.co/api/v2/pokemon/:id', ({ params }: { params: Record<string, string> }) => {
    const id = Number(params.id);
    if (isNaN(id) || id < 1) {
      return new HttpResponse(null, { status: 404 });
    }
    
    // Map some common IDs to realistic names for tests
    const nameMap: Record<number, string> = {
      1: 'bulbasaur',
      4: 'charmander',
      7: 'squirtle',
      25: 'pikachu',
    };
    const name = nameMap[id] || `pokemon-${id}`;
    
    return HttpResponse.json({
      id,
      name,
      types: [
        { slot: 1, type: { name: id === 7 ? 'water' : 'normal', url: `https://pokeapi.co/api/v2/type/${id === 7 ? 11 : 1}/` } },
      ],
      stats: [
        { base_stat: 45, effort: 0, stat: { name: 'hp', url: 'https://pokeapi.co/api/v2/stat/1/' } },
        { base_stat: 49, effort: 0, stat: { name: 'attack', url: 'https://pokeapi.co/api/v2/stat/2/' } },
        { base_stat: 49, effort: 0, stat: { name: 'defense', url: 'https://pokeapi.co/api/v2/stat/3/' } },
        { base_stat: 65, effort: 1, stat: { name: 'special-attack', url: 'https://pokeapi.co/api/v2/stat/4/' } },
        { base_stat: 65, effort: 0, stat: { name: 'special-defense', url: 'https://pokeapi.co/api/v2/stat/5/' } },
        { base_stat: 45, effort: 0, stat: { name: 'speed', url: 'https://pokeapi.co/api/v2/stat/6/' } },
      ],
      sprites: {
        other: {
          'official-artwork': {
            front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
          },
        },
      },
    });
  }),
  
  // Get species by ID
  http.get('https://pokeapi.co/api/v2/pokemon-species/:id', ({ params }: { params: Record<string, string> }) => {
    const id = Number(params.id);
    if (isNaN(id) || id < 1) {
      return new HttpResponse(null, { status: 404 });
    }
    
    const nameMap: Record<number, string> = {
      1: 'bulbasaur',
      4: 'charmander',
      7: 'squirtle',
      25: 'pikachu',
    };
    const name = nameMap[id] || `pokemon-${id}`;
    const descriptions: Record<number, string> = {
      7: 'After birth, its back swells and hardens into a shell. Powerfully sprays foam from its mouth.',
    };
    const description = descriptions[id] || `This is a test description for ${name}.`;
    
    return HttpResponse.json({
      id,
      name,
      gender_rate: id === 7 ? 1 : 4,
      flavor_text_entries: [
        {
          flavor_text: description,
          language: { name: 'en', url: 'https://pokeapi.co/api/v2/language/9/' },
        },
      ],
      evolution_chain: {
        url: `https://pokeapi.co/api/v2/evolution-chain/${id}/`,
      },
    });
  }),
  
  // Get evolution chain
  http.get('https://pokeapi.co/api/v2/evolution-chain/:id', ({ params }: { params: Record<string, string> }) => {
    const id = Number(params.id);
    if (isNaN(id) || id < 1) {
      return new HttpResponse(null, { status: 404 });
    }
    
    const nameMap: Record<number, string> = {
      1: 'bulbasaur',
      4: 'charmander',
      7: 'squirtle',
      25: 'pikachu',
    };
    const name = nameMap[id] || `pokemon-${id}`;
    
    return HttpResponse.json({
      id,
      chain: {
        species: {
          name,
          url: `https://pokeapi.co/api/v2/pokemon-species/${id}/`,
        },
        evolves_to: [],
        evolution_details: [],
      },
    });
  }),
];

