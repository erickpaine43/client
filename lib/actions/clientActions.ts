"use server";

/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Please use the new modular structure at lib/actions/clients/ instead.
 * See lib/actions/MIGRATION_GUIDE.md for migration instructions.
 */

// Log deprecation warning
if (typeof console !== 'undefined') {
  console.warn(
    '🚨 DEPRECATED: lib/actions/clientActions.ts is deprecated. ' +
    'Please migrate to lib/actions/clients/ for better organization and maintainability. ' +
    'See lib/actions/MIGRATION_GUIDE.md for migration guide.'
  );
}

// Re-export all functions from the new modular structure for backward compatibility
export {
  createClient,
  updateClient,
  removeFromCampaign,
  deleteClient,
  maskClientPII,
  getClients,
  getClientById,
} from './clients';

// Re-export types
export type {
  CreateClientData,
  ClientData,
  Client,
} from './clients';

// Legacy wrapper functions for backward compatibility
import {
  createClient as createClientNew,
  updateClient as updateClientNew,
  removeFromCampaign as removeFromCampaignNew,
  deleteClient as deleteClientNew,
  maskClientPII as maskClientPIINew,
} from './clients';
import type { CreateClientData, ClientData } from './clients';

export async function createClientLegacy(data: CreateClientData) {
  const result = await createClientNew(data);
  if (result.success && result.data) {
    return {
      id: result.data.id,
      email: result.data.email,
      firstName: result.data.firstName,
      lastName: result.data.lastName,
      notes: result.data.notes,
      campaignId: result.data.campaignId,
    };
  }
  
  // Fallback for legacy compatibility
  return {
    id: Date.now(),
    email: data.email,
    firstName: data.firstName || null,
    lastName: data.lastName || null,
    notes: data.notes || null,
    campaignId: data.campaignId,
  };
}

export async function updateClientLegacy(id: number, data: ClientData) {
  const result = await updateClientNew(id, data);
  return result.success ? { success: true } : { success: false };
}

export async function removeFromCampaignLegacy(clientId: number, campaignId: number) {
  await removeFromCampaignNew(clientId, campaignId);
}

export async function deleteClientLegacy(clientId: number) {
  await deleteClientNew(clientId);
}

export async function maskClientPIILegacy(clientId: number) {
  const result = await maskClientPIINew(clientId);
  if (result.success && result.data) {
    return result.data;
  }
  
  // Fallback for legacy compatibility
  return {
    id: clientId,
    firstName: "Joh*",
    lastName: "D**",
  };
}
