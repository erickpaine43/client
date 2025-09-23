/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Please use the new modular structure at lib/actions/mailboxes/ instead.
 *
 * Migration guide:
 * - import { functionName } from '@/lib/actions/mailboxes'
 * - import { functionName } from '@/lib/actions/mailboxes'
 */

// Log deprecation warning
if (typeof console !== 'undefined') {
  console.warn(
    '🚨 DEPRECATED: lib/actions/mailboxActions.ts is deprecated. ' +
    'Please migrate to lib/actions/mailboxes/ for better organization and maintainability. ' +
    'See lib/actions/legacy/README.md for migration guide.'
  );
}

// Re-export from the original file for backward compatibility
// Note: This will be updated once mailboxes module is created
export * from '../mailboxActions';
