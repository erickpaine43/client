# Analytics Components Troubleshooting Guide

## Overview

This guide provides solutions to common issues encountered when working with analytics components, including data loading problems, performance issues, and integration challenges.

## Common Issues and Solutions

### Data Loading Issues

#### Issue: Components show loading state indefinitely

**Symptoms:**

- Components display skeleton loaders but never show data
- No error messages displayed
- Network requests appear to be successful

**Diagnosis:**

```typescript
// Check if data is being received but not processed correctly
console.log("Analytics query result:", data);
console.log("Is loading:", isLoading);
console.log("Error state:", error);
```

**Common Causes and Solutions:**

1. **Data format mismatch**

```typescript
// ❌ Problem: Component expects different data structure
const { data } = useAnalyticsQuery(['campaigns'], () =>
  services.campaigns.getPerformanceMetrics()
);

// Component expects: { metrics: PerformanceMetrics }
// But receives: PerformanceMetrics

// ✅ Solution: Transform data in the query
const { data } = useAnalyticsQuery(['campaigns'], asy{
  const metrics = await services.campaigns.getPerformanceMetrics();
  return { metrics }; // Wrap in expected structure
});
```

2. **Missing error boundaries**

```typescript
// ✅ Add error boundary around analytics components
export function AnalyticsDashboard() {
  return (
    <ErrorBoundary fallback={<AnalyticsErrorFallback />}>
      <CampaignMetricsCard />
      <DomainHealthCard />
    </ErrorBoundary>
  );
}
```

3. **Incorrect query keys**

```typescript
// ❌ Problem: Query key doesn't include all dependencies
const { data } = useQuery(["campaigns"], () =>
  getCampaignMetrics(campaignIds, filters)
);

// ✅ Solution: Include all dependencies in query key
const { data } = useQuery(["campaigns", campaignIds, filters], () =>
  getCampaignMetrics(campaignIds, filters)
);
```

#### Issue: "Cannot read property of undefined" errors

**Symptoms:**

- Runtime errors when accessing data properties
- Components crash during rendering
- Inconsistent behavior across different data states

**Solutions:**

1. **Add proper null checks**

```typescript
// ❌ Problem: Accessing properties without null checks
export function MetricsCard({ data }: { data: PerformanceMetrics }) {
  return (
    <div>
      <span>{data.sent}</span> {/* Crashes if data is undefined */}
      <span>{data.delivered}</span>
    </div>
  );
}

// ✅ Solution: Add null checks and default values
export function MetricsCard({ data }: { data?: PerformanceMetrics }) {
  if (!data) {
    return <MetricsCardSkeleton />;
  }

  return (
    <div>
      <span>{data.sent ?? 0}</span>
      <span>{data.delivered ?? 0}</span>
    </div>
  );
}
```

2. **Use optional chaining**

```typescript
// ✅ Safe property access
export function CampaignCard({ campaign }: { campaign?: Campaign }) {
  return (
    <div>
      <h3>{campaign?.name ?? 'Unknown Campaign'}</h3>
      <p>Status: {campaign?.status ?? 'Unknown'}</p>
      <p>Metrics: {campaign?.metrics?.sent ?? 0} sent</p>
    </div>
  );
}
```

### Performance Issues

#### Issue: Components re-render excessively

**Symptoms:**

- Slow UI interactions
- High CPU usage in browser
- Components flicker during updates

**Diagnosis:**

```typescript
// Add logging to identify unnecessary re-renders
export function CampaignMetricsCard(props) {
  console.log('CampaignMetricsCard render:', props);

  // Use React DevTools Profiler to identify performance bottlenecks
  return (
    <Profiler id="CampaignMetricsCard" onRender={onRenderCallback}>
      {/* Component content */}
    </Profiler>
  );
}
```

**Solutions:**

1. **Memoize expensive calculations**

```typescript
// ❌ Problem: Expensive calculation on every render
export function MetricsCard({ data }: { data: PerformanceMetrics[] }) {
  const aggregatedMetrics = data.reduce((acc, item) => ({
    sent: acc.sent + item.sent,
    delivered: acc.delivered + item.delivered,
  }), { sent: 0, delivered: 0 });

  return <div>{/* Render aggregated metrics */}</div>;
}

// ✅ Solution: Use useMemo for expensive calculations
export function MetricsCard({ data }: { data: PerformanceMetrics[] }) {
  const aggregatedMetrics = useMemo(() =>
    data.reduce((acc, item) => ({
      sent: acc.sent + item.sent,
      delivered: acc.delivered + item.delivered,
    }), { sent: 0, delivered: 0 })
  , [data]);

  return <div>{/* Render aggregated metrics */}</div>;
}
```

2. **Memoize components**

