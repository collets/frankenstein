# Pokedex Auth & Session Flow

This document outlines authentication via AWS Cognito (Hosted UI + OIDC), SSR session handling, guest mode, and migration from guest to authenticated accounts.

## Objectives

- Secure, standards-based auth with minimal custom logic
- SSR-friendly sessions via HTTP-only cookies
- Guest mode for frictionless exploration
- Safe, idempotent migration of guest data

## Components

- Cognito User Pool + Hosted UI (OIDC)
- SSR app (React Router v7) with loaders/actions
- Session storage: encrypted, signed HTTP-only cookie
- DynamoDB for user data

## Session lifecycle

1) Anonymous visit
- Create `guestId` (ULID) if not present; set client-side (localStorage) and mirror minimal state server-side via a short-lived cookie for correlation
- Session cookie contains `{ userId: null, guestId, isGuest: true }`

2) Sign-in
- User clicks Sign In → redirect to Cognito Hosted UI (OIDC)
- On callback, exchange code for tokens server-side
- Validate ID token, derive `userId` (sub)
- Create server session `{ userId, isGuest: false }` and set cookie

3) Sign-out
- Clear session cookie; redirect to Cognito logout URL; preserve local guestId to continue in guest mode if desired

## Cookie details

- HTTP-only, Secure, SameSite=Lax (Strict on non-OIDC flows), Path=/
- Contents: minimal identity + CSRF token reference
- Rotation: refresh session on each auth callback; short maxAge with sliding expiration
- Encryption/signing: server secret; key rotation via env vars

## Guest mode

- Local storage holds:
  - `guestId`
  - tentative `box` entries (speciesId list with timestamps)
  - tentative `squad` (up to 6 species with order)
  - tentative `dex` status (seen/caught flags)
- Server awareness:
  - Loaders detect guest and may reconcile server state lazily (optional)
  - Actions validate and persist only on authenticated users; for guests, keep local-only until migration or add a limited guest server store if needed later

## Migration flow (guest → user)

Trigger: user signs in and we detect existing guest data.

Steps:
- Action `migrateGuestData(guestPayload)` receives serialized guest records (validated with zod)
- Server resolves `guestId` from cookie (defense-in-depth)
- Using the migration strategy in `.ai/pokedex-dynamodb-model.md`:
  - Rewrite keys from `USER#GUEST#{guestId}` to `USER#{userId}`
  - Squad: prefer existing user squad; fill remaining slots from guest (max 6)
  - Box: merge entries (distinct `entryId`)
  - Dex: OR flags; merge timestamps
- Idempotency: include an idempotency key (hash of guest payload + userId); upserts guarded by conditional writes
- On success: clear local guest data; update session `{ userId, isGuest: false }`

## Route guards and access policy

- Read routes (Home, Pokedex, Pokemon details): accessible to guests
- Mutations that alter persistent state:
  - For guests: either blocked with prompt to sign in, or allowed into local storage (configurable per flow)
  - For authenticated: allowed and persisted
- Box/Squad write operations: prompt sign-in if guest; optional "continue as guest" writes to local store

## CSRF and security

- Use double-submit cookie pattern or same-site cookie + origin checks for actions
- Validate referer/origin for POST actions
- Rate-limit auth callbacks and data-mutating actions

## Error handling

- Auth callback errors → redirect with message to `/user`
- Session decode failure → clear cookie and treat as guest
- Cognito downtime → degrade gracefully to guest mode; disable mutations

## Configuration (env)

- `COGNITO_USER_POOL_ID`
- `COGNITO_CLIENT_ID`
- `COGNITO_ISSUER_URL`
- `COGNITO_REDIRECT_URI`
- `COGNITO_LOGOUT_URI`
- `SESSION_SECRET`
- Cookie options (name, maxAge)

## Implementation hooks

- `requireUser(request)` helper returns `{ userId }` or throws redirect to `/user`
- `getSession(request)` reads and verifies cookie; `commitSession`/`destroySession`
- UI surfaces:
  - `/user` route shows sign-in/out and migration CTA when guest data exists
  - Post-auth, run migration action if client indicates guest data present

## Observability

- Log auth flows with correlation id
- Emit metrics: sign-ins, migrations, failures
- Alert on elevated auth errors
