/**
 * Tests for template validation utilities
 */

import { describe, it, expect } from '@jest/globals';
import {
  validateTemplateId,
  validateFolderId,
  validateTemplateData,
  validateFolderData,
  validateTemplateFormData,
  validateFolderFormData,
  validateTemplateFilters,
  sanitizeTemplateContent,
  validateAndSanitizeContent,
} from '../validation';

describe('Template Validation', () => {
  describe('validateTemplateId', () => {
    it('should validate valid template ID', () => {
      const result = validateTemplateId('123');
      expect(result.success).toBe(true);
      expect(result.data).toBe(123);
    });

    it('should reject empty ID', () => {
      const result = validateTemplateId('');
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.message).toContain('required');
    });

    it('should reject non-numeric ID', () => {
      const result = validateTemplateId('abc');
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.message).toContain('positive number');
    });

    it('should reject negative ID', () => {
      const result = validateTemplateId('-1');
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.message).toContain('positive number');
    });

    it('should reject zero ID', () => {
      const result = validateTemplateId('0');
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.message).toContain('positive number');
    });
  });

  describe('validateFolderId', () => {
    it('should validate valid folder ID', () => {
      const result = validateFolderId('456');
      expect(result.success).toBe(true);
      expect(result.data).toBe(456);
    });

    it('should reject invalid folder ID', () => {
      const result = validateFolderId('invalid');
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
    });
  });

  describe('validateTemplateData', () => {
    it('should validate complete template data', () => {
      const result = validateTemplateData({
        name: 'Test Template',
        subject: 'Test Subject',
        content: 'Test Content',
        category: 'OUTREACH',
        folderId: '1',
      });

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        name: 'Test Template',
        subject: 'Test Subject',
        content: 'Test Content',
        category: 'OUTREACH',
        folderId: 1,
      });
    });

    it('should validate minimal template data', () => {
      const result = validateTemplateData({
        name: 'Test Template',
        subject: '',
        content: 'Test Content',
      });

      if (!result.success) {
        console.log('Validation errors:', result.error);
      }

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        name: 'Test Template',
        subject: '',
        content: 'Test Content',
      });
    });

    it('should reject empty name', () => {
      const result = validateTemplateData({
        name: '',
        subject: 'Test Subject',
        content: 'Test Content',
      });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.message).toContain('name');
    });

    it('should reject empty content', () => {
      const result = validateTemplateData({
        name: 'Test Template',
        subject: 'Test Subject',
        content: '',
      });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.message).toContain('content');
    });

    it('should reject name that is too long', () => {
      const result = validateTemplateData({
        name: 'a'.repeat(201), // Too long
        subject: 'Test Subject',
        content: 'Test Content',
      });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.message).toContain('name');
    });

    it('should reject content that is too long', () => {
      const result = validateTemplateData({
        name: 'Test Template',
        subject: 'Test Subject',
        content: 'a'.repeat(10001), // Too long
      });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.message).toContain('content');
    });

    it('should reject invalid category', () => {
      const result = validateTemplateData({
        name: 'Test Template',
        subject: 'Test Subject',
        content: 'Test Content',
        category: 'INVALID_CATEGORY',
      });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.message).toContain('category');
    });

    it('should reject invalid folder ID', () => {
      const result = validateTemplateData({
        name: 'Test Template',
        subject: 'Test Subject',
        content: 'Test Content',
        folderId: 'invalid',
      });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.message).toContain('Folder ID');
    });
  });

  describe('validateFolderData', () => {
    it('should validate complete folder data', () => {
      const result = validateFolderData({
        name: 'Test Folder',
        type: 'template',
        parentId: 1,
      });

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        name: 'Test Folder',
        type: 'template',
        parentId: 1,
      });
    });

    it('should validate folder data without parent', () => {
      const result = validateFolderData({
        name: 'Root Folder',
        type: 'quick-reply',
      });

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        name: 'Root Folder',
        type: 'quick-reply',
      });
    });

    it('should reject empty name', () => {
      const result = validateFolderData({
        name: '',
        type: 'template',
      });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.message).toContain('name');
    });

    it('should reject invalid type', () => {
      const result = validateFolderData({
        name: 'Test Folder',
        type: 'invalid',
      });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.message).toContain('type');
    });
  });

  describe('validateTemplateFormData', () => {
    it('should validate form data successfully', () => {
      const formData = new FormData();
      formData.append('name', 'Test Template');
      formData.append('subject', 'Test Subject');
      formData.append('content', 'Test Content');
      formData.append('category', 'OUTREACH');

      const result = validateTemplateFormData(formData);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        name: 'Test Template',
        subject: 'Test Subject',
        content: 'Test Content',
        category: 'OUTREACH',
      });
    });

    it('should handle missing form fields', () => {
      const formData = new FormData();
      formData.append('name', 'Test Template');
      // Missing subject and content

      const result = validateTemplateFormData(formData);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
    });
  });

  describe('validateFolderFormData', () => {
    it('should validate folder form data successfully', () => {
      const formData = new FormData();
      formData.append('name', 'Test Folder');
      formData.append('type', 'template');
      formData.append('parentId', '1');

      const result = validateFolderFormData(formData);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        name: 'Test Folder',
        type: 'template',
        parentId: 1,
      });
    });
  });

  describe('validateTemplateFilters', () => {
    it('should validate complete filter parameters', () => {
      const result = validateTemplateFilters({
        search: 'test',
        category: 'OUTREACH',
        folderId: '1',
        type: 'template',
        starred: 'true',
        limit: '20',
        offset: '0',
      });

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        search: 'test',
        category: 'OUTREACH',
        folderId: 1,
        type: 'template',
        starred: true,
        limit: 20,
        offset: 0,
      });
    });

    it('should use default pagination values', () => {
      const result = validateTemplateFilters({});

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        limit: 20,
        offset: 0,
      });
    });

    it('should reject invalid limit', () => {
      const result = validateTemplateFilters({
        limit: '101', // Too high
      });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.message).toContain('Limit');
    });

    it('should reject invalid starred value', () => {
      const result = validateTemplateFilters({
        starred: 'maybe',
      });

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.message).toContain('Starred');
    });
  });

  describe('sanitizeTemplateContent', () => {
    it('should remove script tags', () => {
      const content = 'Hello <script>alert("xss")</script> World';
      const result = sanitizeTemplateContent(content);
      expect(result).toBe('Hello  World');
    });

    it('should remove iframe tags', () => {
      const content = 'Hello <iframe src="evil.com"></iframe> World';
      const result = sanitizeTemplateContent(content);
      expect(result).toBe('Hello  World');
    });

    it('should remove javascript URLs', () => {
      const content = 'Hello <a href="javascript:alert()">Link</a> World';
      const result = sanitizeTemplateContent(content);
      expect(result).toBe('Hello <a href="">Link</a> World');
    });

    it('should remove event handlers', () => {
      const content = 'Hello <div onclick="alert()">Div</div> World';
      const result = sanitizeTemplateContent(content);
      expect(result).toBe('Hello <div >Div</div> World');
    });

    it('should preserve safe HTML', () => {
      const content = 'Hello <b>bold</b> and <i>italic</i> text';
      const result = sanitizeTemplateContent(content);
      expect(result).toBe('Hello <b>bold</b> and <i>italic</i> text');
    });
  });

  describe('validateAndSanitizeContent', () => {
    it('should validate and sanitize content successfully', () => {
      const content = 'Hello <b>world</b> <script>alert("xss")</script>';
      const result = validateAndSanitizeContent(content);

      expect(result.success).toBe(true);
      expect(result.data).toBe('Hello <b>world</b>');
    });

    it('should reject empty content', () => {
      const result = validateAndSanitizeContent('');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.message).toContain('content');
    });

    it('should reject content that becomes empty after sanitization', () => {
      const content = '<script>alert("xss")</script>';
      const result = validateAndSanitizeContent(content);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.message).toContain('empty after sanitization');
    });

    it('should reject content that is too long', () => {
      const content = 'a'.repeat(10001);
      const result = validateAndSanitizeContent(content);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.message).toContain('10,000 characters');
    });
  });
});
