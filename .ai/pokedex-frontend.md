# Pokedex Frontend Structure (Design)

This document defines the app's route hierarchy, pages, core UI components, and data contracts for SSR loaders/actions. It is implementation-agnostic and focuses on responsibilities and interfaces.

## Navigation & Layout

- AppShell
  - Mobile: bottom sticky main menu with 5 items (center: Home; left: Pokedex, Squad; right: Generations, User)
  - Desktop: left collapsible sidebar with same items; persistent header for search/context actions
  - Content area renders nested routes; supports skeletons and error boundaries
- Main colors
  - Type-based palette for cards/badges
  - Main accent for non-type UI: Indigo (default), configurable via CSS variable `--accent` and theme token; easily changeable

## Route tree (React Router v7)

- `/` Home
- `/pokedex` Pokedex index (grid, search, filters)
- `/pokemon/:id` Pokemon details (tabs: about, stats, evolution, moves; locations later)
- `/squad` Your squad (max 6, reorder, context menu)
- `/box` Your box (grid, load more, context menu)
- `/generations` Generations (list/detail; filter integration)
- `/user` User (profile/auth entrypoint; guest mode messaging)
- `/settings` Settings (theme, data options)

Notes
- Each route has a loader (SSR data) and may have actions (mutations)
- Use nested UI layout for shared shells and tab sections
- Use `defer()` and streaming for heavier detail routes to optimize TTFB

## Pages: responsibilities, data, components

### Home (`/`)
- Purpose: Highlight main squad Pokémon; quick access to squad
- SSR loader reads
  - User squad (ordered list of up to 6) from DB
  - For the first Pokémon: PokeAPI basics (name, types, artwork)
- Client interactions
  - Tap squad card to switch main Pokémon
  - CTA to view details; CTA to manage squad
- Components
  - HeroPokemonCard, SquadMiniGrid, PokemonTypeBadge, Button

### Pokedex (`/pokedex`)
- Purpose: Browse all species; catch/see flow; search & filter
- SSR loader reads
  - Page params (limit/offset), active filters
  - PokeAPI species index page (id, name where visible rules allow)
  - User pokedex status (seen/caught) for silhouette logic (from DB or guest store)
- Client interactions
  - Search input with debounced query
  - Filter modal (type, generation, sort by name/number/type/gen/stats)
  - Load more paging (default)
  - Context menu: add to squad (if caught), view details, catch
- Components
  - PokedexGrid, PokemonCard (supports silhouette state), SearchBar, FilterDialog, ContextMenu, LoadMore

### Pokemon details (`/pokemon/:id`)
- Purpose: Rich detail view with tabs
- SSR loader reads
  - PokeAPI pokemon (stats, types, sprites)
  - PokeAPI species (flavor text, gender rate)
  - Evolution chain (may be deferred)
  - User status (in squad? caught?)
- Client interactions
  - Add to squad; catch to box; tab switching
  - Expand section (mobile swipe/desktop scroll) to compact hero
- Components
  - PokemonHero, DetailsTabs (About, Stats, Evolution, Moves, Locations TBD),
    StatBars, TypeBadges, ActionButtons

### Squad (`/squad`)
- Purpose: Manage squad of up to 6; preview latest 6 caught from box; quick access to Box
- SSR loader reads
  - Squad list from DB; minimal PokeAPI summaries for display
  - Latest 6 caught from box (ordered by addedAt desc)
- Client interactions
  - Reorder via context menu (move up/down). No drag-and-drop.
  - Context menu: remove, view details, move up/down
  - Open Box page button
  - Add from preview to squad (if full, trigger replacement modal)
- Components
  - SquadGrid, PokemonCard, SortControls, ContextMenu, LatestCaughtPreview, OpenBoxButton

### Box (`/box`)
- Purpose: Collection of caught Pokémon
- SSR loader reads
  - Paginated box entries from DB; resolve lightweight PokeAPI fields for cards
- Client interactions
  - Load more paging (default)
  - Context menu: add to squad (with modal if full), view details, free Pokémon
  - Search & filters (shared with Pokedex)
- Components
  - BoxGrid, PokemonCard, LoadMore, ContextMenu, SearchBar, FilterDialog

### Generations (`/generations`)
- Purpose: Explore generations and filter pokedex/box
- SSR loader reads
  - PokeAPI generations index
- Client interactions
  - Select one or multiple generations to filter other pages
