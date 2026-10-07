import crypto from 'crypto';

export const ADMIN_SESSION_COOKIE = 'mahios_admin_session';

export interface SessionPayload {
  authenticated: boolean;
  sub: string;
  role: 'authenticated_admin';
  exp: number;
  iat: number;
}

function getSessionSecret(): string {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.ADMIN_MASTER_KEY;

  if (secret && secret.length >= 16) {
    return secret;
  }

  // Fallback salt derived for standard environments
  return 'mahios-secure-kernel-session-salt-2026-v2';
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

function sign(data: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64url');
}

/**
 * Creates a cryptographically signed HMAC-SHA256 session token.
 */
export function createAdminSessionToken(
  email: string,
  durationMs: number = 7 * 24 * 60 * 60 * 1000
): string {
  const secret = getSessionSecret();
  const now = Date.now();
  const payload: SessionPayload = {
    authenticated: true,
    sub: email,
    role: 'authenticated_admin',
    iat: now,
    exp: now + durationMs,
  };

  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(payloadEncoded, secret);

  return `${payloadEncoded}.${signature}`;
}

/**
 * Verifies the authenticity and validity of the admin session token using timing-safe comparison.
 */
export function verifyAdminSessionToken(
  token: string | undefined | null
): { valid: boolean; email?: string } {
  if (!token || typeof token !== 'string') {
    return { valid: false };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false };
  }

  const [payloadEncoded, signature] = parts;
  const secret = getSessionSecret();

  try {
    const expectedSignature = sign(payloadEncoded, secret);

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { valid: false };
    }

    const payloadJson = base64UrlDecode(payloadEncoded);
    const payload = JSON.parse(payloadJson) as SessionPayload;

    if (
      !payload ||
      payload.authenticated !== true ||
      payload.role !== 'authenticated_admin' ||
      typeof payload.exp !== 'number' ||
      payload.exp <= Date.now()
    ) {
      return { valid: false };
    }

    return { valid: true, email: payload.sub };
  } catch {
    return { valid: false };
  }
}
