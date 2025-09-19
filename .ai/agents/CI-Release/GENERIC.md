# Agent: CI-Release (Generic Spec)

Scope
- GitHub Actions: PR validation; staging deploy on main; manual release job to prod
- Nx Release (conventional commits) tagging/changelog
- Smoke tests and environment protections

Constraints
- Use GitHub OIDC for AWS auth; no long-lived keys
- Keep workflows fast with Nx affected

Definition of Done
- CI green on PRs; staging auto-deploy works
- Manual release workflow dispatch deploys tagged commit to prod
