'use server';

/**
 * Leads Actions - Convex Integration
 * 
 * This module provides leads management actions using ConvexQueryHelper
 * for type safety and standardized error handling.
 */

import {
  createActionResult,
  withConvexErrorHandling
} from '../core/errors';
import { 
  withAuthAndCompany,
  withContextualRateLimit,
  RateLimits 
} from '../core/auth';
import type { ActionResult, ActionContext } from '../core/types';

/**
 * Lead list interface
 */
export interface LeadList {
  id: string;
  name: string;
  description?: string;
  leadCount: number;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive' | 'archived';
}

/**
 * Lead interface
 */
export interface Lead {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  title?: string;
  phone?: string;
  linkedinUrl?: string;
  notes?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'unqualified';
  source: string;
  listId: string;
  campaignId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Lead filters interface
 */
export interface LeadFilters {
  listId?: string;
  campaignId?: string;
  status?: string[];
  source?: string[];
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Get all lead lists for a company
 */
export async function getLeadsLists(): Promise<ActionResult<LeadList[]>> {
  return withContextualRateLimit(
    'get_leads_lists',
    'company',
    RateLimits.GENERAL_READ,
    () => withAuthAndCompany(async (_context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        // For now, fall back to mock data until Convex leads schema is implemented
        const { leadLists } = await import("@/lib/data/leads");

        // Map to LeadList interface
        const leadListsMapped: LeadList[] = leadLists.map(list => ({
          id: list.id,
          name: list.name,
          description: list.description,
          leadCount: list.contacts,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active' as const,
        }));

        // In a real implementation, this would be:
        // const leadLists = await convexHelper.query(
        //   api.leads.getLists,
        //   {
        //     companyId: context.companyId,
        //   }
        // );

        return createActionResult(leadListsMapped);
      });
    })
  );
}

/**
 * Create a new lead list
 */
export async function createLeadList(
  data: {
    name: string;
    description?: string;
  }
): Promise<ActionResult<LeadList>> {
  return withContextualRateLimit(
    'create_lead_list',
    'company',
    RateLimits.GENERAL_WRITE,
    () => withAuthAndCompany(async (_context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        // Validate required fields
        if (!data.name || data.name.trim().length === 0) {
          throw new Error('Lead list name is required');
        }

        // For now, use mock implementation until Convex leads schema is implemented
        const newLeadList: LeadList = {
          id: `list_${Date.now()}`,
          name: data.name.trim(),
          description: data.description?.trim(),
          leadCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'active',
        };

        // In a real implementation, this would be:
        // const leadList = await convexHelper.mutation(
        //   api.leads.createList,
        //   {
        //     companyId: context.companyId,
        //     name: data.name.trim(),
        //     description: data.description?.trim(),
        //   }
        // );

        return createActionResult(newLeadList);
      });
    })
  );
}

/**
 * Update a lead list
 */
export async function updateLeadList(
  listId: string,
  data: {
    name?: string;
    description?: string;
    status?: 'active' | 'inactive' | 'archived';
  }
): Promise<ActionResult<LeadList>> {
  return withContextualRateLimit(
    'update_lead_list',
    'company',
    RateLimits.GENERAL_WRITE,
    () => withAuthAndCompany(async (_context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        // Validate list ID
        if (!listId) {
          throw new Error('Lead list ID is required');
        }

        // For now, use mock implementation until Convex leads schema is implemented
        const updatedLeadList: LeadList = {
          id: listId,
          name: data.name || 'Updated List',
          description: data.description,
          leadCount: 0,
          createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          updatedAt: new Date().toISOString(),
          status: data.status || 'active',
        };

        // In a real implementation, this would be:
        // const leadList = await convexHelper.mutation(
        //   api.leads.updateList,
        //   {
        //     id: listId,
        //     companyId: context.companyId,
        //     ...data,
        //   }
        // );

        return createActionResult(updatedLeadList);
      });
    })
  );
}

/**
 * Delete a lead list
 */
export async function deleteLeadList(
  listId: string
): Promise<ActionResult<{ success: boolean }>> {
  return withContextualRateLimit(
    'delete_lead_list',
    'company',
    RateLimits.GENERAL_WRITE,
    () => withAuthAndCompany(async (_context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        // Validate list ID
        if (!listId) {
          throw new Error('Lead list ID is required');
        }

        // For now, use mock implementation until Convex leads schema is implemented
        console.log(`Deleting lead list ${listId}`);

        // In a real implementation, this would be:
        // await convexHelper.mutation(
        //   api.leads.deleteList,
        //   {
        //     id: listId,
        //     companyId: context.companyId,
        //   }
        // );

        return createActionResult({ success: true });
      });
    })
  );
}

/**
 * Get leads from a specific list
 */
