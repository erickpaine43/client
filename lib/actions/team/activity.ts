/**
 * Team activity logging and retrieval actions
 * 
 * This module handles team activity logging, audit trails,
 * and activity history retrieval with proper filtering.
 */

'use server';

import { ActionResult } from '../core/types';
import { ErrorFactory, withErrorHandling } from '../core/errors';
import { withFullAuth, RateLimits } from '../core/auth';
import { Permission } from '@/types/auth';
import { TeamActivity, TeamActivityResponse } from '@/types/team';
import { checkTeamPermission } from './permissions';

// Mock activity storage (in production, this would be a database)
const mockActivities: TeamActivity[] = [
  {
    id: 'activity-1',
    teamId: 'team-1',
    action: 'member:invited',
    performedBy: 'user-123',
    performedByName: 'John Owner',
    targetUser: 'new@example.com',
    timestamp: new Date(),
    metadata: { role: 'member' },
  },
];

/**
 * Log team activity
 */
export async function logTeamActivity(
  activity: Omit<TeamActivity, 'id' | 'teamId' | 'timestamp' | 'performedByName'>
): Promise<void> {
  try {
    // In a real implementation, this would save to database
    const newActivity: TeamActivity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      teamId: 'team-1', // This would come from context
      timestamp: new Date(),
      performedByName: 'Unknown User', // This would be fetched from user data
      ...activity,
    };

    // Add to mock storage
    mockActivities.unshift(newActivity);

    // Keep only last 1000 activities in memory
    if (mockActivities.length > 1000) {
      mockActivities.splice(1000);
    }

    console.log('Team activity logged:', newActivity);
  } catch (error) {
    console.error('Failed to log team activity:', error);
    // Don't throw error as logging should not break the main operation
  }
}

/**
 * Get team activity log with pagination and filtering
 */
export async function getTeamActivity(
  options: {
    limit?: number;
    offset?: number;
    action?: TeamActivity['action'];
    performedBy?: string;
    targetUser?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}
): Promise<ActionResult<TeamActivityResponse>> {
  return await withFullAuth(
    {
      permission: Permission.VIEW_SETTINGS,
      rateLimit: {
        action: 'team:activity:read',
        type: 'user',
        config: RateLimits.GENERAL_READ,
      },
    },
    async (context) => {
      return await withErrorHandling(async () => {
        // Check permission
        const hasAccess = await checkTeamPermission(context.userId!, 'settings:read');
        if (!hasAccess) {
          return ErrorFactory.unauthorized('You do not have permission to view team activity');
        }

        const {
          limit = 20,
          offset = 0,
          action,
          performedBy,
          targetUser,
          startDate,
          endDate,
        } = options;

        // Filter activities
        let filteredActivities = [...mockActivities];

        if (action) {
          filteredActivities = filteredActivities.filter(a => a.action === action);
        }

        if (performedBy) {
          filteredActivities = filteredActivities.filter(a => a.performedBy === performedBy);
        }

        if (targetUser) {
          filteredActivities = filteredActivities.filter(a => a.targetUser === targetUser);
        }

        if (startDate) {
          filteredActivities = filteredActivities.filter(a => a.timestamp >= startDate);
        }

        if (endDate) {
          filteredActivities = filteredActivities.filter(a => a.timestamp <= endDate);
        }

        // Sort by timestamp descending (newest first)
        filteredActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        // Apply pagination
        const total = filteredActivities.length;
        const activities = filteredActivities.slice(offset, offset + limit);

        return {
          activities,
          pagination: {
            total,
            page: Math.floor(offset / limit) + 1,
            limit,
            hasMore: offset + limit < total,
          },
        };
      });
    }
  );
}

/**
 * Get recent team activity (last 10 activities)
 */
export async function getRecentTeamActivity(): Promise<ActionResult<TeamActivity[]>> {
  return await withFullAuth(
    {
      permission: Permission.VIEW_SETTINGS,
      rateLimit: {
        action: 'team:activity:recent',
        type: 'user',
        config: RateLimits.GENERAL_READ,
      },
    },
    async (context) => {
      return await withErrorHandling(async () => {
        // Check permission
        const hasAccess = await checkTeamPermission(context.userId!, 'settings:read');
        if (!hasAccess) {
          return ErrorFactory.unauthorized('You do not have permission to view team activity');
        }

        // Get last 10 activities
        const recentActivities = mockActivities
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 10);

        return recentActivities;
      });
    }
  );
}

/**
 * Get activity statistics
 */
