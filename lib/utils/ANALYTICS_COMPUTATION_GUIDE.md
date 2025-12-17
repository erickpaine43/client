# Analytics Computation Utilities Guide

## Overview

This guide documents the shared analytics computation utilities implemented in Task 3.2. These utilities provide standardized calculation methods, time series aggregation, performance analysis, and filtered dataset processing for all analytics domains.

## Core Utilities

### 1. AnalyticsCalculator (Extended)

Enhanced with additional KPI calculations and validation methods.

#### New KPI Methods

```typescript
// Click-through rate: clicked_tracked / opened_tracked
const ctr = AnalyticsCalculator.calculateClickThroughRate(clicked, opened);

// Engagement rate: (opened + clicked + replied) / delivered
const engagement = AnalyticsCalculator.calculateEngagementRate(
  opened,
  clicked,
  replied,
  delivered
);

// Conversion rate: replied / delivered (alias for reply rate)
const conversion = AnalyticsCalculator.calculateConversionRate(
  replied,
  delivered
);

// List growth rate: (new_subscribers - unsubscribed) / total_subscribers
const growth = AnalyticsCalculator.calculateListGrowthRate(
  newSubs,
  unsubs,
  total
);

// Email ROI: (revenue - cost) / cost
const roi = AnalyticsCalculator.calculateEmailROI(revenue, cost);

// Deliverability score (0-100) based on industry benchmarks
const deliverability =
  AnalyticsCalculator.calculateDeliverabilityScore(metrics);
```

#### Comprehensive KPI Analysis

```typescript
const kpiAnalysis = AnalyticsCalculator.calculateKPIMetrics(metrics);

// Returns:
// {
//   rates: CalculatedRates,
//   kpis: {
//     clickThroughRate: number,
//     engagementRate: number,
//     conversionRate: number,
//     healthScore: number,
//     deliverabilityScore: number
//   }
// }
```

#### Enhanced Validation

```typescript
// Basic validation (existing)
const validation = AnalyticsCalculator.validateMetrics(metrics);

// Validation with automatic correction
const correctionResult = AnalyticsCalculator.validateAndCorrectMetrics(metrics);
// Returns: { correctedMetrics, corrections, isValid, errors }
```

### 2. TimeSeriesAggregator

Handles time series data aggregation and analysis.

#### Basic Aggregation

```typescript
// Aggregate by granularity (day, week, month)
const aggregated = TimeSeriesAggregator.aggregateByGranularity(
  timeSeriesData,
  "day"
);

// Fill missing time periods with zero data
const filled = TimeSeriesAggregator.fillMissingPeriods(
  timeSeriesData,
  "2024-01-01",
  "2024-01-31",
  "day"
);
```

#### Trend Analysis

```typescript
// Calculate moving averages
const movingAvg = TimeSeriesAggregator.calculateMovingAverage(
  timeSeriesData,
  7, // window size
  "opened_tracked" // metric to analyze
);

// Calculate growth rates between periods
const growthRates = TimeSeriesAggregator.calculateGrowthRates(
  timeSeriesData,
  "sent"
);
```

### 3. PerformanceCalculator

Unified performance calculation methods with standardized field names.

#### Standardized Rate Calculations

```typescript
// Uses correct denominators: openRate = opened_tracked/delivered (not sent)
const rates = PerformanceCalculator.calculateStandardizedRates(metrics);
```

#### Comparative Analysis

```typescript
const comparison = PerformanceCalculator.calculateComparativePerformance(
  currentMetrics,
  previousMetrics
);

// Returns:
// {
//   current: CalculatedRates,
//   previous: CalculatedRates,
//   changes: Record<keyof CalculatedRates, number>,
//   improvements: string[],
//   declines: string[]
// }
```

#### Performance Benchmarking

```typescript
const benchmarks =
  PerformanceCalculator.calculatePerformanceBenchmarks(metrics);

// Returns:
// {
//   rates: CalculatedRates,
//   scores: Record<keyof CalculatedRates, number>, // 0-100 scores
//   overallScore: number,
//   grade: "A" | "B" | "C" | "D" | "F",
//   recommendations: string[]
// }
```

