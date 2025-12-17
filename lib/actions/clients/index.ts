'use server';

/**
 * Client Actions - Convex Integration
 * 
 * This module provides client management actions using ConvexQueryHelper
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
import { revalidatePath } from "next/cache";

/**
 * Client data interfaces
 */
export interface CreateClientData {
  email: string;
  firstName?: string;
  lastName?: string;
  notes?: string;
  campaignId: string;
}

export interface ClientData {
  email: string;
  firstName: string;
  lastName: string;
  notes: string;
  campaignId: string;
}

export interface Client {
  id: number | string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  notes: string | null;
  campaignId: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Create a new client
 */
export async function createClient(
  data: CreateClientData
): Promise<ActionResult<Client>> {
  return withContextualRateLimit(
    'create_client',
    'company',
    RateLimits.GENERAL_WRITE,
    () => withAuthAndCompany(async (_context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        // Validate required fields
        if (!data.email || !data.campaignId) {
          throw new Error('Email and campaign ID are required');
        }

        // For now, use mock implementation until Convex clients schema is implemented
        const client: Client = {
          id: Date.now(),
          email: data.email,
          firstName: data.firstName || null,
          lastName: data.lastName || null,
          notes: data.notes || null,
          campaignId: data.campaignId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // In a real implementation, this would be:
        // const client = await convexHelper.mutation(
        //   api.clients.create,
        //   {
        //     companyId: context.companyId,
        //     email: data.email,
        //     firstName: data.firstName,
        //     lastName: data.lastName,
        //     notes: data.notes,
        //     campaignId: data.campaignId,
        //   }
        // );

        revalidatePath("/dashboard/clients");
        return createActionResult(client);
      });
    })
  );
}

/**
 * Update an existing client
 */
export async function updateClient(
  id: number | string,
  _data: Partial<ClientData>
): Promise<ActionResult<{ success: boolean }>> {
  return withContextualRateLimit(
    'update_client',
    'company',
    RateLimits.GENERAL_WRITE,
    () => withAuthAndCompany(async (_context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        // Validate client ID
        if (!id) {
          throw new Error('Client ID is required');
        }

        // For now, use mock implementation until Convex clients schema is implemented
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // In a real implementation, this would be:
        // const updatedClient = await convexHelper.mutation(
        //   api.clients.update,
        //   {
        //     id: id.toString(),
        //     companyId: context.companyId,
        //     ...data,
        //   }
        // );

        revalidatePath("/dashboard/clients");
        return createActionResult({ success: true });
      });
    })
  );
}

/**
 * Remove client from campaign
 */
export async function removeFromCampaign(
  clientId: number | string,
  campaignId: number | string
): Promise<ActionResult<{ success: boolean }>> {
  return withContextualRateLimit(
    'remove_from_campaign',
    'company',
    RateLimits.GENERAL_WRITE,
    () => withAuthAndCompany(async (_context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        // Validate parameters
        if (!clientId || !campaignId) {
          throw new Error('Client ID and campaign ID are required');
        }

        console.log({ clientId, campaignId });

        // For now, use mock implementation until Convex clients schema is implemented
        // In a real implementation, this would be:
        // await convexHelper.mutation(
        //   api.clients.removeFromCampaign,
        //   {
        //     clientId: clientId.toString(),
        //     campaignId: campaignId.toString(),
        //     companyId: context.companyId,
        //   }
        // );

        revalidatePath("/dashboard/clients");
        return createActionResult({ success: true });
      });
    })
  );
}

/**
 * Delete a client
 */
export async function deleteClient(
  clientId: number | string
): Promise<ActionResult<{ success: boolean }>> {
  return withContextualRateLimit(
    'delete_client',
    'company',
    RateLimits.GENERAL_WRITE,
    () => withAuthAndCompany(async (_context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        // Validate client ID
        if (!clientId) {
          throw new Error('Client ID is required');
        }

        console.log({ clientId });

        // For now, use mock implementation until Convex clients schema is implemented
        // In a real implementation, this would be:
        // await convexHelper.mutation(
        //   api.clients.delete,
        //   {
        //     id: clientId.toString(),
        //     companyId: context.companyId,
        //   }
        // );

        revalidatePath("/dashboard/clients");
        return createActionResult({ success: true });
      });
    })
  );
}

