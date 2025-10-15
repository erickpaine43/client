-- Migration script to convert JSONB preferences to structured settings tables
-- This script safely migrates data from existing JSONB columns to new structured tables

-- =============================================
-- MIGRATION: User Preferences
-- =============================================

-- Insert user preferences from existing JSONB data (assuming users table has preferences column)
INSERT INTO user_preferences (user_id, theme, language, timezone, email_notifications, push_notifications, weekly_reports, marketing_emails)
SELECT
  u.id as user_id,
  COALESCE((u.preferences->>'theme')::text, 'light') as theme,
  COALESCE((u.preferences->>'language')::text, 'en') as language,
  COALESCE((u.preferences->>'timezone')::text, 'UTC') as timezone,
  COALESCE((u.preferences->>'emailNotifications')::boolean, true) as email_notifications,
  COALESCE((u.preferences->>'pushNotifications')::boolean, false) as push_notifications,
  COALESCE((u.preferences->>'weeklyReports')::boolean, true) as weekly_reports,
  COALESCE((u.preferences->>'marketingEmails')::boolean, false) as marketing_emails
FROM users u
WHERE u.preferences IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM user_preferences up WHERE up.user_id = u.id)
ON CONFLICT (user_id) DO NOTHING;

-- =============================================
-- MIGRATION: Company Settings
-- =============================================

-- Insert company settings from existing JSONB data (assuming companies table has settings column)
INSERT INTO company_settings (company_id, max_users, max_domains, max_campaigns_per_month, api_rate_limit, custom_branding, advanced_analytics, priority_support)
SELECT
  c.id as company_id,
  COALESCE((c.settings->>'maxUsers')::integer, 10) as max_users,
  COALESCE((c.settings->>'maxDomains')::integer, 5) as max_domains,
  COALESCE((c.settings->>'maxCampaignsPerMonth')::integer, 100) as max_campaigns_per_month,
  COALESCE((c.settings->>'apiRateLimit')::integer, 1000) as api_rate_limit,
  COALESCE((c.settings->>'customBranding')::boolean, false) as custom_branding,
  COALESCE((c.settings->>'advancedAnalytics')::boolean, false) as advanced_analytics,
  COALESCE((c.settings->>'prioritySupport')::boolean, false) as priority_support
FROM companies c
WHERE c.settings IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM company_settings cs WHERE cs.company_id = c.id)
ON CONFLICT (company_id) DO NOTHING;

-- =============================================
-- MIGRATION: Tenant Settings
-- =============================================

-- Insert tenant settings from existing JSONB data (assuming tenants table has settings column)
INSERT INTO tenant_settings (tenant_id, default_theme, default_language, default_timezone, allow_custom_branding, max_companies_per_tenant, global_email_limits, audit_logging_enabled)
SELECT
  t.id as tenant_id,
  COALESCE((t.settings->>'defaultTheme')::text, 'light') as default_theme,
  COALESCE((t.settings->>'defaultLanguage')::text, 'en') as default_language,
  COALESCE((t.settings->>'defaultTimezone')::text, 'UTC') as default_timezone,
  COALESCE((t.settings->>'allowCustomBranding')::boolean, false) as allow_custom_branding,
  COALESCE((t.settings->>'maxCompaniesPerTenant')::integer, 100) as max_companies_per_tenant,
  COALESCE((t.settings->>'globalEmailLimits')::integer, 10000) as global_email_limits,
  COALESCE((t.settings->>'auditLoggingEnabled')::boolean, true) as audit_logging_enabled
FROM tenants t
WHERE t.settings IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM tenant_settings ts WHERE ts.tenant_id = t.id)
ON CONFLICT (tenant_id) DO NOTHING;

-- =============================================
-- DATA VALIDATION QUERIES
-- =============================================

-- Verify migration completeness
SELECT
  'user_preferences' as table_name,
  COUNT(*) as migrated_count
FROM user_preferences
UNION ALL
SELECT
  'company_settings' as table_name,
  COUNT(*) as migrated_count
FROM company_settings
UNION ALL
SELECT
  'tenant_settings' as table_name,
  COUNT(*) as migrated_count
FROM tenant_settings;

-- Check for any data inconsistencies
SELECT
  'users_without_preferences' as check_name,
  COUNT(*) as count
FROM users u
LEFT JOIN user_preferences up ON u.id = up.user_id
WHERE u.preferences IS NOT NULL AND up.user_id IS NULL;

-- =============================================
-- ROLLBACK PREPARATION (if needed)
-- =============================================

-- Create backup of original JSONB data before cleanup
CREATE TABLE IF NOT EXISTS settings_migration_backup AS
SELECT
  'users' as source_table,
  u.id as entity_id,
  u.preferences as original_data,
  NOW() as backed_up_at
FROM users u
WHERE u.preferences IS NOT NULL

UNION ALL

SELECT
  'companies' as source_table,
  c.id as entity_id,
  c.settings as original_data,
  NOW() as backed_up_at
FROM companies c
WHERE c.settings IS NOT NULL

UNION ALL

SELECT
  'tenants' as source_table,
  t.id as entity_id,
  t.settings as original_data,
  NOW() as backed_up_at
FROM tenants t
WHERE t.settings IS NOT NULL;

-- =============================================
-- CLEANUP (run after verification - CAUTION!)
-- =============================================
-- Uncomment the following lines only after verifying migration success:

-- ALTER TABLE users DROP COLUMN IF EXISTS preferences;
-- ALTER TABLE companies DROP COLUMN IF EXISTS settings;
-- ALTER TABLE tenants DROP COLUMN IF EXISTS settings;

-- =============================================
-- POST-MIGRATION REPORTING
-- =============================================

-- Generate migration summary
SELECT
  'Migration Summary' as report,
  (SELECT COUNT(*) FROM user_preferences) as user_preferences_migrated,
  (SELECT COUNT(*) FROM company_settings) as company_settings_migrated,
  (SELECT COUNT(*) FROM tenant_settings) as tenant_settings_migrated,
  NOW() as migration_completed_at;
