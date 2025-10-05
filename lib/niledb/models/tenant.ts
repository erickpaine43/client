/**
 * Tenant Entity Model
 *
 * Logical separation of data for different organizations
 */

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTenantRequest {
  name: string;
  slug?: string;
}

export interface UpdateTenantRequest {
  name?: string;
}
