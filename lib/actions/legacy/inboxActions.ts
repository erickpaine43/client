/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Please use the new modular structure at lib/actions/inbox/ instead.
 * 
 * Migration guide:
 * - import { functionName } from '@/lib/actions/inbox' 
 * - import { functionName } from '@/lib/actions/inbox'
 */

'use server';

// Log deprecation warning
if (typeof console !== 'undefined') {
  console.warn(
    '🚨 DEPRECATED: lib/actions/inboxActions.ts is deprecated. ' +
    'Please migrate to lib/actions/inbox/ for better organization and maintainability. ' +
    'See lib/actions/legacy/README.md for migration guide.'
  );
}

// Re-export from the original file for backward compatibility
// Note: This will be updated once inbox module is created
export * from '../inboxActions';
