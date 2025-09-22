/**
 * Core action utilities and types
 * 
 * This module provides a centralized export for all core action utilities,
 * types, and constants used across the actions directory.
 */

// Types
export type {
  ActionResult,
  ActionError as IActionError,
  ActionErrorType,
  ActionContext,
  PaginationParams,
  FilterParams,
  ValidationResult,
  ValidationError,
  RateLimitConfig,
  CacheConfig,
  AuditLogEntry,
  ActionMetrics,
} from './types';

// Monitoring types
export type {
  ErrorMetrics,
  ActionPerformanceMetrics,
  ConvexPerformanceMetrics,
  ErrorRateMetrics,
} from './monitoring';

// Error handling
export {
  ActionError,
  createActionResult,
  createActionError,
  ErrorFactory,
  handleUnknownError,
  withErrorHandling,
  withConvexErrorHandling,
  logActionError,
  logConvexError,
} from './errors';

// Monitoring utilities
export {
  recordError,
  recordPerformance,
  recordConvexPerformance,
  withPerformanceMonitoring,
  getMetrics,
  clearMetrics,
  hasHighErrorRates,
  getSlowActions,
  getSlowConvexQueries,
} from './monitoring';

// Authentication and authorization
export {
  createActionContext,
  requireAuth,
  requireAuthWithCompany,
  requireUserId,
  requireCompanyId,
  getCurrentCompanyId,
  checkPermission,
  requirePermission,
  checkResourceOwnership,
  requireResourceOwnership,
  checkRateLimit,
  checkRateLimitEnhanced,
  withRateLimit,
  withContextualRateLimit,
  withAuth,
  withAuthAndCompany,
  withPermission,
  withFullAuth,
  validateCompanyIsolation,
  createUserRateLimitKey,
  createCompanyRateLimitKey,
  createIpRateLimitKey,
  getRateLimitKey,
  getRateLimitConfig,
  cleanupRateLimitStore,
  getRateLimitStats,
  RateLimits,
} from './auth';

// Validation utilities
export {
  validateRequired,
  validateEmail,
  validateUrl,
  validatePhone,
  validatePassword,
  validateLength,
  validateNumber,
  validateArray,
  validateEnum,
  validateDate,
  sanitizeHtml,
  sanitizeString,
  validateObject,
  validationToActionResult,
  Validators,
} from './validation';

// Constants and error codes
export {
  ERROR_CODES,
  HTTP_STATUS,
  PAGINATION,
  CACHE_TTL,
  RATE_LIMIT_WINDOWS,
  VALIDATION_LIMITS,
  ACTION_TYPES,
  RESOURCE_TYPES,
  PERMISSIONS,
  TEAM_ROLES,
  ROLE_HIERARCHY,
  SUBSCRIPTION_PLANS,
  NOTIFICATION_TYPES,
  ENVIRONMENT,
  FEATURE_FLAGS,
  DEFAULTS,
  REGEX_PATTERNS,
} from './constants';
