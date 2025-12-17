# Analytics Components

## Overview

This directory contains all React components related to analytics functionality, organized by feature and responsibility. The components follow a domain-driven architecture that separates concerns by analytics domain (campaigns, domains, mailboxes, leads, templates, billing) while maintaining consistent patterns and reusable utilities.

## Architecture

### Component Organization

```
components/analytics/
├── README.md                    # This file
├── troubleshooting.md          # Component-specific troubleshooting guide
├── AnalyticsProviderClient.tsx # Main analytics context provider
├── ConvexProvider.tsx          # Convex integration provider
├── actions/                    # Server action components
├── cards/                      # Analytics card components
├── charts/                     # Chart and visualization components
├── components/                 # Shared analytics components
├── config/                     # Configuration and constants
├── dashboard/                  # Dashboard-specific components
├── examples/                   # Example implementations
├── filters/                    # Filter and control components
├── hooks/                      # Analytics-specific hooks
├── monitoring/                 # Performance monitoring components
├── nav/                        # Navigation components
├── overview/                   # Overview and summary components
├── summary/                    # Summary components
├── utils/                      # Utility functions and helpers
└── warmup/                     # Warmup-specific components
```

### Domain-Specific Components

Each analytics domain has its own set of components organized by functionality:

#### Campaign Analytics Components

- **CampaignMetricsCard**: Displays campaign performance metrics
- **CampaignTimeSeriesChart**: Shows campaign performance over time
- **SequenceAnalyticsView**: Visualizes email sequence performance
- **CampaignComparisonTable**: Compares multiple campaigns

#### Domain Analytics Components

- **DomainHealthCard**: Shows domain reputation and health scores
- **ReputationTrendChart**: Displays domain reputation trends
- **AuthenticationStatusGrid**: Shows DNS authentication status
- **DeliverabilityMetricsPanel**: Domain deliverability insights

#### Mailbox Analytics Components

- **MailboxPerformanceGrid**: Grid view of mailbox performance
- **WarmupProgressCard**: Mailbox warmup status and progress
- **HealthScoreIndicator**: Visual health score representation
- **SendingCapacityChart**: Mailbox sending capacity visualization

#### Template Analytics Components

- **TemplatePerformanceTable**: Template effectiveness metrics
- **UsageAnalyticsChart**: Template usage patterns
- **EffectivenessComparison**: A/B testing results (future)

#### Lead Analytics Components

- **LeadEngagementChart**: Lead interaction patterns
- **ConversionFunnelView**: Lead conversion visualization
- **SegmentationAnalytics**: Lead segmentation insights

#### Billing Analytics Components

- **UsageMetricsCard**: Current usage vs limits
- **CostAnalyticsChart**: Cost breakdown and trends
- **PlanUtilizationView**: Plan feature utilization

## Core Components

### AnalyticsProviderClient

The main context provider that manages analytics state and provides services to child components.

```typescript
interface AnalyticsContextState {
  // UI State Management
  filters: AnalyticsFilters;
  loading: Record<AnalyticsDomain, boolean>;
  errors: Record<AnalyticsDomain, string | null>;

  // Filter Management
  updateFilters: (filters: Partial<AnalyticsFilters>) => void;
  resetFilters: () => void;

  // Service Access
  services: AnalyticsService;

  // Cross-domain coordination
  refreshAll: () => Promise<void>;
  refreshDomain: (domain: AnalyticsDomain) => Promise<void>;
}
```

**Usage Example**:

```typescript
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProviderClient';

export function AnalyticsDashboard() {
  return (
    <AnalyticsProvider>
      <div className="analytics-dashboard">
        <AnalyticsFilters />
        <AnalyticsOverview />
        <DomainSpecificComponents />
      </div>
    </AnalyticsProvider>
  );
}
```

### ConvexProvider

Provides Convex client integration for real-time analytics updates.

```typescript
export function ConvexProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConvexReactClient client={convexClient}>
      {children}
    </ConvexReactClient>
  );
}
```

## Component Patterns

### Data Loading Pattern

All analytics components follow a consistent data loading pattern:

```typescript
export function CampaignMetricsCard({ campaignIds }: { campaignIds?: string[] }) {
  const { services, filters } = useAnalyticsContext();

  // Use React Query for data fetching with proper caching
  const { data, isLoading, error } = useQuery({
    queryKey: ['campaign-metrics', campaignIds, filters],
    queryFn: () => services.campaigns.getPerformanceMetrics(campaignIds, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  if (isLoading) {
    return <MetricsCardSkeleton />;
  }

  if (error) {
    return <ErrorCard error={error} onRetry={() => refetch()} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <MetricsGrid metrics={data} />
      </CardContent>
    </Card>
  );
}
```

