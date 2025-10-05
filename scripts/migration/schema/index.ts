/**
 * Schema Creation Index
 *
 * Exports all schema creation and drop functions for batch operations.
 */

import { createTenantSchema, dropTenantSchema } from './tenant';
import { createUserSchema, dropUserSchema } from './user';
import { createTeamMemberSchema, dropTeamMemberSchema } from './team-member';
import { createCompanySchema, dropCompanySchema } from './company';
import { createPaymentSchema, dropPaymentSchema } from './payment';
import { createDomainSchema, dropDomainSchema } from './domain';
import { createCompanySettingsSchema, dropCompanySettingsSchema } from './company-settings';
import { createEmailAccountSchema, dropEmailAccountSchema } from './email-account';
import { createLeadsSchema, dropLeadsSchema } from './leads';
import { createCampaignSchema, dropCampaignSchema } from './campaign';
import { createTemplatesSchema, dropTemplatesSchema } from './templates';
import { createInboxMessagesSchema, dropInboxMessagesSchema } from './inbox-messages';
import { createEmailServiceSchema, dropEmailServiceSchema } from './emailservice';

export {
  createTenantSchema,
  dropTenantSchema,
  createUserSchema,
  dropUserSchema,
  createTeamMemberSchema,
  dropTeamMemberSchema,
  createCompanySchema,
  dropCompanySchema,
  createPaymentSchema,
  dropPaymentSchema,
  createDomainSchema,
  dropDomainSchema,
  createCompanySettingsSchema,
  dropCompanySettingsSchema,
  createEmailAccountSchema,
  dropEmailAccountSchema,
  createLeadsSchema,
  dropLeadsSchema,
  createCampaignSchema,
  dropCampaignSchema,
  createTemplatesSchema,
  dropTemplatesSchema,
  createInboxMessagesSchema,
  dropInboxMessagesSchema,
  createEmailServiceSchema,
  dropEmailServiceSchema
};

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
