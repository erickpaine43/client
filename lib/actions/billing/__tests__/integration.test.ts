/**
 * Integration tests for billing module
 */

import { getBillingInfo, updateBillingInfo, getSubscriptionPlans } from '../index';
import { addPaymentMethod, getPaymentMethods } from '../payment-methods';
import { getUsageMetrics } from '../usage';
import { getBillingHistory } from '../invoices';
import { applyPromoCode } from '../subscriptions';
import { requireAuth, withContextualRateLimit } from '../../core/auth';

// Mock the auth utilities
jest.mock('../../core/auth', () => ({
  requireAuth: jest.fn().mockResolvedValue({
    success: true,
    data: { userId: 'test-user-id', companyId: 'test-company-id' },
  }),
  withContextualRateLimit: jest.fn((action, type, config, fn) => fn()),
  RateLimits: {
    GENERAL_READ: { limit: 100, windowMs: 60000 },
    BILLING_UPDATE: { limit: 5, windowMs: 60000 },
    PAYMENT_METHOD_ADD: { limit: 10, windowMs: 3600000 },
    ANALYTICS_QUERY: { limit: 200, windowMs: 60000 },
    ANALYTICS_EXPORT: { limit: 10, windowMs: 3600000 },
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
  validatePaymentMethod: jest.fn(() => null),
  validatePromoCode: jest.fn(() => null),
  validatePagination: jest.fn(() => null),
}));

describe('Billing Module Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle complete billing workflow', async () => {
    // 1. Get billing info
    const billingResult = await getBillingInfo();
    expect(billingResult.success).toBe(true);
    expect(billingResult.data).toBeDefined();

    // 2. Get subscription plans
    const plansResult = await getSubscriptionPlans();
    expect(plansResult.success).toBe(true);
    expect(plansResult.data?.length).toBeGreaterThan(0);

    // 3. Get usage metrics
    const usageResult = await getUsageMetrics();
    expect(usageResult.success).toBe(true);
    expect(usageResult.data).toBeDefined();

    // 4. Get billing history
    const historyResult = await getBillingHistory();
    expect(historyResult.success).toBe(true);
    expect(Array.isArray(historyResult.data)).toBe(true);

    // 5. Get payment methods
    const paymentMethodsResult = await getPaymentMethods();
    expect(paymentMethodsResult.success).toBe(true);
    expect(Array.isArray(paymentMethodsResult.data)).toBe(true);
  });

  it('should handle payment method operations', async () => {
    const newPaymentMethod = {
      type: 'visa' as const,
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      holderName: 'John Doe',
      isDefault: false,
    };

    // Add payment method
    const addResult = await addPaymentMethod(newPaymentMethod);
    expect(addResult.success).toBe(true);
    expect(addResult.data?.id).toBeDefined();
  });

  it('should handle billing updates', async () => {
    const updates = {
      billingAddress: {
        street: '456 New Street',
        city: 'New City',
        state: 'NY',
        zipCode: '10001',
        country: 'United States',
      },
    };

    const updateResult = await updateBillingInfo(updates);
    expect(updateResult.success).toBe(true);
    expect(updateResult.data?.billingAddress).toMatchObject(updates.billingAddress);
  });

  it('should handle promo code application', async () => {
    const promoResult = await applyPromoCode('WELCOME20');
    expect(promoResult.success).toBe(true);
    expect(promoResult.data?.discount).toBeDefined();
  });

  it('should maintain consistent error handling across modules', async () => {
    const mockRequireAuth = jest.mocked(requireAuth);

    // Mock authentication failure for all subsequent calls
    mockRequireAuth.mockResolvedValue({
      success: false,
      error: { type: 'auth', message: 'Authentication required' },
    });

    const billingResult = await getBillingInfo();
    const usageResult = await getUsageMetrics();
    const historyResult = await getBillingHistory();

    // All should fail with auth error
    expect(billingResult.success).toBe(false);
    expect(usageResult.success).toBe(false);
    expect(historyResult.success).toBe(false);
  });

  it('should handle rate limiting consistently', async () => {
    const mockWithContextualRateLimit = jest.mocked(withContextualRateLimit);

    // Mock rate limit exceeded
    mockWithContextualRateLimit.mockImplementation((_action, _type, _config, _fn) => {
      return Promise.resolve({
        success: false,
        error: { type: 'rate_limit', message: 'Rate limit exceeded' },
      });
    });

    const billingResult = await getBillingInfo();
    expect(billingResult.success).toBe(false);
  });
});
