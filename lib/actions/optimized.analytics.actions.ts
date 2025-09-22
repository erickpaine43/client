'use server';

// ============================================================================
// OPTIMIZED ANALYTICS ACTIONS - MIGRATED TO STANDARDIZED MODULE
// ============================================================================

// This file has been migrated to the standardized analytics module.
// Please use the new module at: lib/actions/analytics/
//
// Migration notes:
// - Replaced direct ConvexHttpClient usage with ConvexQueryHelper
// - All functions now use standardized ActionResult return types
// - Enhanced authentication and rate limiting
// - Improved error handling and type safety
// - Performance monitoring and caching improvements
// - Removed EmptyObject workarounds

// Import all analytics modules for comprehensive functionality
export * from './analytics/billing-analytics';
export * from './analytics/campaign-analytics';
export * from './analytics/domain-analytics';
export * from './analytics/lead-analytics';
export * from './analytics/mailbox-analytics';
export * from './analytics/template-analytics';
export * from './analytics/cross-domain-analytics';

// Legacy imports for backward compatibility
import type { 
  PerformanceMetrics,
  CalculatedRates,
  TimeSeriesDataPoint,
  AnalyticsFilters as CoreAnalyticsFilters,
  AnalyticsComputeOptions as CoreAnalyticsComputeOptions
} from '@/types/analytics/core';

import type { 
  AnalyticsDomain,
  DateRangePreset 
} from '@/types/analytics/ui';

import { api } from '@/convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';
import { 
  AnalyticsCalculator,
  analyticsCache,
  serverSideComputationService,
  type ComputationResult
} from '@/lib/services/analytics';
import { PerformanceCalculator } from '@/lib/utils/performance-calculator';
import { EmptyObject } from 'react-hook-form';

// Type aliases to maintain backward compatibility
type AnalyticsFilters = CoreAnalyticsFilters & {
  dateRangePreset?: DateRangePreset;
  customDateRange?: {
    start: string;
    end: string;
  };
  // These properties are included for backward compatibility
  start?: string;
  end?: string;
};

type AnalyticsComputeOptions = CoreAnalyticsComputeOptions;

// Helper function to ensure all required PerformanceMetrics fields are present
function ensurePerformanceMetrics(metrics: Partial<PerformanceMetrics>): PerformanceMetrics {
  return {
    sent: 0,
    delivered: 0,
    opened_tracked: 0,
    clicked_tracked: 0,
    replied: 0,
    bounced: 0,
    unsubscribed: 0,
    spamComplaints: 0,
    ...metrics,
  };
}

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || '');

/**
 * Helper function to resolve DateRangePreset to actual date range.
 */
