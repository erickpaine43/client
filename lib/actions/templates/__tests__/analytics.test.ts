/**
 * Tests for template analytics operations
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import {
  getTemplateUsageStats,
  getTemplatePerformanceMetrics,
  getTemplateAnalyticsSummary,
  trackTemplateUsage,
  getTemplateUsageTrends,
} from '../analytics';
import { nile } from '@/app/api/[...nile]/nile';
import * as auth from '@/lib/actions/core/auth';

// Mock dependencies
jest.mock('@/app/api/[...nile]/nile', () => ({
  nile: {
    db: {
      query: jest.fn(),
    },
  },
}));
jest.mock('@/lib/actions/core/auth');

const mockNile = nile as jest.Mocked<typeof nile>;
const mockAuth = auth as jest.Mocked<typeof auth>;

describe('Template Actions - Analytics Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful authentication
    mockAuth.withAuth = jest.fn().mockImplementation((handler: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      return handler({ userId: 'test-user', companyId: 'test-company', timestamp: Date.now(), requestId: 'test-req' });
    }) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    mockAuth.withContextualRateLimit = jest.fn().mockImplementation((action: any, type: any, config: any, operation: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      return operation();
    }) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getTemplateUsageStats', () => {
    it('should return usage statistics successfully', async () => {
      const mockDbResult = [
        {
          templateId: 1,
          templateName: 'Test Template',
          templateType: 'template',
          totalUsage: 10,
          lastUsed: '2024-01-01',
          category: 'OUTREACH',
          usageRank: 1,
          averageUsagePerWeek: '2.5',
        },
        {
          templateId: 2,
          templateName: 'Test Quick Reply',
          templateType: 'quick-reply',
          totalUsage: 5,
          lastUsed: '2024-01-02',
          category: 'FOLLOW_UP',
          usageRank: 2,
          averageUsagePerWeek: '1.25',
        },
      ];

      mockNile.db.query.mockResolvedValueOnce(mockDbResult);

      const result = await getTemplateUsageStats();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data![0]).toMatchObject({
        templateId: 1,
        templateName: 'Test Template',
        templateType: 'template',
        totalUsage: 10,
        averageUsagePerWeek: 2.5,
        usageRank: 1,
      });
    });

    it('should filter by template ID', async () => {
      const mockDbResult = [
        {
          templateId: 1,
          templateName: 'Test Template',
          templateType: 'template',
          totalUsage: 10,
          lastUsed: '2024-01-01',
          category: 'OUTREACH',
          usageRank: 1,
          averageUsagePerWeek: '2.5',
        },
      ];

      mockNile.db.query.mockResolvedValueOnce(mockDbResult);

      const result = await getTemplateUsageStats({ templateId: '1' });

      expect(result.success).toBe(true);
      expect(mockNile.db.query).toHaveBeenCalledWith(
        expect.stringContaining('AND t.id = $1'),
        expect.arrayContaining([1])
      );
    });

    it('should filter by type', async () => {
      const mockDbResult: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
      mockNile.db.query.mockResolvedValueOnce(mockDbResult);

      const result = await getTemplateUsageStats({ type: 'quick-reply' });

      expect(result.success).toBe(true);
      expect(mockNile.db.query).toHaveBeenCalledWith(
        expect.stringContaining("AND t.type = $1"),
        expect.arrayContaining(['quick-reply'])
      );
    });

    it('should handle invalid template ID', async () => {
      const result = await getTemplateUsageStats({ templateId: 'invalid' });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
    });

    it('should handle database errors', async () => {
      mockNile.db.query.mockRejectedValueOnce(new Error('Database error'));

      const result = await getTemplateUsageStats();

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('server');
    });
  });

  describe('getTemplatePerformanceMetrics', () => {
    it('should return performance metrics successfully', async () => {
      const mockDbResult: any[] = [ // eslint-disable-line @typescript-eslint/no-explicit-any
        {
          templateId: 1,
          templateName: 'Test Template',
          openRate: 0,
          replyRate: 0,
          clickRate: 0,
          bounceRate: 0,
          totalSent: 0,
          totalOpened: 0,
          totalReplied: 0,
          totalClicked: 0,
          totalBounced: 0,
        },
      ];

      mockNile.db.query.mockResolvedValueOnce(mockDbResult);

      const result = await getTemplatePerformanceMetrics();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data![0]).toMatchObject({
        templateId: 1,
        templateName: 'Test Template',
        openRate: 0,
        replyRate: 0,
      });
    });

    it('should filter by template ID', async () => {
      const mockDbResult: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
      mockNile.db.query.mockResolvedValueOnce(mockDbResult);

      const result = await getTemplatePerformanceMetrics('1');

      expect(result.success).toBe(true);
      expect(mockNile.db.query).toHaveBeenCalledWith(
        expect.stringContaining('AND t.id = $1'),
        [1]
      );
    });

    it('should handle invalid template ID', async () => {
      const result = await getTemplatePerformanceMetrics('invalid');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
    });
  });

  describe('getTemplateAnalyticsSummary', () => {
    it('should return analytics summary successfully', async () => {
      mockNile.db.query
        .mockResolvedValueOnce([{ // counts query
          totalTemplates: 10,
          totalQuickReplies: 5,
          totalUsage: 100,
          averageUsagePerTemplate: '6.67',
        }])
        .mockResolvedValueOnce([{ // extremes query
          templateId: 1,
          templateName: 'Most Used',
          templateType: 'template',
          totalUsage: 20,
          lastUsed: '2024-01-01',
          category: 'OUTREACH',
          usageRank: 1,
          averageUsagePerWeek: 0,
        }, {
          templateId: 2,
          templateName: 'Least Used',
          templateType: 'template',
          totalUsage: 1,
          lastUsed: '2024-01-02',
          category: 'FOLLOW_UP',
          usageRank: 999,
          averageUsagePerWeek: 0,
        }])
        .mockResolvedValueOnce([{ // category query
          category: 'OUTREACH',
          usage: 60,
        }, {
          category: 'FOLLOW_UP',
          usage: 40,
        }])
        .mockResolvedValueOnce([{ // weekly query
          week: '2024-01-01',
          usage: 5,
        }, {
          week: '2024-01-08',
          usage: 8,
        }]);

      const result = await getTemplateAnalyticsSummary();

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        totalTemplates: 10,
        totalQuickReplies: 5,
        totalUsage: 100,
        averageUsagePerTemplate: 6.67,
        mostUsedTemplate: expect.objectContaining({
          templateId: 1,
          templateName: 'Most Used',
        }),
        leastUsedTemplate: expect.objectContaining({
          templateId: 2,
          templateName: 'Least Used',
        }),
        usageByCategory: {
          'OUTREACH': 60,
          'FOLLOW_UP': 40,
        },
        usageByWeek: expect.arrayContaining([
          { week: '2024-01-01', usage: 5 },
          { week: '2024-01-08', usage: 8 },
        ]),
      });
    });

    it('should handle database errors', async () => {
      mockNile.db.query.mockRejectedValueOnce(new Error('Database error'));

      const result = await getTemplateAnalyticsSummary();

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('server');
    });
  });

  describe('trackTemplateUsage', () => {
    it('should track template usage successfully', async () => {
      mockNile.db.query
        .mockResolvedValueOnce([]) // update query
        .mockResolvedValueOnce([]); // log query

      const result = await trackTemplateUsage('1', {
        campaignId: 123,
        emailId: 456,
        userId: 'user-1',
      });

      expect(result.success).toBe(true);
      expect(mockNile.db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE templates'),
        [1]
      );
      expect(mockNile.db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO template_usage_log'),
        expect.arrayContaining([1, 'user-1', 123, 456])
      );
    });

    it('should track usage without context', async () => {
      mockNile.db.query.mockResolvedValueOnce([]);

      const result = await trackTemplateUsage('1');

      expect(result.success).toBe(true);
      expect(mockNile.db.query).toHaveBeenCalledTimes(1); // Only update, no log
    });

    it('should handle invalid template ID', async () => {
      const result = await trackTemplateUsage('invalid');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
    });

    it('should handle database errors', async () => {
      mockNile.db.query.mockRejectedValueOnce(new Error('Database error'));

      const result = await trackTemplateUsage('1');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('server');
    });
  });

  describe('getTemplateUsageTrends', () => {
    it('should return usage trends successfully', async () => {
      const mockDbResult = [
        { date: '2024-01-01', usage: 5 },
        { date: '2024-01-02', usage: 8 },
        { date: '2024-01-03', usage: 3 },
      ];

      mockNile.db.query.mockResolvedValueOnce(mockDbResult);

      const result = await getTemplateUsageTrends();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDbResult);
      expect(mockNile.db.query).toHaveBeenCalledWith(
        expect.stringContaining('template_usage_log'),
        [30]
      );
    });

    it('should filter by template ID', async () => {
      const mockDbResult: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
      mockNile.db.query.mockResolvedValueOnce(mockDbResult);

      const result = await getTemplateUsageTrends('1', 7);

      expect(result.success).toBe(true);
      expect(mockNile.db.query).toHaveBeenCalledWith(
        expect.stringContaining('AND tul.template_id = $2'),
        [7, 1]
      );
    });

    it('should validate days parameter', async () => {
      const result = await getTemplateUsageTrends(undefined, 400); // Too many days

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.message).toContain('365');
    });

    it('should handle database errors gracefully', async () => {
      mockNile.db.query.mockRejectedValueOnce(new Error('Table does not exist'));

      const result = await getTemplateUsageTrends();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]); // Empty array on error
    });

    it('should handle invalid template ID', async () => {
      const result = await getTemplateUsageTrends('invalid');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
    });
  });
});
