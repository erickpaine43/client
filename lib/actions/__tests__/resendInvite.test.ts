import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import * as authUtils from '../../utils/auth';

// Mock the auth module
jest.mock('../../utils/auth', () => ({
  requireUserId: jest.fn(),
  hasPermission: jest.fn(),
  checkRateLimit: jest.fn(),
}));

// Mock checkTeamPermission function
const mockCheckTeamPermission = jest.fn().mockResolvedValue(true);

// Mock the teamActions module
jest.mock('../teamActions', () => {
  const actual = jest.requireActual('../teamActions');
  return {
    ...actual,
    checkTeamPermission: mockCheckTeamPermission,
  };
});

// Import after mocking
import { resendInvite } from '../teamActions';

describe('resendInvite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mocks
    (authUtils.requireUserId as jest.Mock).mockResolvedValue('user-123');
    (authUtils.checkRateLimit as jest.Mock).mockResolvedValue(true);
    // Reset checkTeamPermission mock to default (true)
    mockCheckTeamPermission.mockResolvedValue(true);
  });

  it('should resend invite with permission', async () => {
    const result = await resendInvite('invite-1');
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.expiresAt).toBeDefined();
      // The expiry date should be in the future
      expect(result.data.expiresAt.getTime()).toBeGreaterThan(Date.now());
    }
  });

  it('should return error for non-existent invite', async () => {
    const result = await resendInvite('non-existent-invite');
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('not found');
    }
  });

  it('should check permission to manage invites', async () => {
    // Use a user without permission (user-789 is a member with limited permissions)
    (authUtils.requireUserId as jest.Mock).mockResolvedValue('user-789');
    
    const result = await resendInvite('invite-1');
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('permission');
    }
  });
});
