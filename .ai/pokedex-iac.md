# Pokedex IaC in Nx Monorepo

This document proposes how we manage infrastructure as code (IaC) for hosting, Cognito, and DynamoDB.

## Choice: AWS CDK v2 (TypeScript)

- Reasons
  - First-class AWS coverage; fits Amplify hosting + app resources (Cognito, DynamoDB)
  - TypeScript DX in the same monorepo; reuse types/constants
  - Clear env scoping via stacks and context
- Alternatives
  - Terraform: great multi-cloud; heavier toolchain for this scope
  - SST/Architect: excellent for Lambda-first apps; we’re using Amplify Hosting, less need for their runtime abstractions

## Structure in Nx

- `apps/pokedex` — app code
- `infra/pokedex` — CDK app (new workspace folder outside libs/apps for clarity)
  - `bin/` cdk entrypoint
  - `stacks/`
    - `cognito-stack.ts`
    - `dynamodb-stack.ts`
    - `amplify-hosting-not-managed.ts` (placeholder if we later provision domains/certs)
  - `config/` per-env settings (account, region, names)
  - `package.json` (cdk dependencies)

Naming
- Stacks per environment: `PokedexCognitoStack-{stage}`, `PokedexDataStack-{stage}`

## What CDK manages

- DynamoDB table `pokedex` (with `GSI1` per model doc)
- Cognito User Pool, App Client(s), Hosted UI domains
- (Optional) Route53/ACM if we want to manage custom domains outside Amplify console

What CDK does not manage
- Amplify Hosting app itself (kept simple in console initially); we can later add AWS SDK automation if needed

## Environments

- `staging`, `prod`
- CDK context or env files provide table names, domain prefixes, callback URLs per stage

Domain patterns
- staging: `staging.<root-domain>` (e.g., `staging.pokedex.example.com`)
- prod: `<root-domain>` (e.g., `pokedex.example.com`)

Cognito callback URLs (examples)
- staging: `https://staging.pokedex.example.com/auth/callback`
- prod: `https://pokedex.example.com/auth/callback`

## Nx Targets

- `pnpm nx run infra-pokedex:build` — typecheck/compile CDK
- `pnpm nx run infra-pokedex:diff -- --profile <aws>` — cdk diff
- `pnpm nx run infra-pokedex:deploy -- --profile <aws> -c stage=staging` — cdk deploy
- `pnpm nx run infra-pokedex:destroy -- --profile <aws> -c stage=staging` — cdk destroy (careful)

We’ll wire these as project targets in `project.json` for `infra/pokedex`.

## Secrets & config

- Keep no secrets in code.
- App runtime env vars managed in Amplify environments (resolved from SSM/Secrets at deploy-time or manually set per env).
- Mapping per environment (`staging`, `prod`):

Secrets Manager (rotation-worthy or high-sensitivity)
- `/pokedex/{stage}/SESSION_SECRET` — cookie encryption/signing secret
- `/pokedex/{stage}/COGNITO_CLIENT_SECRET` — if using a confidential app client
- `/pokedex/{stage}/THIRDPARTY_API_KEY` — any external keys needing rotation

SSM Parameter Store
- SecureString (light secrets / config):
  - `/pokedex/{stage}/COGNITO_USER_POOL_ID`
  - `/pokedex/{stage}/COGNITO_CLIENT_ID`
  - `/pokedex/{stage}/COGNITO_ISSUER_URL`
  - `/pokedex/{stage}/COGNITO_REDIRECT_URI`
  - `/pokedex/{stage}/COGNITO_LOGOUT_URI`
  - `/pokedex/{stage}/DYNAMO_TABLE_NAME`
  - `/pokedex/{stage}/AWS_REGION`
- String (non-secret config):
  - `/pokedex/{stage}/SENTRY_DSN` (can be SecureString if preferred)
  - `/pokedex/{stage}/FEATURE_FLAGS` (json string)

Access policy
- App runtime IAM role has read access only to exact ARNs of required secrets/parameters for its stage.
- CDK deploy role can read/write/manage these during provisioning.

## Migration notes

- If we outgrow Amplify Hosting:
  - We can reuse CDK to provision ECS/Fargate service (using React Router Node+Docker template)
  - No change to DynamoDB/Cognito stacks

## Next steps

- Confirm CDK choice
- Define `infra/pokedex` scaffold and per-stage config placeholders
- Add minimal stacks: DynamoDB + Cognito
