/**
 * Campaign Management Actions
 * 
 * Core campaign CRUD operations with standardized error handling
 * and authentication.
 */

'use server';

import { campaignLeads, campaignsData, mockedCampaigns } from '@/lib/data/campaigns';
import { CampaignDisplay } from '@/types';
import { withSecurity, SecurityConfigs } from '../core/auth-middleware';
import { ActionResult, ActionContext } from '../core/types';
import { ErrorFactory, createActionResult } from '../core/errors';
import { validateString, validateId } from '../core/validation';
import type { CampaignFilters, CampaignSummary, CampaignLead } from './types';

/**
 * Get campaign leads for the authenticated company
 */
export async function getCampaignLeads(): Promise<ActionResult<CampaignLead[]>> {
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
      const transformedLeads: CampaignLead[] = campaignLeads.map(lead => ({
        ...lead,
        addedAt: new Date().toISOString()
      }));
      return createActionResult(transformedLeads);
    }
  );
}

/**
 * Get a specific campaign by ID
 */
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
      const idValidation = validateId(campaignId, 'campaignId');
      if (!idValidation.isValid && idValidation.errors) {
        const firstError = idValidation.errors[0];
        return ErrorFactory.validation(firstError.message, firstError.field, firstError.code);
      }

      // In a real implementation, this would fetch from a database with company isolation
      // For now, return the matching campaign from mock data
      const campaign = campaignsData.find(campaign => campaign.id === parseInt(campaignId)) || null;
      
      return createActionResult(campaign);
    }
  );
}

/**
 * Get campaigns for the authenticated user and company
 */
export async function getUserCampaigns(filters?: CampaignFilters): Promise<ActionResult<typeof campaignsData>> {
  return withSecurity(
    'get_user_campaigns',
    SecurityConfigs.COMPANY_READ,
    async (context: ActionContext) => {
      // Ensure company context exists
      if (!context.companyId) {
        return ErrorFactory.unauthorized('Company context required');
      }

      console.log("Fetching campaigns for user/company:", context.userId, context.companyId);
      
      // In a real implementation, this would fetch campaigns for the user/company with proper isolation
      // Apply filters if provided
      let filteredCampaigns = campaignsData;
      
      if (filters?.status && filters.status.length > 0) {
        filteredCampaigns = filteredCampaigns.filter(campaign => 
          filters.status!.includes(campaign.status)
        );
      }
      
      if (filters?.limit) {
        filteredCampaigns = filteredCampaigns.slice(0, filters.limit);
      }
      
      return createActionResult(filteredCampaigns);
    }
  );
}

/**
 * Get campaign data with summary statistics
 */
export async function getCampaignsData(companyId?: string): Promise<ActionResult<{
  summary: CampaignSummary;
  campaigns: typeof mockedCampaigns;
}>> {
  return withSecurity(
    'get_campaigns_data',
    SecurityConfigs.COMPANY_READ,
    async (context: ActionContext) => {
      // Use context company ID for security
      const effectiveCompanyId = context.companyId || companyId;
      
      if (!effectiveCompanyId) {
        return ErrorFactory.unauthorized('Company context required');
      }

      console.log(`Fetching campaign data for company: ${effectiveCompanyId}`);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Calculate summary data from mock campaigns
      const totalCampaigns = mockedCampaigns.length;
      const activeCampaigns = mockedCampaigns.filter(
        (c) => c.status === "Running",
      ).length;
      const emailsSent = mockedCampaigns.reduce((sum, c) => sum + c.sent, 0);
      const totalReplies = mockedCampaigns.reduce((sum, c) => sum + c.replied, 0);
      
      // Calculate rates
      const totalOpened = mockedCampaigns.reduce((sum, c) => sum + (c.opened_tracked || 0), 0);
      const averageOpenRate = emailsSent > 0 ? (totalOpened / emailsSent) * 100 : 0;
      const averageReplyRate = emailsSent > 0 ? (totalReplies / emailsSent) * 100 : 0;

      const summary: CampaignSummary = {
        totalCampaigns,
        activeCampaigns,
        emailsSent,
        totalReplies,
        averageOpenRate,
        averageReplyRate,
      };

      return createActionResult({
        summary,
        campaigns: mockedCampaigns,
      });
    }
  );
}

/**
 * Create a new campaign
 */
export async function createCampaign(data: {
  name: string;
  description?: string;
  status?: string;
}): Promise<ActionResult<{ id: string; message: string }>> {
  return withSecurity(
    'create_campaign',
    SecurityConfigs.COMPANY_WRITE,
    async (context: ActionContext) => {
      // Ensure company context exists
      if (!context.companyId) {
        return ErrorFactory.unauthorized('Company context required');
      }

      // Validate required fields
      const nameValidation = validateString(data.name, 'name', { minLength: 1, maxLength: 100 });
      if (!nameValidation.isValid && nameValidation.errors) {
        const firstError = nameValidation.errors[0];
        return ErrorFactory.validation(firstError.message, firstError.field, firstError.code);
      }

      // In a real implementation, this would create a campaign in the database
      const newCampaignId = `campaign_${Date.now()}`;
      
      console.log(`Creating campaign for company ${context.companyId}:`, data);

      return createActionResult({
        id: newCampaignId,
        message: 'Campaign created successfully',
      });
    }
  );
}

/**
 * Update an existing campaign
 */
export async function updateCampaign(
  campaignId: string,
  data: Partial<{ name: string; description?: string; status?: string }>
): Promise<ActionResult<{ message: string }>> {
  return withSecurity(
    'update_campaign',
    SecurityConfigs.COMPANY_WRITE,
    async (context: ActionContext) => {
      // Ensure company context exists
      if (!context.companyId) {
        return ErrorFactory.unauthorized('Company context required');
      }

      // Validate campaign ID
      const idValidation = validateId(campaignId, 'campaignId');
      if (!idValidation.isValid && idValidation.errors) {
        const firstError = idValidation.errors[0];
        return ErrorFactory.validation(firstError.message, firstError.field, firstError.code);
      }

      // Validate name if provided
      if (data.name) {
        const nameValidation = validateString(data.name, 'name', { minLength: 1, maxLength: 100 });
        if (!nameValidation.isValid && nameValidation.errors) {
          const firstError = nameValidation.errors[0];
          return ErrorFactory.validation(firstError.message, firstError.field, firstError.code);
        }
      }

      // In a real implementation, this would update the campaign in the database
      console.log(`Updating campaign ${campaignId} for company ${context.companyId}:`, data);

      return createActionResult({
        message: 'Campaign updated successfully',
      });
    }
  );
}

/**
 * Delete a campaign
 */
export async function deleteCampaign(campaignId: string): Promise<ActionResult<{ message: string }>> {
  return withSecurity(
    'delete_campaign',
    SecurityConfigs.COMPANY_WRITE,
    async (context: ActionContext) => {
      // Ensure company context exists
      if (!context.companyId) {
        return ErrorFactory.unauthorized('Company context required');
      }

      // Validate campaign ID
      const idValidation = validateId(campaignId, 'campaignId');
      if (!idValidation.isValid && idValidation.errors) {
        const firstError = idValidation.errors[0];
        return ErrorFactory.validation(firstError.message, firstError.field, firstError.code);
      }

      // In a real implementation, this would delete the campaign from the database
      console.log(`Deleting campaign ${campaignId} for company ${context.companyId}`);

      return createActionResult({
        message: 'Campaign deleted successfully',
      });
    }
  );
}
