import crypto from 'crypto';

/**
 * Stateless password reset token utilities.
 *
 * Implements a secure, stateless reset token using HMAC signing.
 * No Convex. No custom NileDB tokens table.
 *
 * Token = base64url(payload).base64url(signature)
 * payload = {
 *   email: string;
 *   iat: number; // issued at (ms)
 *   exp: number; // expires at (ms)
 *   purpose: 'password_reset';
 * }
 */

const RESET_TOKEN_TTL_MINUTES = 60;

function getResetTokenSecret(): string {
  const secret = process.env.PASSWORD_RESET_TOKEN_SECRET;
  if (!secret) {
    throw new Error('PASSWORD_RESET_TOKEN_SECRET is not set');
  }
  return secret;
}

interface ResetTokenPayload {
  email: string;
  iat: number;
  exp: number;
  purpose: 'password_reset';
}

export interface ResetTokenInfo {
  email: string;
}

/**
 * Generate a signed, stateless password reset token for an email.
 */
export function generateResetToken(email: string): string {
  const now = Date.now();
  const ttlMinutes =
    Number(process.env.PASSWORD_RESET_TOKEN_EXPIRY_MINUTES) || RESET_TOKEN_TTL_MINUTES;

  const payload: ResetTokenPayload = {
    email,
    iat: now,
    exp: now + ttlMinutes * 60 * 1000,
    purpose: 'password_reset',
  };

  const secret = getResetTokenSecret();
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = sign(data, secret);
  return `${data}.${signature}`;
}

/**
 * Validate a reset token and return the associated email if valid.
 * Throws on any invalid/expired token.
 */
export function validateResetToken(token: string): ResetTokenInfo {
  const secret = getResetTokenSecret();

  const parts = token.split('.');
  if (parts.length !== 2) {
    throw new Error('Invalid token format');
  }

  const [data, signature] = parts;

  if (!timingSafeEqual(sign(data, secret), signature)) {
    throw new Error('Invalid token signature');
  }

  let payload: ResetTokenPayload;
  try {
    payload = JSON.parse(
      Buffer.from(data, 'base64url').toString('utf8'),
    ) as ResetTokenPayload;
  } catch {
    throw new Error('Invalid token payload');
  }

  if (payload.purpose !== 'password_reset') {
    throw new Error('Invalid token purpose');
  }

  const now = Date.now();
  if (payload.exp < now) {
    throw new Error('Reset token has expired');
  }

  if (!payload.email) {
    throw new Error('Invalid token payload');
  }

  return { email: payload.email };
}

/**
 * HMAC-SHA256 signing using Node crypto.
 */
function sign(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('base64url');
}

/**
 * Timing-safe string comparison.
 */
function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  if (bufA.length !== bufB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);
}
