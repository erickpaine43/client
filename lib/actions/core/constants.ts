/**
 * Shared constants and error codes for server actions
 * 
 * This module provides standardized constants, error codes, and configuration
 * values used across all action modules for consistency.
 */

/**
 * Standardized error codes for consistent error handling
 */
export const ERROR_CODES = {
  // Authentication errors
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  
  // Authorization/Permission errors
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_ACCESS_DENIED: 'RESOURCE_ACCESS_DENIED',
  COMPANY_ACCESS_DENIED: 'COMPANY_ACCESS_DENIED',
  
  // Validation errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_INPUT: 'INVALID_INPUT',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_URL: 'INVALID_URL',
  INVALID_PHONE: 'INVALID_PHONE',
  INVALID_DATE: 'INVALID_DATE',
  INVALID_NUMBER: 'INVALID_NUMBER',
  INVALID_ARRAY: 'INVALID_ARRAY',
  INVALID_ENUM: 'INVALID_ENUM',
  INVALID_OBJECT: 'INVALID_OBJECT',
  
  // Length validation errors
  TOO_SHORT: 'TOO_SHORT',
  TOO_LONG: 'TOO_LONG',
  TOO_SMALL: 'TOO_SMALL',
  TOO_LARGE: 'TOO_LARGE',
  ARRAY_TOO_SHORT: 'ARRAY_TOO_SHORT',
  ARRAY_TOO_LONG: 'ARRAY_TOO_LONG',
  
  // Password validation errors
  PASSWORD_TOO_SHORT: 'PASSWORD_TOO_SHORT',
  PASSWORD_TOO_WEAK: 'PASSWORD_TOO_WEAK',
  
  // Date validation errors
  DATE_TOO_EARLY: 'DATE_TOO_EARLY',
  DATE_TOO_LATE: 'DATE_TOO_LATE',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  RESOURCE_LOCKED: 'RESOURCE_LOCKED',
  
  // Rate limiting errors
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  
  // Network/Service errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // Database errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  
  // Convex-specific errors
  CONVEX_ERROR: 'CONVEX_ERROR',
  CONVEX_QUERY_FAILED: 'CONVEX_QUERY_FAILED',
  CONVEX_MUTATION_FAILED: 'CONVEX_MUTATION_FAILED',
  
  // File/Upload errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  
  // Business logic errors
  INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',
  SUBSCRIPTION_REQUIRED: 'SUBSCRIPTION_REQUIRED',
  FEATURE_NOT_AVAILABLE: 'FEATURE_NOT_AVAILABLE',
  
  // General errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  OPERATION_FAILED: 'OPERATION_FAILED',
} as const;

/**
 * HTTP status codes for API responses
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Default pagination limits
 */
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
  DEFAULT_OFFSET: 0,
} as const;

/**
 * Cache TTL values (in milliseconds)
 */
export const CACHE_TTL = {
  SHORT: 5 * 60 * 1000,      // 5 minutes
  MEDIUM: 30 * 60 * 1000,    // 30 minutes
  LONG: 2 * 60 * 60 * 1000,  // 2 hours
  VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
} as const;

/**
 * Rate limiting windows (in milliseconds)
 */
export const RATE_LIMIT_WINDOWS = {
  MINUTE: 60 * 1000,
  FIVE_MINUTES: 5 * 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
} as const;

/**
 * Validation limits
 */
export const VALIDATION_LIMITS = {
  // String lengths
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 1000,
  EMAIL_MAX_LENGTH: 254,
  URL_MAX_LENGTH: 2048,
  
  // Password requirements
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  
  // Array limits
  MAX_ARRAY_SIZE: 1000,
  MAX_BULK_OPERATIONS: 100,
  
  // File limits
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES_PER_UPLOAD: 10,
  
  // Numeric limits
  MAX_PERCENTAGE: 100,
  MIN_PERCENTAGE: 0,
  MAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,
  MIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER,
} as const;

/**
 * Action types for audit logging
 */
