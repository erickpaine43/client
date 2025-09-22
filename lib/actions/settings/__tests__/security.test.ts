/**
 * Tests for security settings actions
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import {
  getSecuritySettings,
  updateSecuritySettings,
  getSecurityRecommendations,
  enableTwoFactorAuth,
  disableTwoFactorAuth,
  verifyTwoFactorCode,
  generateBackupCodes,
  updatePassword,
  getActiveSessions,
  revokeSession,
} from '../security';

// Mock the core auth utilities
jest.mock('@/lib/actions/core/auth', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withAuth: jest.fn((handler: any) => {
    const mockContext = {
      userId: 'test-user-id',
      companyId: 'test-company-id',
      timestamp: Date.now(),
      requestId: 'test-request-id',
    };
    return handler(mockContext);
  }),
  RateLimits: {},
  getRateLimitConfig: jest.fn(),
}));

// Mock the error handling
jest.mock('@/lib/actions/core/errors', () => ({
  ErrorFactory: {
    validation: jest.fn((message, field, code) => ({
      success: false,
      error: { type: 'validation', message, field, code },
    })),
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withErrorHandling: jest.fn((handler: any) => handler()),
}));

// Mock the settings data
jest.mock('../../../data/settings.mock', () => ({
  mockSecuritySettings: {
    twoFactor: {
      enabled: false,
      method: 'app',
      backupCodes: 5,
    },
    sessionTimeout: 60,
    loginNotifications: true,
    passwordLastChanged: new Date(),
  },
}));

describe('Security Settings Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getSecuritySettings', () => {
    it('should return security settings successfully', async () => {
      const result = await getSecuritySettings();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.twoFactor).toBeDefined();
    });
  });

  describe('updateSecuritySettings', () => {
    it('should update security settings successfully', async () => {
      const updates = {
        sessionTimeout: 120,
        loginNotifications: false,
      };

      const result = await updateSecuritySettings(updates);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should validate session timeout range', async () => {
      const updates = {
        sessionTimeout: 3, // Too low
      };

      const result = await updateSecuritySettings(updates);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.field).toBe('sessionTimeout');
    });

    it('should validate session timeout maximum', async () => {
      const updates = {
        sessionTimeout: 2000, // Too high
      };

      const result = await updateSecuritySettings(updates);

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.field).toBe('sessionTimeout');
    });
  });

  describe('getSecurityRecommendations', () => {
    it('should return security recommendations successfully', async () => {
      const result = await getSecurityRecommendations();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data?.length).toBeGreaterThan(0);
    });
  });

  describe('enableTwoFactorAuth', () => {
    it('should enable 2FA and return QR code and backup codes', async () => {
      const result = await enableTwoFactorAuth();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.qrCode).toBeDefined();
      expect(result.data?.backupCodes).toBeDefined();
      expect(Array.isArray(result.data?.backupCodes)).toBe(true);
      expect(result.data?.backupCodes.length).toBe(8);
    });
  });

  describe('disableTwoFactorAuth', () => {
    it('should disable 2FA with valid password', async () => {
      const result = await disableTwoFactorAuth('validpassword123');

      expect(result.success).toBe(true);
      expect(result.data?.success).toBe(true);
    });

    it('should require password', async () => {
      const result = await disableTwoFactorAuth('');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.field).toBe('password');
    });

    it('should validate password length', async () => {
      const result = await disableTwoFactorAuth('short');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.field).toBe('password');
    });
  });

  describe('verifyTwoFactorCode', () => {
    it('should verify valid 6-digit code', async () => {
      const result = await verifyTwoFactorCode('123456');

      expect(result.success).toBe(true);
      expect(result.data?.verified).toBe(true);
    });

    it('should reject invalid code length', async () => {
      const result = await verifyTwoFactorCode('123');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.field).toBe('code');
    });

    it('should reject empty code', async () => {
      const result = await verifyTwoFactorCode('');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.field).toBe('code');
    });
  });

  describe('generateBackupCodes', () => {
    it('should generate new backup codes', async () => {
      const result = await generateBackupCodes();

      expect(result.success).toBe(true);
      expect(result.data?.backupCodes).toBeDefined();
      expect(Array.isArray(result.data?.backupCodes)).toBe(true);
      expect(result.data?.backupCodes.length).toBe(8);
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      const result = await updatePassword('currentpassword', 'newpassword123');

      expect(result.success).toBe(true);
      expect(result.data?.success).toBe(true);
    });

    it('should require current password', async () => {
      const result = await updatePassword('', 'newpassword123');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.field).toBe('currentPassword');
    });

    it('should validate new password length', async () => {
      const result = await updatePassword('currentpassword', 'short');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.field).toBe('newPassword');
    });

    it('should require different passwords', async () => {
      const result = await updatePassword('samepassword', 'samepassword');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.field).toBe('newPassword');
    });
  });

  describe('getActiveSessions', () => {
    it('should return active sessions', async () => {
      const result = await getActiveSessions();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data?.length).toBeGreaterThan(0);
    });
  });

  describe('revokeSession', () => {
    it('should revoke session successfully', async () => {
      const result = await revokeSession('session-123');

      expect(result.success).toBe(true);
      expect(result.data?.success).toBe(true);
    });

    it('should require session ID', async () => {
      const result = await revokeSession('');

      expect(result.success).toBe(false);
      expect(result.error?.type).toBe('validation');
      expect(result.error?.field).toBe('sessionId');
    });
  });
});
