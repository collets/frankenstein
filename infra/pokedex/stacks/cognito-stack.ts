import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { CfnSecret } from 'aws-cdk-lib/aws-secretsmanager';

export interface PokedexCognitoStackProps extends StackProps {
  readonly userPoolIdParameterPath: string;
  readonly userPoolClientIdParameterPath: string;
  readonly issuerUrlParameterPath: string;
  readonly redirectUriParameterPath: string;
  readonly logoutUriParameterPath: string;
  readonly sessionSecretName: string;
  readonly cognitoClientSecretName: string;
  readonly thirdPartyApiKeySecretName: string;
}

export class PokedexCognitoStack extends Stack {
  public readonly userPool: UserPool;
  public readonly userPoolClient: UserPoolClient;

  constructor(scope: Construct, id: string, props: PokedexCognitoStackProps) {
    super(scope, id, props);

    this.userPool = new UserPool(this, 'UserPool', {
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      standardAttributes: { email: { required: true, mutable: false } },
    });

    this.userPoolClient = new UserPoolClient(this, 'UserPoolClient', {
      userPool: this.userPool,
      authFlows: { userSrp: true, adminUserPassword: false, custom: false, userPassword: false },
      // OAuth Hosted UI can be configured later once domains/redirects are decided
      generateSecret: false,
    });

    const issuerUrl = `https://cognito-idp.${this.region}.amazonaws.com/${this.userPool.userPoolId}`;

    // Outputs
    new CfnOutput(this, 'UserPoolId', { value: this.userPool.userPoolId, exportName: `${id}:UserPoolId` });
    new CfnOutput(this, 'UserPoolClientId', { value: this.userPoolClient.userPoolClientId, exportName: `${id}:UserPoolClientId` });
    new CfnOutput(this, 'IssuerUrl', { value: issuerUrl, exportName: `${id}:IssuerUrl` });

    // SSM Parameters (created by name, placeholder values)
    new StringParameter(this, 'ParamUserPoolId', {
      parameterName: props.userPoolIdParameterPath,
      stringValue: 'TO_BE_SET'
    });

    new StringParameter(this, 'ParamUserPoolClientId', {
      parameterName: props.userPoolClientIdParameterPath,
      stringValue: 'TO_BE_SET'
    });

    new StringParameter(this, 'ParamIssuerUrl', {
      parameterName: props.issuerUrlParameterPath,
      stringValue: 'TO_BE_SET'
    });

    new StringParameter(this, 'ParamRedirectUri', {
      parameterName: props.redirectUriParameterPath,
      stringValue: 'TO_BE_SET'
    });

    new StringParameter(this, 'ParamLogoutUri', {
      parameterName: props.logoutUriParameterPath,
      stringValue: 'TO_BE_SET'
    });

    // Secrets (created by name only, no value at creation)
    new CfnSecret(this, 'SessionSecret', {
      name: props.sessionSecretName,
    });

    new CfnSecret(this, 'CognitoClientSecret', {
      name: props.cognitoClientSecretName,
    });

    new CfnSecret(this, 'ThirdPartyApiKey', {
      name: props.thirdPartyApiKeySecretName,
    });
  }
}

