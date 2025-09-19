# Agent: FE-Framework (Generic Spec)

Scope
- SSR app setup (React Router v7): root, entries, route wiring
- Loaders/actions orchestration (no domain logic)
- Error boundaries, skeleton states, streaming with defer
- Performance budgets and code-splitting

Constraints
- Do not import server-only repos directly in client modules
- Consume contracts from `libs/models`; data ops via route boundaries only

Definition of Done
- SSR renders minimal layout and route shells
- Loaders/actions typed, tested with MSW/in-memory repos
- No cross-boundary imports; passes lint/type/test