function resolveDateRange(
  preset: DateRangePreset | undefined,
  customRange?: { start: string; end: string }
): { start: string; end: string } {
  // If custom range is provided, use it regardless of preset
  if (customRange) {
    return customRange;
  }

  const end = new Date();
  const start = new Date();

  // If no preset is provided, default to 30 days
  if (!preset) {
    start.setDate(start.getDate() - 30);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  }

  switch (preset) {
    case '7d':
      start.setDate(start.getDate() - 7);
      break;
    case '30d':
      start.setDate(start.getDate() - 30);
      break;
    case '90d':
      start.setDate(start.getDate() - 90);
      break;
    case '1y':
      start.setFullYear(start.getFullYear() - 1);
      break;
    case 'custom':
      // For custom, we should have a customRange, but if not, default to 30d
      start.setDate(start.getDate() - 30);
      break;
    default:
      const _exhaustiveCheck: never = preset;
      return _exhaustiveCheck;
  }

  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

/**
 * Execute heavy analytics computation with all optimizations.
 * Uses server-side computation service with caching, parallel processing, and performance monitoring.
 */
export async function executeHeavyAnalyticsComputation(
  domain: AnalyticsDomain,
  operation: string,
  entityIds: string[] = [],
  filters: AnalyticsFilters,
  computeOptions: AnalyticsComputeOptions = {},
  companyId?: string
): Promise<ComputationResult<{
  aggregatedMetrics: PerformanceMetrics;
  rates: CalculatedRates;
  timeSeriesData?: TimeSeriesDataPoint[];
  performanceBenchmarks?: ReturnType<typeof PerformanceCalculator.calculatePerformanceBenchmarks>;
  comparativeAnalysis?: ReturnType<typeof PerformanceCalculator.calculateComparativePerformance>;
  kpiMetrics?: ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
}>> {
  const effectiveCompanyId = companyId || getCurrentCompanyId();

  return serverSideComputationService.executeHeavyComputation(
    operation,
    domain,
    entityIds,
    filters,
    computeOptions,
    async () => {
      // Execute the actual data fetching and computation
      switch (domain) {
        case "campaigns":
          return await computeCampaignAnalytics(entityIds, filters, computeOptions, effectiveCompanyId);
        case "domains":
          return await computeDomainAnalytics(entityIds, filters, computeOptions, effectiveCompanyId);
        case "mailboxes":
          return await computeMailboxAnalytics(entityIds, filters, computeOptions, effectiveCompanyId);
        case "leads":
          return await computeLeadAnalytics(entityIds, filters, computeOptions, effectiveCompanyId);
        case "templates":
          return await computeTemplateAnalytics(entityIds, filters, computeOptions, effectiveCompanyId);
        case "billing":
          return await computeBillingAnalytics(entityIds, filters, computeOptions, effectiveCompanyId);
        default:
          throw new Error(`Unsupported domain: ${domain}`);
      }
    }
  );
}

/**
 * Execute parallel analytics computations across multiple domains.
 * Optimizes performance by running computations in parallel with intelligent caching.
 */
export async function executeParallelDomainAnalytics(
  domains: AnalyticsDomain[],
  operation: string,
  filters: AnalyticsFilters,
  computeOptions: AnalyticsComputeOptions = {},
  companyId?: string
): Promise<Record<string, ComputationResult<{
  aggregatedMetrics: PerformanceMetrics;
  rates: CalculatedRates;
  kpiMetrics?: ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
}> | null>> {
  const effectiveCompanyId = companyId || getCurrentCompanyId();

  const computations = domains.map(domain => ({
    operation,
    domain,
    filters,
    executor: async () => {
      switch (domain) {
        case "campaigns":
          return await computeCampaignAnalytics([], filters, computeOptions, effectiveCompanyId);
        case "domains":
          return await computeDomainAnalytics([], filters, computeOptions, effectiveCompanyId);
        case "mailboxes":
          return await computeMailboxAnalytics([], filters, computeOptions, effectiveCompanyId);
        case "leads":
          return await computeLeadAnalytics([], filters, computeOptions, effectiveCompanyId);
        case "templates":
          return await computeTemplateAnalytics([], filters, computeOptions, effectiveCompanyId);
        case "billing":
          return await computeBillingAnalytics([], filters, computeOptions, effectiveCompanyId);
        default:
          throw new Error(`Unsupported domain: ${domain}`);
      }
    },
  }));

  return serverSideComputationService.executeParallelComputations(computations);
}

/**
 * Get comprehensive analytics overview with heavy computation optimization.
 * Aggregates data across all domains with intelligent caching and parallel processing.
 */
export async function getOptimizedAnalyticsOverview(
  filters?: AnalyticsFilters,
  computeOptions: AnalyticsComputeOptions = {},
  companyId?: string
): Promise<ComputationResult<{
  overview: {
    totalEmailsSent: number;
    overallOpenRate: number;
    overallClickRate: number;
    overallReplyRate: number;
    overallDeliveryRate: number;
    healthScore: number;
  };
  domainBreakdown: Record<AnalyticsDomain, PerformanceMetrics>;
  timeSeriesData?: TimeSeriesDataPoint[];
  topPerformers: {
    campaigns: Array<{ id: string; name: string; openRate: number }>;
    mailboxes: Array<{ id: string; email: string; healthScore: number }>;
    domains: Array<{ id: string; name: string; reputation: number }>;
  };
}>> {
  const effectiveFilters = filters || createDefaultFilters();
  const effectiveCompanyId = companyId || getCurrentCompanyId();

  return serverSideComputationService.executeHeavyComputation(
    "overview",
    "campaigns", // Use campaigns as primary domain
    [],
    effectiveFilters,
    computeOptions,
    async () => {
      // Execute parallel computations for all domains
      const domainResults = await executeParallelDomainAnalytics(
        ["campaigns", "domains", "mailboxes", "leads", "templates", "billing"],
        "performance",
        effectiveFilters,
        { includePerformanceMetrics: true },
        effectiveCompanyId
      );

      // Aggregate results
      const domainBreakdown: Record<AnalyticsDomain, PerformanceMetrics> = {} as Record<AnalyticsDomain, PerformanceMetrics>;
      const allMetrics: PerformanceMetrics[] = [];

      Object.entries(domainResults).forEach(([key, result]) => {
        if (result && result.data) {
          const domain = key.split(":")[0] as AnalyticsDomain;
          domainBreakdown[domain] = result.data.aggregatedMetrics;
          allMetrics.push(result.data.aggregatedMetrics);
        }
      });

      // Calculate overall metrics
      const overallMetrics = AnalyticsCalculator.aggregateMetrics(allMetrics);
      const overallRates = AnalyticsCalculator.calculateAllRates(overallMetrics);
      const healthScore = AnalyticsCalculator.calculateHealthScore(overallMetrics);

      // Generate time series data if requested
      let timeSeriesData: TimeSeriesDataPoint[] | undefined;
      if (computeOptions.includeTimeSeriesData) {
        timeSeriesData = await generateOverviewTimeSeriesData(effectiveFilters, effectiveCompanyId);
      }

      // Get top performers (mock data for now)
      const topPerformers = {
        campaigns: [
        { id: "campaign1", name: "Welcome Series", openRate: 0.45 },
          { id: "campaign2", name: "Product Launch", openRate: 0.38 },
          { id: "campaign3", name: "Newsletter", openRate: 0.32 },
        ],
        mailboxes: [
          { id: "mailbox1", email: "sales@example.com", healthScore: 95 },
          { id: "mailbox2", email: "support@example.com", healthScore: 88 },
          { id: "mailbox3", email: "marketing@example.com", healthScore: 82 },
        ],
        domains: [
          { id: "domain1", name: "example.com", reputation: 98 },
          { id: "domain2", name: "company.com", reputation: 94 },
          { id: "domain3", name: "business.com", reputation: 89 },
        ],
      };

      return {
        overview: {
          totalEmailsSent: overallMetrics.sent,
          overallOpenRate: overallRates.openRate,
          overallClickRate: overallRates.clickRate,
          overallReplyRate: overallRates.replyRate,
          overallDeliveryRate: overallRates.deliveryRate,
          healthScore,
        },
        domainBreakdown,
        timeSeriesData,
        topPerformers,
      };
    }
  );
}

/**
 * Warm analytics cache for improved performance.
 * Pre-computes common analytics queries and stores them in cache.
 */
export async function warmAnalyticsCache(
  domains?: AnalyticsDomain[],
  operations?: string[]
): Promise<{
  totalWarmed: number;
  successful: number;
  failed: number;
  details: Array<{ domain: AnalyticsDomain; operation: string; success: boolean; duration: number }>;
}> {
  return serverSideComputationService.warmCache(domains, operations);
}

/**
 * Get server-side computation performance statistics.
 * Provides insights into computation performance and cache effectiveness.
 */
export async function getComputationPerformanceStats(): Promise<{
  activeComputations: number;
  queuedComputations: number;
  cacheStats: Awaited<ReturnType<typeof analyticsCache.getStats>>;
  performance: {
    averageComputationTime: number;
    cacheHitRate: number;
    totalComputations: number;
  };
}> {
  const computationStats = serverSideComputationService.getComputationStatistics();
  const cacheStats = await analyticsCache.getStats();

  return {
    activeComputations: computationStats.activeComputations,
    queuedComputations: computationStats.queuedComputations,
    cacheStats,
    performance: computationStats.performance,
  };
}

/**
 * Test server-side computation performance with various data sizes.
 * Useful for performance benchmarking and optimization.
 */
export async function testComputationPerformance(
  testSizes: number[] = [100, 1000, 5000, 10000],
  domain: AnalyticsDomain = "campaigns"
): Promise<Array<{
  dataSize: number;
  computationTime: number;
  cacheTime: number;
  totalTime: number;
  fromCache: boolean;
  performanceGrade: "excellent" | "good" | "fair" | "poor";
}>> {
  const results: Array<{
    dataSize: number;
    computationTime: number;
    cacheTime: number;
    totalTime: number;
    fromCache: boolean;
    performanceGrade: "excellent" | "good" | "fair" | "poor";
  }> = [];

  for (const size of testSizes) {
    const filters = createDefaultFilters();
    
    const result = await serverSideComputationService.executeHeavyComputation(
      `performance-test-${size}`,
      domain,
      [],
      filters,
      {},
      async () => {
        // Simulate computation with varying data sizes
        const mockData: PerformanceMetrics[] = [];
        for (let i = 0; i < size; i++) {
          mockData.push({
            sent: Math.floor(Math.random() * 1000),
            delivered: Math.floor(Math.random() * 900),
            opened_tracked: Math.floor(Math.random() * 300),
            clicked_tracked: Math.floor(Math.random() * 50),
            replied: Math.floor(Math.random() * 20),
            bounced: Math.floor(Math.random() * 100),
            unsubscribed: Math.floor(Math.random() * 10),
            spamComplaints: Math.floor(Math.random() * 5),
          });
        }
        
        // Simulate processing time proportional to data size
        await new Promise(resolve => setTimeout(resolve, Math.log(size) * 10));
        
        return AnalyticsCalculator.aggregateMetrics(mockData);
      }
    );

    // Determine performance grade based on computation time
    let performanceGrade: "excellent" | "good" | "fair" | "poor";
    if (result.performance.computationTime < 100) performanceGrade = "excellent";
    else if (result.performance.computationTime < 500) performanceGrade = "good";
    else if (result.performance.computationTime < 2000) performanceGrade = "fair";
    else performanceGrade = "poor";

    results.push({
      dataSize: size,
      computationTime: result.performance.computationTime,
      cacheTime: result.performance.cacheTime,
      totalTime: result.performance.totalDuration,
      fromCache: result.performance.fromCache,
      performanceGrade,
    });
  }

  return results;
}

// ============================================================================
// DOMAIN-SPECIFIC COMPUTATION FUNCTIONS
// ============================================================================

/**
 * Compute campaign analytics with standardized metrics.
 */
async function computeCampaignAnalytics(
  campaignIds: string[],
  filters: AnalyticsFilters,
  computeOptions: AnalyticsComputeOptions,
  companyId: string
): Promise<{
  aggregatedMetrics: PerformanceMetrics;
  rates: CalculatedRates;
  timeSeriesData?: TimeSeriesDataPoint[];
  performanceBenchmarks?: ReturnType<typeof PerformanceCalculator.calculatePerformanceBenchmarks>;
  comparativeAnalysis?: ReturnType<typeof PerformanceCalculator.calculateComparativePerformance>;
  kpiMetrics?: ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
}> {
  // Query campaign data from Convex
  // Use broad casts to avoid Convex deep type instantiation at call-site
  const campaignDataResponse = await convex.query(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Convex generated type for this function can cause deep instantiation
    api.campaignAnalytics.getCampaignAnalytics,
    {
      campaignIds: campaignIds.length > 0 ? campaignIds : undefined,
      dateRange: filters.dateRange,
      companyId,
    } as unknown as EmptyObject
  );
  
  // Extract results as unknown[] to avoid tight coupling to Convex types
  const rawResults = 'results' in campaignDataResponse 
    ? campaignDataResponse.results 
    : [];
  const campaignItems: unknown[] = Array.isArray(rawResults) ? (rawResults as unknown[]) : [];

  // Optionally validate after mapping to PerformanceMetrics below if needed

  // Define the expected campaign analytics record type (camelCase fields from Convex API)
  type CampaignAnalyticsRecord = {
    sent?: number;
    delivered?: number;
    openedTracked?: number;
    clickedTracked?: number;
    replied?: number;
    bounced?: number;
    spamComplaints?: number;
    unsubscribed?: number;
    [key: string]: unknown; // Allow additional properties
  };

  // Type guard to check if data matches the expected structure
  const isCampaignAnalyticsRecord = (data: unknown): data is CampaignAnalyticsRecord => {
    return typeof data === 'object' && data !== null;
  };

  // Convert campaign data to PerformanceMetrics array with proper type checking
  const metricsArray: PerformanceMetrics[] = campaignItems.map((campaign) => {
    if (!isCampaignAnalyticsRecord(campaign)) {
      console.warn('Invalid campaign data format:', campaign);
      return ensurePerformanceMetrics({});
    }
    
    // Map the campaign data (camelCase) to PerformanceMetrics (snake case for tracked fields)
    return ensurePerformanceMetrics({
      sent: (campaign.sent as number | undefined) || 0,
      delivered: (campaign.delivered as number | undefined) || 0,
      opened_tracked: (campaign.openedTracked as number | undefined) || 0,
      clicked_tracked: (campaign.clickedTracked as number | undefined) || 0,
      replied: (campaign.replied as number | undefined) || 0,
      bounced: (campaign.bounced as number | undefined) || 0,
      spamComplaints: (campaign.spamComplaints as number | undefined) || 0,
      unsubscribed: (campaign.unsubscribed as number | undefined) || 0,
    });
  });

  // Initialize with default values if no data
  const defaultMetrics = ensurePerformanceMetrics({});

  // Calculate aggregated metrics
  const aggregatedMetrics = metricsArray.length > 0 
    ? AnalyticsCalculator.aggregateMetrics(metricsArray)
    : defaultMetrics;

  // Calculate rates
  const rates = AnalyticsCalculator.calculateAllRates(aggregatedMetrics);

  // Generate time series data if requested
  let timeSeriesData: TimeSeriesDataPoint[] | undefined;
  if (computeOptions.includeTimeSeriesData && filters.dateRange) {
    timeSeriesData = await generateCampaignTimeSeriesData(
      campaignIds, 
      { 
        ...filters,
        dateRange: {
          start: filters.dateRange.start,
          end: filters.dateRange.end
        }
      }, 
      companyId
    );
  }

  // Calculate performance benchmarks if requested
  let performanceBenchmarks;
  if (computeOptions.includePerformanceMetrics) {
    performanceBenchmarks = PerformanceCalculator.calculatePerformanceBenchmarks(
      aggregatedMetrics
    );
  }

  // Calculate comparative analysis if requested
  let comparativeAnalysis;
  if (computeOptions.includeComparativeData && metricsArray.length > 1) {
    const firstHalf = metricsArray.slice(0, Math.floor(metricsArray.length / 2));
    const secondHalf = metricsArray.slice(Math.floor(metricsArray.length / 2));
    const firstHalfAggregated = firstHalf.length > 0 
      ? AnalyticsCalculator.aggregateMetrics(firstHalf) 
      : ensurePerformanceMetrics({});
    const secondHalfAggregated = secondHalf.length > 0 
      ? AnalyticsCalculator.aggregateMetrics(secondHalf) 
      : ensurePerformanceMetrics({});
      
    comparativeAnalysis = PerformanceCalculator.calculateComparativePerformance(
      secondHalfAggregated,
      firstHalfAggregated
    );
  }

  // Build and return the result object
  return {
    aggregatedMetrics,
    rates,
    ...(timeSeriesData && { timeSeriesData }),
    ...(performanceBenchmarks && { performanceBenchmarks }),
    ...(comparativeAnalysis && { comparativeAnalysis }),
    kpiMetrics: rates
  };
}

/**
 * Compute domain analytics with standardized metrics.
 */
async function computeDomainAnalytics(
  domainIds: string[],
  filters: AnalyticsFilters,
  computeOptions: AnalyticsComputeOptions,
  companyId: string
): Promise<{
  aggregatedMetrics: PerformanceMetrics;
  rates: CalculatedRates;
  timeSeriesData?: TimeSeriesDataPoint[];
  performanceBenchmarks?: ReturnType<typeof PerformanceCalculator.calculatePerformanceBenchmarks>;
  kpiMetrics?: ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
}> {
  // Convert DateRangePreset to actual date range
  const dateRange = resolveDateRange(
    filters.dateRangePreset as DateRangePreset | undefined, 
    filters.customDateRange
  );

  // Query domain data from Convex
  const domainData = await convex.query(
    api.domainAnalytics.getDomainAggregatedAnalytics,
    {
      domainIds: domainIds.length > 0 ? domainIds : undefined,
      dateRange: {
        start: dateRange.start,
        end: dateRange.end
      },
      companyId,
    }
  );

  // Define the expected domain analytics record type
  type DomainAnalyticsRecord = {
    sent?: number;
    delivered?: number;
    opened_tracked?: number;
    clicked_tracked?: number;
    replied?: number;
    bounced?: number;
    spamComplaints?: number;
    unsubscribed?: number;
    [key: string]: unknown; // Allow additional properties
  };

  // Type guard for domain analytics records
  const isDomainAnalyticsRecord = (data: unknown): data is DomainAnalyticsRecord => {
    return typeof data === 'object' && data !== null;
  };

  // Convert domain data to PerformanceMetrics array with proper type checking
  const metricsArray: PerformanceMetrics[] = domainData.map(domain => {
    if (!isDomainAnalyticsRecord(domain)) {
      console.warn('Invalid domain data format:', domain);
      return ensurePerformanceMetrics({});
    }
    
    return ensurePerformanceMetrics({
      sent: domain.sent || 0,
      delivered: domain.delivered || 0,
      opened_tracked: domain.opened_tracked || 0,
      clicked_tracked: domain.clicked_tracked || 0,
      replied: domain.replied || 0,
      bounced: domain.bounced || 0,
      spamComplaints: domain.spamComplaints || 0,
      unsubscribed: domain.unsubscribed || 0,
    });
  });

  // Initialize with default values if no data
  const defaultMetrics = ensurePerformanceMetrics({});

  // Calculate aggregated metrics
  const aggregatedMetrics = metricsArray.length > 0 
    ? AnalyticsCalculator.aggregateMetrics(metricsArray)
    : defaultMetrics;

  // Calculate rates
  const rates = AnalyticsCalculator.calculateAllRates(aggregatedMetrics);

  // Generate time series data if requested
  let timeSeriesData: TimeSeriesDataPoint[] | undefined;
  if (computeOptions.includeTimeSeriesData) {
    timeSeriesData = []; // TODO: Implement time series data generation for domains
  }

  // Calculate performance benchmarks if requested
  let performanceBenchmarks;
  if (computeOptions.includePerformanceMetrics) {
    performanceBenchmarks = PerformanceCalculator.calculatePerformanceBenchmarks(
      aggregatedMetrics
    );
  }
  // Build and return the result object
  return {
    aggregatedMetrics,
    rates,
    ...(timeSeriesData && { timeSeriesData }),
    ...(performanceBenchmarks && { performanceBenchmarks }),
    kpiMetrics: rates
  };
}

/**
 * Compute mailbox analytics with standardized metrics.
 */
async function computeMailboxAnalytics(
  _mailboxIds: string[],
  _filters: AnalyticsFilters,
  _computeOptions: AnalyticsComputeOptions,
  _companyId: string
): Promise<{
  aggregatedMetrics: PerformanceMetrics;
  rates: CalculatedRates;
  kpiMetrics?: ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
}> {
  const aggregatedMetrics = ensurePerformanceMetrics({});
  const rates = AnalyticsCalculator.calculateAllRates(aggregatedMetrics);
  return { aggregatedMetrics, rates, kpiMetrics: rates };
}

/**
 * Compute lead analytics with standardized metrics.
 */
async function computeLeadAnalytics(
  _leadIds: string[],
  _filters: AnalyticsFilters,
  _computeOptions: AnalyticsComputeOptions,
  _companyId: string
): Promise<{
  aggregatedMetrics: PerformanceMetrics;
  rates: CalculatedRates;
  kpiMetrics?: ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
}> {
  const aggregatedMetrics = ensurePerformanceMetrics({});
  const rates = AnalyticsCalculator.calculateAllRates(aggregatedMetrics);
  return { aggregatedMetrics, rates, kpiMetrics: rates };
}

/**
 * Compute template analytics with standardized metrics.
 */
async function computeTemplateAnalytics(
  _templateIds: string[],
  _filters: AnalyticsFilters,
  _computeOptions: AnalyticsComputeOptions,
  _companyId: string
): Promise<{
  aggregatedMetrics: PerformanceMetrics;
  rates: CalculatedRates;
  kpiMetrics?: ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
}> {
  const aggregatedMetrics = ensurePerformanceMetrics({});
  const rates = AnalyticsCalculator.calculateAllRates(aggregatedMetrics);
  return { aggregatedMetrics, rates, kpiMetrics: rates };
}

/**
 * Compute billing analytics with standardized metrics.
 */
async function computeBillingAnalytics(
  _entityIds: string[],
  _filters: AnalyticsFilters,
  _computeOptions: AnalyticsComputeOptions,
  _companyId: string
): Promise<{
  aggregatedMetrics: PerformanceMetrics;
  rates: CalculatedRates;
  kpiMetrics?: ReturnType<typeof AnalyticsCalculator.calculateAllRates>;
}> {
  const aggregatedMetrics = ensurePerformanceMetrics({});
  const rates = AnalyticsCalculator.calculateAllRates(aggregatedMetrics);
  return { aggregatedMetrics, rates, kpiMetrics: rates };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate campaign time series data.
 */
async function generateCampaignTimeSeriesData(
  _campaignIds: string[],
  _filters: AnalyticsFilters,
  _companyId: string
): Promise<TimeSeriesDataPoint[]> {
  // This would typically query time series data from Convex
  // For now, return mock data
  const data: TimeSeriesDataPoint[] = [];
  const dr = _filters.dateRange;
  if (!dr) {
    return data;
  }
  const start = new Date(dr.start);
  const end = new Date(dr.end);
  
  const current = new Date(start);
  while (current <= end) {
    data.push({
      date: current.toISOString().split("T")[0],
      label: current.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      metrics: {
        sent: Math.floor(Math.random() * 100) + 50,
        delivered: Math.floor(Math.random() * 90) + 45,
        opened_tracked: Math.floor(Math.random() * 30) + 15,
        clicked_tracked: Math.floor(Math.random() * 10) + 5,
        replied: Math.floor(Math.random() * 5) + 2,
        bounced: Math.floor(Math.random() * 10) + 2,
        unsubscribed: Math.floor(Math.random() * 2),
        spamComplaints: Math.floor(Math.random() * 1),
      },
    });
    
    current.setDate(current.getDate() + 1);
  }
  
  return data;
}

/**
 * Generate overview time series data.
 */
async function generateOverviewTimeSeriesData(
  filters: AnalyticsFilters,
  companyId: string
): Promise<TimeSeriesDataPoint[]> {
  // Aggregate time series data across all domains
  return generateCampaignTimeSeriesData([], filters, companyId);
}

/**
 * Create default analytics filters.
 */
function createDefaultFilters(): AnalyticsFilters {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);

  const startDate = start.toISOString().split("T")[0];
  const endDate = end.toISOString().split("T")[0];

  return {
    dateRange: {
      start: startDate,
      end: endDate,
    },
    dateRangePreset: '30d',
    customDateRange: {
      start: startDate,
      end: endDate,
    },
    entityIds: [],
    domainIds: [],
    mailboxIds: [],
    additionalFilters: {},
    granularity: 'day' as const,
  };
}

/**
 * Get current company ID from context/session.
 */
function getCurrentCompanyId(): string {
  return process.env.DEFAULT_COMPANY_ID || "default-company";
}
