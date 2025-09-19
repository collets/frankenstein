# Agent: Data-PokeAPI (Generic Spec)

Scope
- Implement `libs/data-access/pokeapi` using fetch + zod
- Caching (LRU), retries with jitter, token-bucket rate limiting
- Image URL helpers with dream-world → official-artwork → placeholder fallback

Constraints
- Server-only code; no client imports
- Return validated types from `libs/models`

Definition of Done
- Functions: getPokemon, getSpecies, listSpeciesPage, getEvolutionChain
- Unit tests with MSW/mocked fetch and fixtures
