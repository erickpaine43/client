'use server';

import { campaignLeads, campaignsData, sequenceSteps, mockedCampaigns } from '@/lib/data/campaigns';
import { Campaign, CampaignDisplay } from '@/types';
import { withSecurity, SecurityConfigs } from './core/auth-middleware';
import { ActionResult, ActionContext } from './core/types';
import { ErrorFactory } from './core/errors';

export async function getCampaignLeads(): Promise<ActionResult<typeof campaignLeads>> {
  return withSecurity(
    'get_campaign_leads',
    SecurityConfigs.COMPANY_READ,
    async (context: ActionContext) => {
      // Ensure company context exists
      if (!context.companyId) {
        return ErrorFactory.unauthorized('Company context required');
      }

      // In a real implementation, this would fetch from a database filtered by company
      // For now, return the static mock data
      return {
        success: true,
        data: campaignLeads,
      };
    }
  );
}

export async function getCampaign(campaignId: string): Promise<ActionResult<CampaignDisplay | null>> {
  return withSecurity(
    'get_campaign',
    SecurityConfigs.COMPANY_READ,
    async (context: ActionContext) => {
      // Ensure company context exists
      if (!context.companyId) {
        return ErrorFactory.unauthorized('Company context required');
      }

      // Validate campaign ID
      if (!campaignId || typeof campaignId !== 'string') {
        return ErrorFactory.validation('Valid campaign ID is required', 'campaignId');
      }

      // In a real implementation, this would fetch from a database with company isolation
      // For now, return the matching campaign from mock data
      const campaign = campaignsData.find(campaign => campaign.id === parseInt(campaignId)) || null;
      
      return {
        success: true,
        data: campaign,
      };
    }
  );
}

export async function getUserCampaignsAction(_userId?: string, _companyId?: string): Promise<ActionResult<typeof campaignsData>> {
  return withSecurity(
    'get_user_campaigns',
    SecurityConfigs.COMPANY_READ,
    async (context: ActionContext) => {
      // Ensure company context exists
      if (!context.companyId) {
        return ErrorFactory.unauthorized('Company context required');
      }

      // Use context values instead of parameters for security
      const effectiveUserId = context.userId;
      const effectiveCompanyId = context.companyId;
      
      console.log("Fetching campaigns for user/company:", effectiveUserId, effectiveCompanyId);
      
      // In a real implementation, this would fetch campaigns for the user/company with proper isolation
      // For now, return the static campaigns data
      return {
        success: true,
        data: campaignsData,
      };
    }
  );
}

// DEPRECATED: Use CampaignAnalyticsService.getTimeSeriesData() instead
export async function getCampaignAnalyticsAction(campaigns: Partial<Campaign>[], days: number) {
  console.log("DEPRECATED: Use CampaignAnalyticsService.getTimeSeriesData() instead:", campaigns, days);
  // CLEANED UP: This function generates mock data with old field names
  // Use CampaignAnalyticsService for standardized analytics
  const chartData = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const sent = Math.floor(Math.random() * 150) + 20;
    const delivered = Math.floor(sent * (0.95 + Math.random() * 0.04)); // 95-99% delivery
    const opened_tracked = Math.floor(delivered * (0.25 + Math.random() * 0.4)); // CLEANED UP: standardized field name
    const clicked_tracked = Math.floor(delivered * (0.15 + Math.random() * 0.3)); // CLEANED UP: standardized field name
    const replied = Math.floor(delivered * (0.1 + Math.random() * 0.2));
    const bounced = sent - delivered;

    chartData.push({
      date: date.toISOString().split("T")[0],
      sent,
      delivered, // CLEANED UP: added delivered field
      opened: opened_tracked, // DEPRECATED: keeping for backward compatibility
      opened_tracked, // CLEANED UP: standardized field name
      clicked: clicked_tracked, // DEPRECATED: keeping for backward compatibility
      clicked_tracked, // CLEANED UP: standardized field name
      replied,
      bounced,
      formattedDate: date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      }),
    });
  }

  return { ChartData: chartData };
}

export async function getCampaignSendingAccountsAction(companyId?: string | number) {
  // Mock function for sending accounts
  console.log("Fetching sending accounts for company:", companyId);
  return [];
}

// Common timezone identifiers used in email scheduling
const availableTimezones = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Vancouver",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Pacific/Auckland"
];

export async function getTimezonesAction() {
  // Return common timezones for scheduling
  return availableTimezones;
}

// Deprecated: Use getTimezonesAction instead
export async function getTimezonesMockAction() {
  return getTimezonesAction();
}

export async function getSequenceSteps() {
  // In a real implementation, this would fetch from a database
  // For now, return the static mock data
  return sequenceSteps;
}

// Server action to fetch campaign data (using mock data)
export async function getCampaignsDataAction(companyId: string) {
  // Simulate fetching data based on companyId (though not used in mock)
  console.log(`Fetching campaign data for company: ${companyId}`);

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Calculate summary data from mock campaigns
  const totalCampaigns = mockedCampaigns.length;
  const activeCampaigns = mockedCampaigns.filter(
    (c) => c.status === "Running",
  ).length;
  const emailsSent = mockedCampaigns.reduce((sum, c) => sum + c.sent, 0);
  const totalReplies = mockedCampaigns.reduce((sum, c) => sum + c.replied, 0);

  return {
    summary: {
      totalCampaigns,
      activeCampaigns,
      emailsSent,
      totalReplies,
    },
    campaigns: mockedCampaigns,
  };
}
