# Pokedex CI/CD (Nx + Amplify Hosting)

This plan describes automation from pull request to production using GitHub Actions, Nx, and Amplify Hosting.

## Branching

- `main`: production
- `develop` (optional): staging
- Feature branches: PR to `develop` or `main`

## Pipelines

### PR validation

- Trigger: pull_request
- Jobs:
  - Setup Node 22, pnpm
  - Restore Nx cache
  - `pnpm nx affected --target=lint,typecheck,test,build` (no deploy)
  - Upload build artifacts (optional)

### Deploy staging (optional)

- Trigger: push to `develop`
- Jobs:
  - Same steps as PR, then:
  - Deploy app to Amplify `staging` environment
  - Run post-deploy smoke test (HTTP 200 on `/`)

### Deploy production

- Variant A (branch-based):
  - Trigger: push to `main`
  - Jobs:
    - Same steps as PR, then:
    - Deploy app to Amplify `prod` environment
    - Invalidate CDN (Amplify handles)

## Trunk-based variant (manual release to production)

- Push on `main` (trunk): build and deploy to Amplify `staging` only; no tagging
- Manual job: run Nx Release (conventional commits), tag, and deploy to `prod`

Flow
- PRs → CI validation (no deploy)
- main push → build once → deploy to `staging` (smoke test)
- Manual "Release" → Nx Release computes version from conventional commits, updates changelog, creates and pushes git tag → deploy same commit to `prod`

Notes
- Ensure commit messages follow conventional-commit spec
- Use GitHub Environments with required reviewers for `production`
- Prefer GitHub OIDC to assume an AWS role (no long-lived keys)

### Manual release workflow (example)

```yaml
name: release

on:
  workflow_dispatch:
    inputs:
      dryRun:
        description: 'Dry run release (no push/deploy)'
        required: false
        default: 'false'

permissions:
  contents: write
  id-token: write

jobs:
  release-and-deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # required for tagging
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - run: pnpm install --frozen-lockfile

      # Compute version + changelog from conventional commits and create tag
      - name: Nx Release (version + changelog)
        run: |
          if [ "${{ github.event.inputs.dryRun }}" = "true" ]; then
            pnpm nx release --yes --dry-run
          else
            pnpm nx release --yes
          fi

      - name: Push tags and release commits
        if: github.event.inputs.dryRun != 'true'
        run: |
          git push origin HEAD:main --follow-tags

      # Build the SSR app at the tagged commit (current HEAD)
      - name: Build SSR app
        run: pnpm nx build pokedex

      # Deploy to Amplify production
      - name: Deploy to Amplify (prod)
        if: github.event.inputs.dryRun != 'true'
        env:
          AMPLIFY_APP_ID: ${{ secrets.AMPLIFY_APP_ID }}
          AMPLIFY_BRANCH: prod
          AWS_REGION: ${{ secrets.AWS_REGION }}
        run: |
          npx -y @aws-amplify/cli@latest publish \
            --app-id "$AMPLIFY_APP_ID" \
            --env "$AMPLIFY_BRANCH" \
            --yes
```

## GitHub Actions skeleton

```yaml
name: ci

on:
  pull_request:
    branches: [ main, develop ]
  push:
    branches: [ main, develop ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - run: pnpm install --frozen-lockfile
      - name: Nx cache restore
        uses: actions/cache@v4
        with:
          path: .nx/cache
          key: ${{ runner.os }}-nx-${{ github.sha }}
          restore-keys: |
            ${{ runner.os }}-nx-
      - run: pnpm nx affected --target=lint --parallel
      - run: pnpm nx affected --target=typecheck --parallel
      - run: pnpm nx affected --target=test --parallel --ci --code-coverage
      - run: pnpm nx affected --target=build --parallel

  deploy:
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - run: pnpm install --frozen-lockfile
      - name: Build SSR app
        run: pnpm nx build pokedex
      - name: Deploy to Amplify
        env:
          AMPLIFY_APP_ID: ${{ secrets.AMPLIFY_APP_ID }}
          AMPLIFY_BRANCH: ${{ github.ref == 'refs/heads/main' && 'prod' || 'staging' }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_REGION: ${{ secrets.AWS_REGION }}
        run: |
          npx -y @aws-amplify/cli@latest publish \
            --app-id "$AMPLIFY_APP_ID" \
            --env "$AMPLIFY_BRANCH" \
            --yes
```

Notes
- Alternatively, connect Amplify directly to the repo for auto-deploy on branch pushes and keep Actions for validation only.
- Set env variables per Amplify environment (COGNITO_*, DYNAMO_*, SESSION_SECRET via SSM/Secrets).
- Avoid committing secrets; use GitHub OIDC to assume a deploy role in AWS instead of long-lived keys.

## Caching and artifacts

- Nx local cache committed to `.nx/cache` in CI cache; consider Nx Cloud for remote cache later
- Optionally upload SSR build artifacts for debugging

## Smoke tests

- HTTP GET `/` should return 200 and contain expected text
- Add route-level health endpoints if needed
