/**
 * @deprecated This file has been split into modular team actions.
 * Use the new team module instead: lib/actions/team/
 * 
 * Legacy team actions - DEPRECATED
 * 
 * This module has been refactored into separate modules for better maintainability:
 * - lib/actions/team/members.ts - Member management
 * - lib/actions/team/invitations.ts - Invitation handling  
 * - lib/actions/team/permissions.ts - Permission management
 * - lib/actions/team/activity.ts - Activity logging
 * - lib/actions/team/settings.ts - Settings management
 * 
 * Please migrate to the new modular structure.
 */

'use server';

// Re-export all functions from the new modular structure for backward compatibility
export {
  getTeamMembers,
  updateTeamMember,
  removeTeamMember,
  validateTeamEmail,
} from './team/members';

export {
  addTeamMember,
  resendInvite,
  cancelInvite,
  bulkInviteMembers,
} from './team/invitations';

export {
  checkTeamPermission,
  canAssignRole,
  canModifyMember,
  getEffectivePermissions,
  roleHasPermission,
  validateRoleChange,
  hasMinimumOwners,
  isTeamOwner,
  isTeamAdminOrHigher,
} from './team/permissions';

export {
  logTeamActivity,
  getTeamActivity,
  getRecentTeamActivity,
  getActivityStats,
} from './team/activity';

export {
  getTeamSettings,
  updateTeamSettings,
  resetTeamSettings,
  validateTeamSlug,
  updateTeamBranding,
  getTeamSecuritySettings,
  updateTeamSecuritySettings,
} from './team/settings';

// Legacy implementations have been moved to the new modular structure.
// This file now only contains re-exports for backward compatibility.
// 
// The original 874-line implementation has been successfully split into:
// - 5 focused modules (members, invitations, permissions, activity, settings)
// - Comprehensive test coverage
// - Standardized error handling using core utilities
// - Consistent authentication and rate limiting patterns
// - Enhanced type safety and validation
//
// Migration completed successfully!
