/**
 * Email verification utilities for handling token management
 * without requiring Convex client in API routes
 * 
 * This module interacts with the email_verification_tokens table
 * which is managed by Convex through the schema definition.
 */

import { getDatabaseService } from '@/lib/niledb';

/**
 * Generate a secure verification token
 */
export function generateVerificationToken(): string {
  return crypto.randomUUID();
}

/**
 * Create expiration time (24 hours from now)
 */
export function getVerificationTokenExpiry(): number {
  return Date.now() + (24 * 60 * 60 * 1000); // 24 hours
}

/**
 * Store verification token in database
 * 
 * This function assumes the email_verification_tokens table exists
 * and is managed through Convex schema migrations.
 */
export async function storeVerificationToken(
  email: string, 
  token: string, 
  expiresAt: number
): Promise<boolean> {
  try {
    const dbService = getDatabaseService();
    
    // Insert or update token for email (upsert operation)
    // Using Convex-compatible schema structure
    await dbService.queryCrossTenant(
      `INSERT INTO email_verification_tokens (email, token, expiresAt, used, createdAt, usedAt)
       VALUES ($1, $2, $3, false, $4, NULL)
       ON CONFLICT (email) DO UPDATE SET
         token = EXCLUDED.token,
         expiresAt = EXCLUDED.expiresAt,
         used = false,
         createdAt = EXCLUDED.createdAt,
         usedAt = NULL`,
      [email, token, expiresAt, Date.now()]
    );
    
    return true;
  } catch (error) {
    console.error('Error storing verification token:', error);
    return false;
  }
}

/**
 * Validate and verify a token
 */
export async function validateVerificationToken(
  token: string
): Promise<{
  valid: boolean;
  expired?: boolean;
  used?: boolean;
  email?: string;
  error?: string;
}> {
  try {
    const dbService = getDatabaseService();
    
    const result = await dbService.queryCrossTenant(
      `SELECT email, expiresAt, used, usedAt 
       FROM email_verification_tokens 
       WHERE token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return { valid: false, error: 'Token not found' };
    }

    const tokenData = result.rows[0] as {
      email: string;
      expiresAt: number;
      used: boolean;
      usedAt?: number;
    };
    const now = Date.now();

    // Check if token is expired
    if (now > tokenData.expiresAt) {
      return { valid: false, expired: true, email: tokenData.email, error: 'Token expired' };
    }

    // Check if token was already used
    if (tokenData.used) {
      return { valid: false, used: true, email: tokenData.email, error: 'Token already used' };
    }

    return { valid: true, email: tokenData.email };
  } catch (error) {
    console.error('Error validating verification token:', error);
    return { valid: false, error: 'Validation error' };
  }
}

/**
 * Mark token as used
 */
export async function markTokenAsUsed(token: string): Promise<boolean> {
  try {
    const dbService = getDatabaseService();
    
    await dbService.queryCrossTenant(
      `UPDATE email_verification_tokens 
       SET used = true, usedAt = $1 
       WHERE token = $2`,
      [Date.now(), token]
    );
    
    return true;
  } catch (error) {
    console.error('Error marking token as used:', error);
    return false;
  }
}

/**
 * Update user verification status
 */
export async function updateUserVerificationStatus(email: string): Promise<boolean> {
  try {
    const dbService = getDatabaseService();
    
    await dbService.queryCrossTenant(
      `UPDATE users.users 
       SET email_verified = true, verified_at = NOW() 
       WHERE email = $1 AND deleted IS NULL`,
      [email]
    );
    
    return true;
  } catch (error) {
    console.error('Error updating user verification status:', error);
    return false;
  }
}
