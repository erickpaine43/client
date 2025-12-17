/**
 * Tests for main template operations
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { getTemplates, getTemplateById, updateTemplate, getTabCounts } from '../index';
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
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

const mockNile = nile as jest.Mocked<typeof nile>;
const mockAuth = auth as jest.Mocked<typeof auth>;

describe('Template Actions - Main Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful authentication
    mockAuth.withAuth = jest.fn().mockImplementation((handler: any, ...args: any[]) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      return handler({ userId: 'test-user', companyId: 'test-company', timestamp: Date.now(), requestId: 'test-req' }, ...args);
    }) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    mockAuth.withContextualRateLimit = jest.fn().mockImplementation((action: any, type: any, config: any, operation: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      return operation();
    }) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getTemplates', () => {
    it('should return templates from database successfully', async () => {
      const mockDbResult = [
        {
          id: 1,
          name: 'Test Template',
          body: 'Test body',
          bodyHtml: 'Test body',
          subject: 'Test subject',
          content: 'Test content',
          category: 'OUTREACH',
          folderId: null,
          usage: 5,
          lastUsed: '2024-01-01',
          isStarred: false,
          type: 'template',
          tenant_id: 1,
          description: 'Test description',
          createdById: 'user-1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      mockNile.db.query.mockResolvedValueOnce(mockDbResult);

      const result = await getTemplates();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data![0]).toMatchObject({
        id: 1,
        name: 'Test Template',
        type: 'template',
        category: 'OUTREACH',
      });
      expect(mockNile.db.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE type = 'template'")
      );
    });

    it('should fallback to mock data on database error', async () => {
      mockNile.db.query.mockRejectedValueOnce(new Error('Database error'));

      const result = await getTemplates();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should handle authentication failure', async () => {
      mockAuth.withAuth = jest.fn().mockImplementation(() => {
        return Promise.resolve({
          success: false,
          error: { type: 'auth', message: 'Authentication required' }
        });
      }) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

      const result = await getTemplates();

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('auth');
    });
  });

  describe('getTemplateById', () => {
    it('should return template by ID successfully', async () => {
      const mockDbResult = [
        {
          id: 1,
          name: 'Test Template',
          body: 'Test body',
          bodyHtml: 'Test body',
          subject: 'Test subject',
          content: 'Test content',
          category: 'OUTREACH',
          folderId: null,
          usage: 5,
          lastUsed: '2024-01-01',
          isStarred: false,
          type: 'template',
          tenant_id: 1,
          description: 'Test description',
          createdById: 'user-1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      mockNile.db.query.mockResolvedValueOnce(mockDbResult);

      const result = await getTemplateById('1');

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        id: 1,
        name: 'Test Template',
        type: 'template',
      });
      expect(mockNile.db.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE id = $1 AND type = 'template'"),
        [1]
      );
    });

    it('should return error for invalid ID', async () => {
      const result = await getTemplateById('invalid');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.message).toContain('positive number');
    });

    it('should return not found for non-existent template', async () => {
      mockNile.db.query.mockResolvedValueOnce([]);

      const result = await getTemplateById('999');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('not_found');
    });

    it('should fallback to mock data on database error', async () => {
      mockNile.db.query.mockRejectedValueOnce(new Error('Database error'));

      const result = await getTemplateById('1');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });
  });

  describe('getTabCounts', () => {
    it('should return tab counts successfully', async () => {
      mockNile.db.query
        .mockResolvedValueOnce([{ count: 5 }]) // templates count
        .mockResolvedValueOnce([{ count: 3 }]); // quick-replies count

      const result = await getTabCounts();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        templates: 5,
        'quick-replies': 3,
        gallery: 0,
      });
    });

    it('should fallback to mock data counts on database error', async () => {
      mockNile.db.query.mockRejectedValueOnce(new Error('Database error'));

      const result = await getTabCounts();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(typeof result.data!.templates).toBe('number');
      expect(typeof result.data!['quick-replies']).toBe('number');
    });
  });

  describe('updateTemplate', () => {
    it('should handle missing authentication', async () => {
      mockAuth.withAuthAndCompany = jest.fn().mockImplementation(() => {
        return Promise.resolve({
          success: false,
          error: { type: 'auth', message: 'Authentication required' }
        });
      }) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

      const formData = new FormData();
      formData.append('id', '1');
      formData.append('name', 'Updated Template');
      formData.append('subject', 'Updated Subject');
      formData.append('content', 'Updated Content');

      await expect(updateTemplate(formData)).rejects.toThrow('Authentication required');
    });

    it('should handle validation errors', async () => {
      mockAuth.withAuthAndCompany = jest.fn().mockImplementation((handler: any, ...args: any[]) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        return handler({
          userId: 'test-user',
          companyId: 'test-company',
          timestamp: Date.now(),
          requestId: 'test-req'
        }, ...args);
      }) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

      const formData = new FormData();
      formData.append('id', '1');
      formData.append('name', ''); // Invalid empty name
      formData.append('subject', 'Updated Subject');
      formData.append('content', 'Updated Content');

      await expect(updateTemplate(formData)).rejects.toThrow();
    });
  });
});
