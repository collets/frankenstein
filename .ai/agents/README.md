# Pokedex Agent Squad — Overview & Orchestration

## Goal
Enable parallel implementation using Cursor background agents with minimal conflicts. Each agent owns a domain slice, works on a dedicated branch, and follows clear specs.

## Branching & PR flow
- main: trunk (deploys to staging)
- feature branches per agent: `agent/<role>/<short-topic>`
- PRs small and atomic; require passing CI; code owners per domain
- Manual release workflow tags and deploys to prod

## Orchestration
- Master diary: `.ai/agents/DIARY.md` (timeline, decisions, blockers)
- Daily sync note per agent appended to diary
- CI enforces lint, typecheck, tests, and no cross-boundary imports
- Merge order defined in workflow section below

## Agents & responsibilities (high-level)
- FE-Framework: SSR app shell, routes, loaders/actions wiring, error boundaries
- UI-DesignSystem: Tailwind/shadcn, tokens, components, accessibility
- Data-PokeAPI: fetch + zod, caching, retries, contracts
- Data-UserRepo: DynamoDB repos, in-memory adapter, migration logic
- Auth-Sessions: Cognito integration, session cookies, CSRF, guards
- Infra-IaC: CDK stacks (DDB, Cognito), params/secrets, env wiring
- CI-Release: CI pipelines, Nx Release config, smoke tests

See each agent folder for generic spec and project spec.

## Merge Workflow (initial)
1. Infra-IaC → prepares parameters/secrets (no deploy required locally)
2. FE-Framework + UI-DesignSystem in parallel (no cross-imports except `libs/ui` consumption)
3. Data-PokeAPI + Data-UserRepo in parallel (stable interfaces from `.ai/pokedex-interfaces.md`)
4. Auth-Sessions integrates with FE-Framework (feature flag off until ready)
5. CI-Release finalizes CI and staging deploys

## Conflict minimization
- Strict boundaries: UI never imports data-access; models only from `libs/models`
- Stable contracts in `.ai/pokedex-interfaces.md`; schema changes via PRs labeled `contract-change`
- Avoid shared file edits; agree shared token names up-front

## Local testability
- In-memory repos for user data
- MSW for PokeAPI
- Route-level tests executable offline
