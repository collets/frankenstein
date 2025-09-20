# Orchestrating Cursor Background Agents

## How it works
- Each agent runs as a Cursor background task with a narrow scope and clear inputs/outputs.
- Agents work on dedicated branches and produce small PRs.
- Periodic sync via `.ai/agents/DIARY.md` and short status PR comments.

## Branch strategy
- `main` → staging deploy
- `agent/<role>/<topic>` → feature branches
- Rebase/merge frequently to minimize drift

## PR discipline
- Atomic changes per PR (one concern)
- Required checks: lint, typecheck, unit tests, route tests
- Code owners: enforce reviews for cross-domain touches
- Labels: `contract-change`, `infra`, `ui`, `data`, `auth`, `release`

## Conflict avoidance
- Respect domain boundaries: UI vs data-access vs models
- Contracts in `.ai/pokedex-interfaces.md` are the single source of truth; propose changes via PR labeled `contract-change`
- Shared tokens and constants documented up-front

## Execution order & parallelism
- Phase 0 (preflight):
  - Infra-IaC — scaffold CDK (DynamoDB, Cognito), define SSM/Secrets names and outputs; no deploy required for local work
- Phase 1 (parallel):
  - UI-DesignSystem (tokens/components)
  - FE-Framework (skeleton routes/loaders with mocks)
  - Data-PokeAPI (fetchers, schemas)
  - Data-UserRepo (repos, in-memory adapter)
- Phase 2:
  - Auth-Sessions integrates with FE-Framework and Data-UserRepo
- Phase 3:
  - CI-Release finalizes pipelines; staging deploy and manual release

Deployment notes
- Infra-IaC can deploy to staging once FE skeleton and Auth are ready for integration tests
- Until then, teams rely on in-memory repos + MSW; no AWS dependency for local SSR

## Status & diary
- Agents append daily updates to `.ai/agents/DIARY.md`
- Mention branch, change summary, blockers

## Start-of-task routine (every session)
- Update branch from main to get latest context:
  - `git checkout <agent-branch>`
  - `git fetch origin` && `git rebase origin/main` (or merge if preferred)
- Re-read Context requirements in your GENERIC.md and PROJECT.md
- Then begin work; keep PRs atomic

## Merging to main
- Only after green checks and review
- Staging auto-deploy verifies artifact; then manual release can promote

## Commit, push, and PR policy
- Agents MUST commit and push to their own branch when work is complete for the task
- Agents MUST open a PR with an atomic scope and include a checklist and notes
- Agents MUST append a one-line update to `.ai/agents/DIARY.md` in the PR

## Local testing
- In-memory repos and MSW enable full offline testing
- Route tests run under Node SSR

## When conflicts arise
- Prefer reverting to last green commit and replaying small PRs
- For contract disagreements, schedule a single-PR change to `.ai/pokedex-interfaces.md` first
