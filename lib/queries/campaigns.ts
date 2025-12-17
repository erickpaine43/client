import { campaignsData } from "@/lib/data/campaigns";

/**
 * Fetch campaign by ID from database.
 * Currently mocked, future: niledb.query
 */
export const getCampaignById = async (id: string) => {
  // TODO: Replace with actual DB query: niledb.query('CAMPAIGN_TABLE', { id })
  const campaignId = parseInt(id);
  return campaignsData.find((campaign) => campaign.id === campaignId) || null;
};
