/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Please use the new standardized analytics module at lib/actions/analytics/ instead.
 * 
 * Migration guide:
 * - import { functionName } from '@/lib/actions/analytics' 
 * - import { functionName } from '@/lib/actions/analytics'
 */

'use server';

// Log deprecation warning
if (typeof console !== 'undefined') {
  console.warn(
    '🚨 DEPRECATED: lib/actions/optimized.analytics.actions.ts is deprecated. ' +
    'Please migrate to lib/actions/analytics/ for standardized analytics patterns. ' +
    'See lib/actions/legacy/README.md for migration guide.'
  );
}

// Re-export from the new standardized analytics module
export * from '../analytics';
