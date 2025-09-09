'use server';

import { campaignLeads, campaignsData, sequenceSteps, mockedCampaigns } from '@/lib/data/campaigns';
import { Campaign } from '@/types';

export async function getCampaignLeads() {
  // In a real implementation, this would fetch from a database
  // For now, return the static mock data
  return campaignLeads;
}

export async function getCampaign(campaignId: string) {
  // In a real implementation, this would fetch from a database
  // For now, return the matching campaign from mock data
  return campaignsData.find(campaign => campaign.id === parseInt(campaignId)) || null;
}

export async function getUserCampaignsAction(userId?: string, companyId?: string) {
  console.log("Fetching campaigns for user/company:", userId, companyId);
  // In a real implementation, this would fetch campaigns for the user/company
  // For now, return the static campaigns data
  return campaignsData;
}

export async function getCampaignAnalyticsAction(campaigns: Partial<Campaign>[], days: number) {
  console.log("Generating campaign analytics:", campaigns, days);
  // In a real implementation, this would generate analytics from campaign data
  // For now, generate mock chart data
  const chartData = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const sent = Math.floor(Math.random() * 150) + 20;
    const opened = Math.floor(sent * (0.25 + Math.random() * 0.4));
    const clicked = Math.floor(opened * (0.15 + Math.random() * 0.3));
    const replied = Math.floor(opened * (0.1 + Math.random() * 0.2));
    const bounced = Math.floor(sent * (0.02 + Math.random() * 0.08));

    chartData.push({
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
  const emailsSent = mockedCampaigns.reduce((sum, c) => sum + c.progressTotal, 0);
  const totalReplies = mockedCampaigns.reduce((sum, c) => sum + c.replies, 0);

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
