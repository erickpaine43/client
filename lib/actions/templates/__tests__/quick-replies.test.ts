/**
 * Tests for quick reply operations
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import {
  getQuickReplies,
  getQuickReplyById,
  createQuickReply,
  updateQuickReply,
  deleteQuickReply,
  markQuickReplyAsUsed
} from '../quick-replies';
import { nile } from '@/app/api/[...nile]/nile';
import * as auth from '@/lib/actions/core/auth';
import { ActionContext, ActionResult } from '@/lib/actions/core/types';

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

describe('Template Actions - Quick Reply Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful authentication
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockAuth.withAuth = (jest.fn() as any).mockImplementation((
      handler: (context: ActionContext) => Promise<ActionResult<unknown>>
    ) => {
      return handler({ userId: 'test-user', companyId: 'test-company', timestamp: Date.now(), requestId: 'test-req' });
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockAuth.withContextualRateLimit = (jest.fn() as any).mockImplementation((
      _action: string,
      _type: string,
      _config: unknown,
      operation: () => Promise<ActionResult<unknown>>
    ) => {
      return operation();
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getQuickReplies', () => {
    it('should return quick replies from database successfully', async () => {
      const mockDbResult = [
        {
          id: 1,
          name: 'Test Quick Reply',
          body: 'Test body',
          bodyHtml: 'Test body',
          subject: 'Test subject',
          content: 'Test content',
          category: 'FOLLOW_UP',
          folderId: null,
          usage: 3,
          lastUsed: '2024-01-01',
          isStarred: false,
          type: 'quick-reply',
          tenant_id: 1,
          description: 'Test description',
          createdById: 'user-1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      mockNile.db.query.mockResolvedValueOnce(mockDbResult);

      const result = await getQuickReplies();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data![0]).toMatchObject({
        id: 1,
        name: 'Test Quick Reply',
        type: 'quick-reply',
        category: 'FOLLOW_UP',
      });
      expect(mockNile.db.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE type = 'quick-reply'")
      );
    });

    it('should fallback to mock data on database error', async () => {
      mockNile.db.query.mockRejectedValueOnce(new Error('Database error'));

      const result = await getQuickReplies();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('getQuickReplyById', () => {
    it('should return quick reply by ID successfully', async () => {
      const mockDbResult = [
        {
          id: 1,
          name: 'Test Quick Reply',
          body: 'Test body',
          bodyHtml: 'Test body',
          subject: 'Test subject',
          content: 'Test content',
          category: 'FOLLOW_UP',
          folderId: null,
          usage: 3,
          lastUsed: '2024-01-01',
          isStarred: false,
          type: 'quick-reply',
          tenant_id: 1,
          description: 'Test description',
          createdById: 'user-1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      mockNile.db.query.mockResolvedValueOnce(mockDbResult);

      const result = await getQuickReplyById('1');

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        id: 1,
        name: 'Test Quick Reply',
        type: 'quick-reply',
      });
      expect(mockNile.db.query).toHaveBeenCalledWith(
        expect.stringContaining("WHERE id = $1 AND type = 'quick-reply'"),
        [1]
      );
    });

    it('should return error for invalid ID', async () => {
      const result = await getQuickReplyById('invalid');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
    });

    it('should return not found for non-existent quick reply', async () => {
      mockNile.db.query.mockResolvedValueOnce([]);

      const result = await getQuickReplyById('999');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('not_found');
    });
  });

  describe('createQuickReply', () => {
    it('should create quick reply successfully', async () => {
      const mockDbResult = [
        {
          id: 1,
          name: 'New Quick Reply',
          body: 'New content',
          bodyHtml: 'New content',
          subject: '',
          content: 'New content',
          category: 'FOLLOW_UP',
          folderId: null,
          usage: 0,
          lastUsed: null,
          isStarred: false,
          type: 'quick-reply',
          tenant_id: 1,
          description: 'New Quick Reply',
          createdById: 'test-user',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockNile.db.query.mockResolvedValueOnce(mockDbResult);

      const result = await createQuickReply({
        name: 'New Quick Reply',
        content: 'New content',
      });

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        id: 1,
        name: 'New Quick Reply',
        type: 'quick-reply',
      });
      expect(mockNile.db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO templates'),
        expect.arrayContaining(['New Quick Reply', 'New content'])
      );
    });

    it('should validate quick reply data', async () => {
      const result = await createQuickReply({
        name: '', // Invalid empty name
        content: 'Valid content',
      });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
    });

    it('should handle database errors', async () => {
      mockNile.db.query.mockRejectedValueOnce(new Error('Database error'));

      const result = await createQuickReply({
        name: 'New Quick Reply',
        content: 'New content',
      });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('server');
    });
  });

  describe('updateQuickReply', () => {
    it('should update quick reply successfully', async () => {
      const mockDbResult = [
        {
          id: 1,
          name: 'Updated Quick Reply',
          body: 'Updated content',
          bodyHtml: 'Updated content',
          subject: '',
          content: 'Updated content',
          category: 'FOLLOW_UP',
          folderId: null,
          usage: 0,
          lastUsed: null,
          isStarred: true,
          type: 'quick-reply',
          tenant_id: 1,
          description: 'Updated Quick Reply',
          createdById: 'test-user',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockNile.db.query.mockResolvedValueOnce(mockDbResult);

      const result = await updateQuickReply('1', {
        name: 'Updated Quick Reply',
        content: 'Updated content',
        isStarred: true,
      });

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        id: 1,
        name: 'Updated Quick Reply',
        isStarred: true,
      });
    });

    it('should validate no fields to update', async () => {
      const result = await updateQuickReply('1', {});

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.message).toContain('No fields to update');
    });

    it('should return not found for non-existent quick reply', async () => {
      mockNile.db.query.mockResolvedValueOnce([]);

      const result = await updateQuickReply('999', {
        name: 'Updated Quick Reply',
      });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('not_found');
    });
  });

  describe('deleteQuickReply', () => {
    it('should delete quick reply successfully', async () => {
      mockNile.db.query.mockResolvedValueOnce([{ id: 1 }]);

      const result = await deleteQuickReply('1');

      expect(result.success).toBe(true);
      expect(mockNile.db.query).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM templates"),
        [1]
      );
    });

    it('should return not found if quick reply does not exist', async () => {
      mockNile.db.query.mockResolvedValueOnce([]);

      const result = await deleteQuickReply('999');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('not_found');
    });

    it('should validate ID before deletion', async () => {
      const result = await deleteQuickReply('invalid');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
    });
  });

  describe('markQuickReplyAsUsed', () => {
    it('should mark quick reply as used successfully', async () => {
      mockNile.db.query.mockResolvedValueOnce([{ id: 1 }]);

      const result = await markQuickReplyAsUsed('1');

      expect(result.success).toBe(true);
      expect(mockNile.db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE templates'),
        [1]
      );
    });

    it('should return not found if quick reply does not exist', async () => {
      mockNile.db.query.mockResolvedValueOnce([]);

      const result = await markQuickReplyAsUsed('999');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('not_found');
    });

    it('should validate ID before marking as used', async () => {
      const result = await markQuickReplyAsUsed('invalid');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
    });

    it('should handle database errors', async () => {
      mockNile.db.query.mockRejectedValueOnce(new Error('Database error'));

      const result = await markQuickReplyAsUsed('1');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('server');
    });
  });
});
