# Pokedex Project — Prerequisites Checklist

Use this as a step-by-step guide. Check items off and ping me when done.

## 1) Local environment

- Node.js 22.19.0
  - `nvm use` (repo has `.nvmrc`) - done
  - Verify: `node -v` → v22.19.0 - done
- pnpm 9+ - done: 10.16.0
  - Install: `corepack enable` then `corepack prepare pnpm@latest --activate`
  - Verify: `pnpm -v`
- Git - done
  - Configure user/email: `git config user.name` / `git config user.email`
  - Ensure SSH access to GitHub if you use SSH

Resources

- Node/NVM: `https://github.com/nvm-sh/nvm`
- pnpm: `https://pnpm.io/installation`

## 2) GitHub repository settings

- Protect `main` branch - done
  - Require PRs, status checks (lint/type/test/build) to pass
  - Require code owner review (optional)
- Environments - done. Question: how to set production that enables deploy only manually from main?
  - Create `staging` and `production` environments (Settings → Environments)
  - Add required reviewers for `production`
  - To allow only manual deploys to production from main:
    - In GitHub → Settings → Environments → `production`:
      - Protection rules:
        - Required reviewers: set at least 1 (your account is fine for now)
        - Deployment branch policy: allow deployments from selected branches only → add `main`
      - Secrets: none required if using OIDC; otherwise add temporary keys
    - Ensure the production workflow uses `workflow_dispatch` (manual) and sets `environment: production`
    - Keep the staging deploy job triggered on `push` to `main` with `environment: staging`

Resources
- Protected branches: `https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests`
- Environments: `https://docs.github.com/actions/deployment/targeting-different-environments/using-environments-for-deployment`

## 3) AWS account preparation (before deploys)

- Choose a region (e.g., `eu-west-1` or `us-east-1`)
- Create IAM roles
  - CDK deployer role with permissions for: CloudFormation, DynamoDB, Cognito, SSM, SecretsManager - done
  - Amplify publish permissions (or administrator for Amplify if simpler initially) - done
  - GitHub OIDC role for CI/CD — detailed guide
    - Set GitHub as Identity Provider and trust the repo
    - Allow minimal actions: Amplify publish, read SSM/Secrets
    - Steps (AWS Console):
      1) IAM → Identity providers → Add provider → OpenID Connect
         - Provider URL: `https://token.actions.githubusercontent.com`
         - Audience: `sts.amazonaws.com`
      2) Create IAM role (Trusted entity: Web identity → GitHub OIDC)
         - Trust policy (restrict to your repo and branch/tag):
```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"},
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {"token.actions.githubusercontent.com:aud": "sts.amazonaws.com"},
        "StringLike": {
          "token.actions.githubusercontent.com:sub": [
            "repo:<OWNER>/<REPO>:ref:refs/heads/main",
            "repo:<OWNER>/<REPO>:ref:refs/tags/*"
          ]
        }
      }
    }
  ]
}
```
         - Permissions policy (minimal Amplify + read params/secrets):
```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AmplifyDeploy",
      "Effect": "Allow",
      "Action": [
        "amplify:CreateDeployment",
        "amplify:StartDeployment",
        "amplify:GetApp",
        "amplify:GetBranch",
        "amplify:ListApps",
        "amplify:ListBranches"
      ],
      "Resource": "arn:aws:amplify:<REGION>:<ACCOUNT_ID>:apps/<AMPLIFY_APP_ID>/branches/*"
    },
    {
      "Sid": "ReadConfig",
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters",
        "secretsmanager:GetSecretValue"
      ],
      "Resource": [
        "arn:aws:ssm:<REGION>:<ACCOUNT_ID>:parameter/pokedex/*",
        "arn:aws:secretsmanager:<REGION>:<ACCOUNT_ID>:secret:pokedex/*"
      ]
    }
  ]
}
```
      3) In GitHub Actions workflows, add:
         - `permissions: id-token: write, contents: read`
         - Configure `aws-actions/configure-aws-credentials` to assume the role via OIDC
      4) Add repo secrets: `AMPLIFY_APP_ID`, `AWS_REGION` (no long-lived AWS keys)

      CDK ROLE CREATED:
      - arn:aws:iam::371045849962:role/CDK_DEV

      REPOSITORY SECRETS CREATED:
      - AMPLIFY_APP_ID
      - AWS_REGION
      - ROLE_AMPLIFY
      - ROLE_GITHUB_OIDC

- Amplify app
  - Create an Amplify app with environments `staging`, `prod` (can be via console)
  - Note `AMPLIFY_APP_ID`: d3mg5ufwk4ce1

Resources
- OIDC for GitHub → AWS: `https://docs.github.com/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services`
- Amplify Hosting: `https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html`

## 4) Cognito (can be provisioned later by CDK) - PROVISION LATER WITH CDK

- If manual for now:
  - Create User Pool and an App Client (no client secret for public SPA flows; for SSR we can keep confidential if needed)
  - Configure Hosted UI domain (temporary Amplify domain is fine)
  - Allowed callback URLs:
    - `https://staging.<your-domain>/auth/callback` (or Amplify staging URL)
    - `https://<your-domain>/auth/callback` (or Amplify prod URL)
  - Gather IDs: User Pool ID, App Client ID (and secret if configured)

Resources
- Cognito Hosted UI: `https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-userpools-hosted-ui.html`

## 5) Parameters & Secrets (names per iac doc) - Can we leave this for CDK management?

- Secrets Manager (rotation-worthy)
  - `/pokedex/staging/SESSION_SECRET` — a strong random string
  - `/pokedex/prod/SESSION_SECRET`
  - Any third-party keys you plan to use
- SSM Parameter Store
  - `/pokedex/staging/COGNITO_USER_POOL_ID`, `/COGNITO_CLIENT_ID`, `/ISSUER_URL`, `/REDIRECT_URI`, `/LOGOUT_URI`
  - `/pokedex/staging/DYNAMO_TABLE_NAME`, `/AWS_REGION`
  - Repeat for `prod`

Resources
- SSM: `https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html`
- Secrets Manager: `https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html`

## 6) Domains (optional now) - Later

- If you want custom domains
  - Set DNS for `pokedex.<root>` and `staging.pokedex.<root>` to Amplify when ready
  - Add matching callback URLs in Cognito

Resources
- Amplify custom domains: `https://docs.aws.amazon.com/amplify/latest/userguide/custom-domains.html`

## 7) CI/CD inputs

- GitHub Secrets (minimal if OIDC) - Done, OIDC configured
  - `AMPLIFY_APP_ID`
  - `AWS_REGION`
  - If not using OIDC yet (temporary): `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (replace later)

Resources
- Nx Release conventional commits: `https://nx.dev/features/manage-releases`

## 8) Local dev smoke check (once workspace is scaffolded)

- Run SSR dev server: `pnpm nx serve pokedex` (we’ll wire soon)
- Open http://localhost:PORT and verify placeholder renders

When you finish each step, mark it done and I’ll proceed to the next phase (workspace scaffold and agent branches).
