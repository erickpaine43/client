/**
 * Campaign Analytics Actions
 * 
 * Analytics-specific actions for campaigns, separate from the main
 * analytics module to avoid circular dependencies.
 */

'use server';

import { Campaign } from '@/types';
import { withSecurity, SecurityConfigs } from '../core/auth';
import { ActionResult, ActionContext } from '../core/types';
import { ErrorFactory, createActionResult } from '../core/errors';
import { validateNumber } from '../core/validation';
import type { CampaignTimeSeriesPoint } from './types';

/**
 * Get campaign analytics time series data
 * 
 * @deprecated Use the standardized analytics module instead:
 * import { getCampaignTimeSeries } from '@/lib/actions/analytics/campaign-analytics'
 */
export async function getCampaignAnalytics(
  campaigns: Partial<Campaign>[],
  days: number
): Promise<ActionResult<{ ChartData: CampaignTimeSeriesPoint[] }>> {
  return withSecurity(
    'get_campaign_analytics',
    SecurityConfigs.COMPANY_READ,
    async (context: ActionContext) => {
      // Ensure company context exists
      if (!context.companyId) {
        return ErrorFactory.unauthorized('Company context required');
      }

      // Validate days parameter
      const daysValidation = validateNumber(days, 'days', { min: 1, max: 365 });
      if (!daysValidation.isValid && daysValidation.errors) {
        const firstError = daysValidation.errors[0];
        return ErrorFactory.validation(firstError.message, firstError.field, firstError.code);
      }

      // TODO: Migrate to CampaignAnalyticsService.getTimeSeriesData()
      
      // Generate mock data with standardized field names
      const chartData: CampaignTimeSeriesPoint[] = [];
      const today = new Date();

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        const sent = Math.floor(Math.random() * 150) + 20;
        const delivered = Math.floor(sent * (0.95 + Math.random() * 0.04)); // 95-99% delivery
        const opened_tracked = Math.floor(delivered * (0.25 + Math.random() * 0.4)); // 25-65% open rate
        const clicked_tracked = Math.floor(delivered * (0.15 + Math.random() * 0.3)); // 15-45% click rate
        const replied = Math.floor(delivered * (0.1 + Math.random() * 0.2)); // 10-30% reply rate
        const bounced = sent - delivered;

        chartData.push({
          date: date.toISOString().split("T")[0],
          formattedDate: date.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
          }),
          sent,
          delivered,
          opened_tracked,
          clicked_tracked,
          replied,
          bounced,
          // Legacy fields for backward compatibility
          opened: opened_tracked,
          clicked: clicked_tracked,
        });
      }

      return createActionResult({ ChartData: chartData });
    }
  );
}

/**
 * Get campaign performance summary
 */
export async function getCampaignPerformanceSummary(
  _campaignIds?: string[]
): Promise<ActionResult<{
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalReplied: number;
  averageOpenRate: number;
  averageClickRate: number;
  averageReplyRate: number;
}>> {
  return withSecurity(
    'get_campaign_performance_summary',
    SecurityConfigs.COMPANY_READ,
    async (context: ActionContext) => {
      // Ensure company context exists
      if (!context.companyId) {
        return ErrorFactory.unauthorized('Company context required');
      }

      // In a real implementation, this would aggregate data from the database
      // For now, generate mock summary data
      const totalSent = Math.floor(Math.random() * 10000) + 1000;
      const totalDelivered = Math.floor(totalSent * 0.97);
      const totalOpened = Math.floor(totalDelivered * 0.35);
      const totalClicked = Math.floor(totalDelivered * 0.08);
      const totalReplied = Math.floor(totalDelivered * 0.05);

      const averageOpenRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
      const averageClickRate = totalDelivered > 0 ? (totalClicked / totalDelivered) * 100 : 0;
      const averageReplyRate = totalDelivered > 0 ? (totalReplied / totalDelivered) * 100 : 0;

      return createActionResult({
        totalSent,
        totalDelivered,
        totalOpened,
        totalClicked,
        totalReplied,
        averageOpenRate,
        averageClickRate,
        averageReplyRate,
      });
    }
  );
}
