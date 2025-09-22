# Billing Actions Module

This module provides comprehensive billing operations for the application, split from the original large `billingActions.ts` file for better maintainability and organization.

## Module Structure

```
lib/actions/billing/
├── index.ts                 # Main billing operations
├── validation.ts           # Input validation functions
├── payment-methods.ts      # Payment method management
├── subscriptions.ts        # Subscription and add-on management
├── invoices.ts            # Invoice and billing history
├── usage.ts               # Usage metrics and tracking
├── __tests__/             # Comprehensive test suite
│   ├── index.test.ts
│   ├── validation.test.ts
│   ├── payment-methods.test.ts
│   └── integration.test.ts
└── README.md              # This file
```

## Core Functions

### Main Billing Operations (`index.ts`)

- `getBillingInfo()` - Get complete billing information
- `updateBillingInfo()` - Update billing details
- `getSubscriptionPlans()` - Get available subscription plans
- `updateSubscriptionPlan()` - Change subscription plan
- `cancelSubscription()` - Cancel subscription
- `reactivateSubscription()` - Reactivate cancelled subscription
- `getBillingDataForSettings()` - Get billing data for settings UI

### Payment Methods (`payment-methods.ts`)

- `addPaymentMethod()` - Add new payment method
- `removePaymentMethod()` - Remove payment method
- `setDefaultPaymentMethod()` - Set default payment method
- `getPaymentMethods()` - List all payment methods
- `updatePaymentMethod()` - Update payment method details
- `verifyPaymentMethod()` - Verify payment method with small charge

### Subscriptions (`subscriptions.ts`)

- `applyPromoCode()` - Apply promotional codes
- `addStorage()` - Add storage to account
- `removeStorage()` - Remove storage from account
- `getStorageOptions()` - Get available storage options
- `getUsagePredictions()` - Get usage predictions and recommendations
- `scheduleSubscriptionChange()` - Schedule plan changes
- `cancelScheduledSubscriptionChange()` - Cancel scheduled changes

### Invoices (`invoices.ts`)

- `getBillingHistory()` - Get invoice history with pagination
- `downloadInvoice()` - Generate invoice download URLs
- `getInvoiceDetails()` - Get detailed invoice information
- `getInvoiceSummary()` - Get billing statistics
- `markInvoiceAsPaid()` - Manual payment tracking
- `regenerateInvoice()` - Regenerate invoices
- `getInvoicesByDateRange()` - Get invoices by date range

### Usage Tracking (`usage.ts`)

- `getUsageMetrics()` - Get current usage data
- `getUsageWithCalculations()` - Get usage with percentages and projections
- `getUsageHistory()` - Historical usage data for specific metrics
- `getUsageAlerts()` - Usage warnings and alerts
- `updateUsageMetrics()` - Update usage tracking (internal)
- `getUsageComparison()` - Compare with previous periods
- `resetUsageMetrics()` - Reset usage (admin function)

### Validation (`validation.ts`)

- `validatePaymentMethod()` - Validate payment method data
- `validateBillingAddress()` - Validate billing address
- `validateSubscriptionChange()` - Validate plan changes
- `validatePromoCode()` - Validate promo code format
- `validateStorageAmount()` - Validate storage amounts
- `validatePagination()` - Validate pagination parameters
- `validateInvoiceId()` - Validate invoice ID format
- `validatePaymentMethodId()` - Validate payment method ID
- `validateCurrency()` - Validate currency codes
- `validateBillingCycle()` - Validate billing cycles
- `validateTaxRate()` - Validate tax rates
- `validateBillingInfo()` - Comprehensive billing validation

## Features

### ✅ Standardized Error Handling

- Uses core error handling utilities from `../core/errors.ts`
- Consistent error types and messages across all functions
- Proper error categorization (auth, validation, server, etc.)

### ✅ Rate Limiting

- Integrated with core rate limiting from `../core/auth.ts`
- Different limits for different operation types
- User, company, IP, and global rate limiting support