### Error Handling Pattern

Components implement consistent error handling with graceful degradation:

```typescript
export function ErrorCard({
  error,
  onRetry,
  fallbackData
}: {
  error: Error;
  onRetry?: () => void;
  fallbackData?: any;
}) {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Unable to load data</span>
        </div>

        <p className="mt-2 text-sm text-red-600">
          {error.message || 'An unexpected error occurred'}
        </p>

        <div className="mt-4 flex space-x-2">
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          )}

          {fallbackData && (
            <Button variant="ghost" size="sm" onClick={() => showFallbackData()}>
              Show cached data
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Loading State Pattern

Consistent loading states across all components:

```typescript
export function MetricsCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

## Shared Components

### AnalyticsFilters

Centralized filter component used across all analytics views:

```typescript
export function AnalyticsFilters() {
  const { filters, updateFilters } = useAnalyticsContext();

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
      <DateRangeFilter
        value={filters.dateRange}
        onChange={(dateRange) => updateFilters({ dateRange })}
      />

      <GranularityFilter
        value={filters.granularity}
        onChange={(granularity) => updateFilters({ granularity })}
      />

      <DomainFilter
        value={filters.domains}
        onChange={(domains) => updateFilters({ domains })}
      />

      <CampaignFilter
        value={filters.campaigns}
        onChange={(campaigns) => updateFilters({ campaigns })}
      />
    </div>
  );
}
```

### MetricsGrid

Reusable metrics display component:

```typescript
interface MetricsGridProps {
  metrics: PerformanceMetrics;
  showRates?: boolean;
  className?: string;
}

export function MetricsGrid({ metrics, showRates = true, className }: MetricsGridProps) {
  const metricItems = [
    { label: 'Sent', value: metrics.sent, format: 'number' },
    { label: 'Delivered', value: metrics.delivered, format: 'number' },
    { label: 'Opened', value: metrics.opened, format: 'number' },
    { label: 'Clicked', value: metrics.clicked, format: 'number' },
  ];

  if (showRates) {
    metricItems.push(
      { label: 'Open Rate', value: metrics.openRate, format: 'percentage' },
      { label: 'Click Rate', value: metrics.clickRate, format: 'percentage' }
    );
  }

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", className)}>
      {metricItems.map((item) => (
        <div key={item.label} className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {formatMetricValue(item.value, item.format)}
          </div>
          <div className="text-sm text-gray-500">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
```

### TimeSeriesChart

Reusable chart component for time series data:

```typescript
interface TimeSeriesChartProps {
  data: TimeSeriesData[];
  metrics: string[];
  height?: number;
  showLegend?: boolean;
}

export function TimeSeriesChart({
  data,
  metrics,
  height = 300,
  showLegend = true
}: TimeSeriesChartProps) {
  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => formatDate(date)}
          />
          <YAxis />
          <Tooltip
            labelFormatter={(date) => formatDate(date)}
            formatter={(value, name) => [formatMetricValue(value), name]}
          />
          {showLegend && <Legend />}

          {metrics.map((metric, index) => (
            <Line
              key={metric}
              type="monotone"
              dataKey={metric}
              stroke={CHART_COLORS[index % CHART_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

## Hooks

### useAnalyticsContext

Primary hook for accessing analytics context:

```typescript
export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext);

  if (!context) {
    throw new Error(
      "useAnalyticsContext must be used within AnalyticsProvider"
    );
  }

  return context;
}
```

### useAnalyticsQuery

Custom hook for analytics data fetching with consistent patterns:

```typescript
export function useAnalyticsQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
    refetchInterval?: number;
  }
) {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes default
    cacheTime: options?.cacheTime ?? 10 * 60 * 1000, // 10 minutes default
    refetchInterval: options?.refetchInterval,
    enabled: options?.enabled,
    retry: (failureCount, error) => {
      // Don't retry auth errors
      if (error?.message?.includes("auth")) return false;
      return failureCount < 3;
    },
  });
}
```

### useRealTimeAnalytics

Hook for real-time analytics updates using Convex subscriptions:

```typescript
export function useRealTimeAnalytics(companyId: string) {
  // Convex subscription for real-time updates
  const liveData = useQuery(api.analytics.getLiveAnalytics, {
    companyId,
  });

  // Track when data was last updated
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    if (liveData) {
      setLastUpdate(new Date());
    }
  }, [liveData]);

  return {
    data: liveData,
    lastUpdate,
    isLive: !!liveData,
  };
}
```

## Styling and Theming

### CSS Classes

Components use Tailwind CSS with consistent class patterns:

```typescript
// Standard card styling
const cardClasses = "bg-white rounded-lg border border-gray-200 shadow-sm";

