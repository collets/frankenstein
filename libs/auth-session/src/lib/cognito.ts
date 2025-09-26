import crypto from 'node:crypto';

export interface CognitoEnvConfig {
  issuerUrl: string; // https://cognito-idp.<region>.amazonaws.com/<poolId>
  clientId: string;
  clientSecret?: string; // optional if public client
  redirectUri: string;
  logoutUri: string;
}

export interface TokenSet {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
}

export async function exchangeCodeForTokens(params: {
  code: string;
  codeVerifier?: string;
  config: CognitoEnvConfig;
  fetchImpl?: typeof fetch;
}): Promise<TokenSet> {
  const { code, codeVerifier, config } = params;
  const f = params.fetchImpl ?? fetch;
  const tokenUrl = `${config.issuerUrl}/oauth2/token`;
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: config.clientId,
    code,
    redirect_uri: config.redirectUri,
  });
  if (codeVerifier) body.set('code_verifier', codeVerifier);
  const headers: Record<string, string> = { 'content-type': 'application/x-www-form-urlencoded' };
  if (config.clientSecret) {
    const basic = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
    headers['authorization'] = `Basic ${basic}`;
  }
  const res = await f(tokenUrl, { method: 'POST', headers, body: body.toString() });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Token exchange failed: ${res.status} ${text}`);
  }
  const json = await res.json();
  return {
    idToken: json.id_token,
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresIn: json.expires_in,
    tokenType: json.token_type,
  };
}

export interface IdTokenClaims {
  sub: string;
  email?: string;
  aud?: string | string[];
  iss?: string;
  exp?: number;
  iat?: number;
  [k: string]: unknown;
}

export function decodeJwtWithoutVerify(token: string): { header: any; payload: IdTokenClaims } {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT');
  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as IdTokenClaims;
  const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
  return { header, payload };
}

export async function validateIdToken(token: string, cfg: { issuer: string; audience: string; fetchImpl?: typeof fetch }): Promise<IdTokenClaims> {
  // NOTE: For local/dev, we perform minimal validation without JWKs.
  // For production, a JWKs-based signature verification should be added.
  const { payload } = decodeJwtWithoutVerify(token);
  if (payload.iss && payload.iss !== cfg.issuer) throw new Error('Invalid issuer');
  const audOk = !payload.aud || (Array.isArray(payload.aud) ? payload.aud.includes(cfg.audience) : payload.aud === cfg.audience);
  if (!audOk) throw new Error('Invalid audience');
  if (payload.exp && Date.now() / 1000 > payload.exp + 60) throw new Error('Token expired');
  return payload;
}

export function generatePkceVerifier(): string {
  return crypto.randomBytes(32).toString('base64url');
}

export function pkceChallengeFromVerifier(verifier: string): string {
  const hash = crypto.createHash('sha256').update(verifier).digest('base64');
  return hash.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