```typescript
// ✅ Prevent unnecessary re-renders
export const CampaignMetricsCard = React.memo(
  function CampaignMetricsCard({
    campaignIds,
    filters,
  }: CampaignMetricsCardProps) {
    // Component implementation
  },
  (prevProps, nextProps) => {
    // Custom comparison function if needed
    return (
      JSON.stringify(prevProps.campaignIds) ===
        JSON.stringify(nextProps.campaignIds) &&
      JSON.stringify(prevProps.filters) === JSON.stringify(nextProps.filters)
    );
  }
);
```

3. **Optimize context usage**

```typescript
// ❌ Problem: Context causes all consumers to re-render
const AnalyticsContext = createContext({
  filters: {},
  data: {},
  loading: {},
  updateFilters: () => {},
  // ... many other properties
});

// ✅ Solution: Split context by concern
const AnalyticsFiltersContext = createContext({
  filters: {},
  updateFilters: () => {},
});

const AnalyticsDataContext = createContext({
  data: {},
  loading: {},
});
```

#### Issue: Large datasets cause browser freezing

**Symptoms:**

- Browser becomes unresponsive when loading large tables
- Scroll performance is poor
- Memory usage increases significantly

**Solutions:**

1. **Implement virtual scrolling**

```typescript
import { FixedSizeList as List } from 'react-window';

export function LargeAnalyticsTable({ data }: { data: AnalyticsRow[] }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <AnalyticsTableRow data={data[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={data.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </List>
  );
}
```

2. **Implement pagination**

```typescript
export function PaginatedAnalyticsTable({ data }: { data: AnalyticsRow[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  }, [data, currentPage, pageSize]);

  return (
    <div>
      <AnalyticsTable data={paginatedData} />
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(data.length / pageSize)}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
```

### Real-time Update Issues

#### Issue: Convex subscriptions not updating components

**Symptoms:**

- Components don't reflect real-time data changes
- Manual refresh shows updated data
- No error messages in console

**Diagnosis:**

```typescript
// Check if Convex subscription is working
export function DebugConvexSubscription() {
  const data = useQuery(api.analytics.getLiveAnalytics, { companyId: 'test' });

  useEffect(() => {
    console.log('Convex data updated:', data);
  }, [data]);

  return <div>Check console for updates</div>;
}
```

**Solutions:**

1. **Verify Convex provider setup**

```typescript
// ✅ Ensure ConvexProvider wraps your app
export function App() {
  return (
    <ConvexProvider client={convex}>
      <AnalyticsDashboard />
    </ConvexProvider>
  );
}
```

2. **Check query parameters**

```typescript
// ❌ Problem: Query parameters change causing subscription reset
const data = useQuery(api.analytics.getLiveAnalytics, {
  companyId,
  timestamp: Date.now(), // This changes every render!
});

// ✅ Solution: Use stable parameters
const data = useQuery(api.analytics.getLiveAnalytics, {
  companyId, // Only include stable parameters
});
```

3. **Handle subscription errors**

```typescript
export function useRealTimeAnalytics(companyId: string) {
  const data = useQuery(api.analytics.getLiveAnalytics, { companyId });
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (data === undefined) {
      // Check if this is an error state vs loading state
      const timer = setTimeout(() => {
        setError(new Error("Real-time connection timeout"));
      }, 10000); // 10 second timeout

      return () => clearTimeout(timer);
    } else {
      setError(null);
    }
  }, [data]);

  return { data, error };
}
```

### Chart and Visualization Issues

#### Issue: Charts not rendering or displaying incorrectly

**Symptoms:**

- Empty chart containers
- Charts with incorrect data
- Responsive issues on different screen sizes

**Solutions:**

1. **Verify chart data format**

```typescript
// ✅ Ensure data matches chart expectations
export function TimeSeriesChart({ data }: { data: TimeSeriesData[] }) {
  // Validate data format
  const validatedData = useMemo(() => {
    return data.filter(item =>
      item.date &&
      typeof item.value === 'number' &&
      !isNaN(item.value)
    );
  }, [data]);

  if (validatedData.length === 0) {
    return <div>No valid data to display</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={validatedData}>
        {/* Chart configuration */}
      </LineChart>
    </ResponsiveContainer>
  );
}
```

2. **Handle responsive container issues**

```typescript
// ✅ Ensure parent container has dimensions
export function ChartContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-64"> {/* Explicit dimensions */}
      {children}
    </div>
  );
}
```

3. **Debug chart data**

```typescript
export function DebugChart({ data }: { data: any[] }) {
  useEffect(() => {
    console.log('Chart data:', data);
    console.log('Data length:', data.length);
    console.log('Sample item:', data[0]);
  }, [data]);

  return (
    <div>
      <pre>{JSON.stringify(data.slice(0, 3), null, 2)}</pre>
      <YourChart data={data} />
    </div>
  );
}
```

