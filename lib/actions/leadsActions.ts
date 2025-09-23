"use server";

/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Please use the new modular structure at lib/actions/leads/ instead.
 * See lib/actions/MIGRATION_GUIDE.md for migration instructions.
 */

// Log deprecation warning
if (typeof console !== 'undefined') {
  console.warn(
    '🚨 DEPRECATED: lib/actions/leadsActions.ts is deprecated. ' +
    'Please migrate to lib/actions/leads/ for better organization and maintainability. ' +
    'See lib/actions/MIGRATION_GUIDE.md for migration guide.'
  );
}

// Re-export all functions from the new modular structure for backward compatibility
export {
  getLeadsLists,
  createLeadList,
  updateLeadList,
  deleteLeadList,
  getLeadsFromList,
  createLead,
  updateLead,
  deleteLead,
  bulkImportLeads,
} from './leads';

// Re-export types
export type {
  LeadList,
  Lead,
  LeadFilters,
} from './leads';

// Legacy wrapper function for backward compatibility
import { getLeadsLists as getLeadsListsNew } from './leads';

export async function getLeadsListsLegacy() {
  const result = await getLeadsListsNew();
  return result.success && result.data ? result.data : [];
}
