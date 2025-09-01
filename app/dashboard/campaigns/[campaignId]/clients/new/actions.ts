'use server';

import { revalidatePath } from 'next/cache';

interface CreateClientData {
  email: string;
  firstName?: string;
  lastName?: string;
  notes?: string;
  campaignId: string;
}

interface ClientData {
  email: string;
  firstName: string;
  lastName: string;
  notes: string;
  campaignId: string;
}

export async function createClient(data: CreateClientData) {
  
  // Mock implementation
  const client = {
    id: Date.now(),
    email: data.email,
    firstName: data.firstName || null,
    lastName: data.lastName || null,
    notes: data.notes || null,
    campaignId: data.campaignId,
  };

  revalidatePath('/dashboard/clients');
  return client;
}

export async function updateClient(id: number, data: ClientData) {
  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true };
}

export async function removeFromCampaign(clientId: number, campaignId: number) {
  console.log({ clientId, campaignId });
  
  revalidatePath('/dashboard/clients');
}

export async function deleteClient(clientId: number) {
  console.log({ clientId });
}

export async function maskClientPII(clientId: number) {
const client = {
    id: clientId,
    firstName: "John",
    lastName: "Doe",
  };

  const maskName = (name?: string | null) => {
    if (!name) return name;
    return name.slice(0, 3) + '*'.repeat(name.length - 3);
  };
// mock implementation
  return {
    id: clientId,
    firstName: maskName(client.firstName),
    lastName: maskName(client.lastName),
  };
}
