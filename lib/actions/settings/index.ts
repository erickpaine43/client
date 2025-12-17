/**
 * Settings module - Main entry point
 * 
 * This module provides a centralized interface for all settings-related actions,
 * including general settings, security settings, compliance settings, and
 * notification preferences.
 */

// Re-export all settings actions for backward compatibility
export * from './general';
export * from './security';
export * from './compliance';
export * from './notifications';

// Re-export types for convenience
export type {
  UserSettings,
  CompanyInfo,
  BillingAddress,
  GeneralSettings,
  SecuritySettings,
  ComplianceSettings,
  SimpleNotificationPreferences,
  SecurityRecommendation,
  DeepPartial,
} from './types';

// Re-export error codes
export { ERROR_CODES } from './types';

// Batch operations
export { getAllSettings } from './general';
