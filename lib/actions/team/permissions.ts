/**
 * Team permission management actions
 * 
 * This module handles team permission checking, role hierarchy validation,
 * and permission-based access control for team operations.
 */

'use server';

import { TeamPermission, TeamRole } from '../../../types/team';
import { ROLE_HIERARCHY, ROLE_PERMISSIONS } from '../../constants/team';
import { mockTeamMembers } from '../../mocks/team';

/**
 * Check if a user has permission to perform an action on team members
 */
export async function checkTeamPermission(
  userId: string,
  permission: TeamPermission,
  targetMemberId?: string
): Promise<boolean> {
  try {
    // Get the current user's team member record
    const currentMember = mockTeamMembers.find(m => m.userId === userId);
    
    if (!currentMember) {
      return false;
    }
    
    // Owner has all permissions
    if (currentMember.role === 'owner') {
      return true;
    }
    
    // Check if user has the all permission
    if (currentMember.permissions.includes('all')) {
      return true;
    }
    
    // Check specific permission
    if (!currentMember.permissions.includes(permission)) {
      console.log('User does not have permission:', permission);
      return false;
    }
    
    // If targeting another member, check role hierarchy
    if (targetMemberId) {
      const targetMember = mockTeamMembers.find(m => m.id === targetMemberId);
      if (targetMember) {
        const currentLevel = ROLE_HIERARCHY[currentMember.role];
        const targetLevel = ROLE_HIERARCHY[targetMember.role];
        
        // Can only modify members with lower or equal role (except owners)
        if (targetLevel > currentLevel && targetMember.role !== 'owner') {
          return false;
        }
      }
    }
    
    console.log('Permission check passed, returning true');
    return true;
  } catch (error) {
    console.log('Error in checkTeamPermission:', error);
    return false;
  }
}

/**
 * Check if a user can assign a specific role
 */
export async function canAssignRole(
  userId: string,
  targetRole: TeamRole
): Promise<boolean> {
  try {
    const currentMember = mockTeamMembers.find(m => m.userId === userId);
    
    if (!currentMember) {
      return false;
    }
    
    // Owner can assign any role
    if (currentMember.role === 'owner') {
      return true;
    }
    
    // Users can only assign roles lower than or equal to their own
    const currentLevel = ROLE_HIERARCHY[currentMember.role];
    const targetLevel = ROLE_HIERARCHY[targetRole];
    
    return targetLevel <= currentLevel;
  } catch (error) {
    console.error('Error in canAssignRole:', error);
    return false;
  }
}

/**
 * Check if a user can modify another team member
 */
export async function canModifyMember(
  userId: string,
  targetMemberId: string
): Promise<boolean> {
  try {
    const currentMember = mockTeamMembers.find(m => m.userId === userId);
    const targetMember = mockTeamMembers.find(m => m.id === targetMemberId);
    
    if (!currentMember || !targetMember) {
      return false;
    }
    
    // Owner can modify anyone
    if (currentMember.role === 'owner') {
      return true;
    }
    
    // Cannot modify owner unless you are owner
    if (targetMember.role === 'owner') {
      return false;
    }
    
    // Check role hierarchy
    const currentLevel = ROLE_HIERARCHY[currentMember.role];
    const targetLevel = ROLE_HIERARCHY[targetMember.role];
    
    // Can only modify members with lower role
    return currentLevel > targetLevel;
  } catch (error) {
    console.error('Error in canModifyMember:', error);
    return false;
  }
}

/**
 * Get effective permissions for a user based on their role
 */
export function getEffectivePermissions(role: TeamRole): TeamPermission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(role: TeamRole, permission: TeamPermission): boolean {
  const permissions = getEffectivePermissions(role);
  return permissions.includes('all') || permissions.includes(permission);
}

/**
 * Get the highest role level a user can assign
 */
export function getMaxAssignableRole(userRole: TeamRole): TeamRole {
  const userLevel = ROLE_HIERARCHY[userRole];
  
  // Find the highest role with level <= userLevel
  const roles = Object.entries(ROLE_HIERARCHY) as [TeamRole, number][];
  const assignableRoles = roles.filter(([, level]) => level <= userLevel);
  
  if (assignableRoles.length === 0) {
    return 'viewer';
  }
  
  // Sort by level descending and return the highest
  assignableRoles.sort(([, a], [, b]) => b - a);
  return assignableRoles[0][0];
}

/**
 * Validate role hierarchy for role changes
 */
export function validateRoleChange(
  currentUserRole: TeamRole,
  targetCurrentRole: TeamRole,
  targetNewRole: TeamRole
): { valid: boolean; reason?: string } {
  const currentUserLevel = ROLE_HIERARCHY[currentUserRole];
  const targetCurrentLevel = ROLE_HIERARCHY[targetCurrentRole];
  const targetNewLevel = ROLE_HIERARCHY[targetNewRole];
  
  // Owner can change anyone's role to anything
  if (currentUserRole === 'owner') {
    return { valid: true };
  }
  
  // Cannot change owner's role unless you are owner
  if (targetCurrentRole === 'owner') {
    return { 
      valid: false, 
      reason: 'Cannot change the role of the team owner' 
    };
  }
  
  // Cannot assign a role higher than your own
  if (targetNewLevel > currentUserLevel) {
    return { 
      valid: false, 
      reason: `Cannot assign a role higher than your own (${currentUserRole})` 
    };
  }
  
  // Cannot modify someone with higher or equal role (unless owner)
  if (targetCurrentLevel >= currentUserLevel) {
    return { 
      valid: false, 
      reason: 'Cannot modify someone with equal or higher role' 
    };
  }
  
  return { valid: true };
}

/**
 * Check if team has minimum required owners
 */
export function hasMinimumOwners(excludeMemberId?: string): boolean {
  const owners = mockTeamMembers.filter(m => 
    m.role === 'owner' && 
    m.status === 'active' && 
    m.id !== excludeMemberId
  );
  
  return owners.length >= 1;
}

/**
 * Get team member by user ID
 */
export function getTeamMemberByUserId(userId: string) {
  return mockTeamMembers.find(m => m.userId === userId);
}

/**
 * Get team member by member ID
 */
export function getTeamMemberById(memberId: string) {
  return mockTeamMembers.find(m => m.id === memberId);
}

/**
 * Check if user is team owner
 */
export function isTeamOwner(userId: string): boolean {
  const member = getTeamMemberByUserId(userId);
  return member?.role === 'owner' || false;
}

/**
 * Check if user is team admin or higher
 */
export function isTeamAdminOrHigher(userId: string): boolean {
  const member = getTeamMemberByUserId(userId);
  if (!member) return false;
  
  const level = ROLE_HIERARCHY[member.role];
  return level >= ROLE_HIERARCHY.admin;
}

/**
 * Get all permissions for a user
 */
export function getUserPermissions(userId: string): TeamPermission[] {
  const member = getTeamMemberByUserId(userId);
  if (!member) return [];
  
  return member.permissions;
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(userId: string, permissions: TeamPermission[]): boolean {
  const userPermissions = getUserPermissions(userId);
  
  // Owner or 'all' permission grants everything
  if (userPermissions.includes('all')) {
    return true;
  }
  
  return permissions.some(permission => userPermissions.includes(permission));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(userId: string, permissions: TeamPermission[]): boolean {
  const userPermissions = getUserPermissions(userId);
  
  // Owner or 'all' permission grants everything
  if (userPermissions.includes('all')) {
    return true;
  }
  
  return permissions.every(permission => userPermissions.includes(permission));
}
