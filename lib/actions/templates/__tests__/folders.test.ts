/**
 * Tests for template folder operations
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { 
  getTemplateFolders, 
  getFolderById, 
  createTemplateFolder, 
  updateTemplateFolder, 
  deleteTemplateFolder 
} from '../folders';
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

describe('Template Actions - Folder Operations', () => {
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

  describe('getTemplateFolders', () => {
    it('should return folders with hierarchy successfully', async () => {
      const mockFoldersResult = [
        {
          id: 1,
          name: 'Root Folder',
          type: 'template',
          templateCount: 5,
          isExpanded: true,
          parentId: null,
          order: 1,
        },
        {
          id: 2,
          name: 'Sub Folder',
          type: 'template',
          templateCount: 2,
          isExpanded: false,
          parentId: 1,
          order: 1,
        },
      ];

      const mockTemplatesResult = [
        {
          id: 1,
          name: 'Template 1',
          body: 'Content 1',
          bodyHtml: 'Content 1',
          subject: 'Subject 1',
          content: 'Content 1',
          category: 'OUTREACH',
          folderId: 1,
          usage: 3,
          lastUsed: '2024-01-01',
          isStarred: false,
          type: 'template',
          tenant_id: 1,
          description: 'Template 1',
          createdById: 'user-1',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      mockNile.db.query
        .mockResolvedValueOnce(mockFoldersResult) // folders query
        .mockResolvedValue(mockTemplatesResult); // templates queries for each folder

      const result = await getTemplateFolders();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1); // Only root folders
      expect(result.data![0]).toMatchObject({
        id: 1,
        name: 'Root Folder',
        type: 'template',
        children: expect.any(Array),
      });
      expect(result.data![0].children).toHaveLength(2); // 1 template + 1 subfolder
    });

    it('should fallback to mock data on database error', async () => {
      mockNile.db.query.mockRejectedValueOnce(new Error('Database error'));

      const result = await getTemplateFolders();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('getFolderById', () => {
    it('should return folder by ID successfully', async () => {
      const mockDbResult = [
        {
          id: 1,
          name: 'Test Folder',
          type: 'template',
          templateCount: 3,
          isExpanded: true,
          parentId: null,
          order: 1,
        },
      ];

      mockNile.db.query.mockResolvedValueOnce(mockDbResult);

      const result = await getFolderById('1');

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        id: 1,
        name: 'Test Folder',
        type: 'template',
      });
    });

    it('should return error for invalid ID', async () => {
      const result = await getFolderById('invalid');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
    });

    it('should return not found for non-existent folder', async () => {
      mockNile.db.query.mockResolvedValueOnce([]);

      const result = await getFolderById('999');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('not_found');
    });
  });

  describe('createTemplateFolder', () => {
    it('should create folder successfully', async () => {
      const mockDbResult = [
        {
          id: 1,
          name: 'New Folder',
          type: 'template',
          templateCount: 0,
          isExpanded: true,
          parentId: null,
          order: 1,
        },
      ];

      mockNile.db.query.mockResolvedValueOnce(mockDbResult);

      const result = await createTemplateFolder({
        name: 'New Folder',
        type: 'template',
      });

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        id: 1,
        name: 'New Folder',
        type: 'template',
      });
      expect(mockNile.db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO template_folders'),
        expect.arrayContaining(['New Folder', 'template'])
      );
    });

    it('should validate folder data', async () => {
      const result = await createTemplateFolder({
        name: '', // Invalid empty name
        type: 'template',
      });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
    });

    it('should handle database errors', async () => {
      mockNile.db.query.mockRejectedValueOnce(new Error('Database error'));

      const result = await createTemplateFolder({
        name: 'New Folder',
        type: 'template',
      });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('server');
    });
  });

  describe('updateTemplateFolder', () => {
    it('should update folder successfully', async () => {
      const mockDbResult = [
        {
          id: 1,
          name: 'Updated Folder',
          type: 'template',
          templateCount: 0,
          isExpanded: false,
          parentId: null,
          order: 1,
        },
      ];

      mockNile.db.query.mockResolvedValueOnce(mockDbResult);

      const result = await updateTemplateFolder('1', {
        name: 'Updated Folder',
        isExpanded: false,
      });

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        id: 1,
        name: 'Updated Folder',
        isExpanded: false,
      });
    });

    it('should validate no fields to update', async () => {
      const result = await updateTemplateFolder('1', {});

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.message).toContain('No fields to update');
    });

    it('should return not found for non-existent folder', async () => {
      mockNile.db.query.mockResolvedValueOnce([]);

      const result = await updateTemplateFolder('999', {
        name: 'Updated Folder',
      });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('not_found');
    });
  });

  describe('deleteTemplateFolder', () => {
    it('should prevent deletion of folder with templates', async () => {
      mockNile.db.query
        .mockResolvedValueOnce([{ count: 2 }]) // templates count
        .mockResolvedValueOnce([{ count: 0 }]); // subfolders count

      const result = await deleteTemplateFolder('1');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('conflict');
      expect(result.error?.message).toContain('contains templates');
    });

    it('should prevent deletion of folder with subfolders', async () => {
      mockNile.db.query
        .mockResolvedValueOnce([{ count: 0 }]) // templates count
        .mockResolvedValueOnce([{ count: 1 }]); // subfolders count

      const result = await deleteTemplateFolder('1');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('conflict');
      expect(result.error?.message).toContain('subfolders');
    });

    it('should delete empty folder successfully', async () => {
      mockNile.db.query
        .mockResolvedValueOnce([{ count: 0 }]) // templates count
        .mockResolvedValueOnce([{ count: 0 }]) // subfolders count
        .mockResolvedValueOnce([{ id: 1 }]); // delete result

      const result = await deleteTemplateFolder('1');

      expect(result.success).toBe(true);
      expect(mockNile.db.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM template_folders'),
        [1]
      );
    });

    it('should return not found if folder does not exist', async () => {
      mockNile.db.query
        .mockResolvedValueOnce([{ count: 0 }]) // templates count
        .mockResolvedValueOnce([{ count: 0 }]) // subfolders count
        .mockResolvedValueOnce([]); // delete result (no rows affected)

      const result = await deleteTemplateFolder('999');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('not_found');
    });
  });
});
