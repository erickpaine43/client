/**
 * Authentication and authorization utilities for server actions
 * 
 * This module provides consistent authentication checking, rate limiting,
 * company/tenant isolation, and request context generation across all action modules.
 * 
 * This is the main entry point that re-exports functionality from specialized modules.
 */

// Removed unused imports: ActionContext, ActionResult

// Re-export auth utilities for consistency
export { getCurrentUser, getCurrentUserId, requireAuth as requireAuthUser } from '../../utils/auth';

// Re-export from specialized modules
export {
  generateRequestId,
  getCurrentCompanyId,
  requireCompanyId,
  getRequestMetadata,
  createActionContext,
  requireAuth,
  requireAuthWithCompany,
  requireUserId,
  getUserProfile,
  isSuccessfulResult,
  isErrorResult,
} from './auth-validators';

export {
  checkPermission,
  requirePermission,
  checkResourceOwnership,
  requireResourceOwnership,
  validateCompanyIsolation,
} from './permission-handlers';

export {
  checkRateLimit,
  checkRateLimitEnhanced,
  withRateLimit,
  withContextualRateLimit,
  createUserRateLimitKey,
  createCompanyRateLimitKey,
  createIpRateLimitKey,
  getRateLimitKey,
  cleanupRateLimitStore,
  getRateLimitStats,
  RateLimits,
  getRateLimitConfig,
} from './rate-limit-utils';

export {
  withAuth,
  withAuthAndCompany,
  withPermission,
  withFullAuth,
  withSecurity,
  SecurityConfigs,
  AuthLevel,
  RateLimitType,
  type SecurityConfig,
} from './auth-middleware';


