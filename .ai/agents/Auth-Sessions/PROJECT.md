# Auth-Sessions — Project Spec

Branch: `agent/auth-sessions/cognito`

Objectives
- Cognito Hosted UI integration; callback handler
- Session cookie; CSRF; guest migration action

Plan
- OIDC code exchange; validate ID token; session set
- Cookie SameSite handling (None for callback state; Lax for app session)
- Migration action; guards in loaders/actions
- Tests for session and migration

Dependencies
- FE-Framework for routing; Data-UserRepo for migration