### 4. FilteredDatasetUtils

Utilities for working with filtered datasets and computing analytics on pre-filtered data.

#### Dataset Creation and Validation

```typescript
// Create filtered dataset
const dataset = FilteredDatasetUtils.createFilteredDataset(
  data,
  filters,
  totalCount,
  queryExecutionTime
);

// Validate dataset
const validation = FilteredDatasetUtils.validateFilteredDataset(dataset);
```

#### Data Filtering

```typescript
// Apply date range filtering
const dateFiltered = FilteredDatasetUtils.applyDateRangeFilter(dataWithDates, {
  start: "2024-01-01",
  end: "2024-01-31",
});

// Apply entity ID filtering
const entityFiltered = FilteredDatasetUtils.applyEntityFilter(dataWithIds, [
  "entity1",
  "entity2",
]);
```

#### Analytics Computation on Filtered Data

```typescript
const analytics = FilteredDatasetUtils.computeAnalyticsOnFilteredData(
  filteredDataset,
  {
    includeTimeSeriesData: true,
    includePerformanceMetrics: true,
    includeComparativeData: true,
  }
);

// Returns aggregated metrics, rates, and optional additional analysis
```

#### Dataset Statistics

```typescript
const stats = FilteredDatasetUtils.getDatasetStatistics(dataset);

// Returns:
// {
//   dataCount: number,
//   totalCount: number,
//   filterEfficiency: number,
//   queryTime: number,
//   dateRange: { start: string, end: string },
//   hasEntityFilters: boolean
// }
```

## Key Features

### Standardized Field Names

All utilities use the standardized field names from `types/analytics/core.ts`:

- `opened_tracked` (not `opens`)
- `clicked_tracked` (not `clicks`)
- `spamComplaints` (not `spamFlags`)

### Correct Rate Calculations

- **Open Rate**: `opened_tracked / delivered` (not `sent`)
- **Click Rate**: `clicked_tracked / delivered` (not `sent`)
- **Click-Through Rate**: `clicked_tracked / opened_tracked`

### Data Integrity

- Comprehensive validation with automatic correction
- Logical constraint checking (e.g., opens ≤ delivered ≤ sent)
- Negative value correction
- Missing field calculation (e.g., delivered = sent - bounced)

### Performance Optimization

- Efficient time series aggregation
- Optimized filtering algorithms
- Memory-conscious data processing
- Query execution time tracking

## Usage Examples

### Complete Analytics Workflow

```typescript
import {
  AnalyticsCalculator,
  TimeSeriesAggregator,
  PerformanceCalculator,
  FilteredDatasetUtils,
} from "@/lib/services/analytics";

// 1. Create and validate filtered dataset
const dataset = FilteredDatasetUtils.createFilteredDataset(
  rawData,
  filters,
  totalCount,
  queryTime
);

const validation = FilteredDatasetUtils.validateFilteredDataset(dataset);
if (!validation.isValid) {
  throw new Error(`Invalid dataset: ${validation.errors.join(", ")}`);
}

// 2. Compute analytics on filtered data
const analytics = FilteredDatasetUtils.computeAnalyticsOnFilteredData(dataset, {
  includePerformanceMetrics: true,
});

// 3. Get comprehensive KPI analysis
const kpis = AnalyticsCalculator.calculateKPIMetrics(
  analytics.aggregatedMetrics
);

// 4. Calculate performance benchmarks
const benchmarks = PerformanceCalculator.calculatePerformanceBenchmarks(
  analytics.aggregatedMetrics
);

console.log(`Overall Grade: ${benchmarks.grade}`);
console.log(`Health Score: ${kpis.kpis.healthScore}`);
console.log(`Recommendations: ${benchmarks.recommendations.join(", ")}`);
```

### Time Series Analysis

