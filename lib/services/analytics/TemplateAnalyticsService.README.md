# Template Analytics Service Implementation

This document describes the implementation of Task 6.2: Build template analytics service.

## 📁 Files Created

### Core Implementation

- **`convex/templateAnalytics.ts`** - Convex functions for template analytics data operations
- **`lib/services/analytics/TemplateAnalyticsService.ts`** - Domain service class for template analytics
- **`lib/actions/template.analytics.actions.ts`** - Server actions for template analytics
- **`hooks/useTemplateAnalytics.ts`** - React hooks for real-time template analytics
- **`lib/services/analytics/__tests__/TemplateAnalyticsService.simple.test.ts`** - Test suite for template analytics
- **`lib/services/analytics/examples/template-analytics-usage.ts`** - Usage examples and documentation

### Updated Files

- **`lib/services/analytics/AnalyticsService.ts`** - Added template service integration
- **`lib/services/analytics/index.ts`** - Added template service exports
- **`convex/index.ts`** - Added template analytics function exports

## 🚀 Key Features Implemented

### ✅ Standardized Data Structures

- Uses `TemplateAnalytics` interface from `types/analytics/domain-specific.ts`
- Implements `PerformanceMetrics` interface from `types/analytics/core.ts`
- **No stored rates** - all calculations done using `AnalyticsCalculator`
- Consistent field names (`opened_tracked`, `clicked_tracked`, etc.)
- **Replaces string-based rates** from legacy `templateActions.ts`

### ✅ Convex Functions Implementation

- **`getTemplatePerformanceMetrics`** - Get performance data for templates with filtering
- **`getTemplateTimeSeriesData`** - Get time series data for template performance charts
- **`getTemplateUsageAnalytics`** - Get most used templates and usage trends
- **`getTemplateEffectivenessMetrics`** - Compare template performance and rank by effectiveness
- **`getTemplateAnalyticsOverview`** - Get aggregated template analytics for dashboard
- **`updateTemplateAnalytics`** - Store new template analytics data
- **`batchUpdateTemplateAnalytics`** - Bulk update multiple template records

### ✅ Server Actions Integration

- **`getTemplatePerformanceMetrics()`** - Get performance data with calculated rates
- **`getTemplateTimeSeriesData()`** - Get time series data for charts
- **`getTemplateUsageAnalytics()`** - Get usage analytics with top templates
- **`getTemplateEffectivenessMetrics()`** - Get effectiveness comparison
- **`getTemplateAnalyticsOverview()`** - Get dashboard overview
- **`computeTemplateAnalyticsForFilteredData()`** - Filter-first analytics computation
- **`updateTemplateAnalytics()`** - Update template analytics data
- **`batchUpdateTemplateAnalytics()`** - Batch update multiple templates

### ✅ Real-Time Analytics Hooks

- **`useTemplatePerformanceMetrics`** - Real-time template performance data
- **`useTemplateTimeSeriesData`** - Live time series data for charts
- **`useTemplateUsageAnalytics`** - Real-time usage analytics
- **`useTemplateEffectivenessMetrics`** - Real-time effectiveness comparison
- **`useTemplateAnalyticsOverview`** - Dashboard-level metrics
- **`useComprehensiveTemplateAnalytics`** - Combined analytics for dashboard usage
- **`useOptimisticTemplateAnalytics`** - Optimistic UI updates

### ✅ Service Foundation

- Extends `BaseAnalyticsService` for automatic caching and error handling
- Upstash Redis caching with domain-specific keys: `analytics:templates:operation:entities:filters`
- Exponential backoff retry logic for failed operations
- Structured error handling with `AnalyticsError` types
- Comprehensive logging for monitoring and debugging

### ✅ Data Migration Support

- **Replaces string-based rates** (`openRate: "25.3%"`) with numeric calculations
- Uses `AnalyticsCalculator` for all rate calculations instead of stored strings
- Standardized field names (`opened_tracked` instead of `opens`)
- Data validation using `AnalyticsCalculator.validateMetrics()`

## 🔧 Usage Examples

### Basic Template Performance

```typescript
import { analyticsService } from "@/lib/services/analytics";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";

// Get template performance
const templates = await analyticsService.templates.getPerformanceMetrics(
  ["template-1", "template-2"],
  {
    dateRange: {
      start: "2024-11-01",
      end: "2024-12-01",
    },
  }
);

// Calculate rates using AnalyticsCalculator (not stored)
templates.forEach((template) => {
  const rates = AnalyticsCalculator.calculateAllRates(template.performance);
  console.log(
    `${template.templateName} open rate: ${AnalyticsCalculator.formatRateAsPercentage(rates.openRate)}`
  );
  console.log(
    `${template.templateName} reply rate: ${AnalyticsCalculator.formatRateAsPercentage(rates.replyRate)}`
  );
});
```

