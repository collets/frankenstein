# Agent: FE-Framework (Generic Spec)

Scope
- SSR app setup (React Router v7): root, entries, route wiring
- Loaders/actions orchestration (no domain logic)
- Error boundaries, skeleton states, streaming with defer
- Performance budgets and code-splitting

Constraints
- Do not import server-only repos directly in client modules
- Consume contracts from `libs/models`; data ops via route boundaries only

Definition of Done
- SSR renders minimal layout and route shells
- Loaders/actions typed, tested with MSW/in-memory repos
- No cross-boundary imports; passes lint/type/test

## Context requirements

- Main requirements: `.ai/` (read: `pokedex-frontend.md`, `pokedex-interfaces.md`, `pokedex-plan.md`)
- This agent spec: `.ai/agents/FE-Framework/PROJECT.md`
- Workspace rules: `AGENTS.md`
- Role-specific requirements: `.ai/pokedex-frontend.md` (routes, pages, data contracts)

## Start-of-task routine
- Update branch: `git checkout agent/fe-framework/scaffold && git fetch origin && git rebase origin/main`
- Re-read Context requirements (above) and `PROJECT.md`
