/**
 * Schema Creation Index
 *
 * Exports all schema creation and drop functions for batch operations.
 */

export { createTenantSchema, dropTenantSchema } from './tenant';
export { createUserSchema, dropUserSchema } from './user';
export { createTeamMemberSchema, dropTeamMemberSchema } from './team-member';
export { createCompanySchema, dropCompanySchema } from './company';
export { createPaymentSchema, dropPaymentSchema } from './payment';
export { createDomainSchema, dropDomainSchema } from './domain';
export { createCompanySettingsSchema, dropCompanySettingsSchema } from './company-settings';
export { createEmailAccountSchema, dropEmailAccountSchema } from './email-account';
export { createLeadsSchema, dropLeadsSchema } from './leads';
export { createCampaignSchema, dropCampaignSchema } from './campaign';
export { createTemplatesSchema, dropTemplatesSchema } from './templates';
export { createInboxMessagesSchema, dropInboxMessagesSchema } from './inbox-messages';
export { createEmailServiceSchema, dropEmailServiceSchema } from './emailservice';

/**
 * Create all schemas in dependency order
 */
export async function createAllSchemas(): Promise<void> {
  console.log('Creating all database schemas...');

  // Create base entities first
  await createTenantSchema();
  await createUserSchema();

  // Create dependent entities
  await createTeamMemberSchema();
  await createCompanySchema();
  await createPaymentSchema();
  await createDomainSchema();
  await createCompanySettingsSchema();
  await createEmailAccountSchema();
  await createLeadsSchema();
  await createCampaignSchema();
  await createTemplatesSchema();
  await createInboxMessagesSchema();
  await createEmailServiceSchema();

  console.log('✓ All schemas created successfully');
}

/**
 * Drop all schemas in reverse dependency order
 */
export async function dropAllSchemas(): Promise<void> {
  console.log('Dropping all database schemas...');

  // Drop in reverse dependency order
  await dropEmailServiceSchema();
  await dropInboxMessagesSchema();
  await dropTemplatesSchema();
  await dropCampaignSchema();
  await dropLeadsSchema();
  await dropEmailAccountSchema();
  await dropCompanySettingsSchema();
  await dropDomainSchema();
  await dropPaymentSchema();
  await dropCompanySchema();
  await dropTeamMemberSchema();
  await dropUserSchema();
  await dropTenantSchema();

  console.log('✓ All schemas dropped successfully');
}
