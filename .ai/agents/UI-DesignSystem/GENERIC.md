# Agent: UI-DesignSystem (Generic Spec)

Scope
- Tailwind + shadcn/ui setup
- Design tokens (type colors, accent), theming
- Reusable components (cards, badges, grids, dialogs, nav)
- Accessibility (focus, ARIA, contrast)

Constraints
- No data fetching; pure presentational components
- Props typed from `libs/models` where applicable

Definition of Done
- Component library exported from `libs/ui` with stories/tests
- Tokens documented; `--accent` configurable

## Context requirements

- Main requirements: `.ai/` (read: `pokedex-frontend.md`, `pokedex-interfaces.md`, `pokedex-plan.md`)
- This agent spec: `.ai/agents/UI-DesignSystem/PROJECT.md`
- Workspace rules: `AGENTS.md`
- Role-specific requirements: `.ai/pokedex-frontend.md` (components, styling, a11y)

## Start-of-task routine
- Update branch: `git checkout agent/ui/tokens-and-cards && git fetch origin && git rebase origin/main`
- Re-read Context requirements (above) and `PROJECT.md`
