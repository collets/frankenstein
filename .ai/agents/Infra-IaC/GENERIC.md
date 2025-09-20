# Agent: Infra-IaC (Generic Spec)

Scope
- CDK app in `infra/pokedex`: DynamoDB, Cognito, params/secrets
- Stage configs: staging/prod; domain patterns and callback URLs

Constraints
- No Amplify app provisioning initially; focus on app dependencies
- Principle of least privilege IAM

Definition of Done
- CDK synth/diff OK; deploy commands documented
- SSM/Secrets created per env; outputs documented for app

## Context requirements

- Main requirements: `.ai/` (read: `pokedex-iac.md`, `pokedex-hosting-infra.md`, `pokedex-plan.md`)
- This agent spec: `.ai/agents/Infra-IaC/PROJECT.md`
- Workspace rules: `AGENTS.md`
- Role-specific requirements: `.ai/pokedex-iac.md` (stacks, params) and `.ai/pokedex-hosting-infra.md` (envs/domains)

## Start-of-task routine
- Update branch: `git checkout agent/infra/cdk-stacks && git fetch origin && git rebase origin/main`
- Re-read Context requirements (above) and `PROJECT.md`
