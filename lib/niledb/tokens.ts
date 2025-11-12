/**
 * Deprecated: NileDB Token Management Service
 *
 * This file was previously used to implement a custom token store on top of NileDB.
 * Nile already provides first-class auth/session/CSRF mechanisms, so we should not
 * maintain a parallel token persistence layer for password reset.
 *
 * Kept temporarily as a no-op shim to avoid import errors while the new
 * stateless reset-token flow is wired in.
 */

export interface DeprecatedTokenInfo {
  email: string;
  token: string;
}

export async function deprecatedValidateToken(_token: string): Promise<DeprecatedTokenInfo> {
  throw new Error('Deprecated token validation path called. Migrate to the new stateless reset-token flow.');
}