export async function getActivityStats(
  days: number = 30
): Promise<ActionResult<{
  totalActivities: number;
  activitiesByAction: Record<TeamActivity['action'], number>;
  activitiesByDay: Array<{ date: string; count: number }>;
  mostActiveUsers: Array<{ userId: string; userName: string; count: number }>;
}>> {
  return await withFullAuth(
    {
      permission: Permission.VIEW_SETTINGS,
      rateLimit: {
        action: 'team:activity:stats',
        type: 'user',
        config: RateLimits.GENERAL_READ,
      },
    },
    async (context) => {
      return await withErrorHandling(async () => {
        // Check permission
        const hasAccess = await checkTeamPermission(context.userId!, 'settings:read');
        if (!hasAccess) {
          return ErrorFactory.unauthorized('You do not have permission to view team activity');
        }

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        // Filter activities within the date range
        const recentActivities = mockActivities.filter(a => a.timestamp >= cutoffDate);

        // Calculate statistics
        const totalActivities = recentActivities.length;

        // Activities by action type
        const activitiesByAction = recentActivities.reduce((acc, activity) => {
          acc[activity.action] = (acc[activity.action] || 0) + 1;
          return acc;
        }, {} as Record<TeamActivity['action'], number>);

        // Activities by day
        const activitiesByDay = Array.from({ length: days }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const count = recentActivities.filter(a => {
            const activityDate = a.timestamp.toISOString().split('T')[0];
            return activityDate === dateStr;
          }).length;

          return { date: dateStr, count };
        }).reverse();

        // Most active users
        const userActivityCounts = recentActivities.reduce((acc, activity) => {
          const userId = activity.performedBy;
          const userName = activity.performedByName || 'Unknown User';
          
          if (!acc[userId]) {
            acc[userId] = { userId, userName, count: 0 };
          }
          acc[userId].count++;
          
          return acc;
        }, {} as Record<string, { userId: string; userName: string; count: number }>);

        const mostActiveUsers = Object.values(userActivityCounts)
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        return {
          totalActivities,
          activitiesByAction,
          activitiesByDay,
          mostActiveUsers,
        };
      });
    }
  );
}

/**
 * Clear old activity logs (cleanup function)
 */
export async function clearOldActivity(
  olderThanDays: number = 90
): Promise<ActionResult<{ cleared: number }>> {
  return await withFullAuth(
    {
      permission: Permission.UPDATE_SETTINGS,
      rateLimit: {
        action: 'team:activity:cleanup',
        type: 'user',
        config: RateLimits.SENSITIVE_ACTION,
      },
    },
    async (context) => {
      return await withErrorHandling(async () => {
        // Check permission (only owners can clear activity)
        const hasAccess = await checkTeamPermission(context.userId!, 'settings:write');
        if (!hasAccess) {
          return ErrorFactory.unauthorized('You do not have permission to clear team activity');
        }

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

        // Count activities to be removed
        const toRemove = mockActivities.filter(a => a.timestamp < cutoffDate);
        const clearedCount = toRemove.length;

        // Remove old activities
        mockActivities.splice(0, mockActivities.length, 
          ...mockActivities.filter(a => a.timestamp >= cutoffDate)
        );

        // Log the cleanup activity
        await logTeamActivity({
          action: 'settings:updated',
          performedBy: context.userId!,
          metadata: { 
            action: 'activity_cleanup',
            clearedCount,
            olderThanDays 
          },
        });

        return { cleared: clearedCount };
      });
    }
  );
}

/**
 * Export activity log (for compliance/audit purposes)
 */
export async function exportActivityLog(
  options: {
    startDate?: Date;
    endDate?: Date;
    format?: 'json' | 'csv';
  } = {}
): Promise<ActionResult<{
  data: string;
  filename: string;
  contentType: string;
}>> {
  return await withFullAuth(
    {
      permission: Permission.VIEW_SETTINGS,
      rateLimit: {
        action: 'team:activity:export',
        type: 'user',
        config: RateLimits.ANALYTICS_EXPORT,
      },
    },
    async (context) => {
      return await withErrorHandling(async () => {
        // Check permission
        const hasAccess = await checkTeamPermission(context.userId!, 'settings:read');
        if (!hasAccess) {
          return ErrorFactory.unauthorized('You do not have permission to export team activity');
        }

        const { startDate, endDate, format = 'json' } = options;

        // Filter activities by date range
        let activitiesToExport = [...mockActivities];

        if (startDate) {
          activitiesToExport = activitiesToExport.filter(a => a.timestamp >= startDate);
        }

        if (endDate) {
          activitiesToExport = activitiesToExport.filter(a => a.timestamp <= endDate);
        }

        // Sort by timestamp
        activitiesToExport.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

        let data: string;
        let filename: string;
        let contentType: string;

        if (format === 'csv') {
          // Convert to CSV
          const headers = ['ID', 'Timestamp', 'Action', 'Performed By', 'Target User', 'Metadata'];
          const rows = activitiesToExport.map(activity => [
            activity.id,
            activity.timestamp.toISOString(),
            activity.action,
            activity.performedByName || activity.performedBy,
            activity.targetUser || '',
            JSON.stringify(activity.metadata || {}),
          ]);

          data = [headers, ...rows].map(row => 
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
          ).join('\n');

          filename = `team-activity-${new Date().toISOString().split('T')[0]}.csv`;
          contentType = 'text/csv';
        } else {
          // JSON format
          data = JSON.stringify(activitiesToExport, null, 2);
          filename = `team-activity-${new Date().toISOString().split('T')[0]}.json`;
          contentType = 'application/json';
        }

        // Log the export activity
        await logTeamActivity({
          action: 'settings:updated',
          performedBy: context.userId!,
          metadata: { 
            action: 'activity_export',
            format,
            recordCount: activitiesToExport.length,
            startDate: startDate?.toISOString(),
            endDate: endDate?.toISOString(),
          },
        });

        return {
          data,
          filename,
          contentType,
        };
      });
    }
  );
}
