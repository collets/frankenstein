# Infra-IaC — Project Spec

Branch: `agent/infra/cdk-stacks`

Objectives
- CDK stacks for DynamoDB + Cognito
- SSM/Secrets parameters and outputs

Plan
- Scaffold CDK app under `infra/pokedex`
- Add table (with GSI1), user pool + app clients
- Create parameters: per `.ai/pokedex-iac.md`
- Document deploy commands and outputs consumed by app

Dependencies
- None at runtime; outputs shared with FE/Auth teams
