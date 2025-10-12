/**
 * Company-related type definitions
 */

// Note: BillingAddress moved to tenant_config (agency-level billing)

// Company settings (UI and dashboard configuration)
export interface CompanySettings {
  // Member management
  allowMemberInvites: boolean;
  autoApproveMembers: boolean;

  // UI/Dashboard settings
  notifyOnNewMember: boolean;
  requireTwoFactorAuth?: boolean; // Legacy support - deprecated, use tenant-level settings
}

// Consolidated Company (Client/Workspace record)
export interface Company {
  id: string; // Our company ID
  tenantId: string; // Links to Tenant (agency)
  name: string; // Client company name
  email?: string; // Client contact email
  billingEmail?: string; // Legacy support - deprecated, moved to tenant_config
  address?: { // Legacy support - deprecated, moved to tenant_config
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  settings?: CompanySettings; // Legacy support - deprecated, moved to tenant_config
}

// Legacy Company Info (for mapping)
export interface CompanyInfo {
  id: string;
  tenantId: string;
  name: string;
  email?: string;
  role: "member" | "admin" | "owner";
  permissions?: Record<string, unknown>;
}

// Mapping Functions
export function mapCompanyInfoToCompany(companyInfo: CompanyInfo): Company {
  return {
    id: companyInfo.id,
    tenantId: companyInfo.tenantId,
    name: companyInfo.name,
    email: companyInfo.email,
  };
}

export function createDefaultCompanySettings(): CompanySettings {
  return {
    allowMemberInvites: true,
    autoApproveMembers: true,
    notifyOnNewMember: true,
  };
}
