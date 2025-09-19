# UI-DesignSystem — Project Spec

Branch: `agent/ui/tokens-and-cards`

Objectives
- Tailwind config + tokens + `--accent`
- Base components: PokemonCard (skeleton), PokemonTypeBadge, BottomNav, SidebarNav, Tabs

Plan
- Configure Tailwind theme; add type color variables and gradients
- Build shadcn-based components with a11y focus, stories, tests

Dependencies
- Consumes types from `libs/models`
- Used by FE-Framework; avoid changing exported APIs unexpectedly
