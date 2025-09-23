/**
 * Legacy Actions Index
 * 
 * This file provides a central import point for all legacy actions.
 * All functions are deprecated and will be removed in a future version.
 * 
 * Please migrate to the new modular structure:
 * - lib/actions/billing/
 * - lib/actions/team/
 * - lib/actions/settings/
 * - lib/actions/analytics/
 * - etc.
 */

// Log deprecation warning for the entire legacy module
if (typeof console !== 'undefined') {
  console.warn(
    '🚨 DEPRECATED: lib/actions/legacy/ is deprecated. ' +
    'Please migrate to the new modular structure for better organization and maintainability. ' +
    'See lib/actions/MIGRATION_GUIDE.md for migration instructions.'
  );
}

// Re-export all legacy actions for backward compatibility
export * from './campaignActions';
export * from './domainsActions';
export * from './inboxActions';
export * from './leadsActions';
export * from './mailboxActions';

// Legacy analytics actions (now standardized)
export * from './billing.analytics.actions';
export * from './campaign.analytics.actions';
export * from './optimized.analytics.actions';

// Migration utilities
export * from './migration-utilities';
