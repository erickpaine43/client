/**
 * Tests for payment method actions
 */

import {
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod,
  getPaymentMethods,
  updatePaymentMethod,
  verifyPaymentMethod,
} from '../payment-methods';
import { mockBillingInfo } from '../../../data/billing.mock';
import { requireAuth } from '../../core/auth';
import { ErrorFactory } from '../../core/errors';
import { validatePaymentMethod, validatePaymentMethodId } from '../validation';
import { getBillingInfo } from '../index';
import * as paymentMethodsModule from '../payment-methods';

// Mock the auth utilities
jest.mock('../../core/auth', () => ({
  requireAuth: jest.fn(),
  withContextualRateLimit: jest.fn((action, type, config, fn) => fn()),
  RateLimits: {
    PAYMENT_METHOD_ADD: { limit: 10, windowMs: 3600000 },
    PAYMENT_METHOD_DELETE: { limit: 10, windowMs: 3600000 },
    GENERAL_READ: { limit: 100, windowMs: 60000 },
  },
}));

// Mock the error handling utilities
jest.mock('../../core/errors', () => ({
  ErrorFactory: {
    authRequired: jest.fn(() => ({ success: false, error: { type: 'auth', message: 'Authentication required' } })),
    validation: jest.fn((message, field) => ({ success: false, error: { type: 'validation', message, field } })),
    internal: jest.fn((message) => ({ success: false, error: { type: 'server', message } })),
    notFound: jest.fn((resource) => ({ success: false, error: { type: 'not_found', message: `${resource} not found` } })),
  },
  withErrorHandling: jest.fn((fn) => fn()),
}));

// Mock validation functions
jest.mock('../validation', () => ({
  validatePaymentMethod: jest.fn(() => null),
  validatePaymentMethodId: jest.fn(() => null),
}));

// Mock getBillingInfo from index
jest.mock('../index', () => ({
  getBillingInfo: jest.fn(),
}));

const mockRequireAuth = jest.mocked(requireAuth);
const mockErrorFactory = jest.mocked(ErrorFactory);
const mockValidatePaymentMethod = jest.mocked(validatePaymentMethod);
const mockValidatePaymentMethodId = jest.mocked(validatePaymentMethodId);
const mockGetBillingInfo = jest.mocked(getBillingInfo);

