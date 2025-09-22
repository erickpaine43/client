# Analytics Actions - Standardized Module

This module provides consistent, type-safe analytics actions using ConvexQueryHelper for all analytics operations. It replaces the scattered analytics actions with a unified approach that ensures consistent error handling, authentication, rate limiting, and performance monitoring.

## Features

- **Consistent Error Handling**: All actions use standardized `ActionResult<T>` return types
- **Type Safety**: Full TypeScript support with proper type definitions
- **Authentication & Authorization**: Integrated auth checking and company/tenant isolation
- **Rate Limiting**: Contextual rate limiting for different operation types
- **Performance Monitoring**: Built-in performance tracking via ConvexQueryHelper
- **Caching**: Standardized caching patterns for improved performance
- **Health Checks**: Comprehensive health monitoring for all analytics services

## Modules

### Billing Analytics (`billing-analytics.ts`)

Handles billing-related analytics including usage metrics, cost analysis, and plan utilization.

**Key Functions:**

- `getCurrentUsageMetrics()` - Get current usage metrics for a company
- `getBillingAnalytics()` - Get comprehensive billing analytics
- `getCostAnalytics()` - Get cost analysis and trends
- `getPlanUtilization()` - Get plan utilization metrics
- `exportBillingAnalytics()` - Export billing data

### Campaign Analytics (`campaign-analytics.ts`)

Provides campaign performance metrics, sequence analytics, and campaign comparisons.

**Key Functions:**

- `getCampaignPerformanceMetrics()` - Get performance metrics for specific campaigns
- `getCampaignAnalytics()` - Get analytics for all campaigns
- `getSequenceStepAnalytics()` - Get sequence step performance
- `bulkUpdateCampaignAnalytics()` - Bulk update campaign data
- `refreshCampaignAnalyticsCache()` - Refresh campaign cache

### Domain Analytics (`domain-analytics.ts`)

Handles domain health metrics, reputation scores, and domain performance analysis.

**Key Functions:**

- `getDomainHealthMetrics()` - Get domain health scores and metrics
- `getDomainAnalytics()` - Get analytics for all domains
- `getDomainPerformanceComparison()` - Compare domain performance
- `refreshDomainReputationScores()` - Refresh reputation scores
- `exportDomainAnalytics()` - Export domain data

### Lead Analytics (`lead-analytics.ts`)

Provides lead engagement analytics, conversion funnels, and segmentation analysis.

**Key Functions:**

- `getLeadListMetrics()` - Get metrics for specific leads
- `getLeadEngagementAnalytics()` - Get engagement analytics
- `getConversionFunnelData()` - Get conversion funnel analysis
- `getLeadSourceAnalytics()` - Get lead source performance
- `getSegmentationAnalytics()` - Get segmentation analysis

### Mailbox Analytics (`mailbox-analytics.ts`)

Handles mailbox performance, warmup analytics, and health scoring.

**Key Functions:**

- `getMailboxPerformanceMetrics()` - Get mailbox performance metrics
- `getWarmupAnalytics()` - Get warmup progress and analytics
- `getMailboxHealthScores()` - Get mailbox health scores
- `updateWarmupProgress()` - Update warmup progress
- `refreshMailboxHealthScores()` - Refresh health scores

### Template Analytics (`template-analytics.ts`)

Provides template performance analytics, usage tracking, and template comparisons.

**Key Functions:**

- `getTemplatePerformanceAnalytics()` - Get template performance metrics
- `getTemplateUsageAnalytics()` - Get template usage analytics
- `getTemplateComparison()` - Compare template performance
- `trackTemplateUsage()` - Track template usage
- `getTemplateAnalyticsByCategory()` - Get analytics by category

### Cross-Domain Analytics (`cross-domain-analytics.ts`)

Handles cross-domain analysis, correlations, and trend analysis.

**Key Functions:**

- `getCrossDomainPerformanceComparison()` - Compare performance across domains
- `getCrossDomainCorrelationAnalysis()` - Analyze correlations between domains
- `getCrossDomainTrendAnalysis()` - Analyze trends across domains
- `generateCrossDomainInsights()` - Generate actionable insights
- `exportCrossDomainAnalytics()` - Export cross-domain data

## Usage Examples

### Basic Usage

```typescript
import {
  getCurrentUsageMetrics,
  getBillingAnalytics,
} from "@/lib/actions/analytics/billing-analytics";

// Get current usage metrics
const usageResult = await getCurrentUsageMetrics();
if (usageResult.success) {
  console.log("Usage:", usageResult.data);
} else {
  console.error("Error:", usageResult.error);
}

// Get billing analytics with filters
const analyticsResult = await getBillingAnalytics({
  startDate: "2024-01-01",
  endDate: "2024-01-31",
});
```

