"use server";

import { getCampaignById } from "@/lib/queries/campaigns";
import { Campaign } from "@/types/campaign";
import { ChartData } from "@/types/campaign";

/**
 * Server action to fetch campaign by ID.
 */
export async function getCampaign(campaignId: string) {
  return await getCampaignById(campaignId);
}

/**
 * Server action to fetch all campaigns for a user/company.
 * Currently mocked, future: niledb.query
 */
export async function getUserCampaignsAction(userId?: string, companyId?: string): Promise<Campaign[]> {
  console.log(`Fetching campaigns for user: ${userId}, company: ${companyId}`);

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // TODO: Replace with actual DB query: niledb.query('CAMPAIGNS_TABLE', {
  //   user_id: userId,
  //   company_id: companyId,
  //   status: ['ACTIVE', 'COMPLETED'] // Only include active/completed campaigns
  // })

  // Mock data for now - return sample campaigns
  const mockCampaigns: Campaign[] = [
    {
      id: "1",
      name: "Q1 SaaS Outreach",
      status: "ACTIVE",
      fromName: "John Doe",
      fromEmail: "john@mycompany.com",
      metrics: {
        recipients: { sent: 847, total: 1000 },
        opens: { total: 289, rate: 34.1 },
        clicks: { total: 73, rate: 8.6 },
        replies: { total: 42, rate: 5.0 },
        bounces: { total: 12, rate: 1.4 }
      },
      lastUpdated: "2024-01-15T10:30:00Z"
    },
    {
      id: "2",
      name: "Enterprise Prospects",
      status: "ACTIVE",
      fromName: "Sarah Johnson",
      fromEmail: "sarah@mycompany.com",
      metrics: {
        recipients: { sent: 1203, total: 1203 },
        opens: { total: 502, rate: 41.7 },
        clicks: { total: 124, rate: 10.3 },
        replies: { total: 89, rate: 7.4 }
      },
      lastUpdated: "2024-01-14T14:20:00Z"
    },
    {
      id: "3",
      name: "SMB Follow-up",
      status: "COMPLETED",
      fromName: "Mike Chen",
      fromEmail: "mike@mycompany.com",
      metrics: {
        recipients: { sent: 492, total: 492 },
        opens: { total: 142, rate: 28.9 },
        clicks: { total: 31, rate: 6.3 },
        replies: { total: 18, rate: 3.7 },
        bounces: { total: 8, rate: 1.6 }
      },
      lastUpdated: "2024-01-10T09:15:00Z"
    }
  ];

  return mockCampaigns;
}

/**
 * Server action to fetch campaign sending accounts.
 * Currently mocked, future: niledb.query
 */
export async function getCampaignSendingAccountsAction(_companyId: number) {
  // TODO: Replace with actual DB query: niledb.query('COMPANY_SENDING_ACCOUNTS_TABLE', { company_id: companyId })
  // Mock data for now
  return [
    { value: "john@mycompany.com", label: "John Doe (john@mycompany.com)" },
    { value: "sarah@mycompany.com", label: "Sarah Johnson (sarah@mycompany.com)" },
    { value: "mike@mycompany.com", label: "Mike Chen (mike@mycompany.com)" },
  ];
}

/**
 * Server action to fetch available timezones.
 * Currently mocked, future: niledb.query or static list
 */
export async function getTimezonesMockAction() {
  // TODO: Replace with actual timezone data source
  // For now, return common timezones
  return [
    "UTC",
    "America/New_York",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
    "Australia/Sydney",
  ];
}

/**
 * Server action to generate analytics timeseries data from campaign data.
 * Takes campaigns as input and generates chart data with realistic metrics over time.
 */
export async function getCampaignAnalyticsAction(
  campaigns: Campaign[],
  dayRange: number
): Promise<{ ChartData: ChartData[] }> {
  console.log(`Generating analytics data for ${campaigns.length} campaigns over ${dayRange} days`);

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // If no campaigns, return empty data
  if (!campaigns.length) {
    return { ChartData: [] };
  }

  // Calculate aggregate metrics from campaigns
  const totalSent = campaigns.reduce((sum, c) => sum + c.metrics.recipients.sent, 0);
  const totalOpens = campaigns.reduce((sum, c) => sum + c.metrics.opens.total, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + (c.metrics.clicks?.total || 0), 0);
  const totalReplies = campaigns.reduce((sum, c) => sum + c.metrics.replies.total, 0);
  const totalBounces = campaigns.reduce((sum, c) => sum + (c.metrics.bounces?.total || 0), 0);

  // Generate timeseries data distributed over the day range
  const data = [];
  const today = new Date();

  // Calculate daily aggregate metrics based on total campaign data
  const avgDailySent = Math.max(5, Math.floor(totalSent / dayRange));
  const avgDailyOpens = Math.max(2, Math.floor(totalOpens / dayRange));
  const avgDailyClicks = Math.max(1, Math.floor(totalClicks / dayRange));
  const avgDailyReplies = Math.max(0, Math.floor(totalReplies / dayRange));
  const avgDailyBounces = Math.max(0, Math.floor(totalBounces / dayRange));

  for (let i = dayRange - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    // Add some variation to daily metrics (±30% of average)
    const variation = 0.3;
    const sent = Math.floor(avgDailySent * (1 + (Math.random() - 0.5) * variation));
    const opened = Math.floor(avgDailyOpens * (1 + (Math.random() - 0.5) * variation));
    const clicked = Math.floor(avgDailyClicks * (1 + (Math.random() - 0.5) * variation));
    const replied = Math.floor(avgDailyReplies * (1 + (Math.random() - 0.5) * variation));
    const bounced = Math.floor(avgDailyBounces * (1 + (Math.random() - 0.5) * variation));

    data.push({
      date: date.toISOString().split("T")[0],
      sent: Math.max(0, sent),
      opened: Math.max(0, opened),
      replied: Math.max(0, replied),
      bounced: Math.max(0, bounced),
      clicked: Math.max(0, clicked),
      formattedDate: date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      }),
    });
  }

  return { ChartData: data };
}

/**
 * Legacy function for backward compatibility - generates data without campaign context.
 * @deprecated Use getCampaignAnalyticsAction with campaigns parameter instead
 */
export async function getLegacyAnalyticsAction(
  dayRange: number,
  companyId?: string
): Promise<{ ChartData: ChartData[] }> {
  console.log(`[DEPRECATED] Using legacy analytics function for ${dayRange} days, company: ${companyId}`);

  // Generate random data similar to current generateData function
  const data = [];
  const today = new Date();

  for (let i = dayRange - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const sent = Math.floor(Math.random() * 50) + 15;
    const opened = Math.floor(sent * (0.25 + Math.random() * 0.35));
    const clicked = Math.floor(opened * (0.15 + Math.random() * 0.3));
    const replied = Math.floor(opened * (0.1 + Math.random() * 0.2));
    const bounced = Math.floor(sent * (0.02 + Math.random() * 0.08));

    data.push({
      date: date.toISOString().split("T")[0],
      sent,
      opened,
      replied,
      bounced,
      clicked,
      formattedDate: date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      }),
    });
  }

  return { ChartData: data };
}
