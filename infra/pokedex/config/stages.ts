export type StageName = 'staging' | 'prod';

export interface StageConfig {
  readonly accountId?: string;
  readonly region: string;
  readonly stackNamePrefix: string;
  readonly parameterPrefix: string; // e.g., /pokedex/staging
}

export const stages: Record<StageName, StageConfig> = {
  staging: {
    accountId: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
    stackNamePrefix: 'Pokedex',
    parameterPrefix: '/pokedex/staging',
  },
  prod: {
    accountId: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
    stackNamePrefix: 'Pokedex',
    parameterPrefix: '/pokedex/prod',
  },
};

export function getStage(): StageName {
  const value = (process.env.stage || process.env.STAGE || '').toLowerCase();
  if (value === 'prod') return 'prod';
  return 'staging';
}
