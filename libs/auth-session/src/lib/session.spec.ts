import { describe, it, expect } from 'vitest';
import { createSessionCookie, readSessionCookie, toSetCookieString, destroySessionCookie } from './session';

describe('session cookie', () => {
  const opts = { cookieName: 'sid', secret: 'test-secret', sameSite: 'lax' as const, secure: false };

  it('creates and reads a session cookie', async () => {
    const set = createSessionCookie({ userId: 'user-123', isGuest: false }, opts);
    const cookieString = toSetCookieString(set);
    const req = new Request('http://localhost', { headers: { cookie: cookieString.split(';')[0] } });
    const payload = readSessionCookie(req, opts)!;
    expect(payload.userId).toBe('user-123');
    expect(payload.isGuest).toBe(false);
  });

  it('returns undefined on tampered cookie', async () => {
    const set = createSessionCookie({ userId: 'abc', isGuest: false }, opts);
    const bad = { ...set, value: set.value.slice(0, -2) + 'xx' };
    const req = new Request('http://localhost', { headers: { cookie: `${bad.name}=${bad.value}` } });
    const payload = readSessionCookie(req, opts);
    expect(payload).toBeUndefined();
  });

  it('produces a deletion cookie', () => {
    const del = destroySessionCookie(opts);
    expect(del.attributes.join('; ')).toContain('Max-Age=0');
  });
});

