# Data-UserRepo — Project Spec

Branch: `agent/data-userrepo/repos`

Objectives
- Implement DynamoDB repos + in-memory adapter
- Guest→user migration utilities

Plan
- squadRepo, boxRepo, dexRepo, profileRepo per `.ai/pokedex-dynamodb-model.md`
- Add read-your-writes behaviors; idempotent migration
- Unit tests against in-memory adapter

Dependencies
- Contracts in `.ai/pokedex-interfaces.md`
- Consumed by route actions/loaders
