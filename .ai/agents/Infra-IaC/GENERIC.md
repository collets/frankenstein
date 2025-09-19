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
