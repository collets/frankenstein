import { Stack, StackProps, CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AttributeType, BillingMode, Table, ProjectionType, CfnTable } from 'aws-cdk-lib/aws-dynamodb';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import type { StageName } from '../config/stages';

export interface PokedexDynamoStackProps extends StackProps {
  readonly stage: StageName;
  readonly parameterPrefix: string;
  readonly tableNameParameterPath: string;
  readonly awsRegionParameterPath: string;
}

export class PokedexDynamoStack extends Stack {
  public readonly table: Table;

  constructor(scope: Construct, id: string, props?: PokedexDynamoStackProps) {
    super(scope, id, props);

    this.table = new Table(this, 'PokedexTable', {
      tableName: `pokedex-${props?.stage ?? 'staging'}`,
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl',
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // Enable PITR using the non-deprecated L1 property
    const cfnTable = this.table.node.defaultChild as CfnTable;
    cfnTable.pointInTimeRecoverySpecification = { pointInTimeRecoveryEnabled: true };

    this.table.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    new CfnOutput(this, 'TableName', { value: this.table.tableName, exportName: `${id}:TableName` });
    new CfnOutput(this, 'TableArn', { value: this.table.tableArn, exportName: `${id}:TableArn` });

    // SSM Parameters by NAME only (placeholder values)
    new StringParameter(this, 'ParamDynamoTableName', {
      parameterName: props?.tableNameParameterPath,
      stringValue: 'TO_BE_SET'
    });

    new StringParameter(this, 'ParamAwsRegion', {
      parameterName: props?.awsRegionParameterPath,
      stringValue: 'TO_BE_SET'
    });
  }
}
