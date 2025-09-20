# Agent: Auth-Sessions (Generic Spec)

Scope
- Cognito Hosted UI integration, callback handling
- Session cookie (HTTP-only, encryption), CSRF protections
- Guest mode storage + migration action wiring

Constraints
- SSR-first approach; avoid exposing secrets client-side
- Follow cookie SameSite guidance around OIDC

Definition of Done
- Sign-in/out flows with session established
- Migration action and tests; guards in loaders/actions

## Context requirements

- Main requirements: `.ai/` (read: `pokedex-auth-flow.md`, `pokedex-interfaces.md`, `pokedex-plan.md`)
- This agent spec: `.ai/agents/Auth-Sessions/PROJECT.md`
- Workspace rules: `AGENTS.md`
- Role-specific requirements: `.ai/pokedex-auth-flow.md` (cookies, callbacks, migration)

## Start-of-task routine
- Update branch: `git checkout agent/auth-sessions/cognito && git fetch origin && git rebase origin/main`
- Re-read Context requirements (above) and `PROJECT.md`
