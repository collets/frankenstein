# Pokedex Nx Workspace Layout

This document proposes an Nx structure to support the Pokedex app with clear separation of concerns, strong reusability, and smooth SSR with React Router v7.

## Apps

- apps/pokedex
  - React Router v7 SSR app (frontend + BFF via loaders/actions)
  - `app/` routes, loaders/actions, root layout
  - `styles/` Tailwind config and CSS
  - `server/` server entry (if needed by hosting) and SSR glue

## Libraries

- libs/ui
  - shadcn/ui components composed for our design system
  - tokens (colors, shadows, radii) and utility classes
  - no server-only code

- libs/models
  - shared TypeScript types and `zod` schemas for loader/action contracts
  - value objects (e.g., `PokemonType`), parsing helpers
  - no runtime I/O

- libs/data-access/pokeapi (server-only)
  - server fetchers to PokeAPI with `fetch` + `zod` validation
  - small LRU or Map-based in-memory cache; respects upstream cache headers
  - image URL builders (dream-world/official-artwork)

- libs/data-access/user-data (server-only)
  - DynamoDB access (single-table repository functions)
  - session-aware helpers (take userId/guestId)
  - migration utilities (guest → user)

- libs/utils
  - generic helpers (dates, arrays, sorting, formatting)
  - SSR-safe utilities shared across app and server libs

- libs/testing (optional)
  - test utilities, mock data, contract fixtures

## Tagging & boundaries

- Tag libs to enforce boundaries via ESLint/Nx:
  - `type:ui`, `type:models`, `type:data-access`, `type:utils`
  - `scope:server` for server-only libs
- Rules (examples):
  - `type:ui` cannot import from `type:data-access`
  - `type:models` imports only from `type:models` and `type:utils`
  - `scope:server` libs not imported by client-only code

## Environment configuration

- apps/pokedex consumes env via runtime config (Amplify)
- Server-only secrets available to loaders/actions; never to client bundles
- Provide `.env.example` with documented variables (Cognito, DynamoDB table, etc.)

## Generators and conventions

- Custom Nx generators (later) to scaffold:
  - New route with loader/action + zod contracts
  - New UI component (shadcn-based) with story and tests
  - New data-access function with schema validation

## Build targets

- `build`: SSR bundle for app, tsup/tsc for libs
- `lint`, `typecheck`, `test`
- `serve`: SSR dev server

## Caching inputs (namedInputs)

- Use Nx `namedInputs` for `production` and `default` (already present)
- Server-only libs include environment hash in cache key where appropriate (later)

## Why this layout

- Keeps UI, contracts, and data-access separate for clarity and testability
- Enforces SSR safety by isolating server-only logic
- Scales to additional apps/libraries without tangling concerns
