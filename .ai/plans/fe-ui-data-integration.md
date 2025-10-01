# Integration Plan — FE-Framework × UI-DesignSystem × Data-PokeAPI

Use this checklist to refactor the app so routes render with the design system and fetch data from the PokeAPI layer. Keep tasks small and independently verifiable. Check items off as you complete them.

## Scope and goals
- Replace placeholder route UIs with components from `@scdevelop/ui`
- Replace in-memory/placeholder loaders with `@scdevelop/data-access/pokeapi`
- Preserve existing route structure and tests; adapt MSW handlers accordingly

## Assumptions
- Node 22.19.0 and pnpm 9+ (per `.ai/prerequisites.md`)
- Nx workspace already contains `pokedex` (app), `ui` (design system), `models`, and `libs/data-access/pokeapi`
- Styling tokens already applied in `pokedex/src/styles.css`

---

## 0) Workspace hygiene and quick checks
- [ ] Ensure correct Node: `nvm use` and `node -v` prints 22.19.0
- [ ] Install deps: `pnpm install`
- [ ] Baseline CI tasks:
  - [ ] `pnpm nx typecheck` (all)
  - [ ] `pnpm nx test --all`
  - [ ] `pnpm nx build pokedex`

Acceptance:
- All commands succeed (or known, unrelated flakes documented in diary)

---

## 1) AppShell and navigation (compose existing UI components)
- [ ] Create `AppShell` in `pokedex/src/app/layouts/AppShell.tsx` that composes:
  - `SidebarNav` for desktop (left), `BottomNav` for mobile (sticky)
  - `children` content area
  - Provide nav items for: Home, Pokedex, Squad, Box, Generations, User, Settings
- [ ] Replace `RootLayout.tsx` layout with `AppShell` usage
- [ ] Keep minimal header area placeholder for future search/actions

Acceptance:
- App shows sidebar on desktop and bottom nav on mobile; links navigate correctly

---

## 2) Home route — use design system components
- [ ] Replace ad-hoc markup with `PokemonCard` for the `hero` and `PokemonTypeBadge` for types
- [ ] Keep current loader shape; no data change yet

Acceptance:
- Home renders hero using `PokemonCard`; type badges use `PokemonTypeBadge`

---

## 3) Pokedex list — wire to Data-PokeAPI and use cards
- [ ] Update `pokedex/src/app/routes/Pokedex.tsx` loader to call:
  - `import { PokeApi } from '@scdevelop/data-access/pokeapi'`
  - `const page = await PokeApi.listSpeciesPage({ limit, offset })`
- [ ] Map `page.entries` to existing loader output shape: `{ speciesId, number, visibleName, visibleTypes, silhouette }`
  - Use `visibleName = name`, `visibleTypes = []` (PokeAPI index doesn’t include types)
  - Set `silhouette = false` for now (dex status integration comes later)
- [ ] Render list using `PokemonCard` grid
- [ ] Support search param `q` client-side filter for now (retain current behavior)

Acceptance:
- Navigating to `/pokedex` fetches from real PokeAPI; grid shows cards; paging via `limit`/`offset` works

---

## 4) Pokemon details — defer evolution and render with Tabs
- [ ] Update `pokedex/src/app/routes/PokemonDetails.tsx` loader to call:
  - `pokemon = await PokeApi.getPokemon({ speciesId: id })`
  - `species = await PokeApi.getSpecies({ speciesId: id })`
  - `evolution = defer(PokeApi.getEvolutionChain({ speciesId: id }))`
- [ ] Render hero section with `PokemonCard` (or simple hero markup initially)
- [ ] Use `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` for sections (About, Stats, Evolution)
- [ ] Keep `Await` for deferred evolution and show a loading state

Acceptance:
- Details page loads name/types/stats and species text; evolution loads after initial paint

---

## 5) Error handling in loaders (typed mapping)
- [ ] Catch Data-PokeAPI errors and map to `Response` with appropriate status/text for router boundaries
  - `NotFound → 404`, `UpstreamError → 502`, `ValidationError → 502`, default → 500
- [ ] Verify existing `RootErrorBoundary` surfaces these errors

Acceptance:
- Invalid species routes return 404; other upstream errors render an error state without crashing

---

## 6) MSW handlers for tests
- [ ] Expand `pokedex/src/app/mocks/handlers.ts` to cover:
  - `GET https://pokeapi.co/api/v2/pokemon?limit=*&offset=*` returning a minimal index page with stable ids/names
  - `GET https://pokeapi.co/api/v2/pokemon/:id` returning id/name/types/stats
  - `GET https://pokeapi.co/api/v2/pokemon-species/:id` returning english flavor text and gender rate
  - `GET evolution-chain/*` returning a minimal chain shape
- [ ] Update existing tests to rely on MSW rather than hardcoded placeholders

Acceptance:
- `pnpm nx test pokedex` passes with network mocked by MSW

---

## 7) Visual polish alignment with tokens
- [ ] Ensure `pokedex/src/styles.css` is imported and active in the app
- [ ] Verify badges/cards use tokenized colors and radii; adjust classes if necessary
- [ ] Set default accent via CSS variable `--accent` if needed

Acceptance:
- Cards show gradients based on primary type; badges use solid type colors

---

## 8) Light refactors for clarity (optional)
- [ ] Create `pokedex/src/app/components/PokedexGrid.tsx` to encapsulate grid layout
- [ ] Create `pokedex/src/app/components/DetailsTabs.tsx` to encapsulate tab structure

Acceptance:
- Routes become slim; UI composition moves to small components

---

## 9) Smoke and CI checks
- [ ] `pnpm nx typecheck --affected` and `pnpm nx lint --affected`
- [ ] `pnpm nx test --affected`
- [ ] `pnpm nx build pokedex`

Acceptance:
- All succeed; preview app still navigates and renders as expected

---

## Notes and follow-ups (out of scope for this integration)
- Dex silhouette logic from user data (requires Data-UserRepo)
- Squad/Box actions and repositories
- Generations page data (not included in current `pokeapi` lib)
- AppShell promotion to `@scdevelop/ui` if we want reusability later

---

## Diary
When done, add a short entry to `.ai/agents/DIARY.md` with date, branch (if used), what changed, and next steps.
