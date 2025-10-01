import { describe, it, expect } from 'vitest';
import { decodeJwtWithoutVerify, validateIdToken } from './cognito';

function makeJwt(payload: any) {
  const header = { alg: 'none', typ: 'JWT' };
  const b64 = (obj: any) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  return `${b64(header)}.${b64(payload)}.`;
}

describe('cognito token helpers', () => {
  it('decodes jwt without verify', () => {
    const jwt = makeJwt({ sub: 'u1', aud: 'client', iss: 'issuer', exp: Math.floor(Date.now()/1000)+3600 });
    const { payload } = decodeJwtWithoutVerify(jwt);
    expect(payload.sub).toBe('u1');
  });

  it('validates audience and issuer', async () => {
    const jwt = makeJwt({ sub: 'u1', aud: 'client', iss: 'issuer', exp: Math.floor(Date.now()/1000)+3600 });
    const claims = await validateIdToken(jwt, { issuer: 'issuer', audience: 'client' });
    expect(claims.sub).toBe('u1');
  });
});

