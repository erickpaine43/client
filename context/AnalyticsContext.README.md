# Simplified Analytics Context

## Overview

The `AnalyticsContext` has been refactored to focus solely on UI state management, removing data fetching logic and delegating to domain-specific analytics services. This implementation follows the requirements from task 7.1 to separate UI concerns from data concerns.

## Key Changes

### 1. UI-Only State Management

The context now manages only UI-related state:

- **Filters**: Using `AnalyticsUIFilters` interface for standardized filter management
- **Loading States**: Per-domain loading state tracking using `AnalyticsLoadingState`
- **Error States**: Per-domain error handling with graceful degradation
- **Formatted Stats**: UI-ready formatted analytics data using `FormattedAnalyticsStats`

### 2. Domain Service Integration

The context provides access to domain services through the `analyticsService` singleton:

```typescript
const { services } = useAnalytics();
// Access domain-specific services
services.campaigns;
services.domains;
services.mailboxes;
services.leads;
services.templates;
services.billing;
```

### 3. Cross-Domain Coordination

Uses `AnalyticsCalculator` for consistent calculations across domains:

```typescript
const { refreshAll, refreshDomain, invalidateCache } = useAnalytics();

// Refresh all domains
await refreshAll();

// Refresh specific domain
await refreshDomain("campaigns");

// Invalidate cache
await invalidateCache("campaigns");
```

## New Hooks

### `useAnalytics()`

Main hook for accessing the analytics context:

```typescript
const {
  filters, // Current UI filters
  updateFilters, // Update filter function
  resetFilters, // Reset to defaults
  loadingState, // Loading states by domain
  formattedStats, // UI-ready formatted stats
  services, // Domain services access
  refreshAll, // Refresh all domains
  refreshDomain, // Refresh specific domain
  invalidateCache, // Cache invalidation
} = useAnalytics();
```

### `useDomainAnalytics(domain)`

Hook for domain-specific operations with error handling:

```typescript
const campaignAnalytics = useDomainAnalytics("campaigns");

// Access domain service with automatic error handling
const result = await campaignAnalytics.executeWithErrorHandling(async () => {
  return await campaignAnalytics.service.getPerformanceMetrics();
});
```

### `useFormattedAnalytics()`

Hook for formatting raw analytics data for UI display:

```typescript
const { formattedStats, formatMetricsForDisplay } = useFormattedAnalytics();

// Format raw metrics for display
formatMetricsForDisplay(rawMetrics);

// Access formatted stats
console.log(formattedStats.openRate); // "25.3%"
```

## Usage Examples

### Basic Filter Management

```typescript
function AnalyticsFilters() {
  const { filters, updateFilters, getAllowedGranularities } = useAnalytics();

  return (
    <div>
      <select
        value={filters.dateRange}
        onChange={(e) => updateFilters({ dateRange: e.target.value })}
      >
        <option value="7d">7 Days</option>
        <option value="30d">30 Days</option>
        <option value="90d">90 Days</option>
      </select>

      <select
        value={filters.granularity}
        onChange={(e) => updateFilters({ granularity: e.target.value })}
      >
        {getAllowedGranularities().map(gran => (
          <option key={gran} value={gran}>{gran}</option>
        ))}
      </select>
    </div>
  );
}
```

### Loading State Management

```typescript
function LoadingIndicator() {
  const { loadingState } = useAnalytics();

  if (loadingState.isLoading) {
    return <div>Loading analytics...</div>;
  }

  if (loadingState.hasErrors) {
    return (
      <div>
        <h3>Some analytics failed to load:</h3>
        {Object.entries(loadingState.errors).map(([domain, error]) =>
          error && (
            <div key={domain}>
              {domain}: {error}
            </div>
          )
        )}
      </div>
    );
  }

  return <div>All analytics loaded successfully</div>;
}
```

### Domain-Specific Operations

```typescript
function CampaignAnalytics() {
  const campaignAnalytics = useDomainAnalytics('campaigns');
  const [data, setData] = useState(null);

  const loadCampaignData = async () => {
    const result = await campaignAnalytics.executeWithErrorHandling(async () => {
      return await campaignAnalytics.service.getPerformanceMetrics();
    });

    if (result) {
      setData(result);
    }
  };

  return (
    <div>
      <button onClick={loadCampaignData} disabled={campaignAnalytics.loading}>
        {campaignAnalytics.loading ? 'Loading...' : 'Load Campaign Data'}
      </button>

      {campaignAnalytics.error && (
        <div className="error">Error: {campaignAnalytics.error}</div>
      )}

      {data && <div>Campaign data loaded successfully</div>}
    </div>
  );
}
```

### Formatted Stats Display

```typescript
function StatsDisplay() {
  const { formattedStats, formatMetricsForDisplay } = useFormattedAnalytics();

  // Format new metrics when they arrive
  useEffect(() => {
    if (rawMetrics) {
      formatMetricsForDisplay(rawMetrics);
    }
  }, [rawMetrics, formatMetricsForDisplay]);

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <h3>Total Sent</h3>
        <p>{formattedStats.totalSent}</p>
      </div>
      <div className="stat-card">
        <h3>Open Rate</h3>
        <p>{formattedStats.openRate}</p>
      </div>
      <div className="stat-card">
        <h3>Click Rate</h3>
        <p>{formattedStats.clickRate}</p>
      </div>
    </div>
  );
}
```

## Benefits

### 1. Separation of Concerns

- UI state management is separate from data fetching
- Domain services handle all data operations
- Context focuses on coordination and state management

### 2. Better Error Handling

- Per-domain error tracking
- Graceful degradation when individual domains fail
- Centralized error state management

### 3. Improved Performance

- Parallel domain loading
- Intelligent cache management
- Reduced re-renders through focused state updates

### 4. Type Safety

- Uses standardized interfaces from `types/analytics/`
- End-to-end TypeScript safety
- Compile-time error checking

### 5. Testability

- Easy to mock domain services
- Isolated UI state testing
- Clear separation of concerns

## Migration Guide

### From Old Context

```typescript
// OLD: Mixed UI/data concerns
const { chartData, fetchMailboxAnalytics } = useAnalytics();

// NEW: Separated concerns
const { filters } = useAnalytics();
const mailboxAnalytics = useDomainAnalytics("mailboxes");
```

### Filter Updates

```typescript
// OLD: Multiple state setters
setDateRange("30d");
setGranularity("week");

// NEW: Single update function
updateFilters({ dateRange: "30d", granularity: "week" });
```

### Data Formatting

```typescript
// OLD: Mixed raw/formatted data
const openRate = `${((opens / sent) * 100).toFixed(1)}%`;

// NEW: Standardized formatting
const { formatMetricsForDisplay } = useFormattedAnalytics();
formatMetricsForDisplay(rawMetrics);
```

## Requirements Satisfied

- ✅ **2.1**: Context focuses on UI state management only
- ✅ **2.2**: Data fetching delegated to domain services
- ✅ **2.3**: Filter changes notify relevant domain services
- ✅ **2.4**: Coordinates between multiple domain services
- ✅ **2.5**: Graceful error handling without affecting other domains

The simplified `AnalyticsContext` provides a clean, maintainable foundation for analytics UI state management while leveraging the power of domain-specific services for data operations.
