/**
 * Migration TypeScript Types
 *
 * Type definitions for migration scripts based on data-model.md entities.
 * All primary keys are UUID strings as per NileDB requirements.
 */

export interface Tenant {
  id: string; // UUID
  name: string;
  slug?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string; // UUID from NileDB
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string; // UUID
  userId: string; // references user.id
  teamId: string; // references tenant.id
  email: string; // denormalized from user
  name: string; // denormalized from user
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
  joinedAt: Date;
  lastActiveAt?: Date;
  permissions: string[];
  twoFactorEnabled?: boolean;
  metadata?: Record<string, unknown>;
}

export interface Company {
  id: string; // UUID
  tenantId: string; // references tenant.id
  name: string;
  domain?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string; // UUID
  userId: string; // references user.id
  amount: number; // cents
  currency: string; // ISO 4217
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  processedAt?: Date;
}

export interface Domain {
  id: string; // UUID
  tenantId: string; // references tenant.id
  name: string;
  verified: boolean;
  createdAt: Date;
}

export interface CompanySettings {
  id: string; // UUID
  companyId: string; // references company.id
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailAccount {
  id: string; // UUID
  domainId: string; // references domain.id
  email: string;
  provider: string;
  createdAt: Date;
}

export interface Lead {
  id: string; // UUID
  tenantId: string; // references tenant.id
  email: string;
  name?: string;
  company?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted';
  createdAt: Date;
  updatedAt: Date;
}

export interface Campaign {
  id: string; // UUID
  companyId: string; // references company.id
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Template {
  id: string; // UUID
  tenantId: string; // references tenant.id
  name: string;
  subject: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InboxMessage {
  id: string; // UUID
  tenantId: string; // references tenant.id
  fromEmail: string;
  toEmail: string;
  subject: string;
  content: string;
  receivedAt: Date;
}

export interface EmailService {
  id: string; // UUID
  tenantId: string; // references tenant.id
  provider: string;
  config: Record<string, unknown>;
  createdAt: Date;
}

/**
 * Migration operation types
 */
export type MigrationOperation = 'create' | 'update' | 'delete';

export interface MigrationResult {
  success: boolean;
  operation: MigrationOperation;
  table: string;
  recordCount?: number;
  error?: string;
  duration?: number;
}

export interface SeedData<T> {
  table: string;
  data: T[];
}

/**
 * Validation types
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
