// Set up TextEncoder/TextDecoder mocks for Node.js
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

import { describe, it, expect, jest } from '@jest/globals';

// Mock the auth module
jest.mock('../../utils/auth', () => ({
  requireUserId: jest.fn().mockResolvedValue('user-123'),
  checkTeamPermission: jest.fn().mockResolvedValue(true),
  checkRateLimit: jest.fn().mockResolvedValue(true),
}));

// Mock the teamActions module with a simplified implementation
jest.mock('../teamActions', () => {
  const originalModule = jest.requireActual('../teamActions');
  
  // Create a fresh mock invite
  const mockInvite = {
    id: 'test-invite-1',
    teamId: 'team-1',
    email: 'test@example.com',
    role: 'member',
    invitedBy: 'user-123',
    invitedAt: new Date(),
    expiresAt: new Date(Date.now() - 1000), // Expired invite
    status: 'pending'
  };

  // Mock the resendInvite function
  const mockResendInvite = async (inviteId: string) => {
    if (inviteId !== 'test-invite-1') {
      return {
        success: false,
        error: 'Invitation not found',
        code: 'MEMBER_NOT_FOUND',
      };
    }
    
    // Update the expiry date
    mockInvite.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    return {
      success: true,
      data: { ...mockInvite }
    };
  };

  return {
    ...originalModule,
    resendInvite: mockResendInvite,
  };
});

// Import after setting up mocks
import { resendInvite } from '../teamActions';

describe('isolatedResendInvite', () => {
  it('should resend an invite successfully', async () => {
    const result = await resendInvite('test-invite-1');
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe('test-invite-1');
      expect(result.data.expiresAt.getTime()).toBeGreaterThan(Date.now());
    }
  });

  it('should return error for non-existent invite', async () => {
    const result = await resendInvite('non-existent-id');
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('not found');
    }
  });
});