- Components
  - GenerationList, GenerationBadge, FilterActions

### User (`/user`)
- Purpose: Auth entry and profile
- SSR loader reads
  - Session (guest vs authenticated), minimal profile
- Client interactions
  - Sign in/out via Cognito Hosted UI; guest migration CTA
- Components
  - UserProfileCard, AuthActions, MigrationNotice

### Settings (`/settings`)
- Purpose: Preferences
- SSR loader reads
  - Theme, performance toggles
- Client interactions
  - Toggle theme, choose main accent color, data/privacy controls
- Components
  - SettingsForm, ThemeSwitcher

## Data contracts (loader outputs)

Represented as field lists (not code). Each loader returns a JSON object with these shapes.

- Common
  - `session`: { userId | null, isGuest: boolean }

- Home
  - `squad`: [{ slot: 1..6, speciesId, name, types: [type], artworkUrl }]
  - `hero`: { speciesId, name, types: [type], artworkUrl }

- Pokedex
  - `page`: { limit, offset }
  - `filters`: { types?: [type], generations?: [number], sort?: 'name'|'number'|'type'|'generation'|'stats' }
  - `entries`: [{ speciesId, number, visibleName?: string, visibleTypes?: [type], silhouette: boolean }]

- Pokemon details
  - `pokemon`: { speciesId, name, number, types: [type], stats: [{ name, value }], artworkUrl }
  - `species`: { description, genderRate }  // genderRate used to derive male/female %
  - `evolution` (optional, deferred): { chain: [...] }
  - `status`: { inSquad: boolean, caught: boolean }

- Squad
  - `squad`: [{ slot, speciesId, name, types, number, artworkUrl }]
  - `latestCaught`: [{ id, addedAt, speciesId, name, types, number, artworkUrl }] // latest 6 by addedAt desc

- Box
  - `page`: { limit, cursor? }
  - `entries`: [{ id, addedAt, speciesId, name, types, number, artworkUrl }]

- Generations
  - `generations`: [{ id, name, range: { fromNumber, toNumber } }]

- User
  - `profile`: { displayName?, email? }

- Settings
  - `preferences`: { theme: 'system'|'light'|'dark', accent: 'indigo'|... }

## Mutations (actions)

- Squad
  - addToSquad(speciesId) → updates ordered list (fail if full)
  - removeFromSquad(speciesId)
  - moveInSquad(speciesId, direction: 'up'|'down'|index)

- Box
  - catchPokemon(speciesId) → creates box entry; set pokedex caught=true
  - freePokemon(entryId) → removes entry; if in squad, also remove from squad

- Pokedex
  - markSeen(speciesId) → seen=true (triggered by "see the pokemon")

- User
  - migrateGuestData(guestPayload) → merges into user records post-auth

## Reusable UI components (shadcn-based)

- Layout: AppShell, BottomNav, SidebarNav, Header, PageSection, Tabs
- Data display: PokemonCard, PokemonHero, PokemonTypeBadge, StatBars, GenerationBadge
- Inputs: SearchBar, FilterDialog (type chips, generation multiselect, sort select), LoadMore
- Overlays: Dialog, ContextMenu, Modal (squad-full replacement UI)
- Feedback: Skeletons (card, hero, list), EmptyState, ErrorBoundary
- Utilities: ImageWithSilhouette, ResponsiveGrid, ScrollArea

## Styling & theming

- Tailwind with CSS variables for type colors (`--type-grass`, `--type-fire`, ...)
- Accent color for non-type UI (default: indigo), controlled via CSS variable `--accent` and theme token; can be changed easily
- Cards use main type for background gradient; badges use solid type color

## Accessibility

- Keyboard navigation for grids and menus
- Focus-visible styles; ARIA labels for actions
- Sufficient color contrast for type colors; respect prefers-reduced-motion

## Performance

- SSR for first paint; defer evolution chain and heavier content
- Grid virtualization if needed on Pokedex/Box
- Image lazy loading; prefer SVG "dream-world" for silhouette-friendly assets

## Decisions (confirmed)

- Accent color: Indigo by default; configured via CSS variable `--accent` and theme token; easily changeable.
- Paging: Use "Load more" on Pokedex and Box.
- Squad reordering: via context menu (move up/down); no drag-and-drop.
- Generation filter: multi-select.
- Tabs: Keep About, Stats, Evolution, Moves for now; add others later as needed.
