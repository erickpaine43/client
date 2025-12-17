# Campaign Analytics Service Implementation

This document describes the implementation of Task 4.2: Build CampaignAnalyticsService with server actions.

## 📁 Files Created

### Core Implementation

- `lib/actions/campaign.analytics.actions.ts` - Server actions for campaign analytics
- `lib/services/analytics/CampaignAnalyticsService.ts` - Domain service class
- `lib/services/analytics/__tests__/CampaignAnalyticsService.test.ts` - Comprehensive tests
- `lib/services/analytics/examples/campaign-analytics-usage.ts` - Usage examples

### Updated Files

- `lib/services/analytics/AnalyticsService.ts` - Added campaign service integration
- `lib/services/analytics/index.ts` - Added campaign service exports

## 🚀 Key Features Implemented

### ✅ Standardized Data Structures

- Uses `PerformanceMetrics` interface from `types/analytics/core.ts`
- Implements `CampaignAnalytics` interface from `types/analytics/domain-specific.ts`
- No stored rates - all calculations done client-side using `AnalyticsCalculator`
- Consistent field names (`opened_tracked`, `clicked_tracked`, etc.)

### ✅ Server Actions Integration

- `getCampaignPerformanceMetrics()` - Get performance data for campaigns
- `getCampaignTimeSeriesData()` - Get time series data for charts
- `computeAnalyticsForFilteredData()` - Filter-first analytics computation
- `getCampaignSequenceAnalytics()` - Sequence step analytics
- `updateCampaignAnalytics()` - Store new analytics data
- `migrateLegacyCampaignData()` - Legacy data migration

### ✅ Convex Integration

- Direct integration with Convex functions from `convex/campaignAnalytics.ts`
- Real-time data capabilities via Convex subscriptions
- Server-side heavy computations with client-side real-time updates
- Proper error handling for Convex operations

### ✅ Upstash Redis Caching

- Domain-specific cache keys: `analytics:campaigns:operation:entities:filters`
- Intelligent TTL management using `CACHE_TTL.RECENT`
- Automatic cache invalidation on data updates
- Graceful fallback when Redis is unavailable

### ✅ Service Foundation

- Extends `BaseAnalyticsService` for automatic caching and error handling
- Exponential backoff retry logic for failed operations
- Structured error handling with `AnalyticsError` types
- Comprehensive logging for monitoring and debugging

### ✅ Data Migration Support

- Uses `ConvexMigrationUtils` for legacy data transformation
- Batch migration with error handling
- Field name mapping (opens → opened_tracked, etc.)
- Data validation during migration

## 🔧 Usage Examples

### Basic Performance Metrics

```typescript
import { analyticsService } from "@/lib/services/analytics";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";

// Get campaign performance
const campaigns = await analyticsService.campaigns.getPerformanceMetrics(
  ["campaign-1", "campaign-2"],
  {
    dateRange: {
      start: "2024-11-01",
      end: "2024-12-01",
    },
  }
);

// Calculate rates using AnalyticsCalculator
campaigns.forEach((campaign) => {
  const rates = AnalyticsCalculator.calculateAllRates(campaign);
  console.log(
    `${campaign.campaignName} open rate: ${AnalyticsCalculator.formatRateAsPercentage(rates.openRate)}`
  );
});
```

### Time Series Data for Charts

```typescript
// Get time series data
const timeSeriesData = await analyticsService.campaigns.getTimeSeriesData(
  ["campaign-1"],
  { dateRange: { start: "2024-11-01", end: "2024-12-01" } },
  "day" // granularity
);

// Format for chart libraries
const chartData = timeSeriesData.map((point) => ({
  date: point.label,
  sent: point.metrics.sent,
  opened: point.metrics.opened_tracked,
  clicked: point.metrics.clicked_tracked,
}));
```

### Filtered Analytics Computation

```typescript
// Filter data first, then compute analytics
const result = await analyticsService.campaigns.computeAnalyticsForFilteredData(
  {
    dateRange: { start: "2024-11-01", end: "2024-12-01" },
    entityIds: ["campaign-1", "campaign-2"],
  },
  {
    includeTimeSeriesData: true,
    includePerformanceMetrics: true,
    granularity: "week",
  }
);

console.log("Aggregated metrics:", result.aggregatedMetrics);
console.log("Calculated rates:", result.rates);
```

### Sequence Analytics

```typescript
// Get sequence step analytics
const sequenceSteps =
  await analyticsService.campaigns.getSequenceAnalytics("campaign-1");

sequenceSteps.forEach((step, index) => {
  const rates = AnalyticsCalculator.calculateAllRates(step);
  console.log(
    `Step ${index + 1}: ${step.subject} - ${AnalyticsCalculator.formatRateAsPercentage(rates.openRate)} open rate`
  );
});
```

