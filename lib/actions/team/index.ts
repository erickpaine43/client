/**
 * Team module - Main exports and orchestration
 *
 * This module provides the main entry point for team-related actions,
 * orchestrating between members, invitations, permissions, and activity logging.
 *
 * NOTE: This file has been converted to a regular export file because
 * Next.js 15 "use server" files can only export async functions.
 * All actual server actions are in the respective module files.
 */

// Re-export all team actions for backward compatibility
export * from './members';
export * from './invitations';
export * from './permissions';
export * from './activity';
export * from './settings';

// Export types for convenience
export type {
  TeamMember,
  TeamInvite,
  TeamActivity,
  TeamRole,
  TeamPermission,
  TeamMemberStatus,
  InviteTeamMemberForm,
  UpdateTeamMemberForm,
  UpdateTeamSettingsForm,
  BulkInviteResult,
  TeamMembersResponse,
  TeamActivityResponse,
} from '../../../types/team';

// Export constants
export { TEAM_ERROR_CODES, ROLE_HIERARCHY, ROLE_PERMISSIONS } from '../../constants/team';