/**
 * Mask client PII for privacy compliance
 */
export async function maskClientPII(
  clientId: number | string
): Promise<ActionResult<{ id: number | string; firstName: string | null; lastName: string | null }>> {
  return withContextualRateLimit(
    'mask_client_pii',
    'company',
    RateLimits.SENSITIVE_ACTION,
    () => withAuthAndCompany(async (_context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        // Validate client ID
        if (!clientId) {
          throw new Error('Client ID is required');
        }

        // For now, use mock implementation until Convex clients schema is implemented
        const client = {
          id: clientId,
          firstName: "John",
          lastName: "Doe",
        };

        const maskName = (name: string | null) => {
          if (!name) return null;
          return name.slice(0, 3) + "*".repeat(name.length - 3);
        };

        // In a real implementation, this would be:
        // const client = await convexHelper.query(
        //   api.clients.getById,
        //   {
        //     id: clientId.toString(),
        //     companyId: context.companyId,
        //   }
        // );

        const maskedClient = {
          id: clientId,
          firstName: maskName(client.firstName),
          lastName: maskName(client.lastName),
        };

        return createActionResult(maskedClient);
      });
    })
  );
}

/**
 * Get all clients for a company
 */
export async function getClients(
  filters?: {
    campaignId?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }
): Promise<ActionResult<Client[]>> {
  return withContextualRateLimit(
    'get_clients',
    'company',
    RateLimits.GENERAL_READ,
    () => withAuthAndCompany(async (_context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        // For now, use mock implementation until Convex clients schema is implemented
        const mockClients: Client[] = [
          {
            id: 1,
            email: "john.doe@example.com",
            firstName: "John",
            lastName: "Doe",
            notes: "Interested in premium features",
            campaignId: "campaign_1",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 2,
            email: "jane.smith@example.com",
            firstName: "Jane",
            lastName: "Smith",
            notes: null,
            campaignId: "campaign_2",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];

        // Apply filters
        let filteredClients = mockClients;

        if (filters?.campaignId) {
          filteredClients = filteredClients.filter(client => client.campaignId === filters.campaignId);
        }

        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          filteredClients = filteredClients.filter(client => 
            client.email.toLowerCase().includes(searchLower) ||
            client.firstName?.toLowerCase().includes(searchLower) ||
            client.lastName?.toLowerCase().includes(searchLower)
          );
        }

        // Apply pagination
        if (filters?.offset || filters?.limit) {
          const offset = filters.offset || 0;
          const limit = filters.limit || 50;
          filteredClients = filteredClients.slice(offset, offset + limit);
        }

        // In a real implementation, this would be:
        // const clients = await convexHelper.query(
        //   api.clients.list,
        //   {
        //     companyId: context.companyId,
        //     filters: filters || {},
        //   }
        // );

        return createActionResult(filteredClients);
      });
    })
  );
}

/**
 * Get client by ID
 */
export async function getClientById(
  clientId: number | string
): Promise<ActionResult<Client | null>> {
  return withContextualRateLimit(
    'get_client_by_id',
    'company',
    RateLimits.GENERAL_READ,
    () => withAuthAndCompany(async (_context: ActionContext & { companyId: string }) => {
      return withConvexErrorHandling(async () => {
        // Validate client ID
        if (!clientId) {
          throw new Error('Client ID is required');
        }

        // For now, use mock implementation until Convex clients schema is implemented
        const mockClient: Client = {
          id: clientId,
          email: "john.doe@example.com",
          firstName: "John",
          lastName: "Doe",
          notes: "Interested in premium features",
          campaignId: "campaign_1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // In a real implementation, this would be:
        // const client = await convexHelper.query(
        //   api.clients.getById,
        //   {
        //     id: clientId.toString(),
        //     companyId: context.companyId,
        //   }
        // );

        return createActionResult(mockClient);
      });
    })
  );
}