### Template Usage Analytics

```typescript
// Get most used templates
const usageData = await analyticsService.templates.getUsageAnalytics(
  { dateRange: { start: "2024-11-01", end: "2024-12-01" } },
  10 // Top 10 templates
);

console.log(`Total templates: ${usageData.totalTemplates}`);
console.log(`Total usage: ${usageData.totalUsage}`);

usageData.topTemplates.forEach((template, index) => {
  const rates = AnalyticsCalculator.calculateAllRates(template.performance);
  console.log(`${index + 1}. ${template.templateName}`);
  console.log(`   Usage: ${template.totalUsage} times`);
  console.log(
    `   Reply Rate: ${AnalyticsCalculator.formatRateAsPercentage(rates.replyRate)}`
  );
});
```

### Template Effectiveness Comparison

```typescript
// Compare template effectiveness
const effectiveness = await analyticsService.templates.getEffectivenessMetrics(
  ["template-1", "template-2", "template-3"],
  { dateRange: { start: "2024-11-01", end: "2024-12-01" } }
);

effectiveness.forEach((template) => {
  const rates = AnalyticsCalculator.calculateAllRates(template.effectiveness.performanc
le.log(`Rank ${template.effectiveness.rank}: ${template.templateName}`);
  console.log(`  Effectiveness Score: ${template.effectiveness.score}/100`);
  console.log(`  Reply Rate: ${AnalyticsCalculator.formatRateAsPercentage(rates.replyRate)}`);
});
```

### Real-Time Template Analytics

```typescript
import { useTemplatePerformanceMetrics } from "@/hooks/useTemplateAnalytics";

function TemplateAnalyticsDashboard({ templateIds, companyId }) {
  const { data: templates, isLoading } = useTemplatePerformanceMetrics(
    templateIds,
    {
      dateRange: {
        start: "2024-11-01",
        end: "2024-12-01",
      },
    },
    companyId
  );

  if (isLoading) return <div>Loading template analytics...</div>;

  return (
    <div>
      {templates?.map(template => (
        <div key={template.templateId}>
          <h3>{template.templateName}</h3>
          <p>Category: {template.category}</p>
          <p>Usage: {template.usage} times</p>
          <p>Open Rate: {template.displayOpenRate}</p>
          <p>Reply Rate: {template.displayReplyRate}</p>
          <p>Health Score: {template.healthScore}/100</p>
        </div>
      ))}
    </div>
  );
}
```

### Filter-First Analytics Computation

```typescript
// Filter data first, then compute analytics
const result = await analyticsService.templates.computeAnalyticsForFilteredData(
  {
    dateRange: { start: "2024-11-01", end: "2024-12-01" },
    entityIds: ["template-1", "template-2"],
  },
  {
    includeTimeSeriesData: true,
    includePerformanceMetrics: true,
    granularity: "week",
  }
);

console.log("Aggregated metrics:", result.aggregatedMetrics);
console.log("Calculated rates:", result.rates);
console.log("KPI metrics:", result.kpiMetrics);
```

### Data Updates

```typescript
// Update template analytics
await analyticsService.templates.updateAnalytics({
  templateId: "template-1",
  templateName: "Cold Outreach Template",
  category: "OUTREACH",
  companyId: "company-123",
  date: "2024-12-01",
  sent: 100,
  delivered: 95,
  opened_tracked: 30, // Standardized field name
  clicked_tracked: 8, // Standardized field name
  replied: 5,
  bounced: 5,
  unsubscribed: 2,
  spamComplaints: 1,
  usage: 25,
});
```

## 🧪 Testing

The implementation includes comprehensive tests covering:

- ✅ Template analytics data structure validation
- ✅ Rate calculations using AnalyticsCalculator
- ✅ Standardized field names (opened_tracked, clicked_tracked)
- ✅ Template category support
- ✅ Metrics aggregation
- ✅ Error handling for invalid data
- ✅ Zero value handling
- ✅ Edge case scenarios

Run tests with:

```bash
npm test -- lib/services/analytics/__tests__/TemplateAnalyticsService.simple.test.ts
```

## 🔄 Migration from Legacy Code

The service replaces scattered template analytics logic from:

- **`lib/actions/templateActions.ts`** - String-based rates (`openRate: "25.3%"`, `replyRate: "5.2%"`)
- Various server actions with embedded analytics calculations
- Mock data with inconsistent rate formats

