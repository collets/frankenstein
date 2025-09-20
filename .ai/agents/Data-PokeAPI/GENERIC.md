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

## Context requirements

- Main requirements: `.ai/` (read: `pokedex-data-access.md`, `pokedex-interfaces.md`, `pokedex-plan.md`)
- This agent spec: `.ai/agents/Data-PokeAPI/PROJECT.md`
- Workspace rules: `AGENTS.md`
- Role-specific requirements: `.ai/pokedex-data-access.md` (fetch + zod, caching, rate limits)

## Start-of-task routine
- Update branch: `git checkout agent/data-pokeapi/fetchers && git fetch origin && git rebase origin/main`
- Re-read Context requirements (above) and `PROJECT.md`
