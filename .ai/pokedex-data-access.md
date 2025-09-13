# Pokedex Data-Access Conventions

This document defines conventions for server-side data-access to PokeAPI and DynamoDB. It standardizes validation, caching, error handling, and interfaces used by route loaders/actions.

## Principles

- Server-only: All data-access happens in loaders/actions or server-only libs
- Validation-first: Use `zod` to parse/validate every external payload
- Minimal surface: Export typed functions with narrow, stable contracts
- Cache consciously: Favor correctness and predictability; add caching where it clearly helps
- Observability: Centralize logging and error mapping

## Libraries

- `libs/data-access/pokeapi`
  - Responsible for PokeAPI calls via `fetch`
  - Exports functions like `getPokemon`, `getSpecies`, `listSpeciesPage`, `getEvolutionChain`
  - Uses `zod` schemas (in `libs/models`) to parse responses
  - Provides small in-memory LRU per-process cache; respects upstream cache headers

- `libs/data-access/user-data`
  - Responsible for DynamoDB read/write
  - Exports repositories: `squadRepo`, `boxRepo`, `dexRepo`, `profileRepo`
  - Validates inputs/outputs with `zod`; handles idempotency for multi-write actions

## Validation with zod

- Define response/input schemas under `libs/models`:
  - `PokemonSchema`, `SpeciesSchema`, `EvolutionChainSchema`, etc.
  - For internal records: `SquadSlotSchema`, `BoxEntrySchema`, `DexStatusSchema`
- Data-access functions parse raw payloads via schemas and return typed objects
- Loader/action contracts (documented in `.ai/pokedex-frontend.md`) are mapped from these types

## Caching

- PokeAPI
  - In-memory LRU (size ~200–500 items) per server instance
  - Keyed by full URL + query; value includes parsed data and `staleAt`
  - TTL defaults: 60–300s depending on endpoint; obey `Cache-Control` when present
  - Optional CDN caching via HTTP headers set in loader responses where appropriate

- DynamoDB
  - No generic cache initially; reads are cheap and per-user
  - Consider short-lived per-request memoization within a loader/action

- Avoid caching mutations

## Errors

- Distinguish categories
  - 4xx from PokeAPI → NotFound/BadRequest mapped to 404/400
  - Network/timeout → Retryable; expose 503 with retry headers when safe
  - Validation failure (zod) → 502 (bad upstream) or 500 if internal
- Throw typed errors from data-access with `code`, `status`, `details`
- Route error boundaries render user-friendly states

## Interfaces (examples)

- PokeAPI
  - `getPokemon({ speciesId }: { speciesId: number }): Promise<Pokemon>`
  - `getSpecies({ speciesId }: { speciesId: number }): Promise<Species>`
  - `listSpeciesPage({ offset, limit, filters }): Promise<SpeciesPage>`
  - `getEvolutionChain({ speciesId }): Promise<EvolutionChain>` (may use `defer`)

- User data
  - `squadRepo.get(userId): Promise<SquadSlot[]>`
  - `squadRepo.setSlot(userId, slot, species)`
  - `squadRepo.swap(userId, slotA, slotB)`
  - `boxRepo.list(userId, { cursor, limit }): Promise<{ entries, cursor? }>`
  - `boxRepo.latest(userId, { limit: 6 }): Promise<BoxEntry[]>`
  - `boxRepo.catch(userId, species): Promise<BoxEntry>`
  - `boxRepo.free(userId, entryId)`
  - `dexRepo.markSeen(userId, speciesId)`
  - `dexRepo.markCaught(userId, speciesId)`

## Silhouette & image helpers

- Centralize URL building for dream-world and official-artwork
- Provide `toSilhouette(color?)` helper for grayscale/overlay filters client-side

## Rate limiting and retries

- Use exponential backoff for PokeAPI (e.g., 3 attempts)
- Respect `Retry-After` if provided
- Consider simple token-bucket to protect our quota (later)

## Security

- Never expose secrets client-side; loaders/actions are the only boundary
- Validate all inputs from actions with `zod` (server trust boundary)
- Sanitize headers and strip set-cookie leakage to the client

## Observability

- Central `log` utility (structured) with levels: debug/info/warn/error
- Attach correlation id per request (header or generated) for tracing
- Record error codes and latencies per function for SLOs

## Testing

- Unit test data-access functions with mock fetch/DynamoDB client
- Contract tests per schema to prevent drift
- E2E routes test with mocked PokeAPI fixture responses
