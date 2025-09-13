# Pokedex Infrastructure (High-Level)

This document captures the validated stack and high-level architecture for the mobile-first Pokedex application. It will evolve as we validate each component step-by-step.

## Validated decisions (Step 1)

- App platform: React Router v7 (latest) with SSR
- Language/tooling: TypeScript, Nx monorepo, pnpm, Node 22 (per `.nvmrc`)
- Styling/UI: Tailwind CSS + shadcn/ui (Radix primitives)
- PokeAPI access: server-only `fetch` + `zod` schema validation (default)
- Auth: AWS Cognito (Hosted UI + OIDC), HTTP-only session cookies
- User data store: AWS DynamoDB (single-table, serverless)
- Hosting: AWS Amplify Hosting (SSR) with CloudFront CDN
- Guest mode: supported; migrate local data to account on sign-in
- Images: PokeAPI "dream-world" assets for silhouettes (primary), optionally "official-artwork" for hero images

## Architecture overview

- Frontend: React Router v7 SSR app (mobile-first). Server renders initial route via loader data, then hydrates into a SPA. Use nested routes, loaders/actions, `defer()` for streaming when needed.
- Backend-for-frontend: Route loaders/actions call PokeAPI and DynamoDB. All API keys (if any) remain server-side. Mutations go through actions with CSRF/session protection.
- Data access: Dedicated libs for PokeAPI and user data. `fetch` + `zod` for runtime validation and typed parsing. Small caching layer on the server.
- Auth: Cognito Hosted UI (OIDC). Session persisted in HTTP-only cookie. Guards/redirects handled in loaders.
- Persistence: DynamoDB single-table (user-centric items: squad, box, pokedex progress). Write-optimized for common access patterns.
- Hosting/Delivery: Amplify Hosting (SSR) + CloudFront. Static assets via CDN; SSR via Node runtime provided by Amplify.
- CI/CD: GitHub Actions with Nx affected targets and remote cache; deploy to Amplify on main branch.

## Frontend

- Stack: React Router v7, TypeScript, Vite, Tailwind, shadcn/ui
- Principles: mobile-first, responsive, SSR for first paint; SPA after hydration; consistent design system.
- State: Prefer loader data for route state. Introduce TanStack Query later only where needed for highly interactive views.
- Accessibility: Use Radix-based components (via shadcn) to ensure a11y primitives.

Pros:
- First-class SSR with loaders/actions; progressive enhancement built-in.
- Nested routing simplifies page/tabs composition.
- No client-side secrets; better performance and SEO from SSR.

Cons:
- SSR build/deploy on AWS requires a slightly more bespoke setup than turnkey PaaS.
- Loader/action discipline adds some structure overhead (beneficial long-term).

## Backend-for-frontend (BFF)

- Mechanism: Route loaders (reads) and actions (writes/mutations) encapsulate all external calls.
- Validation: `zod` for response/runtime validation; narrow types exported from `libs/models`.
- Error handling: Typed error helpers; map to HTTP responses; user-friendly error boundaries at route level.
- Caching strategy:
  - Short-lived in-memory LRU for hot PokeAPI responses (per server instance)
  - Respect upstream HTTP caching headers; set sensible `Cache-Control` for CDN
  - Optional DynamoDB TTL cache for heavier endpoints (enable later if needed)

Pros:
- Centralizes data logic; easy to evolve; secure by default.
- Flexible caching choices without coupling to a 3rd-party SDK.

Cons:
- Slightly more implementation work than adopting a feature-rich SDK cache.

Note on `pokedex-promise-v2`:
- It provides convenience and basic caching. We prefer `fetch + zod` for control, validation, and SSR friendliness. If desired later, we can wrap the library behind our data-access interface.

## Data and persistence

- Store: DynamoDB (single-table). Optimized for user-centric access patterns:
  - Read/update a user's squad (order preserved)
  - Add/remove box entries; list latest additions
  - Track pokedex status (seen/caught) per user
  - Migrate guest data to user account upon sign-in
- Modeling approach: predictable partition keys per user; GSIs for recent activity and box listings. We will design keys and GSIs in a dedicated step.

Pros:
- Serverless, elastic, low cost; great fit for user-item aggregations.
- No ops overhead; integrates cleanly with Amplify and Cognito.

Cons:
- Different mental model than relational; requires careful access-pattern design.

Alternative (kept in mind):
- Serverless Postgres (e.g., Neon) + Drizzle ORM if we later prefer relational modeling.

## Auth and sessions

- Cognito Hosted UI (OIDC) for sign-in/sign-up, federated providers optional.
- SSR session cookie (HTTP-only, SameSite=Lax/Strict) storing user identity and minimal claims.
- Guest mode: localStorage for box/squad; on login, a server action migrates guest data to the user's DynamoDB records.

Pros:
- No custom auth implementation; secure and scalable.
- Clean SSR integration with session cookies.

Cons:
- Cognito UX is less customizable than bespoke UIs (trade-off for speed/security).

## Hosting and delivery

- Primary: AWS Amplify Hosting for SSR React Router app + CloudFront.
  - Amplify handles build, environment variables, SSR runtime, and CDN distribution.
- Observability: CloudWatch logs; optional Sentry for FE/BE error tracking.

Pros:
- "All-in-AWS" simplicity; minimal DevOps.
- Global CDN via CloudFront; easy environment management.

Cons:
- Less prescriptive than Vercel/Netlify flows; AWS console knowledge required.

Alternative:
- Architect/SST adaptor deploying SSR to Lambda@Edge with fine-grained control if needed later.

## Images and assets

- Primary source: PokeAPI "dream-world" SVG-like assets for silhouettes and cards.
- Optional: Use "official-artwork" for larger hero images (home/details) if visual quality demands.
- Performance: responsive images, lazy loading, CDN caching.

## Nx workspace (high-level plan)

We will structure the monorepo to keep concerns isolated and reusable:

- apps/pokedex: React Router v7 SSR application
- libs/ui: shadcn components and design tokens
- libs/models: shared types and zod schemas
- libs/data-access/pokeapi: server-only fetchers, response validation, caching
- libs/data-access/user-data: DynamoDB access utilities
- libs/utils: cross-cutting helpers (date, formatting, guards)

We will define generators/conventions as we proceed.

## CI/CD

- GitHub Actions pipeline
  - Setup Node 22; pnpm; Nx cache (remote optional)
  - Lint, typecheck, build
  - Deploy to Amplify on main

## Next validation step

Please confirm this high-level infrastructure. Next, we will design the frontend structure (routes, pages, components, data contracts) step-by-step and reflect decisions back into this document.