### Error Handling

All functions return `ActionResult<T>` which provides consistent error handling:

```typescript
const result = await getCampaignAnalytics();

if (result.success) {
  // Handle success
  const campaigns = result.data;
  console.log("Campaigns:", campaigns);
} else {
  // Handle error
  const error = result.error;
  console.error(`Error (${error.type}): ${error.message}`);

  if (error.field) {
    console.error(`Field: ${error.field}`);
  }
}
```

### Authentication and Rate Limiting

Authentication and rate limiting are handled automatically:

```typescript
// This function automatically:
// 1. Checks authentication
// 2. Validates company context
// 3. Applies rate limiting
// 4. Handles errors consistently
const result = await getDomainHealthMetrics(["domain-1", "domain-2"]);
```

### Health Monitoring

Each module provides health check functions:

```typescript
const healthResult = await getBillingAnalyticsHealth();
if (healthResult.success) {
  const health = healthResult.data;
  console.log(`Status: ${health.status}`);
  console.log(`Issues: ${health.issues.join(", ")}`);
}
```

## Migration from Legacy Actions

### Before (Legacy)

```typescript
// Old pattern with inconsistent error handling
import { getCurrentUsageMetrics } from "@/lib/actions/billing.analytics.actions";

try {
  const usage = await getCurrentUsageMetrics("company-id");
  // Handle success
} catch (error) {
  // Inconsistent error handling
  console.error(error);
}
```

### After (Standardized)

```typescript
// New pattern with consistent ActionResult
import { getCurrentUsageMetrics } from "@/lib/actions/analytics/billing-analytics";

const result = await getCurrentUsageMetrics();
if (result.success) {
  const usage = result.data;
  // Handle success
} else {
  // Consistent error handling
  console.error(`${result.error.type}: ${result.error.message}`);
}
```

## Type Definitions

### ActionResult<T>

```typescript
interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: ActionError;
}

interface ActionError {
  type:
    | "auth"
    | "validation"
    | "network"
    | "server"
    | "rate_limit"
    | "permission"
    | "not_found"
    | "conflict";
  message: string;
  code?: string;
  field?: string;
  details?: Record<string, unknown>;
}
```

### Common Interfaces

```typescript
interface PerformanceMetrics {
  sent: number;
  delivered: number;
  opened_tracked: number;
  clicked_tracked: number;
  replied: number;
  bounced: number;
  spam_reported: number;
  unsubscribed: number;
}

interface CalculatedRates {
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  replyRate: number;
  bounceRate: number;
  spamRate: number;
}

interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  domainIds?: string[];
  campaignIds?: string[];
  // ... other filter options
}
```

## Rate Limiting

Different operations have different rate limits:

- **Analytics Queries**: 200 per minute
- **Analytics Exports**: 10 per hour
- **General Writes**: 100 per minute
- **Bulk Operations**: 10 per 5 minutes
- **Sensitive Actions**: 5 per minute

Rate limiting is applied automatically based on the operation type and user context.

## Performance Monitoring

All actions include performance monitoring via ConvexQueryHelper:

- Query execution time tracking
- Success/failure rate monitoring
- Error categorization and logging
- Health check integration
- Cache hit rate monitoring

## Testing

The module includes comprehensive tests:

```bash
# Run analytics actions tests
npm test lib/actions/analytics/__tests__/analytics-actions.test.ts

# Run all analytics tests
npm test -- --testPathPattern=analytics
```

## Best Practices

1. **Always handle ActionResult**: Check `success` before accessing `data`
2. **Use appropriate filters**: Apply filters to reduce data transfer and improve performance
3. **Monitor health checks**: Regularly check analytics health status
4. **Respect rate limits**: Don't exceed rate limits for better system stability
5. **Use bulk operations**: For multiple updates, use bulk functions when available
6. **Cache appropriately**: Leverage built-in caching for frequently accessed data

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Ensure user is logged in and has proper permissions
2. **Rate Limit Exceeded**: Wait for rate limit window to reset or reduce request frequency
3. **ConvexQueryHelper Errors**: Check Convex service health and network connectivity
4. **Type Errors**: Ensure proper TypeScript types are used for parameters

### Health Check Failures

If health checks fail:

1. Check ConvexQueryHelper status
2. Verify Convex service connectivity
3. Check data freshness and update frequency
4. Review error logs for specific issues

### Performance Issues

If experiencing performance issues:

1. Use appropriate filters to reduce data size
2. Check cache hit rates
3. Monitor query execution times
4. Consider using bulk operations for multiple requests

## Future Enhancements

- Real-time analytics updates
- Advanced caching strategies
- Machine learning insights
- Custom analytics dashboards
- Enhanced export formats
- Automated alerting system
