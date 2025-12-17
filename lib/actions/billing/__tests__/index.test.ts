/**
 * Tests for main billing actions
 */

import {
  getBillingInfo,
  updateBillingInfo,
  getSubscriptionPlans,
  updateSubscriptionPlan,
  cancelSubscription,
  reactivateSubscription,
  getBillingDataForSettings
} from '../index';
import { mockBillingInfo, subscriptionPlans } from '../../../data/billing.mock';
import { requireAuth } from '../../core/auth';
import { ErrorFactory } from '../../core/errors';
import { validateBillingAddress, validateSubscriptionChange } from '../validation';
import * as billingIndex from '../index';
import * as usageModule from '../usage';

// Mock dependencies
jest.mock('@/app/api/[...nile]/nile', () => ({
  nile: {
    db: {
      query: jest.fn(),
    },
    users: {
      getSelf: jest.fn(),
    },
  },
}));

// Mock the auth utilities
jest.mock('../../core/auth', () => ({
  requireAuth: jest.fn(),
  withContextualRateLimit: jest.fn((action, type, config, fn) => fn()),
  RateLimits: {
    GENERAL_READ: { limit: 100, windowMs: 60000 },
    BILLING_UPDATE: { limit: 5, windowMs: 60000 },
    SUBSCRIPTION_UPDATE: { limit: 5, windowMs: 3600000 },
  },
}));

// Mock the error handling utilities
jest.mock('../../core/errors', () => ({
  ErrorFactory: {
    authRequired: jest.fn(() => ({ success: false, error: { type: 'auth', message: 'Authentication required' } })),
    validation: jest.fn((message, field) => ({ success: false, error: { type: 'validation', message, field } })),
    internal: jest.fn((message) => ({ success: false, error: { type: 'server', message } })),
  },
  withErrorHandling: jest.fn((fn) => fn()),
}));

// Mock validation functions
jest.mock('../validation', () => ({
  validateBillingAddress: jest.fn(() => null),
  validateSubscriptionChange: jest.fn(() => null),
}));

const mockRequireAuth = jest.mocked(requireAuth);
const mockErrorFactory = jest.mocked(ErrorFactory);

