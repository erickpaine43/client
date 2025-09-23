'use server';

/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Please use the new modular structure at lib/actions/campaigns/ instead.
 * See lib/actions/MIGRATION_GUIDE.md for migration instructions.
 */

// Log deprecation warning
if (typeof console !== 'undefined') {
  console.warn(
    '🚨 DEPRECATED: lib/actions/campaignActions.ts is deprecated. ' +
    'Please migrate to lib/actions/campaigns/ for better organization and maintainability. ' +
    'See lib/actions/MIGRATION_GUIDE.md for migration guide.'
  );
}

// Re-export all functions from the new modular structure for backward compatibility
export {
  getCampaignLeads,
  getCampaign,
  getUserCampaigns as getUserCampaignsAction,
  getCampaignsData as getCampaignsDataAction,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from './campaigns/campaigns';

export {
  getCampaignAnalytics as getCampaignAnalyticsAction,
  getCampaignPerformanceSummary,
} from './campaigns/analytics';

export {
  getSequenceSteps,
  getCampaignSequenceSteps,
  createSequenceStep,
  updateSequenceStep,
  deleteSequenceStep,
} from './campaigns/sequences';

export {
  getTimezones as getTimezonesAction,
  getTimezones as getTimezonesMockAction, // Alias for backward compatibility
  getCampaignSendingAccounts as getCampaignSendingAccountsAction,
  createCampaignSchedule,
  updateCampaignSchedule,
} from './campaigns/scheduling';

// Re-export types
export type {
  CampaignFilters,
  CampaignSummary,
  CampaignCreateData,
  CampaignUpdateData,
  CampaignTimeSeriesPoint,
  SendingAccount,
  SequenceStep,
  CampaignLead,
} from './campaigns/types';