### Key Migration Changes:

1. **String rates → Numeric calculations**:

   ```typescript
   // OLD (stored strings)
   template.openRate = "25.3%";
   template.replyRate = "5.2%";

   // NEW (calculated on-demand)
   const rates = AnalyticsCalculator.calculateAllRates(template.performance);
   const displayOpenRate = AnalyticsCalculator.formatRateAsPercentage(
     rates.openRate
   );
   const displayReplyRate = AnalyticsCalculator.formatRateAsPercentage(
     rates.replyRate
   );
   ```

2. **Standardized field names**:

   ```typescript
   // OLD
   { opens: 30, clicks: 8 }

   // NEW
   { opened_tracked: 30, clicked_tracked: 8 }
   ```

3. **Consistent data structures**:

   ```typescript
   // OLD (mixed UI/data concerns)
   interface Template {
     openRate: string; // "25.3%"
     replyRate: string; // "5.2%"
   }

   // NEW (separated concerns)
   interface TemplateAnalytics {
     performance: PerformanceMetrics; // Raw numbers
     // Rates calculated on-demand using AnalyticsCalculator
   }
   ```

## 📊 Performance Considerations

### Caching Strategy

- **Cache Keys**: `analytics:templates:operation:templateIds:filters:timestamp`
- **TTL**: 5-15 minutes based on operation type
- **Invalidation**: Automatic on data updates
- **Graceful Fallback**: Direct Convex queries when Redis unavailable

### Query Optimization

- Filter data at database level before analytics computation
- Use specific template IDs when possible to limit data retrieval
- Implement pagination for large datasets (handled by Convex functions)
- Parallel loading for multiple analytics queries

### Error Handling

- Exponential backoff retry for transient failures
- Graceful degradation when services are unavailable
- Structured error types for appropriate handling
- Data validation before storage

## 🔗 Dependencies

### Required Infrastructure

- ✅ `BaseAnalyticsService` - Provides caching, retry logic, error handling
- ✅ `AnalyticsCalculator` - Standardized rate calculations (replaces string rates)
- ✅ Upstash Redis - Caching layer
- ✅ Convex functions - Data storage and retrieval
- ✅ Convex schema - `templateAnalytics` table

### Type Dependencies

- ✅ `TemplateAnalytics` - Domain-specific interface
- ✅ `PerformanceMetrics` - Raw count interface (no stored rates)
- ✅ `AnalyticsFilters` - Filter interface
- ✅ `TimeSeriesDataPoint` - Time series interface

## 🚨 Important Notes

1. **No Stored Rates**: All rate calculations are done on-demand using `AnalyticsCalculator`
2. **Standardized Fields**: Uses `opened_tracked`, `clicked_tracked` (not `opens`, `clicks`)
3. **Data Validation**: All metrics are validated using `AnalyticsCalculator.validateMetrics()`
4. **Cache Consistency**: Cache is automatically invalidated on data updates
5. **Error Resilience**: Service continues working even if individual operations fail
6. **Migration Ready**: Replaces string-based rates with numeric calculations

## ✅ Requirements Fulfilled

- **1.6**: ✅ Template analytics service with standardized metrics
- **14.1**: ✅ Server-side heavy computation with real-time updates

## 🔄 Integration with Existing System

The template analytics service integrates seamlessly with:

- **Analytics Service**: Available as `analyticsService.templates`
- **Server Actions**: Replaces scattered logic in `templateActions.ts`
- **React Hooks**: Real-time updates via Convex subscriptions
- **Analytics Calculator**: Consistent rate calculations across all domains
- **Type System**: Fully typed with existing analytics interfaces

## 🚀 Next Steps

The template analytics service is now ready for:

1. **Integration with template management UI**
2. **A/B testing functionality** (placeholder implemented)
3. **Advanced template recommendations** based on effectiveness scores
4. **Template performance alerts** when effectiveness drops
5. **Cross-domain template impact analysis**

## 📚 Additional Resources

- **Service Patterns**: `lib/services/analytics/CampaignAnalyticsService.README.md`
- **Real-Time Implementation**: `components/analytics/README.md`
- **Analytics Calculator**: `lib/utils/analytics-calculator.ts`
- **Usage Examples**: `lib/services/analytics/examples/template-analytics-usage.ts`
- **Convex Functions**: `convex/templateAnalytics.ts`

This implementation provides a solid foundation for template analytics with proper separation of concerns, standardized data structures, and comprehensive error handling while replacing legacy string-based rates with calculated numeric values.
