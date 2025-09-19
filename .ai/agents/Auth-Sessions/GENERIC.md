# Agent: Auth-Sessions (Generic Spec)

Scope
- Cognito Hosted UI integration, callback handling
- Session cookie (HTTP-only, encryption), CSRF protections
- Guest mode storage + migration action wiring

Constraints
- SSR-first approach; avoid exposing secrets client-side
- Follow cookie SameSite guidance around OIDC

Definition of Done
- Sign-in/out flows with session established
- Migration action and tests; guards in loaders/actions
