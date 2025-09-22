/**
 * Tests for billing validation functions
 */

import {
  validatePaymentMethod,
  validateBillingAddress,
  validateSubscriptionChange,
  validatePromoCode,
  validateStorageAmount,
  validatePagination,
  validateInvoiceId,
  validatePaymentMethodId,
  validateCurrency,
  validateBillingCycle,
  validateTaxRate,
  validateBillingInfo,
} from '../validation';
import { subscriptionPlans, mockUsageMetrics, type PaymentMethod } from '../../../data/billing.mock';

describe('Billing Validation', () => {
  describe('validatePaymentMethod', () => {
    it('should validate valid credit card', () => {
      const paymentMethod = {
        type: 'visa' as const,
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2025,
        holderName: 'John Doe',
      };

      const result = validatePaymentMethod(paymentMethod);
      expect(result).toBeNull();
    });

    it('should reject missing type', () => {
      const paymentMethod = {
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2025,
        holderName: 'John Doe',
      };

      const result = validatePaymentMethod(paymentMethod);
      expect(result).toBe('Payment method type is required');
    });

    it('should reject invalid type', () => {
      const paymentMethod = {
        type: 'invalid' as unknown as PaymentMethod['type'],
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2025,
        holderName: 'John Doe',
      };

      const result = validatePaymentMethod(paymentMethod);
      expect(result).toBe('Invalid payment method type');
    });

    it('should reject invalid last4', () => {
      const paymentMethod = {
        type: 'visa' as const,
        last4: '42',
        expiryMonth: 12,
        expiryYear: 2025,
        holderName: 'John Doe',
      };

      const result = validatePaymentMethod(paymentMethod);
      expect(result).toBe('Invalid card last 4 digits');
    });

    it('should reject expired card', () => {
      const paymentMethod = {
        type: 'visa' as const,
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2020,
        holderName: 'John Doe',
      };

      const result = validatePaymentMethod(paymentMethod);
      expect(result).toBe('Card has expired');
    });

    it('should reject invalid expiry month', () => {
      const paymentMethod = {
        type: 'visa' as const,
        last4: '4242',
        expiryMonth: 13,
        expiryYear: 2025,
        holderName: 'John Doe',
      };

      const result = validatePaymentMethod(paymentMethod);
      expect(result).toBe('Invalid expiry month');
    });

    it('should reject missing cardholder name', () => {
      const paymentMethod = {
        type: 'visa' as const,
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2025,
        holderName: '',
      };

      const result = validatePaymentMethod(paymentMethod);
      expect(result).toBe('Cardholder name is required');
    });

    it('should validate PayPal payment method', () => {
      const paymentMethod = {
        type: 'paypal' as const,
        holderName: 'John Doe',
      };

      const result = validatePaymentMethod(paymentMethod);
      expect(result).toBeNull();
    });
  });

  describe('validateBillingAddress', () => {
    it('should validate complete address', () => {
      const address = {
        street: '123 Main Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'United States',
      };

      const result = validateBillingAddress(address);
      expect(result).toBeNull();
    });

    it('should reject short street address', () => {
      const address = {
        street: '123',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'United States',
      };

      const result = validateBillingAddress(address);
      expect(result).toBe('Street address must be at least 5 characters');
    });

    it('should reject short city name', () => {
      const address = {
        street: '123 Main Street',
        city: 'A',
        state: 'CA',
        zipCode: '94105',
        country: 'United States',
      };

      const result = validateBillingAddress(address);
      expect(result).toBe('City must be at least 2 characters');
    });

    it('should reject invalid zip code', () => {
      const address = {
        street: '123 Main Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '!@#$%',
        country: 'United States',
      };

      const result = validateBillingAddress(address);
      expect(result).toBe('Invalid postal/zip code format');
    });

    it('should reject missing country', () => {
      const address = {
        street: '123 Main Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'A', // Too short country name
      };

      const result = validateBillingAddress(address);
      expect(result).toBe('Country is required');
    });
  });

  describe('validateSubscriptionChange', () => {
    it('should allow upgrade', () => {
      const currentPlan = subscriptionPlans[0]; // Starter
      const newPlanId = subscriptionPlans[1].id; // Growth

      const result = validateSubscriptionChange(currentPlan, newPlanId, mockUsageMetrics);
      expect(result).toBeNull();
    });

    it('should reject invalid plan ID', () => {
      const currentPlan = subscriptionPlans[0];
      const newPlanId = 'invalid-plan';

      const result = validateSubscriptionChange(currentPlan, newPlanId, mockUsageMetrics);
      expect(result).toBe('Invalid subscription plan');
    });

    it('should reject downgrade with too many email accounts', () => {
      const currentPlan = subscriptionPlans[2]; // Professional (15 accounts)
      const newPlanId = subscriptionPlans[1].id; // Growth (5 accounts)
      const usage = { ...mockUsageMetrics, emailAccountsActive: 10 };

      const result = validateSubscriptionChange(currentPlan, newPlanId, usage);
      expect(result).toContain('Cannot downgrade: You have 10 email accounts');
    });

    it('should reject downgrade with too many campaigns', () => {
      const currentPlan = subscriptionPlans[2]; // Professional (unlimited)
      const newPlanId = subscriptionPlans[1].id; // Growth (20 campaigns)
      const usage = { ...mockUsageMetrics, campaignsActive: 25 };

      const result = validateSubscriptionChange(currentPlan, newPlanId, usage);
      expect(result).toContain('Cannot downgrade: You have 25 active campaigns');
    });
  });

  describe('validatePromoCode', () => {
    it('should validate valid promo code', () => {
      const result = validatePromoCode('WELCOME20');
      expect(result).toBeNull();
    });

    it('should reject empty promo code', () => {
      const result = validatePromoCode('');
      expect(result).toBe('Invalid promo code format');
    });

    it('should reject promo code with special characters', () => {
      const result = validatePromoCode('WELCOME@20');
      expect(result).toBe('Invalid promo code format');
    });

    it('should reject too short promo code', () => {
      const result = validatePromoCode('ABC');
      expect(result).toBe('Invalid promo code format');
    });

    it('should reject too long promo code', () => {
      const result = validatePromoCode('A'.repeat(21));
      expect(result).toBe('Invalid promo code format');
    });
  });

  describe('validateStorageAmount', () => {
    it('should validate valid storage amount', () => {
      const result = validateStorageAmount(5);
      expect(result).toBeNull();
    });

    it('should reject zero storage', () => {
      const result = validateStorageAmount(0);
      expect(result).toBe('Storage amount must be between 1 and 100 GB');
    });

    it('should reject negative storage', () => {
      const result = validateStorageAmount(-5);
      expect(result).toBe('Storage amount must be between 1 and 100 GB');
    });

    it('should reject too much storage', () => {
      const result = validateStorageAmount(150);
      expect(result).toBe('Storage amount must be between 1 and 100 GB');
    });
  });

  describe('validatePagination', () => {
    it('should validate valid pagination', () => {
      const result = validatePagination(10, 0);
      expect(result).toBeNull();
    });

    it('should reject invalid limit', () => {
      const result = validatePagination(0, 0);
      expect(result).toBe('Limit must be between 1 and 100');
    });

    it('should reject too high limit', () => {
      const result = validatePagination(150, 0);
      expect(result).toBe('Limit must be between 1 and 100');
    });

    it('should reject negative offset', () => {
      const result = validatePagination(10, -5);
      expect(result).toBe('Offset must be non-negative');
    });
  });

  describe('validateInvoiceId', () => {
    it('should validate valid invoice ID', () => {
      const result = validateInvoiceId('inv-001');
      expect(result).toBeNull();
    });

    it('should reject empty invoice ID', () => {
      const result = validateInvoiceId('');
      expect(result).toBe('Invoice ID is required');
    });

    it('should reject invalid format', () => {
      const result = validateInvoiceId('invalid-format');
      expect(result).toBe('Invalid invoice ID format');
    });
  });

  describe('validatePaymentMethodId', () => {
    it('should validate valid payment method ID', () => {
      const result = validatePaymentMethodId('pm-123');
      expect(result).toBeNull();
    });

    it('should reject empty payment method ID', () => {
      const result = validatePaymentMethodId('');
      expect(result).toBe('Payment method ID is required');
    });

    it('should reject invalid format', () => {
      const result = validatePaymentMethodId('invalid-format');
      expect(result).toBe('Invalid payment method ID format');
    });
  });

  describe('validateCurrency', () => {
    it('should validate supported currency', () => {
      const result = validateCurrency('USD');
      expect(result).toBeNull();
    });

    it('should validate lowercase currency', () => {
      const result = validateCurrency('eur');
      expect(result).toBeNull();
    });

    it('should reject unsupported currency', () => {
      const result = validateCurrency('JPY');
      expect(result).toContain('Invalid currency');
    });

    it('should reject empty currency', () => {
      const result = validateCurrency('');
      expect(result).toContain('Invalid currency');
    });
  });

  describe('validateBillingCycle', () => {
    it('should validate monthly cycle', () => {
      const result = validateBillingCycle('monthly');
      expect(result).toBeNull();
    });

    it('should validate yearly cycle', () => {
      const result = validateBillingCycle('yearly');
      expect(result).toBeNull();
    });

    it('should reject invalid cycle', () => {
      const result = validateBillingCycle('weekly');
      expect(result).toContain('Invalid billing cycle');
    });
  });

  describe('validateTaxRate', () => {
    it('should validate valid tax rate', () => {
      const result = validateTaxRate(8.75);
      expect(result).toBeNull();
    });

    it('should validate zero tax rate', () => {
      const result = validateTaxRate(0);
      expect(result).toBeNull();
    });

    it('should reject negative tax rate', () => {
      const result = validateTaxRate(-5);
      expect(result).toBe('Tax rate must be between 0 and 100 percent');
    });

    it('should reject tax rate over 100%', () => {
      const result = validateTaxRate(150);
      expect(result).toBe('Tax rate must be between 0 and 100 percent');
    });
  });

  describe('validateBillingInfo', () => {
    it('should validate complete billing info', () => {
      const billingInfo = {
        paymentMethod: {
          type: 'visa' as const,
          last4: '4242',
          expiryMonth: 12,
          expiryYear: 2025,
          holderName: 'John Doe',
        },
        billingAddress: {
          street: '123 Main Street',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          country: 'United States',
        },
        currency: 'USD',
        billingCycle: 'monthly',
        taxRate: 8.75,
      };

      const result = validateBillingInfo(billingInfo);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should collect multiple validation errors', () => {
      const billingInfo = {
        paymentMethod: {
          type: 'invalid' as unknown as PaymentMethod['type'],
          last4: '42',
          holderName: '',
        },
        billingAddress: {
          street: '123',
          city: 'A',
        },
        currency: 'INVALID',
        billingCycle: 'weekly',
        taxRate: -5,
      };

      const result = validateBillingInfo(billingInfo);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate partial billing info', () => {
      const billingInfo = {
        currency: 'EUR',
      };

      const result = validateBillingInfo(billingInfo);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