export async function getLeadsFromList(
  listId: string,
  filters?: Omit<LeadFilters, 'listId'>
): Promise<ActionResult<Lead[]>> {
  return withContextualRateLimit(
    'get_leads_from_list',
    'company',
    RateLimits.GENERAL_READ,
    () => withAuthAndCompany(async (_context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        // Validate list ID
        if (!listId) {
          throw new Error('Lead list ID is required');
        }

        // For now, use mock implementation until Convex leads schema is implemented
        const mockLeads: Lead[] = [
          {
            id: `lead_1_${listId}`,
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            company: 'Example Corp',
            title: 'Marketing Manager',
            phone: '+1-555-0123',
            linkedinUrl: 'https://linkedin.com/in/johndoe',
            notes: 'Interested in our premium package',
            status: 'new',
            source: 'website',
            listId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: `lead_2_${listId}`,
            email: 'jane.smith@example.com',
            firstName: 'Jane',
            lastName: 'Smith',
            company: 'Tech Solutions Inc',
            title: 'CEO',
            status: 'contacted',
            source: 'referral',
            listId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];

        // Apply filters
        let filteredLeads = mockLeads;

        if (filters?.campaignId) {
          filteredLeads = filteredLeads.filter(lead => lead.campaignId === filters.campaignId);
        }

        if (filters?.status && filters.status.length > 0) {
          filteredLeads = filteredLeads.filter(lead => filters.status!.includes(lead.status));
        }

        if (filters?.source && filters.source.length > 0) {
          filteredLeads = filteredLeads.filter(lead => filters.source!.includes(lead.source));
        }

        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          filteredLeads = filteredLeads.filter(lead => 
            lead.email.toLowerCase().includes(searchLower) ||
            lead.firstName?.toLowerCase().includes(searchLower) ||
            lead.lastName?.toLowerCase().includes(searchLower) ||
            lead.company?.toLowerCase().includes(searchLower)
          );
        }

        // Apply pagination
        if (filters?.offset || filters?.limit) {
          const offset = filters.offset || 0;
          const limit = filters.limit || 50;
          filteredLeads = filteredLeads.slice(offset, offset + limit);
        }

        // In a real implementation, this would be:
        // const leads = await convexHelper.query(
        //   api.leads.getFromList,
        //   {
        //     listId,
        //     companyId: context.companyId,
        //     filters: filters || {},
        //   }
        // );

        return createActionResult(filteredLeads);
      });
    })
  );
}

/**
 * Create a new lead
 */
export async function createLead(
  data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ActionResult<Lead>> {
  return withContextualRateLimit(
    'create_lead',
    'company',
    RateLimits.GENERAL_WRITE,
    () => withAuthAndCompany(async (_context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        // Validate required fields
        if (!data.email || !data.listId) {
          throw new Error('Email and list ID are required');
        }

        // For now, use mock implementation until Convex leads schema is implemented
        const newLead: Lead = {
          ...data,
          id: `lead_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // In a real implementation, this would be:
        // const lead = await convexHelper.mutation(
        //   api.leads.create,
        //   {
        //     companyId: context.companyId,
        //     ...data,
        //   }
        // );

        return createActionResult(newLead);
      });
    })
  );
}

/**
 * Update a lead
 */
export async function updateLead(
  leadId: string,
  data: Partial<Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<ActionResult<Lead>> {
  return withContextualRateLimit(
    'update_lead',
    'company',
    RateLimits.GENERAL_WRITE,
    () => withAuthAndCompany(async (_context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        // Validate lead ID
        if (!leadId) {
          throw new Error('Lead ID is required');
        }

        // For now, use mock implementation until Convex leads schema is implemented
        const updatedLead: Lead = {
          id: leadId,
          email: data.email || 'updated@example.com',
          firstName: data.firstName,
          lastName: data.lastName,
          company: data.company,
          title: data.title,
          phone: data.phone,
          linkedinUrl: data.linkedinUrl,
          notes: data.notes,
          status: data.status || 'new',
          source: data.source || 'unknown',
          listId: data.listId || 'default_list',
          campaignId: data.campaignId,
          createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          updatedAt: new Date().toISOString(),
        };

        // In a real implementation, this would be:
        // const lead = await convexHelper.mutation(
        //   api.leads.update,
        //   {
        //     id: leadId,
        //     companyId: context.companyId,
        //     ...data,
        //   }
        // );

        return createActionResult(updatedLead);
      });
    })
  );
}

/**
 * Delete a lead
 */
export async function deleteLead(
  leadId: string
): Promise<ActionResult<{ success: boolean }>> {
  return withContextualRateLimit(
    'delete_lead',
    'company',
    RateLimits.GENERAL_WRITE,
    () => withAuthAndCompany(async (_context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        // Validate lead ID
        if (!leadId) {
          throw new Error('Lead ID is required');
        }

        // For now, use mock implementation until Convex leads schema is implemented
        console.log(`Deleting lead ${leadId}`);

        // In a real implementation, this would be:
        // await convexHelper.mutation(
        //   api.leads.delete,
        //   {
        //     id: leadId,
        //     companyId: context.companyId,
        //   }
        // );

        return createActionResult({ success: true });
      });
    })
  );
}

/**
 * Bulk import leads to a list
 */
export async function bulkImportLeads(
  listId: string,
  leads: Array<Omit<Lead, 'id' | 'listId' | 'createdAt' | 'updatedAt'>>
): Promise<ActionResult<{ imported: number; failed: number; errors: string[] }>> {
  return withContextualRateLimit(
    'bulk_import_leads',
    'company',
    RateLimits.BULK_OPERATION,
    () => withAuthAndCompany(async (_context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        // Validate list ID
        if (!listId) {
          throw new Error('Lead list ID is required');
        }

        // Validate leads array
        if (!Array.isArray(leads) || leads.length === 0) {
          throw new Error('Leads array is required and cannot be empty');
        }

        // For now, use mock implementation until Convex leads schema is implemented
        const result = {
          imported: leads.length,
          failed: 0,
          errors: [] as string[],
        };

        // In a real implementation, this would be:
        // const result = await convexHelper.mutation(
        //   api.leads.bulkImport,
        //   {
        //     listId,
        //     companyId: context.companyId,
        //     leads: leads.map(lead => ({ ...lead, listId })),
        //   }
        // );

        return createActionResult(result);
      });
    })
  );
}
