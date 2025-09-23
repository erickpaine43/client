/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Please use the new modular structure at lib/actions/campaigns/ instead.
 * 
 * Migration guide:
 * - import { functionName } from '@/lib/actions/campaigns' 
 * - import { functionName } from '@/lib/actions/campaigns'
 */

'use server';

// Log deprecation warning
if (typeof console !== 'undefined') {
  console.warn(
    '🚨 DEPRECATED: lib/actions/campaignActions.ts is deprecated. ' +
    'Please migrate to lib/actions/campaigns/ for better organization and maintainability. ' +
    'See lib/actions/legacy/README.md for migration guide.'
  );
}

// Re-export from the original file for backward compatibility
// Note: This will be updated once campaigns module is created
export * from '../campaignActions';
