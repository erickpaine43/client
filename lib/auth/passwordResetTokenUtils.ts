import { getTokenService, type TokenInfo } from '@/lib/niledb/tokens';

/**
 * Password reset token validation utilities
 *
 * These utilities have been migrated from Convex to NILEDB for consistency
 * with the authentication system.
 */

/**
 * Validate password reset token using NILEDB
 *
 * @param token - The reset token to validate
 * @returns Token information with email and validation status
 */
export async function validateToken(token: string): Promise<TokenInfo> {
  const tokenService = getTokenService();
  
  try {
    const tokenInfo = await tokenService.validateToken(token, 'password_reset');
    return tokenInfo;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Invalid reset token');
  }
}
