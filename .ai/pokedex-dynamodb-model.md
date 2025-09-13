# Pokedex DynamoDB Single-Table Design

This describes the data model and access patterns for user-centric features: squad, box, and pokedex status. Goals: minimal RCU/WCU, simple queries, easy guest→user migration.

## Table

- Table name: `pokedex`
- Primary key: `PK` (partition), `SK` (sort)
- GSIs:
  - `GSI1` (latest additions): `GSI1PK`, `GSI1SK` for listing latest caught per user
  - Optional `GSI2` for global leaderboard/future needs (not used initially)
- TTL attribute: `ttl` (used only for optional caching records if introduced later)

## Key patterns

- Users
  - PK: `USER#{userId}`
  - SK: `PROFILE`

- Squad (ordered up to 6)
  - PK: `USER#{userId}`
  - SK: `SQUAD#SLOT#{slot}` (slot 1..6)

- Box entries (caught Pokémon)
  - PK: `USER#{userId}`
  - SK: `BOX#{entryId}` (ULID/KSUID for time-sortable ids)
  - GSI1PK: `USER#{userId}#BOX`
  - GSI1SK: `{addedAt}` (ISO or epoch for desc sort)

- Pokedex status
  - PK: `USER#{userId}`
  - SK: `DEX#{speciesId}`

- Guest records
  - Same shapes, replace `userId` with `guestId` (e.g., `USER#GUEST#{guestId}`)

## Item shapes

- Profile
  - Keys: PK, SK
  - Attributes: `displayName?`, `email?`, `createdAt`, `updatedAt`

- Squad slot
  - Keys: PK, SK
  - Attributes: `slot` (1..6), `speciesId`, `number`, `name`, `types` (array), `artworkUrl`, `addedAt`

- Box entry
  - Keys: PK, SK
  - Attributes: `entryId`, `speciesId`, `number`, `name`, `types` (array), `artworkUrl`, `addedAt`
  - GSI1: as above for latest listing

- Pokedex species status
  - Keys: PK, SK
  - Attributes: `speciesId`, `seen` (bool), `caught` (bool), `seenAt?`, `caughtAt?`

## Core access patterns

- Get squad (ordered)
  - Query PK=`USER#{id}` with `begins_with(SK, 'SQUAD#SLOT#')`, sort ascending by slot

- Update squad: add/move/remove
  - Put/Delete specific `SQUAD#SLOT#{slot}`
  - Move up/down by swapping `slot` between two items (transaction)

- Get latest caught (preview)
  - Query `GSI1` with GSI1PK=`USER#{id}#BOX` and `limit=6` order by GSI1SK desc

- List box with pagination
  - Query PK=`USER#{id}` with `begins_with(SK, 'BOX#')`, use `LastEvaluatedKey` for cursor

- Catch Pokémon
  - Transaction:
    - Put `BOX#{entryId}` with `addedAt=now`
    - Update `DEX#{speciesId}` set `caught=true`, `caughtAt=now` (create if absent)

- Free Pokémon
  - Transaction:
    - Delete `BOX#{entryId}`
    - If in squad, delete corresponding `SQUAD#SLOT#{slot}` (slot lookup by speciesId requires an index scan via query on `begins_with('SQUAD#SLOT#')` then filter speciesId; acceptable due to max 6)

- Mark seen
  - Upsert `DEX#{speciesId}` with `seen=true`, `seenAt=now`

## Guest → User migration

- Input: `guestId`, `userId`
- Steps:
  - Query all guest items with PK=`USER#GUEST#{guestId}`
  - For each item, rewrite keys to `USER#{userId}`
    - For squad collisions (both have squads): prefer user, append guest entries into available slots up to 6
    - For box collisions (duplicate species): keep both (distinct `entryId`)
    - For dex: OR the flags (`seen`, `caught`) and min of timestamps
  - BatchWrite/TransactWrite with idempotency key

## Notes on costs and limits

- Per-user partitions remain small and hot, which is fine given low RCU/WCU
- Box queries use SK prefix; preview uses GSI1 for time-ordered reads
- Max squad size (6) keeps reorders cheap and simple

## Validation

- All write paths validated with `zod` in `libs/models`
- Repositories reside in `libs/data-access/user-data`; loaders/actions call through these APIs

## Future extensions

- Add `GSI2` for cross-user ranking (e.g., total caught) if needed
- Add soft-delete flags on box entries if undo is desired
- Introduce write-time denormalized counters per user (e.g., `stats` item)
