import crypto from 'node:crypto';

export interface CsrfCookieOptions {
  cookieName: string;
  secure?: boolean;
  path?: string;
  sameSite?: 'lax' | 'strict' | 'none';
}

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

export function createCsrfCookie(token: string, opts: CsrfCookieOptions) {
  const attributes: string[] = [
    `Path=${opts.path ?? '/'}`,
    (opts.secure ?? true) ? 'Secure' : '',
    `SameSite=${(opts.sameSite ?? 'lax').charAt(0).toUpperCase()}${(opts.sameSite ?? 'lax').slice(1)}`,
  ].filter(Boolean);
  return { name: opts.cookieName, value: token, attributes };
}

export function validateDoubleSubmitCsrf(request: Request, tokenFieldName = 'csrf'): boolean {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookie = cookieHeader.split(';').map((s) => s.trim()).find((p) => p.startsWith(`${tokenFieldName}=`));
  if (!cookie) return false;
  const cookieValue = decodeURIComponent(cookie.split('=')[1] ?? '');
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    // cannot parse body without reading it; leave to caller
    return true;
  }
  if (contentType.includes('application/json')) {
    // cannot synchronously read; caller must compare
    return true;
  }
  return !!cookieValue;
}

