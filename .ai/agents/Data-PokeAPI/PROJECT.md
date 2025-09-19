# Data-PokeAPI — Project Spec

Branch: `agent/data-pokeapi/fetchers`

Objectives
- Implement PokeAPI fetchers and validation
- Image URL helpers with fallback

Plan
- Functions: getPokemon, getSpecies, listSpeciesPage, getEvolutionChain
- LRU cache; retries (3) with jitter; token-bucket limiter
- Tests with MSW fixtures

Dependencies
- Contracts in `.ai/pokedex-interfaces.md`
- Consumed by route loaders (FE-Framework)