// Metric value styling
const metricValueClasses = "text-2xl font-bold text-gray-900";

// Error state styling
const errorClasses = "border-red-200 bg-red-50 text-red-600";

// Loading state styling
const skeletonClasses = "bg-gray-200 rounded animate-pulse";
```

### Theme Integration

Components support light/dark theme switching:

```typescript
export function MetricsCard({ className, ...props }: MetricsCardProps) {
  return (
    <Card className={cn(
      "bg-white dark:bg-gray-800",
      "border-gray-200 dark:border-gray-700",
      "text-gray-900 dark:text-gray-100",
      className
    )}>
      {/* Card content */}
    </Card>
  );
}
```

## Performance Considerations

### Memoization

Components use React.memo and useMemo for performance optimization:

```typescript
export const CampaignMetricsCard = React.memo(function CampaignMetricsCard({
  campaignIds,
  filters,
}: CampaignMetricsCardProps) {
  const memoizedFilters = useMemo(
    () => ({
      ...filters,
      campaignIds,
    }),
    [filters, campaignIds]
  );

  // Component implementation
});
```

### Lazy Loading

Large components are lazy loaded to improve initial page load:

```typescript
const LazyAnalyticsChart = lazy(() => import('./charts/AnalyticsChart'));

export function AnalyticsDashboard() {
  return (
    <div>
      <Suspense fallback={<ChartSkeleton />}>
        <LazyAnalyticsChart />
      </Suspense>
    </div>
  );
}
```

### Virtual Scrolling

Large data tables use virtual scrolling for performance:

```typescript
import { FixedSizeList as List } from 'react-window';

export function LargeAnalyticsTable({ data }: { data: any[] }) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <AnalyticsTableRow data={data[index]} />
    </div>
  );

  return (
    <List
      height={400}
      itemCount={data.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </List>
  );
}
```

## Testing

### Component Testing

Components include comprehensive tests:

```typescript
// __tests__/CampaignMetricsCard.test.tsx
import { render, screen } from '@testing-library/react';
import { CampaignMetricsCard } from '../cards/CampaignMetricsCard';
import { AnalyticsProvider } from '../AnalyticsProviderClient';

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <AnalyticsProvider>
      {component}
    </AnalyticsProvider>
  );
};

describe('CampaignMetricsCard', () => {
  it('displays campaign metrics correctly', () => {
    const mockData = {
      sent: 1000,
      delivered: 950,
      opened: 300,
      clicked: 50
    };

    renderWithProvider(<CampaignMetricsCard data={mockData} />);

    expect(screen.getByText('1,000')).toBeInTheDocument();
    expect(screen.getByText('950')).toBeInTheDocument();
    expect(screen.getByText('300')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    renderWithProvider(<CampaignMetricsCard loading />);

    expect(screen.getByTestId('metrics-skeleton')).toBeInTheDocument();
  });

  it('handles error state', () => {
    const error = new Error('Failed to load metrics');

    renderWithProvider(<CampaignMetricsCard error={error} />);

    expect(screen.getByText('Unable to load data')).toBeInTheDocument();
    expect(screen.getByText('Failed to load metrics')).toBeInTheDocument();
  });
});
```

## Best Practices

1. **Consistent Patterns**: All components follow the same data loading, error handling, and loading state patterns

2. **Type Safety**: Use proper TypeScript interfaces for all props and data structures

3. **Performance**: Implement memoization, lazy loading, and virtual scrolling where appropriate

4. **Accessibility**: Include proper ARIA labels, keyboard navigation, and screen reader support

5. **Error Handling**: Provide graceful error states with retry mechanisms and fallback data

6. **Testing**: Write comprehensive tests for all components including edge cases

7. **Documentation**: Document component props, usage examples, and integration patterns

8. **Reusability**: Create shared components and hooks to avoid duplication

9. **Responsive Design**: Ensure components work well on all screen sizes

10. **Real-time Updates**: Leverage Convex subscriptions for live data updates where appropriate

This component architecture provides a solid foundation for building scalable, maintainable analytics interfaces while ensuring consistent user experience across all analytics domains.
