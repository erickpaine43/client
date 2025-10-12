-- Seed: 001_initial_data.sql
-- Description: Initial seed data for marketing agency SaaS
-- Date: 2025-10-06
-- Dependencies: Migration 001_initial_schema.sql must be run first
-- Note: Run this after the schema migration is complete

-- Insert default system permissions
INSERT INTO permissions (id, name, display_name, description, category, is_system_permission) VALUES
('perm_campaigns_create', 'campaigns:create', 'Create Campaigns', 'Ability to create new campaigns', 'campaigns', true),
('perm_campaigns_read', 'campaigns:read', 'View Campaigns', 'Ability to view campaign details', 'campaigns', true),
('perm_campaigns_update', 'campaigns:update', 'Edit Campaigns', 'Ability to modify existing campaigns', 'campaigns', true),
('perm_campaigns_delete', 'campaigns:delete', 'Delete Campaigns', 'Ability to delete campaigns', 'campaigns', true),
('perm_users_create', 'users:create', 'Create Users', 'Ability to invite new team members', 'users', true),
('perm_users_read', 'users:read', 'View Users', 'Ability to view team member details', 'users', true),
('perm_users_update', 'users:update', 'Edit Users', 'Ability to modify user profiles and roles', 'users', true),
('perm_users_delete', 'users:delete', 'Remove Users', 'Ability to remove team members', 'users', true),
('perm_billing_read', 'billing:read', 'View Billing', 'Ability to view billing information', 'billing', true),
('perm_billing_update', 'billing:update', 'Manage Billing', 'Ability to update billing information', 'billing', true),
('perm_settings_read', 'settings:read', 'View Settings', 'Ability to view agency settings', 'settings', true),
('perm_settings_update', 'settings:update', 'Manage Settings', 'Ability to modify agency settings', 'settings', true),
('perm_reports_read', 'reports:read', 'View Reports', 'Ability to access reporting features', 'reports', true)
ON CONFLICT (name) DO NOTHING;

-- Insert default plans
INSERT INTO plans (id, name, display_name, description, price_monthly, price_yearly, features, limits) VALUES
('plan_starter', 'starter', 'Starter Plan', 'Perfect for small teams getting started', 29.00, 290.00,
 '{"campaigns": true, "email_tracking": true, "basic_support": true}',
 '{"emails_sent": 50000, "contacts_reached": 100000, "campaigns": 10, "email_accounts": {"total": 5, "per_domain": 3}, "storage_gb": 10}'
),
('plan_professional', 'professional', 'Professional Plan', 'For growing agencies with advanced needs', 79.00, 790.00,
 '{"campaigns": true, "email_tracking": true, "advanced_analytics": true, "priority_support": true, "api_access": true}',
 '{"emails_sent": 200000, "contacts_reached": 500000, "campaigns": 50, "email_accounts": {"total": 20, "per_domain": 10}, "storage_gb": 50}'
),
('plan_enterprise', 'enterprise', 'Enterprise Plan', 'Full-featured solution for large agencies', 199.00, 1990.00,
 '{"campaigns": true, "email_tracking": true, "advanced_analytics": true, "priority_support": true, "api_access": true, "white_label": true, "dedicated_ip": true}',
 '{"emails_sent": 1000000, "contacts_reached": 2000000, "campaigns": 500, "email_accounts": {"total": 100, "per_domain": 50}, "storage_gb": 200}'
)
ON CONFLICT (id) DO NOTHING;

-- Insert default roles
INSERT INTO roles (id, name, display_name, description, is_system_role) VALUES
('role_owner', 'owner', 'Agency Owner', 'Full access to all agency features and settings', true),
('role_admin', 'admin', 'Administrator', 'Manage users, campaigns, and most agency settings', true),
('role_manager', 'manager', 'Manager', 'Manage campaigns and view reports', true),
('role_user', 'user', 'User', 'Basic user access for campaign execution', true)
ON CONFLICT (id) DO NOTHING;

-- Assign default permissions to roles
INSERT INTO role_permissions (role_id, permission_id, granted_by, granted_at) VALUES
-- Owner gets all permissions
('role_owner', 'perm_campaigns_create', 'system', NOW()),
('role_owner', 'perm_campaigns_read', 'system', NOW()),
('role_owner', 'perm_campaigns_update', 'system', NOW()),
('role_owner', 'perm_campaigns_delete', 'system', NOW()),
('role_owner', 'perm_users_create', 'system', NOW()),
('role_owner', 'perm_users_read', 'system', NOW()),
('role_owner', 'perm_users_update', 'system', NOW()),
('role_owner', 'perm_users_delete', 'system', NOW()),
('role_owner', 'perm_billing_read', 'system', NOW()),
('role_owner', 'perm_billing_update', 'system', NOW()),
('role_owner', 'perm_settings_read', 'system', NOW()),
('role_owner', 'perm_settings_update', 'system', NOW()),
('role_owner', 'perm_reports_read', 'system', NOW()),
-- Admin gets most permissions except user deletion and billing updates
('role_admin', 'perm_campaigns_create', 'system', NOW()),
('role_admin', 'perm_campaigns_read', 'system', NOW()),
('role_admin', 'perm_campaigns_update', 'system', NOW()),
('role_admin', 'perm_users_create', 'system', NOW()),
('role_admin', 'perm_users_read', 'system', NOW()),
('role_admin', 'perm_users_update', 'system', NOW()),
('role_admin', 'perm_billing_read', 'system', NOW()),
('role_admin', 'perm_settings_read', 'system', NOW()),
('role_admin', 'perm_settings_update', 'system', NOW()),
('role_admin', 'perm_reports_read', 'system', NOW()),
-- Manager gets campaign and reporting permissions
('role_manager', 'perm_campaigns_create', 'system', NOW()),
('role_manager', 'perm_campaigns_read', 'system', NOW()),
('role_manager', 'perm_campaigns_update', 'system', NOW()),
('role_manager', 'perm_reports_read', 'system', NOW()),
-- User gets basic campaign read access
('role_user', 'perm_campaigns_read', 'system', NOW())
ON CONFLICT (role_id, permission_id) DO NOTHING;

COMMIT;