export const ACTION_TYPES = {
  // User actions
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_REGISTER: 'user.register',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  
  // Settings actions
  SETTINGS_UPDATE: 'settings.update',
  SETTINGS_VIEW: 'settings.view',
  
  // Team actions
  TEAM_MEMBER_ADD: 'team.member.add',
  TEAM_MEMBER_UPDATE: 'team.member.update',
  TEAM_MEMBER_REMOVE: 'team.member.remove',
  TEAM_INVITE_SEND: 'team.invite.send',
  TEAM_INVITE_ACCEPT: 'team.invite.accept',
  TEAM_INVITE_DECLINE: 'team.invite.decline',
  
  // Billing actions
  BILLING_UPDATE: 'billing.update',
  PAYMENT_METHOD_ADD: 'billing.payment_method.add',
  PAYMENT_METHOD_REMOVE: 'billing.payment_method.remove',
  SUBSCRIPTION_UPDATE: 'billing.subscription.update',
  SUBSCRIPTION_CANCEL: 'billing.subscription.cancel',
  
  // Template actions
  TEMPLATE_CREATE: 'template.create',
  TEMPLATE_UPDATE: 'template.update',
  TEMPLATE_DELETE: 'template.delete',
  TEMPLATE_VIEW: 'template.view',
  
  // Campaign actions
  CAMPAIGN_CREATE: 'campaign.create',
  CAMPAIGN_UPDATE: 'campaign.update',
  CAMPAIGN_DELETE: 'campaign.delete',
  CAMPAIGN_START: 'campaign.start',
  CAMPAIGN_PAUSE: 'campaign.pause',
  CAMPAIGN_STOP: 'campaign.stop',
  
  // Domain actions
  DOMAIN_ADD: 'domain.add',
  DOMAIN_UPDATE: 'domain.update',
  DOMAIN_DELETE: 'domain.delete',
  DOMAIN_VERIFY: 'domain.verify',
  
  // Analytics actions
  ANALYTICS_VIEW: 'analytics.view',
  ANALYTICS_EXPORT: 'analytics.export',
} as const;

/**
 * Resource types for permission checking
 */
export const RESOURCE_TYPES = {
  USER: 'user',
  COMPANY: 'company',
  TEAM: 'team',
  TEMPLATE: 'template',
  CAMPAIGN: 'campaign',
  DOMAIN: 'domain',
  MAILBOX: 'mailbox',
  LEAD: 'lead',
  ANALYTICS: 'analytics',
  BILLING: 'billing',
  SETTINGS: 'settings',
} as const;

/**
 * Permission types
 */
export const PERMISSIONS = {
  // General permissions
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  ADMIN: 'admin',
  
  // Specific permissions
  USER_MANAGE: 'user.manage',
  TEAM_MANAGE: 'team.manage',
  BILLING_MANAGE: 'billing.manage',
  SETTINGS_MANAGE: 'settings.manage',
  TEMPLATE_MANAGE: 'template.manage',
  CAMPAIGN_MANAGE: 'campaign.manage',
  DOMAIN_MANAGE: 'domain.manage',
  ANALYTICS_VIEW: 'analytics.view',
} as const;

/**
 * Team roles and their hierarchy
 */
export const TEAM_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  VIEWER: 'viewer',
} as const;

/**
 * Role hierarchy for permission checking
 */
export const ROLE_HIERARCHY = {
  [TEAM_ROLES.OWNER]: 4,
  [TEAM_ROLES.ADMIN]: 3,
  [TEAM_ROLES.MEMBER]: 2,
  [TEAM_ROLES.VIEWER]: 1,
} as const;

/**
 * Subscription plan types
 */
export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  STARTER: 'starter',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise',
} as const;

/**
 * Notification types
 */
export const NOTIFICATION_TYPES = {
  EMAIL: 'email',
  IN_APP: 'in_app',
  PUSH: 'push',
  SMS: 'sms',
} as const;

/**
 * Environment-specific constants
 */
export const ENVIRONMENT = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
} as const;

/**
 * Feature flags
 */
export const FEATURE_FLAGS = {
  ANALYTICS_V2: 'analytics_v2',
  TEAM_COLLABORATION: 'team_collaboration',
  ADVANCED_BILLING: 'advanced_billing',
  CUSTOM_DOMAINS: 'custom_domains',
} as const;

/**
 * Default values for common operations
 */
export const DEFAULTS = {
  PAGINATION_LIMIT: PAGINATION.DEFAULT_LIMIT,
  CACHE_TTL: CACHE_TTL.MEDIUM,
  RATE_LIMIT_WINDOW: RATE_LIMIT_WINDOWS.MINUTE,
  REQUEST_TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

/**
 * Regular expressions for validation
 */
export const REGEX_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  URL: /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
} as const;
