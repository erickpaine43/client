# Billing Module Troubleshooting Guide

## Overview

This guide provides comprehensive troubleshooting information for the billing module, including common issues, error patterns, diagnostic procedures, and resolution strategies.

## Common Issues and Solutions

### Authentication and Authorization Issues

#### Issue: "Authentication required" errors

**Symptoms:**

- Functions return `ErrorFactory.authRequired()`
- Users can't access billing information
- All billing operations fail with auth errors

**Diagnosis:**

```typescript
// Check authentication flow
console.log("Auth check:", await requireAuthUser());
console.log("User ID:", await getCurrentUserId());
```

**Solutions:**

1. **Verify user session**: Ensure user is properly logged in
2. **Check token validity**: Verify JWT tokens haven't expired
3. **Review auth middleware**: Ensure `requireAuthUser()` is working correctly
4. **Database connection**: Verify user exists in database

**Prevention:**

- Implement proper session management
- Add token refresh mechanisms
- Monitor authentication failure rates

#### Issue: Cross-tenant data access

**Symptoms:**

- Users see billing data from other companies
- Company isolation not working
- Data leakage between tenants

**Diagnosis:**

```typescript
// Check company context
console.log("Company ID:", context.companyId);
console.log("User Company:", await getUserCompany(userId));
```

**Solutions:**

1. **Verify company context**: Ensure `companyId` is properly set
2. **Check database queries**: Add company filters to all queries
3. **Review middleware**: Ensure company isolation is enforced
4. **Audit data access**: Review recent data access patterns

**Prevention:**

- Always include company filters in database queries
- Implement automated testing for tenant isolation
- Regular security audits

### Rate Limiting Issues

#### Issue: "Too many requests" errors

**Symptoms:**

- Users hit rate limits frequently
- Legitimate requests are blocked
- Rate limiting is too aggressive

**Diagnosis:**

```typescript
// Check rate limit status
const rateLimitKey = `billing_${userId}`;
const remaining = await rateLimiter.getRemainingTime(rateLimitKey);
console.log("Rate limit remaining time:", remaining);
```

**Solutions:**

1. **Adjust rate limits**: Increase limits for legitimate use cases
2. **Implement user feedback**: Show remaining requests to users
3. **Add retry logic**: Implement exponential backoff
4. **Review usage patterns**: Analyze if limits are appropriate

**Rate Limit Configuration:**

```typescript
// Adjust these values based on usage patterns
const BILLING_RATE_LIMITS = {
  GET_BILLING_INFO: { limit: 20, windowMs: 60000 }, // Increased from 10
  UPDATE_BILLING: { limit: 10, windowMs: 300000 }, // Increased from 5
  ADD_PAYMENT_METHOD: { limit: 10, windowMs: 300000 }, // Increased from 5
};
```

#### Issue: Rate limiting not working

**Symptoms:**

- Users can make unlimited requests
- No rate limiting enforcement
- System vulnerable to abuse

**Diagnosis:**

```typescript
// Test rate limiting
for (let i = 0; i < 15; i++) {
  const result = await getBillingInfo();
  consoest ${i}:`, result.success);
}
```

**Solutions:**

1. **Check rate limiter initialization**: Ensure `RateLimiter` is properly instantiated
2. **Verify key generation**: Ensure rate limit keys are unique per user
3. **Review middleware**: Ensure rate limiting is applied to all functions
4. **Test configuration**: Verify rate limits are configured correctly

### Payment Processing Issues

#### Issue: Stripe payment failures

**Symptoms:**

- Payment methods can't be added
- Subscription changes fail
- Stripe errors in logs

**Common Stripe Errors:**

```typescript
// Card declined
{
  type: 'StripeCardError',
  code: 'card_declined',
  message: 'Your card was declined.'
}

// Invalid card number
{
  type: 'StripeCardError',
  code: 'invalid_number',
  message: 'Your card number is invalid.'
}

// Expired card
{
  type: 'StripeCardError',
  code: 'expired_card',
  message: 'Your card has expired.'
}
```

**Diagnosis:**

```typescript
// Test Stripe connection
try {
  const testCharge = await stripe.paymentIntents.create({
    amount: 100,
    currency: "usd",
    payment_method: "pm_card_visa",
  });
  console.log("Stripe connection OK:", testCharge.id);
} catch (error) {
  console.error("Stripe error:", error);
}
```

**Solutions:**

1. **Check API keys**: Verify Stripe keys are correct and not expired
2. **Test with test cards**: Use Stripe test cards for debugging
3. **Review error handling**: Ensure propeerror messages are shown
4. **Check webhook configuration**: Verify webhooks are properly configured

**Test Cards for Debugging:**

```typescript
const TEST_CARDS = {
  SUCCESS: "4242424242424242",
  DECLINED: "4000000000000002",
  INSUFFICIENT_FUNDS: "4000000000009995",
  EXPIRED: "4000000000000069",
};
```

#### Issue: Subscription changes not processing

**Symptoms:**

- Plan upgrades/downgrades fail
- Billing not updated after changes
- Inconsistent subscription state

**Diagnosis:**

```typescript
// Check subscription state
const subscription = await getCurrentSubscription(userId);
console.log("Current subscription:", subscription);

