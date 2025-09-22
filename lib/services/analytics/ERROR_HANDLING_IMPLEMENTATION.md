# Error Handling Implementation - Task 9.1

## Overview

This document describes the implementation of domain-specific error handling for the analytics services, addressing the requirements for graceful degradation, fallback mechanisms, and retry logic.

## Implemented Features

### 1. Graceful Degradation When Individual Domains Fail

**Implementation**: Enhanced cross-domain operation handling in `AnalyticsService.ts`

- **Domain Isolation**: When one analytics domain fails, other domains continue to function normally
- **Partial Failure Support**: Operations can succeed partially, returning data from working domains
- **Health Status Tracking**: Each domain's health is monitored and tracked independently
- **Error Isolation**: Failures in one domain don't cascade to other domains

**Key Methods**:

- `executeCrossDomainOperation()` - Handles parallel domain operations with individual error handling
- `testDomainIsolation()` - Tests that domain failures are properly isolated
- `updateDomainHealth()` - Tracks health status per domain

**Example**:

```typescript
// If campaigns domain fails, other domains still work
const result = await analyticsService.executeCrossDomainOperation(
  "getOverviewMetrics",
  {
    campaigns: () => campaignService.getMetrics(),
    domains: () => domainService.getMetrics(),
    mailboxes: () => mailboxService.getMetrics(),
  },
  true // Allow partial failure
);

// Result will contain data from working domains and errors from failed ones
console.log(result.partialFailure); // true if some domains failed
console.log(result.data.domains); // Still available even if campaigns failed
```

### 2. Fallback to Cached Data When Services Are Unavailable

**Implementation**: Enhanced `executeWithCache()` method in `BaseAnalyticsService.ts`

- **Automatic Fallback**: When services are unavailable, automatically falls back to cached data
- **Cache Key Variations**: Tries multiple cache key patterns to find relevant cached data
- **Service Availability Detection**: Detects network errors and service unavailability
- **Graceful Warning**: Logs warnings when using cached data as fallback

**Key Methods**:

- `executeWithCache()` - Enhanced with fallback logic
- `tryGetCachedDataForDomain()` - Attempts to retrieve cached data with multiple strategies
- `testCachedDataFallback()` - Tests fallback mechanisms

**Example**:

```typescript
// Service automatically falls back to cache when Convex is unavailable
try {
  const result = await service.executeWithCache(
    "performance",
    ["campaign123"],
    filters,
    () => convex.query(api.campaigns.getPerformance, { ... }),
    CACHE_TTL.RECENT
  );
  // Returns cached data if service is unavailable
} catch (error) {
  // Only throws if no cached data is available
}
```

### 3. Retry Logic with Exponential Backoff

**Implementation**: Enhanced retry logic in `BaseAnalyticsService.ts`

- **Exponential Backoff**: Delays increase exponentially between retry attempts
- **Configurable Retry Policy**: Customizable max retries, base delay, and backoff multiplier
- **Smart Error Classification**: Only retries errors that are likely to be transient
- **Retry Limits**: Respects maximum retry attempts to prevent infinite loops

**Configuration**:

```typescript
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
};
```

**Retryable Error Types**:

- Network errors (ECONNREFUSED, ETIMEDOUT, etc.)
- Service unavailable (HTTP 5xx)
- Rate limiting (HTTP 429)
- Convex service errors
- Timeout errors

**Non-Retryable Error Types**:

- Authentication errors (HTTP 401, 403)
- Data not found (HTTP 404)
- Validation errors

### 4. Enhanced Error Normalization

**Implementation**: Improved `normalizeError()` method in `BaseAnalyticsService.ts`

- **Comprehensive Error Classification**: Handles various error types from different sources
- **Convex-Specific Errors**: Special handling for Convex service errors
- **Cache Error Handling**: Separate handling for Redis/cache errors
- **Retry Decision Logic**: Automatically determines if errors should be retried

**Error Types Handled**:

- Network errors (connection refused, timeout, reset)
- HTTP status codes (4xx, 5xx)
- Convex service errors
- Redis/cache errors
- Generic application errors

### 5. Health Monitoring and Status Tracking

**Implementation**: Health monitoring system in `AnalyticsService.ts`

- **Per-Domain Health Status**: Tracks health status for each analytics domain
- **Error Count Tracking**: Monitors error frequency per domain
- **Last Error Tracking**: Records the most recent error for each domain
- **Detailed Health Checks**: Provides comprehensive health status information

**Key Methods**:

- `getDomainHealthStatus()` - Returns current health status for all domains
- `getDetailedHealthCheck()` - Comprehensive health check with cache status
- `resetHealthStatus()` - Resets health status (useful for testing)

## Testing Infrastructure

