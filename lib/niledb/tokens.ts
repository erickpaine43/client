/**
 * NileDB Token Management Service
 * 
 * Manages password reset and email verification tokens using NileDB's native CSRF system.
 * This replaces the previous Convex-based token management for consistency.
 */

import { getNileClient, withoutTenantContext } from './client';
import { AuthenticationError } from './errors';

// Token types
export type TokenType = 'password_reset' | 'email_verification';

// Token status interface
export interface TokenInfo {
  id?: string;
  email: string;
  token: string;
  tokenType: TokenType;
  expiresAt: number;
  used: boolean;
  createdAt: number;
  usedAt?: number;
}

/**
 * NileDB Token Service
 * 
 * Provides token management using NileDB's native authentication and CSRF capabilities.
 * Implements secure token generation, validation, and management.
 */
export class TokenService {
  private nile = getNileClient();

  /**
   * Create a new token using NILEDB's CSRF system
   */
  async createToken(email: string, tokenType: TokenType, expiryMinutes = 60): Promise<{
    token: string;
    expiresAt: number;
    id: string;
  }> {
    const token = crypto.randomUUID();
    const expiresAt = Date.now() + (expiryMinutes * 60 * 1000);

    try {
      const result = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          `
          INSERT INTO public.tokens (
            email, 
            token, 
            token_type, 
            expires_at, 
            used,
            created_at
          ) VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id, email, token, token_type, expires_at, used, created_at
          `,
          [email, token, tokenType, expiresAt, false, Date.now()]
        );
      });

      if (result.rows.length === 0) {
        throw new Error('Failed to create token');
      }

      const tokenData = result.rows[0];
      return {
        token,
        expiresAt,
        id: tokenData.id
      };
    } catch (error) {
      console.error('Failed to create token:', error);
      throw new AuthenticationError('Failed to create token');
    }
  }

  /**
   * Validate and get token information
   */
  async validateToken(token: string, expectedType: TokenType): Promise<TokenInfo> {
    try {
      const result = await withoutTenantContext(async (nile) => {
        return await nile.db.query(
          `
          SELECT id, email, token, token_type, expires_at, used, created_at, used_at
          FROM public.tokens 
          WHERE token = $1 AND token_type = $2 AND deleted IS NULL
          `,
          [token, expectedType]
        );
      });

      if (result.rows.length === 0) {
        throw new AuthenticationError('Invalid token');
      }

      const tokenData = result.rows[0];

      // Check if token is expired
      if (tokenData.expires_at < Date.now()) {
        throw new AuthenticationError('Token has expired');
      }

      // Check if token was already used
      if (tokenData.used) {
        throw new AuthenticationError('Token has already been used');
      }

      return {
        id: tokenData.id,
        email: tokenData.email,
        token: tokenData.token,
        tokenType: tokenData.token_type,
        expiresAt: tokenData.expires_at,
        used: tokenData.used,
        createdAt: tokenData.created_at,
        usedAt: tokenData.used_at
      };
    } catch (error) {
      console.error('Failed to validate token:', error);
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError('Token validation failed');
    }
  }

  /**
   * Mark token as used
   */
  async markTokenAsUsed(tokenId: string, usedAt = Date.now()): Promise<void> {
    try {
      await withoutTenantContext(async (nile) => {
        await nile.db.query(
          `
          UPDATE public.tokens 
          SET used = true, used_at = $2, updated = CURRENT_TIMESTAMP 
          WHERE id = $1
          `,
          [tokenId, usedAt]
        );
      });
    } catch (error) {
      console.error('Failed to mark token as used:', error);
      throw new AuthenticationError('Failed to mark token as used');
    }
  }

  /**
   * Clean up expired tokens (can be called periodically)
   */
  async cleanupExpiredTokens(tokenType?: TokenType): Promise<{ cleaned: number }> {
    try {
      const result = await withoutTenantContext(async (nile) => {
        const params = [Date.now()];
        const typeFilter = tokenType ? 'AND token_type = $2' : '';
        const paramValues = tokenType ? [...params, tokenType] : params;

        return await nile.db.query(
          `
          DELETE FROM public.tokens 
          WHERE expires_at < $1 ${typeFilter}
          RETURNING id
          `,
          paramValues
        );
      });

      return { cleaned: result.rows.length };
    } catch (error) {
      console.error('Failed to cleanup expired tokens:', error);
      throw new AuthenticationError('Failed to cleanup expired tokens');
    }
  }

  /**
   * Clean up expired tokens for specific email (used in forgot-password)
   */
  async cleanupExpiredTokensForEmail(email: string, tokenType: TokenType): Promise<void> {
    try {
      await withoutTenantContext(async (nile) => {
        await nile.db.query(
          `
          DELETE FROM public.tokens 
          WHERE email = $1 AND token_type = $2 AND (expires_at < $3 OR used = true)
          `,
          [email, tokenType, Date.now()]
        );
      });
    } catch (error) {
      console.error('Failed to cleanup expired tokens for email:', error);
      // Don't throw error for cleanup failures
    }
  }

  /**
   * Get token statistics
   */
  async getTokenStats(): Promise<{
    total: number;
    used: number;
    expired: number;
    active: number;
  }> {
    try {
      const result = await withoutTenantContext(async (nile) => {
        return await nile.db.query(`
          SELECT 
            COUNT(*) as total,
            COUNT(CASE WHEN used = true THEN 1 END) as used,
            COUNT(CASE WHEN expires_at < $1 THEN 1 END) as expired,
            COUNT(CASE WHEN used = false AND expires_at >= $1 THEN 1 END) as active
          FROM public.tokens 
          WHERE deleted IS NULL
        `, [Date.now()]);
      });

      const stats = result.rows[0];
      return {
        total: parseInt(stats.total),
        used: parseInt(stats.used),
        expired: parseInt(stats.expired),
        active: parseInt(stats.active)
      };
    } catch (error) {
      console.error('Failed to get token stats:', error);
      return {
        total: 0,
        used: 0,
        expired: 0,
        active: 0
      };
    }
  }
}

// Export singleton instance
let tokenServiceInstance: TokenService | null = null;

export const getTokenService = (): TokenService => {
  if (!tokenServiceInstance) {
    tokenServiceInstance = new TokenService();
  }
  return tokenServiceInstance;
};

// Reset instance (useful for testing)
export const resetTokenService = (): void => {
  tokenServiceInstance = null;
};