const billingInfo = await getBillingInfo();
console.log("Billing info plan:", billingInfo.data?.currentPlan);
```

**Solutions:**

1. **Verify plan exists**: Ensure target plan is valid and active
2. **Check proration logic**: Verify proration calculations are correct
3. **Review transaction handling**: Ensure database transactions are atomic
4. **Test with webhooks**: Verify Stripe webhooks update subscription state

### Database and Performance Issues

#### Issue: Slow billing queries

**Symptoms:**

- Billing operations take >5 seconds
- Database timeouts
- Poor user experience

**Diagnosis:**

```typescript
// Add timing to queries
const startTime = Date.now();
const result = await getBillingInfo();
const duration = Date.now() - startTime;
console.log(`Query took ${duration}ms`);
```

**Solutions:**

1. **Add database indexes**: Ensure proper indexing on user_id, company_id
2. **Optimize queries**: Review and optimize slow queries
3. **Implement caching**: Cache frequently accessed billing data
4. **Connection pooling**: Ensure proper database connection management

**Recommended Indexes:**

```sql
-- Essential indexes for billing queries
CREATE INDEX idx_billing_info_user_id ON billing_info(user_id);
CREATE INDEX idx_billing_info_company_id ON billing_info(company_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
```

#### Issue: Memory leaks in billing operations

**Symptoms:**

- Increasing memory usage over time
- Application crashes with out-of-memory errors
- Performance degradation

**Diagnosis:**

```typescript
// Monitor memory usage
const initialMemory = process.memoryUsage();
await performBillingOperations();
const finalMemory = process.memoryUsage();
console.log("Memory increase:", finalMemory.heapUsed - initialMemory.heapUsed);
```

**Solutions:**

1. **Review object references**: Ensure objects are properly garbage collected
2. **Close database connections**: Properly close all database connections
3. **Clear caches**: Implement cache cleanup mechanisms
4. **Monitor memory usage**: Add memory monitoring to production

### Type Safety and Compilation Issues

#### Issue: TypeScript compilation errors

**Symptoms:**

- Build failures with type errors
- `ActionResult` type mismatches
- Import/export errors

**Common Type Errors:**

```typescript
// Double-wrapping ActionResult
Type 'ActionResult<ActionResult<T>>' is not assignable to type 'ActionResult<T>'

// Missing properties
Property 'data' is missing in type but required in type 'ActionResult<T>'

// Error type mismatches
Type 'ActionError' is not assignable to type 'string'
```

**Solutions:**

1. **Standardize ActionResult**: Use single ActionResult type from core
2. **Fix double-wrapping**: Remove nested ActionResult returns
3. **Update error handling**: Use ActionError objects consistently
4. **Review imports**: Ensure correct type imports

**Type Standardization:**

```typescript
// Correct ActionResult usage
export async function getBillingInfo(): Promise<ActionResult<BillingInfo>> {
  try {
    // Function logic
    return { success: true, data: billingInfo };
  } catch (error) {
    return ErrorFactory.internal("Operation failed");
  }
}
```

#### Issue: Hook integration problems

**Symptoms:**

- `useServerAction` hook errors
- Component rendering failures
- Type mismatches in UI

**Diagnosis:**

```typescript
// Test hook integration
const { data, loading, error, execute } = useServerAction(getBillingInfo);
console.log("Hook state:", { data, loading, error });
```

**Solutions:**

1. **Update hook types**: Ensure hook expects correct ActionResult type
2. **Fix error handling**: Extract error messages properly in components
3. **Review component integration**: Ensure proper error display
4. **Test with mock data**: Verify hook works with expected data shapes

### Data Validation Issues

#### Issue: Invalid billing data accepted

**Symptoms:**

- Invalid email addresses saved
- Incomplete billing addresses
- Malformed payment data

**Diagnosis:**

```typescript
// Test validation
const invalidData = { email: "invalid-email" };
const validation = validateBillingData(invalidData);
console.log("Validation result:", validation);
```

**Solutions:**

1. **Strengthen validation**: Add comprehensive input validation
2. **Sanitize input**: Clean and normalize input data
3. **Add client-side validation**: Prevent invalid data submission
4. **Review validation rules**: Ensure rules match business requirements

**Enhanced Validation:**

```typescript
function validateBillingData(data: BillingUpdateData): ValidationResult {
  const errors: string[] = [];

  // Email validation
  if (data.email && !isValidEmail(data.email)) {
    errors.push("Invalid email address format");
  }

  // Address validation
  if (data.billingAddress) {
    if (!data.billingAddress.country) {
      errors.push("Country is required");
    }
    if (!data.billingAddress.postalCode) {
      errors.push("Postal code is required");
    }
    if (
      data.billingAddress.postalCode &&
      !isValidPostalCode(
        data.billingAddress.postalCode,
        data.billingAddress.country
      )
    ) {
      errors.push("Invalid postal code for country");
    }
  }

  return { valid: errors.length === 0, errors };
}
```

## Error Patterns and Diagnostics

### Error Classification

#### Critical Errors (Immediate attention required)

- Payment processing failures
- Data corruption or loss
- Security breaches
- System-wide outages

#### High Priority Errors (Fix within 24 hours)

- Authentication failures
- Rate limiting issues
- Performance degradation
- Type safety violations

#### Medium Priority Errors (Fix within week)

- Validation issues
- Minor UI problems
- Non-critical feature failures
- Documentation gaps

#### Low Priority Errors (Fix when convenient)

- Cosmetic issues
- Performance optimizations
- Code quality improvements
- Enhancement requests

### Diagnostic Procedures

#### Step 1: Error Identification

```typescript
// Log error details
console.error("Billing error:", {
  function: "getBillingInfo",
  userId,
  error: error.message,
  stack: error.stack,
  timestamp: new Date().toISOString(),
});
```

#### Step 2: Context Gathering

```typescript
// Gather context information
const context = {
  userId: await getCurrentUserId(),
  companyId: await getCompanyId(),
  userAgent: request.headers["user-agent"],
  ipAddress: request.ip,
  timestamp: new Date().toISOString(),
};
```

#### Step 3: Reproduction

```typescript
// Create reproduction test
describe("Bug reproduction", () => {
  it("should reproduce the billing error", async () => {
    // Set up exact conditions that caused the error
    const result = await getBillingInfo();
    // Verify error occurs
  });
});
```

#### Step 4: Root Cause Analysis

1. **Review logs**: Check application and database logs
2. **Analyze code**: Review recent changes and related code
3. **Check dependencies**: Verify third-party service status
4. **Test isolation**: Isolate the problem to specific components

#### Step 5: Solution Implementation

1. **Fix the issue**: Implement the appropriate solution
2. **Add tests**: Create tests to prevent regression
3. **Update documentation**: Document the fix and prevention
4. **Monitor**: Watch for similar issues

## Monitoring and Alerting

### Key Metrics to Monitor

#### Performance Metrics

- Response time for billing operations
- Database query execution time
- Memory usage patterns
- Error rates by function

#### Business Metrics

- Payment success/failure rates
- Subscription change completion rates
- User billing activity patterns
- Revenue impact of errors

#### Security Metrics

- Authentication failure rates
- Rate limiting effectiveness
- Suspicious activity patterns
- Data access audit trails

### Alerting Configuration

```typescript
// Example alerting thresholds
const ALERT_THRESHOLDS = {
  RESPONSE_TIME: 5000, // 5 seconds
  ERROR_RATE: 0.05, // 5% error rate
  PAYMENT_FAILURE_RATE: 0.1, // 10% payment failure rate
  MEMORY_USAGE: 0.8, // 80% memory usage
};

// Alert conditions
if (responseTime > ALERT_THRESHOLDS.RESPONSE_TIME) {
  sendAlert("High response time in billing module", {
    responseTime,
    function: "getBillingInfo",
    severity: "warning",
  });
}
```

### Log Analysis

#### Structured Logging

```typescript
// Use structured logging for better analysis
logger.info("Billing operation completed", {
  operation: "updateBillingInfo",
  userId,
  duration: responseTime,
  success: true,
  metadata: { fieldsUpdated: Object.keys(updateData) },
});
```

#### Log Aggregation Queries

```sql
-- Find most common billing errors
SELECT error_message, COUNT(*) as count
FROM application_logs
WHERE module = 'billing' AND level = 'error'
GROUP BY error_message
ORDER BY count DESC;

-- Analyze response times
SELECT
  operation,
  AVG(duration) as avg_duration,
  MAX(duration) as max_duration,
  COUNT(*) as total_requests
FROM application_logs
WHERE module = 'billing'
GROUP BY operation;
```

## Prevention Strategies

### Code Quality

1. **Comprehensive testing**: Unit, integration, and end-to-end tests
2. **Type safety**: Strong TypeScript typing throughout
3. **Code reviews**: Peer review of all billing changes
4. **Static analysis**: Automated code quality checks

### Monitoring

1. **Real-time monitoring**: Monitor key metrics continuously
2. **Alerting**: Set up alerts for critical issues
3. **Log analysis**: Regular review of error patterns
4. **Performance tracking**: Monitor response times and resource usage

### Documentation

1. **Keep documentation current**: Update docs with code changes
2. **Document known issues**: Maintain list of known problems and workarounds
3. **Share knowledge**: Ensure team knowledge is documented
4. **Regular reviews**: Periodic review and update of documentation

### Testing

1. **Automated testing**: Comprehensive test suite with CI/CD
2. **Load testing**: Regular performance and load testing
3. **Security testing**: Regular security audits and penetration testing
4. **User acceptance testing**: Test with real user scenarios

This troubleshooting guide provides a comprehensive resource for diagnosing and resolving billing module issues, ensuring system reliability and user satisfaction.