describe('Payment Method Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireAuth.mockResolvedValue({
      success: true,
      data: { userId: 'test-user-id', companyId: 'test-company-id', timestamp: Date.now(), requestId: 'test-request-id' },
    });
    mockGetBillingInfo.mockResolvedValue({
      success: true,
      data: mockBillingInfo,
    });
  });

  describe('addPaymentMethod', () => {
    const validPaymentMethod = {
      type: 'visa' as const,
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      holderName: 'John Doe',
      isDefault: false,
    };

    it('should add payment method successfully', async () => {
      const result = await addPaymentMethod(validPaymentMethod);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        ...validPaymentMethod,
        id: expect.stringMatching(/^pm-\d+$/),
      });
    });

    it('should validate payment method', async () => {
      mockValidatePaymentMethod.mockReturnValue('Invalid payment method');

      await addPaymentMethod(validPaymentMethod);

      expect(mockValidatePaymentMethod).toHaveBeenCalledWith(validPaymentMethod);
      expect(mockErrorFactory.validation).toHaveBeenCalledWith('Invalid payment method');
    });

    it('should require authentication', async () => {
      mockRequireAuth.mockResolvedValue({
        success: false,
        error: { type: 'auth', message: 'Authentication required' },
      });

      const result = await addPaymentMethod(validPaymentMethod);

      expect(result.success).toBe(false);
      expect(mockErrorFactory.authRequired).toHaveBeenCalled();
    });
  });

  describe('removePaymentMethod', () => {
    const paymentMethodId = 'pm-test-123';

    it('should remove payment method successfully', async () => {
      // Mock different payment method ID so it's not the default
      mockGetBillingInfo.mockResolvedValue({
        success: true,
        data: {
          ...mockBillingInfo,
          paymentMethod: { ...mockBillingInfo.paymentMethod, id: 'pm-different-id' },
        },
      });

      const result = await removePaymentMethod(paymentMethodId);

      expect(result.success).toBe(true);
      expect(result.data?.removed).toBe(true);
    });

    it('should prevent removing default payment method', async () => {
      // Mock same payment method ID as default
      mockGetBillingInfo.mockResolvedValue({
        success: true,
        data: {
          ...mockBillingInfo,
          paymentMethod: { ...mockBillingInfo.paymentMethod, id: paymentMethodId },
        },
      });

      await removePaymentMethod(paymentMethodId);

      expect(mockErrorFactory.validation).toHaveBeenCalledWith(
        'Cannot remove default payment method. Please add another payment method first.'
      );
    });

    it('should validate payment method ID', async () => {
      mockValidatePaymentMethodId.mockReturnValue('Invalid ID format');

      await removePaymentMethod('invalid-id');

      expect(mockValidatePaymentMethodId).toHaveBeenCalledWith('invalid-id');
      expect(mockErrorFactory.validation).toHaveBeenCalledWith('Invalid ID format', 'paymentMethodId');
    });

    it('should handle billing info fetch failure', async () => {
      mockGetBillingInfo.mockResolvedValue({
        success: false,
        error: { type: 'server', message: 'Database error' },
      });

      await removePaymentMethod(paymentMethodId);

      expect(mockErrorFactory.internal).toHaveBeenCalledWith('Failed to verify billing information');
    });
  });

  describe('setDefaultPaymentMethod', () => {
    const paymentMethodId = 'pm-test-123';

    it('should set default payment method successfully', async () => {
      const result = await setDefaultPaymentMethod(paymentMethodId);

      expect(result.success).toBe(true);
      expect(result.data?.updated).toBe(true);
    });

    it('should validate payment method ID', async () => {
      mockValidatePaymentMethodId.mockReturnValue('Invalid ID format');

      await setDefaultPaymentMethod('invalid-id');

      expect(mockValidatePaymentMethodId).toHaveBeenCalledWith('invalid-id');
      expect(mockErrorFactory.validation).toHaveBeenCalledWith('Invalid ID format', 'paymentMethodId');
    });

    it('should require authentication', async () => {
      mockRequireAuth.mockResolvedValue({
        success: false,
        error: { type: 'auth', message: 'Authentication required' },
      });

      const result = await setDefaultPaymentMethod(paymentMethodId);

      expect(result.success).toBe(false);
      expect(mockErrorFactory.authRequired).toHaveBeenCalled();
    });
  });

  describe('getPaymentMethods', () => {
    it('should return payment methods successfully', async () => {
      const result = await getPaymentMethods();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockBillingInfo.paymentMethod]);
    });

    it('should handle billing info fetch failure', async () => {
      mockGetBillingInfo.mockResolvedValue({
        success: false,
        error: { type: 'server', message: 'Database error' },
      });

      await getPaymentMethods();

      expect(mockErrorFactory.internal).toHaveBeenCalledWith('Failed to retrieve payment methods');
    });

    it('should require authentication', async () => {
      mockRequireAuth.mockResolvedValue({
        success: false,
        error: { type: 'auth', message: 'Authentication required' },
      });

      const result = await getPaymentMethods();

      expect(result.success).toBe(false);
      expect(mockErrorFactory.authRequired).toHaveBeenCalled();
    });
  });

  describe('updatePaymentMethod', () => {
    const paymentMethodId = 'pm-test-123';
    const updates = {
      holderName: 'Jane Doe',
      expiryMonth: 6,
      expiryYear: 2026,
    };

    beforeEach(() => {
      // Mock getPaymentMethods to return existing payment method
      const mockGetPaymentMethods = jest.fn().mockResolvedValue({
        success: true,
        data: [{ ...mockBillingInfo.paymentMethod, id: paymentMethodId }],
      });

      // Replace the function in the module
      jest.mocked(paymentMethodsModule).getPaymentMethods = mockGetPaymentMethods;
    });

    it('should update payment method successfully', async () => {
      const result = await updatePaymentMethod(paymentMethodId, updates);

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        ...mockBillingInfo.paymentMethod,
        id: paymentMethodId,
        ...updates,
      });
    });

    it('should validate payment method ID', async () => {
      mockValidatePaymentMethodId.mockReturnValue('Invalid ID format');

      await updatePaymentMethod('invalid-id', updates);

      expect(mockValidatePaymentMethodId).toHaveBeenCalledWith('invalid-id');
      expect(mockErrorFactory.validation).toHaveBeenCalledWith('Invalid ID format', 'paymentMethodId');
    });

    it('should validate updates', async () => {
      mockValidatePaymentMethod.mockReturnValue('Invalid updates');

      await updatePaymentMethod(paymentMethodId, updates);

      expect(mockValidatePaymentMethod).toHaveBeenCalledWith(updates);
      expect(mockErrorFactory.validation).toHaveBeenCalledWith('Invalid updates');
    });

    it('should handle non-existent payment method', async () => {
      // Mock getPaymentMethods to return empty array
      const mockGetPaymentMethods = jest.fn().mockResolvedValue({
        success: true,
        data: [],
      });
      jest.mocked(paymentMethodsModule).getPaymentMethods = mockGetPaymentMethods;

      await updatePaymentMethod(paymentMethodId, updates);

      expect(mockErrorFactory.notFound).toHaveBeenCalledWith('Payment method');
    });
  });

  describe('verifyPaymentMethod', () => {
    const paymentMethodId = 'pm-test-123';

    it('should verify payment method successfully', async () => {
      const result = await verifyPaymentMethod(paymentMethodId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        verified: true,
        verificationAmount: 1.00,
      });
    });

    it('should validate payment method ID', async () => {
      mockValidatePaymentMethodId.mockReturnValue('Invalid ID format');

      await verifyPaymentMethod('invalid-id');

      expect(mockValidatePaymentMethodId).toHaveBeenCalledWith('invalid-id');
      expect(mockErrorFactory.validation).toHaveBeenCalledWith('Invalid ID format', 'paymentMethodId');
    });

    it('should require authentication', async () => {
      mockRequireAuth.mockResolvedValue({
        success: false,
        error: { type: 'auth', message: 'Authentication required' },
      });

      const result = await verifyPaymentMethod(paymentMethodId);

      expect(result.success).toBe(false);
      expect(mockErrorFactory.authRequired).toHaveBeenCalled();
    });
  });
});