describe('Billing Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue({
      success: true,
      data: { userId: 'test-user-id', companyId: 'test-company-id', timestamp: Date.now(), requestId: 'test-request-id' },
    });
  });

  describe('getBillingInfo', () => {
    it('should return billing info for authenticated user', async () => {
      const result = await getBillingInfo();

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        userId: 'test-user-id',
        currentPlan: expect.any(Object),
        paymentMethod: expect.any(Object),
        usage: expect.any(Object),
      });
    });

    it('should return error when user is not authenticated', async () => {
      mockRequireAuth.mockResolvedValue({
        success: false,
        error: { type: 'auth', message: 'Authentication required' },
      });

      const result = await getBillingInfo();

      expect(result.success).toBe(false);
      expect(mockErrorFactory.authRequired).toHaveBeenCalled();
    });
  });

  describe('updateBillingInfo', () => {
    it('should update billing info successfully', async () => {
      const updates = {
        billingAddress: {
          street: '456 New Street',
          city: 'New City',
          state: 'NY',
          zipCode: '10001',
          country: 'United States',
        },
      };

      const result = await updateBillingInfo(updates);

      expect(result.success).toBe(true);
      expect(result.data?.billingAddress).toMatchObject(updates.billingAddress);
    });

    it('should validate billing address', async () => {
      const mockValidateBillingAddress = jest.mocked(validateBillingAddress);
      mockValidateBillingAddress.mockReturnValue('Invalid address');

      const updates = {
        billingAddress: {
          street: 'x', // Invalid short street
          city: 'NY',
          state: 'NY',
          zipCode: '10001',
          country: 'US'
        },
      };

      await updateBillingInfo(updates);

      expect(mockValidateBillingAddress).toHaveBeenCalledWith(updates.billingAddress);
      expect(mockErrorFactory.validation).toHaveBeenCalledWith('Invalid address', 'billingAddress');
    });
  });

  describe('getSubscriptionPlans', () => {
    it('should return all available subscription plans', async () => {
      const result = await getSubscriptionPlans();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(subscriptionPlans);
        expect(result.data.length).toBeGreaterThan(0);
      }
    });

    it('should not require authentication', async () => {
      // This function should work without authentication
      mockRequireAuth.mockResolvedValue({
        success: false,
        error: { type: 'auth', message: 'Authentication required' },
      });

      const result = await getSubscriptionPlans();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(subscriptionPlans);
      }
    });
  });

  describe('updateSubscriptionPlan', () => {
    it('should update subscription plan successfully', async () => {
      // Mock getBillingInfo and getUsageMetrics
      const mockGetBillingInfo = jest.fn().mockResolvedValue({
        success: true,
        data: mockBillingInfo,
      });
      const mockGetUsageMetrics = jest.fn().mockResolvedValue({
        success: true,
        data: mockBillingInfo.usage,
      });

      // Replace the imports temporarily
      const originalModule = billingIndex;
      originalModule.getBillingInfo = mockGetBillingInfo;
      jest.mocked(usageModule).getUsageMetrics = mockGetUsageMetrics;

      const result = await updateSubscriptionPlan('plan-professional');

      expect(result.success).toBe(true);
      expect(result.data?.currentPlan.id).toBe('plan-professional');
    });

    it('should validate subscription change', async () => {
      const mockValidateSubscriptionChange = jest.mocked(validateSubscriptionChange);
      mockValidateSubscriptionChange.mockReturnValue('Cannot downgrade');

      await updateSubscriptionPlan('plan-starter');

      expect(mockErrorFactory.validation).toHaveBeenCalledWith('Cannot downgrade');
    });

    it('should reject invalid plan ID', async () => {
      await updateSubscriptionPlan('invalid-plan');

      expect(mockErrorFactory.validation).toHaveBeenCalledWith('Invalid subscription plan');
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel subscription successfully', async () => {
      const result = await cancelSubscription('Not satisfied with service');

      expect(result.success).toBe(true);
      expect(result.data?.cancelledAt).toBeInstanceOf(Date);
    });

    it('should require authentication', async () => {
      mockRequireAuth.mockResolvedValue({
        success: false,
        error: { type: 'auth', message: 'Authentication required' },
      });

      const result = await cancelSubscription();

      expect(result.success).toBe(false);
      expect(mockErrorFactory.authRequired).toHaveBeenCalled();
    });
  });

  describe('reactivateSubscription', () => {
    it('should reactivate subscription successfully', async () => {
      // Mock getBillingInfo to return billing info with payment method
      const mockGetBillingInfo = jest.fn().mockResolvedValue({
        success: true,
        data: mockBillingInfo,
      });
      jest.mocked(billingIndex).getBillingInfo = mockGetBillingInfo;

      const result = await reactivateSubscription();

      expect(result.success).toBe(true);
      expect(result.data?.reactivatedAt).toBeInstanceOf(Date);
    });

    it('should require payment method for reactivation', async () => {
      // Mock getBillingInfo to return billing info without payment method
      const mockGetBillingInfo = jest.fn().mockResolvedValue({
        success: true,
        data: { ...mockBillingInfo, paymentMethod: null },
      });
      
      // Mock the module's getBillingInfo function
      const billingModule = billingIndex;
      const originalGetBillingInfo = jest.mocked(billingModule).getBillingInfo;
      jest.mocked(billingModule).getBillingInfo = mockGetBillingInfo;

      const result = await reactivateSubscription();

      expect(result.success).toBe(false);
      expect(mockErrorFactory.validation).toHaveBeenCalledWith(
        'Payment method required to reactivate subscription'
      );

      // Restore original function
      jest.mocked(billingModule).getBillingInfo = originalGetBillingInfo;
    });
  });

  describe('getBillingDataForSettings', () => {
    it('should return billing data for settings component', async () => {
      const result = await getBillingDataForSettings();

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        renewalDate: expect.any(String),
        planDetails: expect.any(Object),
        paymentMethod: expect.any(Object),
        billingHistory: expect.any(Array),
      });
    });

    it('should require authentication', async () => {
      mockRequireAuth.mockResolvedValue({
        success: false,
        error: { type: 'auth', message: 'Authentication required' },
      });

      const result = await getBillingDataForSettings();

      expect(result.success).toBe(false);
      expect(mockErrorFactory.authRequired).toHaveBeenCalled();
    });
  });
});
