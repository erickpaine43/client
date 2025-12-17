/**
 * Core action types for standardized server action responses
 * 
 * This module provides the foundational types used across all action modules
 * to ensure consistent interfaces and error handling patterns.
 */

// Action result type with enhanced error information
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: ActionError;
}

// Standardized error interface with categorization
export interface ActionError {
  type: ActionErrorType;
  message: string;
  code?: string;
  field?: string;
  details?: Record<string, unknown>;
}

// Error type categories for consistent error handling
export type ActionErrorType = 
  | "auth"           // Authentication errors
  | "validation"     // Input validation errors
  | "network"        // Network/connectivity errors
  | "server"         // Internal server errors
  | "rate_limit"     // Rate limiting errors
  | "permission"     // Authorization/permission errors
  | "not_found"      // Resource not found errors
  | "conflict";      // Resource conflict errors

// Request context interface for consistent auth and metadata
export interface ActionContext {
  userId?: string;
  companyId?: string;
  timestamp: number;
  requestId: string;
  userAgent?: string;
  ipAddress?: string;
}

// Pagination parameters for list operations
export interface PaginationParams {
  limit: number;
  offset: number;
}

// Filter parameters for search and filtering operations
export interface FilterParams {
  [key: string]: string | string[] | number | boolean | undefined;
}

// Validation result interface
export interface ValidationResult<T = unknown> {
  isValid: boolean;
  data?: T;
  errors?: ValidationError[];
}

// Individual validation error
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
  value?: unknown;
}

// Rate limiting configuration
export interface RateLimitConfig {
  key: string;
  limit: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
}

// Cache configuration
export interface CacheConfig {
  key: string;
  ttl?: number; // Time to live in milliseconds
  tags?: string[]; // Cache tags for invalidation
}

// Audit log entry for action tracking
export interface AuditLogEntry {
  action: string;
  userId?: string;
  companyId?: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  timestamp: number;
  ipAddress?: string;
  userAgent?: string;
}

// Performance metrics for monitoring
export interface ActionMetrics {
  actionName: string;
  duration: number;
  success: boolean;
  errorType?: ActionErrorType;
  timestamp: number;
  userId?: string;
  companyId?: string;
}
