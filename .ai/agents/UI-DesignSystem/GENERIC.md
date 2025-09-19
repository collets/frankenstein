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