### Data Updates

```typescript
// Update campaign analytics
await analyticsService.campaigns.updateAnalytics({
  campaignId: "campaign-1",
  campaignName: "Q4 Outreach",
  date: "2024-12-01",
  companyId: "company-123",
  sent: 100,
  delivered: 95,
  opened_tracked: 30,
  clicked_tracked: 8,
  replied: 5,
  bounced: 5,
  unsubscribed: 2,
  spamComplaints: 1,
  status: "ACTIVE",
  leadCount: 100,
  activeLeads: 80,
  completedLeads: 20,
});
```

## 🧪 Testing

The implementation includes comprehensive tests covering:

- ✅ Performance metrics retrieval
- ✅ Time series data generation
- ✅ Sequence analytics
- ✅ Lead engagement calculations
- ✅ Data validation
- ✅ Error handling
- ✅ Cache operations
- ✅ Health checks

Run tests with:

```bash
npm test -- lib/services/analytics/__tests__/CampaignAnalyticsService.test.ts
```

## 🔄 Integration with Existing Code

### Analytics Context Integration

The service is designed to work with the existing `AnalyticsContext` by providing data through server actions:

```typescript
// In React components
const campaigns = await analyticsService.campaigns.getPerformanceMetrics(
  selectedCampaigns,
  filters
);
```

### Convex Real-time Updates

The service works with Convex subscriptions for real-time updates:

```typescript
// In React components with Convex hooks
const analytics = useQuery(
  api.campaignAnalytics.getCampaignAggregatedAnalytics,
  {
    campaignIds: selectedCampaigns,
    companyId: "company-123",
  }
);
```

### Cache Management

Automatic cache invalidation ensures data consistency:

```typescript
// Cache is automatically invalidated when data is updated
await analyticsService.campaigns.updateAnalytics(campaignData);
// Related cache entries are automatically cleared
```

## 📊 Performance Considerations

### Caching Strategy

- **Cache Keys**: `analytics:campaigns:operation:campaignIds:filters:timestamp`
- **TTL**: 5 minutes for recent data (`CACHE_TTL.RECENT`)
- **Invalidation**: Automatic on data updates, manual for cache refresh

### Query Optimization

- Filter data at the database level before analytics computation
- Use specific campaign IDs when possible to limit data retrieval
- Implement pagination for large datasets (handled by Convex functions)

### Error Handling

- Exponential backoff retry for transient failures
- Graceful degradation when services are unavailable
- Structured error types for appropriate handling

## 🔗 Dependencies

### Required Infrastructure

- ✅ `BaseAnalyticsService` - Provides caching, retry logic, error handling
- ✅ `AnalyticsCalculator` - Standardized rate calculations
- ✅ `ConvexMigrationUtils` - Data transformation utilities
- ✅ Upstash Redis - Caching layer
- ✅ Convex functions - Data storage and retrieval

### Type Dependencies

- ✅ `PerformanceMetrics` - Raw count interface
- ✅ `CampaignAnalytics` - Domain-specific interface
- ✅ `AnalyticsFilters` - Filter interface
- ✅ `TimeSeriesDataPoint` - Time series interface

## 🚨 Important Notes

1. **No Stored Rates**: All rate calculations are done client-side using `AnalyticsCalculator`
2. **Standardized Fields**: Uses `opened_tracked`, `clicked_tracked` (not `opens`, `clicks`)
3. **Data Validation**: All metrics are validated using `AnalyticsCalculator.validateMetrics()`
4. **Cache Consistency**: Cache is automatically invalidated on data updates
5. **Error Resilience**: Service continues working even if individual operations fail

## 🔄 Migration from Legacy Code

The service replaces scattered analytics logic from:

- `lib/actions/campaignActions.ts` - `getCampaignAnalyticsAction()`
- Various server actions with embedded analytics calculations
- Mock data generators with real Convex-based data

Migration path:

1. Update components to use `analyticsService.campaigns` instead of direct server actions
2. Replace rate calculations with `AnalyticsCalculator` methods
3. Update mock data to use standardized field names
4. Test with existing UI components to ensure compatibility

## ✅ Requirements Fulfilled

- **3.2**: ✅ Implements shared analytics computation utilities
- **13.4**: ✅ Integrates Upstash Redis caching with domain-specific keys
- **14.1**: ✅ Implements server-side heavy computation with real-time updates
- **14.2**: ✅ Supports filter-first analytics computation

The implementation provides a solid foundation for campaign analytics with proper separation of concerns, standardized data structures, and comprehensive error handling.