```typescript
// Aggregate daily data into weekly summaries
const weeklyData = TimeSeriesAggregator.aggregateByGranularity(
  dailyTimeSeriesData,
  "week"
);

// Fill missing weeks with zero data
const completeWeeklyData = TimeSeriesAggregator.fillMissingPeriods(
  weeklyData,
  "2024-01-01",
  "2024-12-31",
  "week"
);

// Calculate 4-week moving average for trend analysis
const trendData = TimeSeriesAggregator.calculateMovingAverage(
  completeWeeklyData,
  4,
  "opened_tracked"
);

// Calculate week-over-week growth rates
const growthData = TimeSeriesAggregator.calculateGrowthRates(
  completeWeeklyData,
  "sent"
);
```

### Comparative Performance Analysis

```typescript
// Compare current month vs previous month
const currentMonth = AnalyticsCalculator.aggregateMetrics(currentMonthData);
const previousMonth = AnalyticsCalculator.aggregateMetrics(previousMonthData);

const comparison = PerformanceCalculator.calculateComparativePerformance(
  currentMonth,
  previousMonth
);

// Identify improvements and declines
console.log("Improvements:", comparison.improvements);
console.log("Declines:", comparison.declines);

// Show percentage changes
Object.entries(comparison.changes).forEach(([metric, change]) => {
  const percentage = AnalyticsCalculator.formatRateAsPercentage(
    Math.abs(change)
  );
  const direction = change > 0 ? "increased" : "decreased";
  console.log(`${metric} ${direction} by ${percentage}`);
});
```

## Integration with Existing Systems

### With BaseAnalyticsService

```typescript
class CampaignAnalyticsService extends BaseAnalyticsService {
  async getPerformanceMetrics(
    campaignIds: string[],
    filters: AnalyticsFilters
  ) {
    return this.executeWithCache(
      "performance",
      campaignIds,
      filters,
      async () => {
        // Get filtered data from Convex
        const rawData = await this.getCampaignData(campaignIds, filters);

        // Create filtered dataset
        const dataset = FilteredDatasetUtils.createFilteredDataset(
          rawData,
          filters,
          rawData.length,
          Date.now() - startTime
        );

        // Compute analytics
        return FilteredDatasetUtils.computeAnalyticsOnFilteredData(dataset, {
          includePerformanceMetrics: true,
        });
      }
    );
  }
}
```

### With Convex Functions

```typescript
// In Convex function
export const getCampaignAnalytics = query({
  args: { campaignIds: v.array(v.string()), filters: v.object({}) },
  handler: async (ctx, args) => {
    const rawData = await ctx.db
      .query("campaignAnalytics")
      .filter(/* apply filters */)
      .collect();

    // Server-side computation using utilities
    const aggregated = AnalyticsCalculator.aggregateMetrics(rawData);
    const rates = PerformanceCalculator.calculateStandardizedRates(aggregated);
    const kpis = AnalyticsCalculator.calculateKPIMetrics(aggregated);

    return { aggregated, rates, kpis };
  },
});
```

## Testing

Comprehensive test coverage includes:

- **Unit Tests**: Individual utility method testing
- **Integration Tests**: Cross-utility workflow testing
- **Validation Tests**: Data integrity and correction testing
- **Performance Tests**: Time series aggregation efficiency
- **Edge Case Tests**: Empty datasets, invalid data, boundary conditions

Run tests:

```bash
npm test -- lib/utils/__tests__/analytics-computation.test.ts
npm test -- lib/utils/__tests__/analytics-integration.test.ts
```

## Requirements Compliance

This implementation satisfies the following requirements:

- **4.1**: Standardized data aggregation patterns across domains
- **4.2**: Common TimeSeriesAggregator for consistent time-based analysis
- **4.3**: Common KPICalculator and PerformanceCalculator for consistent metrics
- **4.5**: Single shared utility functions for consistent calculations
- **13.1**: Convex-compatible data structures and calculations
- **13.5**: Data integrity validation and correction methods

All utilities use standardized field names (`opened_tracked`, `clicked_tracked`) and provide consistent calculation methods across all analytics domains.