### Error Handling Test Utilities

**File**: `ErrorHandlingTestUtils.ts`

Comprehensive testing utilities for validating error handling behavior:

- **Graceful Degradation Tests**: Verify domain isolation works correctly
- **Cached Data Fallback Tests**: Test fallback mechanisms
- **Retry Logic Tests**: Validate retry behavior for different error types
- **Comprehensive Test Suite**: Run all error handling tests together

### Test Scripts

1. **Simple Error Handling Test** (`scripts/test-error-handling-simple.ts`):
   - Tests error normalization
   - Tests retry logic
   - Tests filter validation
   - No external dependencies required

2. **Comprehensive Error Handling Test** (`scripts/test-error-handling.ts`):
   - Tests full analytics service integration
   - Tests domain isolation
   - Tests cached data fallback
   - Requires Redis and Convex configuration

## Usage Examples

### Testing Domain Isolation

```typescript
import { analyticsService } from "@/lib/services/analytics";

// Test that campaigns domain failure doesn't affect other domains
const isolationResult = await analyticsService.testDomainIsolation(
  "campaigns",
  true
);

console.log({
  targetDomainFailed: isolationResult.targetDomainFailed, // true
  otherDomainsWorking: isolationResult.otherDomainsWorking, // true
  isolationSuccessful: isolationResult.isolationSuccessful, // true
});
```

### Testing Cached Data Fallback

```typescript
// Test fallback to cached data when service is unavailable
const fallbackResult =
  await analyticsService.testCachedDataFallback("campaigns");

console.log({
  cacheAvailable: fallbackResult.cacheAvailable,
  fallbackSuccessful: fallbackResult.fallbackSuccessful,
  dataRetrieved: fallbackResult.dataRetrieved,
});
```

### Running Comprehensive Tests

```typescript
import { createErrorHandlingTestUtils } from "@/lib/services/analytics";

const testUtils = createErrorHandlingTestUtils(analyticsService);
const results = await testUtils.runComprehensiveTests();

console.log(`Overall Success: ${results.overallSuccess}`);
console.log(
  `Tests Passed: ${results.summary.passed}/${results.summary.totalTests}`
);
```

## Configuration

### Environment Variables

- `UPSTASH_REDIS_REST_URL` - Redis URL for caching (optional, graceful degradation if not set)
- `UPSTASH_REDIS_REST_TOKEN` - Redis token for caching (optional)
- `CONVEX_URL` - Convex deployment URL (required for full functionality)

### Retry Configuration

Customize retry behavior by modifying `DEFAULT_RETRY_CONFIG` in `BaseAnalyticsService.ts`:

```typescript
const customRetryConfig = {
  maxRetries: 5, // More retry attempts
  baseDelay: 500, // Shorter initial delay
  maxDelay: 30000, // Longer maximum delay
  backoffMultiplier: 1.5, // Gentler backoff
};
```

## Monitoring and Observability

### Health Status Monitoring

```typescript
// Get current health status for all domains
const healthStatus = analyticsService.getDomainHealthStatus();

Object.entries(healthStatus).forEach(([domain, status]) => {
  console.log(`${domain}: ${status.isHealthy ? "Healthy" : "Unhealthy"}`);
  console.log(`  Error Count: ${status.errorCount}`);
  console.log(`  Last Error: ${status.lastError || "None"}`);
});
```

### Detailed Health Check

```typescript
// Get comprehensive health information
const health = await analyticsService.getDetailedHealthCheck();

console.log(`Overall Status: ${health.status}`); // healthy, degraded, or unhealthy
console.log(`Cache Available: ${health.cache}`);
console.log(`Services Status:`, health.services);
```

## Error Handling Best Practices

1. **Always Use Service Methods**: Use the analytics service methods rather than direct Convex calls to benefit from error handling
2. **Handle Partial Failures**: Check for `partialFailure` in cross-domain operations
3. **Monitor Health Status**: Regularly check domain health status in production
4. **Configure Appropriate TTLs**: Set cache TTLs based on data freshness requirements
5. **Test Error Scenarios**: Use the provided test utilities to validate error handling behavior

## Compliance with Requirements

This implementation addresses all requirements from **Requirement 8: Error Handling and Resilience**:

✅ **8.1**: When one analytics domain fails, other domains continue to function  
✅ **8.2**: When analytics data is unavailable, the system shows appropriate fallback messages  
✅ **8.3**: When network errors occur, the system retries failed requests with exponential backoff  
✅ **8.4**: When analytics services are down, the system uses cached data when available  
✅ **8.5**: If all analytics fail, the system shows meaningful error messages with retry options

The implementation provides robust error handling that ensures the analytics system remains functional even when individual components fail, meeting the requirements for graceful degradation and resilience.
