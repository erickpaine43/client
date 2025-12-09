/**
 * User Entity Model
 *
 * Represents authenticated users with tenant and company associations
 */

export interface User {
  id: string;
  email: string;
  name: string;
  tenant_id: string;
  company_id: string;
  role: 'admin' | 'user' | 'manager';
  emailVerified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  tenant_id: string;
  company_id: string;
  role?: 'admin' | 'user' | 'manager';
}

export interface UpdateUserRequest {
  name?: string;
  role?: 'admin' | 'user' | 'manager';
}
