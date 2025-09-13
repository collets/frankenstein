# Pokedex Hosting & Server-Side Infrastructure (No CI/CD)

This document defines the staging/production hosting approach and server-side services for the Pokedex app, excluding CI/CD.

## Overview

- Platform: AWS with Amplify Hosting for SSR React Router v7 app
- CDN: CloudFront (managed by Amplify)
- Compute: Amplify-managed SSR runtime (Node)
- Data: DynamoDB single-table (`pokedex`) + optional S3 for logs/artifacts
- Auth: Cognito User Pool + Hosted UI
- Observability: CloudWatch logs/metrics; optional Sentry
- Secrets/Config: Amplify environment variables

## Environments

- `staging`, `prod`
- Separate Amplify environments per stage
- Separate Cognito User Pools per stage (or separate app clients minimally)
- One DynamoDB table per stage (namespaced)

## Networking & Security

- HTTPS via Amplify-managed certs
- Custom domains per stage (e.g., `staging.pokedex.example.com`, `pokedex.example.com`)
- WAF (optional) in front of CloudFront for basic rate-limiting/bot control
- CORS: no public API exposed; SSR handles data server-side

## SSR App (Amplify)

- Build artifacts include server entry for SSR
- Amplify handles:
  - Build-time environment injection
  - CloudFront distribution and cache invalidation
  - Node runtime for SSR, with access to environment variables
- Environment variables:
  - Cognito: `COGNITO_*`
  - Session: `SESSION_SECRET`
  - DynamoDB: `TABLE_NAME` (and region)
  - Observability: `SENTRY_DSN` (optional)

### React Router compatibility note

React Router framework apps deploy to any Node SSR host. Amplify provides a managed Node runtime for SSR, so the app can run without a custom server layer. If we ever need a custom server or Docker-based deploy, React Router also ships templates targeting generic Node+Docker (which fit ECS/Fargate) per the official guides: see [Deploying templates](https://reactrouter.com/start/framework/deploying) and the [Node template repo](https://github.com/remix-run/react-router-templates/tree/main/default).

## Data layer

- DynamoDB (as per `.ai/pokedex-dynamodb-model.md`)
- Provisioned or On-demand capacity (start On-demand)
- GSIs: `GSI1` for latest caught, as specified
- Backups: Point-in-Time Recovery (PITR) enabled
- IAM policy for app runtime limited to table and required GSIs only

## Auth layer

- Cognito User Pool with Hosted UI (OIDC)
- App clients per environment; redirect URIs per domain
- Minimal user attributes (email, sub)
- Federation (Google/Apple) optionally added later

## Caching strategy

- Edge caching: CloudFront caches static assets aggressively
- SSR responses: short-lived caching for list pages if safe (otherwise no cache)
- PokeAPI responses: server in-memory LRU; optional CDN cache for certain endpoints via loader headers

## Observability

- CloudWatch Logs for SSR runtime
- Metrics: error rates, latency percentiles
- Structured logging with correlation id
- Optional Sentry for FE/BE error tracking (dsn via env)

## Local development

- Run SSR app locally (Node) against AWS resources or LocalStack (optional)
- Use `.env` for local values; never commit secrets

## Risks & mitigations

- Cold starts: Amplify SSR generally low; mitigate with traffic and CDN caching
- Upstream PokeAPI limits: add retries/backoff and modest caching
- Vendor lock-in: architecture remains portable to other SSR-on-Edge providers
