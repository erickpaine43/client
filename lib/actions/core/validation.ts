/**
 * Standardized validation utilities for server actions
 * 
 * This module provides consistent validation patterns across all action modules
 * with field-specific error information and runtime type checking.
 * 
 * @deprecated This file has been refactored into domain-specific modules.
 * Import from './validation/index' for new code, or use specific domain modules:
 * - './validation/core' for basic validation functions
 * - './validation/analytics' for analytics-specific validation
 * - './validation/auth' for authentication validation
 * - './validation/common' for common utilities
 * - './validation/schema' for schema-based validation
 */

// Re-export everything from the new modular structure for backward compatibility
export * from './validation/index';
