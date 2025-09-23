/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Please use the new modular structure at lib/actions/domains/ instead.
 * 
 * Migration guide:
 * - import { functionName } from '@/lib/actions/domains' 
 * - import { functionName } from '@/lib/actions/domains'
 */

'use server';

// Log deprecation warning
if (typeof console !== 'undefined') {
  console.warn(
    '🚨 DEPRECATED: lib/actions/domainsActions.ts is deprecated. ' +
    'Please migrate to lib/actions/domains/ for better organization and maintainability. ' +
    'See lib/actions/legacy/README.md for migration guide.'
  );
}

// Re-export from the original file for backward compatibility
// Note: This will be updated once domains module is created
export * from '../domainsActions';
