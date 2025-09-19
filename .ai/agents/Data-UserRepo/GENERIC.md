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
