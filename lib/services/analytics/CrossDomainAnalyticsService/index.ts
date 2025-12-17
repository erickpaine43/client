// Barrel exports for CrossDomainAnalyticsService

// Types
export type {
  CrossDomainAnalyticsResult,
  CrossDomainTimeSeriesDataPoint,
  MailboxDomainImpactAnalysis,
} from "./types";

// Validation
export {
  validateCrossDomainFilters,
  validateDomainMailboxIds,
} from "./validation";

// Calculations
export {
  calculateMailboxDomainCorrelation,
  generateCorrelationInsights,
  aggregateMailboxMetricsForDomain,
  calculateDomainHealthScore,
} from "./calculations";

// Queries
export {
  performMailboxDomainJoinedAnalyticsQuery,
  performCrossDomainTimeSeriesDataQuery,
  performMailboxDomainImpactAnalysisQuery,
  performFilteredCrossDomainAnalyticsQuery,
  performCrossDomainCorrelationInsightsQuery,
} from "./queries";

// Mutations
export {
  performUpdateCrossDomainAnalyticsMutation,
} from "./mutations";

// Service class
import { BaseAnalyticsService } from "../BaseAnalyticsService";

export class CrossDomainAnalyticsService extends BaseAnalyticsService {
  constructor() {
    super("crossDomain");
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Simple health check - just return true for now
      return true;
    } catch (error) {
      console.error('CrossDomainAnalyticsService health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const crossDomainAnalyticsService = new CrossDomainAnalyticsService();
