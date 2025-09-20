# Agent: Data-UserRepo (Generic Spec)

Scope
- Implement `libs/data-access/user-data` DynamoDB repos
- In-memory adapter for local dev; guest→user migration utils
- Read-your-writes consistency for immediate UI updates

Constraints
- Server-only code; no UI dependencies
- Validate inputs/outputs with zod

Definition of Done
- Repos: squadRepo, boxRepo, dexRepo, profileRepo (+ tests)
- Migration service with idempotency and tests

## Context requirements

- Main requirements: `.ai/` (read: `pokedex-dynamodb-model.md`, `pokedex-interfaces.md`, `pokedex-plan.md`)
- This agent spec: `.ai/agents/Data-UserRepo/PROJECT.md`
- Workspace rules: `AGENTS.md`
- Role-specific requirements: `.ai/pokedex-dynamodb-model.md` (keys, GSIs, access patterns)

## Start-of-task routine
- Update branch: `git checkout agent/data-userrepo/repos && git fetch origin && git rebase origin/main`
- Re-read Context requirements (above) and `PROJECT.md`
