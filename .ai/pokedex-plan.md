# Pokedex — Summary and Implementation Plan

## Project summary

- Goal: Build a mobile‑first Pokedex web application using React Router v7 with SSR, Tailwind + shadcn/ui, TypeScript, and an AWS backend (Cognito, DynamoDB, Amplify Hosting). Data comes primarily from PokeAPI; user features (squad, box, pokedex status) are stored in DynamoDB. Guest mode supports local usage, with migration on sign‑in.
- Architecture:
  - App: React Router v7 SSR; loaders/actions as BFF
  - UI: Tailwind + shadcn/ui, type‑based color system, Indigo accent (configurable)
  - Data access: server‑only `fetch + zod` for PokeAPI; typed repos for DynamoDB
  - Auth: Cognito Hosted UI; HTTP‑only session cookie
  - Infra: Amplify Hosting; DynamoDB single‑table; CDK for infra; SSM/Secrets for config
  - CI/CD: Nx + GitHub Actions with trunk‑based flow; staging on main, manual release via Nx Release to prod

## References (internal docs)

- `.ai/pokedex-infrastructure.md` — high‑level architecture
- `.ai/pokedex-frontend.md` — routes, pages, components, data contracts
- `.ai/pokedex-nx-layout.md` — apps/libs layout and boundaries
- `.ai/pokedex-dynamodb-model.md` — single‑table design and access patterns
- `.ai/pokedex-data-access.md` — data‑access conventions
- `.ai/pokedex-interfaces.md` — pseudo‑code interfaces (models, zod, repos)
- `.ai/pokedex-auth-flow.md` — auth, sessions, guest migration
- `.ai/pokedex-hosting-infra.md` — hosting and server‑side infra
- `.ai/pokedex-iac.md` — CDK plan + secrets mapping
- `.ai/pokedex-cicd.md` — CI/CD including trunk‑based/manual release

---

## Implementation plan (atomic, DDD‑oriented, locally testable)

### 0) Workspace bootstrap

- Ensure Node 22, pnpm, Nx in repo
- Initialize Nx workspace (no code yet). Add `apps/` and `libs/` folders
- Add base `eslint`, `prettier`, and TypeScript config with strict mode

### 1) App skeleton (SSR + routing)

- Create `apps/pokedex` with React Router v7 SSR scaffold (no business code)
- Add `root.tsx`, `entry.client.tsx`, `entry.server.tsx`, and a minimal route
- Integrate Tailwind; add base theme tokens and `--accent` variable
- Add shadcn/ui setup (no custom components yet)
- Local run: verify SSR dev server responds with 200 and renders placeholder

### 2) Domain model (models + zod)

- Create `libs/models`
- Implement types and zod schemas from `.ai/pokedex-interfaces.md`
- Add unit tests for schema parsing (fixtures for PokeAPI)

### 3) UI kit (design system)

- Create `libs/ui`
- Implement foundational components: `AppShell`, `BottomNav`, `SidebarNav`, `PageSection`, `Tabs`, `PokemonTypeBadge`, `PokemonCard` (skeleton state)
- Add color tokens for type palette and configurable `--accent`
- Storybook (optional local testability): basic stories for UI components

### 4) PokeAPI data access (server‑only)

- Create `libs/data-access/pokeapi`
- Implement `getPokemon`, `getSpecies`, `listSpeciesPage`, `getEvolutionChain` using `fetch + zod`
- Add small in‑memory LRU cache and retries with backoff
- Unit tests with mocked fetch + fixtures

### 5) DynamoDB repositories (server‑only)

- Create `libs/data-access/user-data`
- Implement `squadRepo`, `boxRepo`, `dexRepo`, `profileRepo` per `.ai/pokedex-dynamodb-model.md`
- Add in‑memory adapter for local dev (no AWS needed) with the same interfaces
- Unit tests for repositories against the in‑memory adapter

### 6) Auth/session utilities

- Implement `getSession`, `commitSession`, `destroySession`, `requireUser`
- Implement guest handling (generate guestId) and CSRF helpers
- Unit tests for session encoding/decoding (use cookie mocks)

### 7) Route loaders/actions (read‑only first)

- Home: load squad (in‑memory repo), resolve hero from PokeAPI
- Pokedex: list entries (PokeAPI), silhouette logic via `dexRepo` (guest fallback)
- Pokemon details: `pokemon`, `species`, `evolution` (defer), status
- Add route‑level error boundaries and skeletons

### 8) Mutations (actions)

- Squad: `addToSquad`, `removeFromSquad`, `moveInSquad` (context‑menu path)
- Box: `catchPokemon`, `freePokemon`
- Pokedex: `markSeen`
- Tests: action unit tests against in‑memory repos

### 9) Pages & UX details

- Home: hero card + mini squad; switch hero; CTA buttons
- Pokedex: grid with Load More; search input; filter dialog
- Pokemon details: tabs (About, Stats, Evolution, Moves), expand behavior
- Squad: grid, latest caught preview (6), Open Box, context menu reorder (no DnD)
- Box: grid with Load More; context menu; search/filters

### 10) Guest mode and migration

- Implement local storage store for squad/box/dex
- On sign‑in, surface migration CTA and action to move guest → user
- Tests: migration logic unit tests (conflicts, idempotency)

### 11) Observability & errors

- Structured logger; correlation id per request
- Map data‑access errors to friendly UI states
- Add basic health endpoint and smoke tests

### 12) IaC (CDK minimal)

- Scaffold `infra/pokedex` CDK app
- Add `DynamoDB` stack (table + GSI), `Cognito` stack (user pool + app client)
- Parameterize per stage; create SSM/Secrets parameters named per `.ai/pokedex-iac.md`
- Local test: `cdk synth` and `cdk diff` (no deploy yet)

### 13) Hosting integration (Amplify envs)

- Create Amplify `staging`/`prod` envs (manual console is fine at first)
- Wire env variables from SSM/Secrets to Amplify envs
- Validate SSR build artifact runs in Amplify `staging`

### 14) CI (validation) and staging deploy

- Add GitHub Actions PR workflow (lint, typecheck, test, build)
- Add `main` push → staging deploy workflow (from `.ai/pokedex-cicd.md`)
- Smoke tests post‑deploy (HTTP 200)

### 15) Manual release to production

- Add `workflow_dispatch` release job running `pnpm nx release` (conventional commits), push tag, deploy to prod (same commit)
- Protect `production` environment with reviewers

### 16) Hardening & polish

- Accessibility pass (focus, ARIA, contrast)
- Performance pass (headers, cache, defer usage, image loading)
- Error tracking (optional Sentry)

---

## Backlog / future

- Drag‑and‑drop for squad
- Locations tab
- Federation providers in Cognito
- Nx generators to scaffold routes/components/repo functions
- Switch in‑memory repos to DynamoDB locally via LocalStack

## Local testability notes

- In‑memory repos enable full app dev without AWS
- Mock fetch for PokeAPI to create deterministic tests
- Feature flags for expensive features (evolution chain defer, virtualization)

## DDD boundaries

- UI (libs/ui) must not import repos directly
- Models and schemas (libs/models) are the shared language
- Data access (libs/data-access/*) encapsulates integrations and invariants
- App routes orchestrate use cases via loaders/actions
