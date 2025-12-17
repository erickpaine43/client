/**
 * Actions Module - Main Entry Point
 * 
 * This is the main barrel export file for all action modules.
 * It provides clean import paths and maintains backward compatibility
 * while encouraging migration to the new modular structure.
 * 
 * ## Documentation
 * 
 * - **Migration Guide**: See `ACTIONS_MIGRATION_GUIDE.md` for comprehensive migration documentation
 * - **API Documentation**: See `API_DOCUMENTATION.md` for detailed API reference
 * - **Migration Examples**: See `MIGRATION_EXAMPLES.md` for practical migration examples
 * - **Best Practices**: See `BEST_PRACTICES.md` for coding standards and patterns
 * 
 * ## Quick Start
 * 
 * ```typescript
 * import { getBillingInfo } from "@/lib/actions/billing";
 * import { getCampaignAnalytics } from "@/lib/actions/analytics";
 * import { createTeamMember } from "@/lib/actions/team";
 * 
 * // All actions return ActionResult<T>
 * const result = await getBillingInfo();
 * if (result.success) {
 *   console.log("Billing info:", result.data);
 * } else {
 *   console.error("Error:", result.error.message);
 * }
 * ```
 * 
 * ## Module Structure
 * 
 * - `core/` - Core utilities (types, errors, auth, validation)
 * - `analytics/` - Analytics operations (✅ COMPLETED)
 * - `billing/` - Billing and subscription management (✅ COMPLETED)
 * - `team/` - Team member and invitation management (✅ COMPLETED)
 * - `settings/` - Application settings (✅ COMPLETED)
 * - `notifications/` - Notification system (✅ COMPLETED)
 * - `templates/` - Template management (✅ COMPLETED)
 * - `campaigns/` - Campaign operations (✅ COMPLETED)
 * - `domains/` - Domain management (✅ COMPLETED)
 * - `legacy/` - Deprecated actions (for backward compatibility)
 */

// Core utilities (always available)
export * from './core';

// Domain-specific modules
// Note: Using selective exports to avoid naming conflicts

// Analytics (excluding getCampaignAnalytics as it conflicts with campaigns)
export * from './analytics';

// Billing and domains
export * from './billing';
export * from './domains';

// Settings (excluding ERROR_CODES, getNotificationHistory, markAllNotificationsAsRead)
// export * from './settings'; // Commented out due to conflicts

// export * from './team'; // Commented out due to ROLE_HIERARCHY conflict
export * from './templates';
// export * from './notifications'; // Commented out due to notification functions conflict
// export * from './dashboard'; // Commented out due to campaign functions conflict
export * from './clients';
export * from './inbox';
export * from './leads';
export * from './mailboxes';
export * from './profile';
export * from './warmup';

// Explicit re-exports with aliases for conflicting names
export { getCampaignAnalytics as getCampaignAnalyticsFromAnalytics } from './analytics/campaign-analytics';
export { getCampaignAnalytics as getCampaignAnalyticsFromCampaigns } from './campaigns/analytics';
export { ERROR_CODES as CoreErrorCodes } from './core/constants';
export { ERROR_CODES as SettingsErrorCodes } from './settings/types';
export { ROLE_HIERARCHY as CoreRoleHierarchy } from './core/constants';
export { ROLE_HIERARCHY as TeamRoleHierarchy } from '../constants/team';
export { getNotificationHistory as getNotificationHistoryFromSettings } from './settings';
export { getNotificationHistory as getNotificationHistoryFromNotifications } from './notifications';
export { markAllNotificationsAsRead as markAllNotificationsAsReadFromSettings } from './settings';
export { markAllNotificationsAsRead as markAllNotificationsAsReadFromNotifications } from './notifications';
export { deleteCampaign as deleteCampaignFromCampaigns } from './campaigns';
export { deleteCampaign as deleteCampaignFromDashboard } from './dashboard';
export { getCampaignLeads as getCampaignLeadsFromCampaigns } from './campaigns';
export { getCampaignLeads as getCampaignLeadsFromDashboard } from './dashboard';
export { getSequenceSteps as getSequenceStepsFromCampaigns } from './campaigns';
export { getSequenceSteps as getSequenceStepsFromDashboard } from './dashboard';

// Smaller modules
export * from './clients';
export * from './inbox';
export * from './leads';
export * from './mailboxes';
export * from './profile';
export * from './dashboard';
export * from './warmup';

// Legacy re-exports for backward compatibility
// These will be deprecated in future versions
// export * from './legacy'; // Commented out due to conflicts with dashboard

// Common types for convenience
export type {
  ActionResult,
  ActionError,
  ActionContext,
  PaginationParams,
  FilterParams,
} from './core/types';

export type {
  BillingInfo,
  SubscriptionPlan,
} from '../data/billing.mock';

export type {
  TeamMember,
  TeamInvite,
  TeamActivity,
} from '../../types/team';

export type {
  Template,
  TemplateFolder,
  QuickReply,
} from '../../types/templates';

export type {
  NotificationPreferences,
  EmailNotificationPreferences,
  InAppNotificationPreferences,
} from '../data/notifications.mock';