### Filter and State Management Issues

#### Issue: Filters not updating components

**Symptoms:**

- Filter changes don't trigger data refetch
- Components show stale data after filter updates
- URL doesn't sync with filter state

**Solutions:**

1. **Verify filter dependencies in queries**

```typescript
// ✅ Include filters in query key
export function useCampaignMetrics(
  campaignIds: string[],
  filters: AnalyticsFilters
) {
  return useQuery({
    queryKey: ["campaign-metrics", campaignIds, filters],
    queryFn: () => getCampaignMetrics(campaignIds, filters),
    // Query will refetch when filters change
  });
}
```

2. **Implement proper filter state management**

```typescript
// ✅ Use URL state for filters
export function useAnalyticsFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () => ({
      dateRange: searchParams.get("dateRange") || "last30d",
      granularity: searchParams.get("granularity") || "day",
      campaigns: searchParams.get("campaigns")?.split(",") || [],
    }),
    [searchParams]
  );

  const updateFilters = useCallback(
    (newFilters: Partial<AnalyticsFilters>) => {
      const params = new URLSearchParams(searchParams);

      Object.entries(newFilters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          params.set(key, value.join(","));
        } else if (value) {
          params.set(key, String(value));
        } else {
          params.delete(key);
        }
      });

      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  return { filters, updateFilters };
}
```

## Error Debugging Tools

### Analytics Debug Panel

Create a debug panel for development:

```typescript
export function AnalyticsDebugPanel() {
  const { filters, services } = useAnalyticsContext();
  const [debugInfo, setDebugInfo] = useState<any>({});

  const runDiagnostics = async () => {
    const diagnostics = {
      filters,
      timestamp: new Date().toISOString(),
      services: Object.keys(services),
      queryCache: queryClient.getQueryCache().getAll().length,
    };

    // Test each service
    for (const [domain, service] of Object.entries(services)) {
      try {
        const testResult = await service.getPerformanceMetrics?.([], filters);
        diagnostics[`${domain}_test`] = 'success';
        diagnostics[`${domain}_data`] = testResult ? 'has_data' : 'no_data';
      } catch (error) {
        diagnostics[`${domain}_test`] = 'error';
        diagnostics[`${domain}_error`] = error.message;
      }
    }

    setDebugInfo(diagnostics);
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg max-w-md">
      <h3 className="font-bold mb-2">Analytics Debug</h3>
      <button
        onClick={runDiagnostics}
        className="bg-blue-600 px-2 py-1 rounded text-sm mb-2"
      >
        Run Diagnostics
      </button>
      <pre className="text-xs overflow-auto max-h-64">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
}
```

### Query Inspector

Inspect React Query state:

```typescript
export function QueryInspector({ queryKey }: { queryKey: string[] }) {
  const queryClient = useQueryClient();
  const query = queryClient.getQueryState(queryKey);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <details className="border p-2 rounded">
      <summary>Query State: {queryKey.join(' > ')}</summary>
      <pre className="text-xs mt-2 overflow-auto">
        {JSON.stringify({
          status: query?.status,
          fetchStatus: query?.fetchStatus,
          dataUpdatedAt: query?.dataUpdatedAt,
          errorUpdatedAt: query?.errorUpdatedAt,
          error: query?.error?.message,
        }, null, 2)}
      </pre>
    </details>
  );
}
```

## Performance Monitoring

### Component Performance Tracker

```typescript
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return React.memo(function TrackedComponent(props: P) {
    const renderStart = performance.now();

    useEffect(() => {
      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStart;

      if (renderTime > 16) { // Longer than one frame
        console.warn(`Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`);
      }
    });

    return <Component {...props} />;
  });
}

// Usage
export const TrackedCampaignCard = withPerformanceTracking(
  CampaignMetricsCard,
  'CampaignMetricsCard'
);
```

## Best Practices for Troubleshooting

1. **Use TypeScript strictly** - Enable strict mode to catch type issues early
2. **Add comprehensive error boundaries** - Prevent component crashes from affecting the entire app
3. **Implement proper loading states** - Always show loading indicators during async operations
4. **Log strategically** - Add logging for debugging but remove before production
5. **Test with realistic data** - Use production-like data volumes for testing
6. **Monitor performance** - Use React DevTools Profiler to identify bottlenecks
7. **Validate data shapes** - Always validate data from external sources
8. **Handle edge cases** - Test with empty data, error states, and network failures
9. **Use React Query DevTools** - Enable in development for query debugging
10. **Document known issues** - Keep track of common problems and their solutions

This troubleshooting guide should help resolve most common issues encountered when working with analytics components. For persistent issues, consider checking the network requests, Convex function logs, and React DevTools for additional insights.
