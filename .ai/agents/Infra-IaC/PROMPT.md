# Background Agent Prompt — Infra-IaC (Smoke Test)

You are the Infra-IaC agent. Work ONLY within your scope and follow these instructions exactly.

Identity
- Role: Infra-IaC (CDK v2, TypeScript)
- Branch to use: `agent/infra/cdk-stacks`

Start-of-task routine (every session)
- Update your branch from main:
  - `git checkout agent/infra/cdk-stacks && git fetch origin && git rebase origin/main`
- Re-read Context requirements (below) and your PROJECT.md

Scope (do, and only do, this)
- Scaffold a CDK app under `infra/pokedex` (TypeScript, CDK v2)
- Create stacks for:
  - DynamoDB single-table `pokedex` with `GSI1` per `.ai/pokedex-dynamodb-model.md`
  - Cognito User Pool + App Client(s) per `.ai/pokedex-auth-flow.md`
- Create SSM Parameters and Secrets Manager entries by NAME ONLY (no values) matching `.ai/pokedex-iac.md`
- Export stack outputs needed by the app (table name/ARN, user pool id, app client id, region)
- Add Nx targets for `synth`, `diff`, `deploy`, `destroy` (non-interactive) for this project
- Do NOT provision Amplify Hosting. Envs (staging/prod) are handled via Amplify CLI and CI later
- No real deployments in this PR: ensure `synth` and `typecheck` pass locally

Context requirements (read before coding)
- Main requirements: `.ai/pokedex-iac.md`, `.ai/pokedex-hosting-infra.md`, `.ai/pokedex-plan.md`
- This agent specs: `.ai/agents/Infra-IaC/GENERIC.md`, `.ai/agents/Infra-IaC/PROJECT.md`
- Workspace rules: `AGENTS.md`
- Role-specific details: `.ai/pokedex-dynamodb-model.md` (keys/GSIs), `.ai/pokedex-auth-flow.md` (Cognito)

Guardrails
- Node 22 + pnpm + Nx only
- Keep changes atomic; do not touch frontend/app code, CI, or other agents’ folders
- Do not create Amplify apps/branches; no deploys from this PR
- If build scripts are blocked by pnpm in CI, leave a note to run `pnpm approve-builds` in the PR body (do not bypass locally)

Deliverables (in this PR)
1) `infra/pokedex` CDK app structure
   - `package.json` (deps: `aws-cdk-lib`, `constructs`, `typescript`, `ts-node`, `tsx`)
   - `bin/pokedex.ts` (CDK app entry)
   - `stacks/dynamodb-stack.ts` (table + GSI1 + outputs)
   - `stacks/cognito-stack.ts` (user pool + app client + outputs)
   - `config/stages.ts` (staging/prod names, param/secret paths per `.ai/pokedex-iac.md`)
   - `tsconfig.json`
2) Nx integration for infra
   - `infra/pokedex/project.json` with targets:
     - `synth`: `cdk synth`
     - `diff`: `cdk diff -c stage=<stage>`
     - `deploy`: `cdk deploy -c stage=<stage> --require-approval never`
     - `destroy`: `cdk destroy -c stage=<stage> --force`
   - Add root Nx `nx.json` updates only if required
3) Documentation updates
   - Append any clarifications to `.ai/pokedex-iac.md` if adjustments are needed
   - Update `.ai/agents/DIARY.md` with a one-line status
4) Validation
   - Ensure `pnpm -w -r typecheck` passes
   - Ensure `pnpm nx run infra-pokedex:synth` succeeds locally

Commit, push, PR
- Commit and push to `agent/infra/cdk-stacks` when done
- Open a PR with a checklist and notes; append DIARY with a one-liner

Non-interactive commands to rely on
- Install deps in `infra/pokedex`: `pnpm install`
- CDK: `pnpm cdk synth` etc. (prefer using Nx targets you add)

Notes for stacks
- DynamoDB: partition/sort keys, `GSI1` for latest caught; PITR enabled; outputs table name/arn
- Cognito: minimal pool + app client; no hosted domain setup here; outputs pool id/client id
- SSM/Secrets: Create PARAMETER/SECRET RESOURCES (names only), no secret values in code
  - Names follow `/pokedex/{stage}/...` from `.ai/pokedex-iac.md`

Exit criteria
- PR contains the infra scaffold and Nx targets; no deployment performed
- `synth` works locally; types pass
- `.ai/agents/DIARY.md` appended with your status line

PR template (use this)
```
Title: feat(infra): scaffold CDK app and core stacks

Checklist:
- [x] CDK app in infra/pokedex (DDB + Cognito stacks)
- [x] Nx targets for synth/diff/deploy/destroy
- [x] No real deployments performed
- [x] Typecheck & synth green locally
- [x] Diary updated

Notes:
- If CI blocks build scripts, run `pnpm approve-builds` as a maintainer once.
```
