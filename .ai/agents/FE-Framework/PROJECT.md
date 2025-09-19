# FE-Framework — Project Spec

Branch: `agent/fe-framework/scaffold`

Objectives
- Scaffold SSR app in `apps/pokedex`
- Implement route shells and loaders per `.ai/pokedex-frontend.md`
- Wire error boundaries and skeletons; `defer` on details route

Plan
- Create root, entries, base layout (AppShell from `libs/ui` once ready)
- Add routes: `/`, `/pokedex`, `/pokemon/:id`, `/squad`, `/box`, `/generations`, `/user`, `/settings`
- Loader contracts per `.ai/pokedex-interfaces.md` (use in-memory repos)
- Tests: loader unit tests with MSW; render SSR of route shells

Dependencies
- UI-DesignSystem for components (can stub initially)
- Data-PokeAPI & Data-UserRepo for real data (mock initially)
