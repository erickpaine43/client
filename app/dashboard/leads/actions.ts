"use server";

import { leadsStats, leadLists, LeadStats } from "@/lib/data/leads";
import { nile } from "@/app/api/[...nile]/nile";
import { getCurrentUserId } from "@/lib/utils/auth";
import { DbLeadList, DbLeadListRow } from "@/types/clients-leads";

export async function getLeadsStats(): Promise<LeadStats> {
  try {
    // Get current user to authenticate request
    let userId: string | null = null;
    try {
      userId = await getCurrentUserId();
    } catch (authError) {
      console.warn("Authentication error in getLeadsStats, falling back to mock data:", authError);
      return leadsStats;
    }

    if (!userId) {
      // Fallback to mock data if not authenticated
      return leadsStats;
    }

    // Fetch lead statistics from database
    // Nile automatically scopes queries to the current tenant
    try {
      const leadsQuery = `
        SELECT COUNT(*) as total_contacts
        FROM leads
      `;

      const campaignQuery = `
        SELECT COUNT(DISTINCT c.lead_id) as contacts_in_campaigns
        FROM campaign_leads c
      `;

      const [leadsResult, campaignResult] = await Promise.all([
        nile.db.query(leadsQuery),
        nile.db.query(campaignQuery)
      ]);

      const totalContacts = leadsResult[0]?.total_contacts || 0;
      const inCampaignContacts = campaignResult[0]?.contacts_in_campaigns || 0;

      // Return calculated stats in the expected format
      return [
        {
          title: "Total Contacts",
          value: totalContacts.toLocaleString(),
          icon: "users",
          color: "text-blue-600 bg-blue-100",
        },
        {
          title: "In Campaigns",
          value: inCampaignContacts.toLocaleString(),
          icon: "mail",
          color: "bg-purple-100 text-purple-600",
        },
      ];
    } catch (dbError) {
      console.error("Database error in getLeadsStats, falling back to mock data:", dbError);
      return leadsStats;
    }
  } catch (error) {
    console.error("getLeadsStats error:", error);
    // Fallback to mock data on error
    return leadsStats;
  }
}

export async function getLeadLists(): Promise<DbLeadList[]> {
  try {
    // Get current user to authenticate request
    let userId: string | null = null;
    try {
      userId = await getCurrentUserId();
    } catch (authError) {
      console.warn("Authentication error in getLeadLists, falling back to mock data:", authError);
      return leadLists;
    }

    if (!userId) {
      // Fallback to mock data if not authenticated
      return leadLists;
    }

    // Fetch lead lists from database
    try {
      const result = await nile.db.query(`
        SELECT
          id,
          name,
          contacts,
          description
        FROM lead_lists
        ORDER BY name
      `);

      // Map database results to expected format
      const dbLeadLists: DbLeadList[] = (result as DbLeadListRow[]).map((row) => ({
        id: row.id,
        name: row.name,
        contacts: parseInt(String(row.contacts)) || 0,
        description: row.description || "",
      }));

      return dbLeadLists;
    } catch (dbError) {
      console.error("Database error in getLeadLists, falling back to mock data:", dbError);
      return leadLists;
    }
  } catch (error) {
    console.error("getLeadLists error:", error);
    // Fallback to mock data on error
    return leadLists;
  }
}

