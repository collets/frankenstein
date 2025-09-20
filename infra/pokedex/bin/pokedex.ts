import 'source-map-support/register';
import { App, StackProps, Environment } from 'aws-cdk-lib';
import { stages, getStage } from '../config/stages';
import { PokedexDynamoStack } from '../stacks/dynamodb-stack';
import { PokedexCognitoStack } from '../stacks/cognito-stack';

const app = new App();

const stage = getStage();
const cfg = stages[stage];

const env: Environment = {
  account: cfg.accountId,
  region: cfg.region,
};

const baseProps: StackProps = { env, tags: { project: 'pokedex', stage } };

const dynamo = new PokedexDynamoStack(
  app,
  `${cfg.stackNamePrefix}DataStack-${stage}`,
  {
    ...baseProps,
    description: 'Pokedex DynamoDB table and indexes',
    stage,
    parameterPrefix: cfg.parameterPrefix,
    tableNameParameterPath: `${cfg.parameterPrefix}/DYNAMO_TABLE_NAME`,
    awsRegionParameterPath: `${cfg.parameterPrefix}/AWS_REGION`,
  }
);

new PokedexCognitoStack(app, `${cfg.stackNamePrefix}CognitoStack-${stage}`, {
  ...baseProps,
  description: 'Pokedex Cognito user pool and app client',
  userPoolIdParameterPath: `${cfg.parameterPrefix}/COGNITO_USER_POOL_ID`,
  userPoolClientIdParameterPath: `${cfg.parameterPrefix}/COGNITO_CLIENT_ID`,
  issuerUrlParameterPath: `${cfg.parameterPrefix}/COGNITO_ISSUER_URL`,
  redirectUriParameterPath: `${cfg.parameterPrefix}/COGNITO_REDIRECT_URI`,
  logoutUriParameterPath: `${cfg.parameterPrefix}/COGNITO_LOGOUT_URI`,
  sessionSecretName: `/pokedex/${stage}/SESSION_SECRET`,
  cognitoClientSecretName: `/pokedex/${stage}/COGNITO_CLIENT_SECRET`,
  thirdPartyApiKeySecretName: `/pokedex/${stage}/THIRDPARTY_API_KEY`,
});

app.synth();
