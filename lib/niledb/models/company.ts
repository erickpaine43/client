/**
 * Company Entity Model
 *
 * Business entities managing campaigns and users
 */

export interface Company {
  id: string;
  name: string;
  tenant_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCompanyRequest {
  name: string;
  tenant_id: string;
}

export interface UpdateCompanyRequest {
  name?: string;
}