### ✅ Authentication & Authorization

- Consistent authentication patterns using `../core/auth.ts`
- Proper user context and company isolation
- Permission-based access control ready

### ✅ Input Validation

- Comprehensive validation for all input types
- Centralized validation functions for reusability
- Clear validation error messages

### ✅ Backward Compatibility

- Original `billingActions.ts` re-exports all functions
- Existing imports continue to work without changes
- Deprecation notices guide migration to new structure

## Usage Examples

### Basic Billing Operations

```typescript
import { getBillingInfo, updateBillingInfo } from "@/lib/actions/billing";

// Get billing information
const billingResult = await getBillingInfo();
if (billingResult.success) {
  console.log("Current plan:", billingResult.data.currentPlan.name);
}

// Update billing address
const updateResult = await updateBillingInfo({
  billingAddress: {
    street: "123 New Street",
    city: "San Francisco",
    state: "CA",
    zipCode: "94105",
    country: "United States",
  },
});
```

### Payment Method Management

```typescript
import {
  addPaymentMethod,
  getPaymentMethods,
} from "@/lib/actions/billing/payment-methods";

// Add new payment method
const addResult = await addPaymentMethod({
  type: "visa",
  last4: "4242",
  expiryMonth: 12,
  expiryYear: 2025,
  holderName: "John Doe",
  isDefault: false,
});

// Get all payment methods
const methodsResult = await getPaymentMethods();
```

### Usage Tracking

```typescript
import {
  getUsageWithCalculations,
  getUsageAlerts,
} from "@/lib/actions/billing/usage";

// Get usage with calculations
const usageResult = await getUsageWithCalculations();
if (usageResult.success) {
  const { usage, percentages, overage, projection } = usageResult.data;
  console.log("Email usage:", percentages.emailsSentPercentage + "%");
}

// Get usage alerts
const alertsResult = await getUsageAlerts();
if (alertsResult.success) {
  alertsResult.data.forEach((alert) => {
    console.log(`${alert.type}: ${alert.message}`);
  });
}
```

## Testing

The module includes comprehensive tests with 81+ test cases covering:

- **Unit Tests**: Individual function testing
- **Integration Tests**: Module interaction testing
- **Validation Tests**: Input validation testing
- **Error Handling Tests**: Error scenario testing

Run tests with:

```bash
npm test -- lib/actions/billing/__tests__
```

## Migration Guide

### From Original billingActions.ts

The original file is maintained for backward compatibility, but new code should use the modular structure:

```typescript
// Old (still works)
import { getBillingInfo } from "@/lib/actions/billingActions";

// New (recommended)
import { getBillingInfo } from "@/lib/actions/billing";
import { addPaymentMethod } from "@/lib/actions/billing/payment-methods";
import { getUsageMetrics } from "@/lib/actions/billing/usage";
```

### Benefits of New Structure

1. **Better Organization**: Related functions grouped together
2. **Smaller Files**: Easier to navigate and maintain
3. **Clear Separation**: Each module has a specific responsibility
4. **Enhanced Testing**: Focused test suites for each module
5. **Consistent Patterns**: Standardized error handling and validation

## Architecture Integration

This module integrates with:

- **Core Actions**: Uses standardized types, errors, and auth utilities
- **Data Layer**: Mock data with planned database integration
- **UI Components**: Provides data for billing settings and usage displays
- **Analytics**: Usage data feeds into analytics systems

## Future Enhancements

- Database integration (replacing mock data)
- Real payment processor integration (Stripe)
- Enhanced usage analytics and predictions
- Automated billing workflows
- Advanced subscription management features

## Contributing

When adding new billing functionality:

1. Choose the appropriate module based on functionality
2. Follow existing patterns for error handling and validation
3. Add comprehensive tests for new functions
4. Update this README with new functions
5. Maintain backward compatibility in the main billingActions.ts file
