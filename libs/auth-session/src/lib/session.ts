import crypto from 'node:crypto';

export interface SessionCookiePayload {
  userId: string | null;
  isGuest: boolean;
  guestId?: string;
  csrf?: string;
  iat: number;
  exp?: number;
}

export interface SessionCookieOptions {
  cookieName: string;
  secret: string;
  maxAgeSeconds?: number;
  sameSite?: 'lax' | 'strict' | 'none';
  secure?: boolean;
  path?: string;
  domain?: string;
}

export interface SetCookieHeader {
  name: string;
  value: string;
  attributes: string[];
}

function encrypt(plaintext: string, secret: string): string {
  const key = crypto.createHash('sha256').update(secret).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString('base64url');
}

function decrypt(enc: string, secret: string): string {
  const buf = Buffer.from(enc, 'base64url');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const ciphertext = buf.subarray(28);
  const key = crypto.createHash('sha256').update(secret).digest();
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
  return plaintext;
}

export function createSessionCookie(payload: Omit<SessionCookiePayload, 'iat'>, opts: SessionCookieOptions): SetCookieHeader {
  const now = Math.floor(Date.now() / 1000);
  const body: SessionCookiePayload = { ...payload, iat: now };
  const json = JSON.stringify(body);
  const value = encrypt(json, opts.secret);
  const attributes: string[] = [
    'HttpOnly',
    `Path=${opts.path ?? '/'}`,
    (opts.secure ?? true) ? 'Secure' : '',
    `SameSite=${(opts.sameSite ?? 'lax').charAt(0).toUpperCase()}${(opts.sameSite ?? 'lax').slice(1)}`,
  ].filter(Boolean);
  if (opts.domain) attributes.push(`Domain=${opts.domain}`);
  if (opts.maxAgeSeconds) attributes.push(`Max-Age=${opts.maxAgeSeconds}`);
  return { name: opts.cookieName, value, attributes };
}

export function destroySessionCookie(opts: SessionCookieOptions): SetCookieHeader {
  const attributes: string[] = [
    'HttpOnly',
    `Path=${opts.path ?? '/'}`,
    (opts.secure ?? true) ? 'Secure' : '',
    `SameSite=${(opts.sameSite ?? 'lax').charAt(0).toUpperCase()}${(opts.sameSite ?? 'lax').slice(1)}`,
    'Max-Age=0'
  ].filter(Boolean);
  if (opts.domain) attributes.push(`Domain=${opts.domain}`);
  return { name: opts.cookieName, value: 'deleted', attributes };
}

export function parseCookies(headerValue: string | null | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!headerValue) return out;
  const pairs = headerValue.split(';');
  for (const pair of pairs) {
    const [k, v] = pair.split('=');
    if (!k) continue;
    const key = k.trim();
    if (!key) continue;
    if (v === undefined) continue;
    out[key] = decodeURIComponent(v.trim());
  }
  return out;
}

export function readSessionCookie(request: Request, opts: SessionCookieOptions): SessionCookiePayload | undefined {
  const rawCookie = request.headers.get('cookie');
  const all = parseCookies(rawCookie);
  const enc = all[opts.cookieName];
  if (!enc) return undefined;
  try {
    const json = decrypt(enc, opts.secret);
    const parsed = JSON.parse(json) as SessionCookiePayload;
    return parsed;
  } catch {
    return undefined;
  }
}

export function toSetCookieString(setCookie: SetCookieHeader): string {
  return `${setCookie.name}=${setCookie.value}; ${setCookie.attributes.join('; ')}`;
}

export function ensureGuestSession(session: SessionCookiePayload | undefined): SessionCookiePayload {
  if (session && session.userId !== undefined) return session;
  const guestId = crypto.randomUUID();
  return { userId: null, isGuest: true, guestId, iat: Math.floor(Date.now() / 1000) };
}

