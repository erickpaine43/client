/**
 * Schema Creation Index
 *
 * Exports all schema creation and drop functions for batch operations.
 */

import { createTenantSchema, dropTenantSchema } from './tenant';
import { createUserSchema, dropUserSchema } from './user';
import { createCompanySchema, dropCompanySchema } from './company';
import { createPlansSchema, dropPlansSchema } from './plans';
import { createPaymentSchema, dropPaymentSchema } from './payment';
import { createDomainSchema, dropDomainSchema } from './domain';
import { createCompanySettingsSchema, dropCompanySettingsSchema } from './company-settings';
import { createUserPreferencesSchema, dropUserPreferencesSchema } from './user-preferences';
import { createTenantSettingsSchema, dropTenantSettingsSchema } from './tenant-settings';
import { createEmailAccountSchema, dropEmailAccountSchema } from './email-account';
import { createLeadsSchema, dropLeadsSchema } from './leads';
import { createCampaignSchema, dropCampaignSchema } from './campaign';
import { createTemplatesSchema, dropTemplatesSchema } from './templates';
import { createCampaignSequenceStepsSchema, dropCampaignSequenceStepsSchema } from './campaign-sequence-steps';
import { createInboxMessagesSchema, dropInboxMessagesSchema } from './inbox-messages';

export {
  createTenantSchema,
  dropTenantSchema,
  createUserSchema,
  dropUserSchema,
  createCompanySchema,
  dropCompanySchema,
  createPlansSchema,
  dropPlansSchema,
  createPaymentSchema,
  dropPaymentSchema,
  createDomainSchema,
  dropDomainSchema,
  createCompanySettingsSchema,
  dropCompanySettingsSchema,
  createUserPreferencesSchema,
  dropUserPreferencesSchema,
  createTenantSettingsSchema,
  dropTenantSettingsSchema,
  createEmailAccountSchema,
  dropEmailAccountSchema,
  createLeadsSchema,
  dropLeadsSchema,
  createCampaignSchema,
  dropCampaignSchema,
  createCampaignSequenceStepsSchema,
  dropCampaignSequenceStepsSchema,
  createTemplatesSchema,
  dropTemplatesSchema,
  createInboxMessagesSchema,
  dropInboxMessagesSchema,
};

/**
 * Create all schemas in dependency order
 */
export async function createAllSchemas(): Promise<void> {
  console.log('Creating all database schemas...');

  // Create base entities first
  await createTenantSchema();
  await createUserSchema();

  // Create plans early as they're referenced by payments
  await createPlansSchema();

  // Create dependent entities
  await createCompanySchema();
  await createPaymentSchema();
  await createDomainSchema();
  await createCompanySettingsSchema();
  await createUserPreferencesSchema();
  await createTenantSettingsSchema();
  await createEmailAccountSchema();
  await createLeadsSchema();
  await createCampaignSchema();
  await createCampaignSequenceStepsSchema();
  await createInboxMessagesSchema();
  await createTemplatesSchema();

  console.log('✓ All schemas created successfully');
}

/**
 * Drop all schemas in reverse dependency order
 */
export async function dropAllSchemas(): Promise<void> {
  console.log('Dropping all database schemas...');

  // Drop in reverse dependency order
  await dropTemplatesSchema();
  await dropInboxMessagesSchema();
  await dropCampaignSequenceStepsSchema();
  await dropCampaignSchema();
  await dropLeadsSchema();
  await dropEmailAccountSchema();
  await dropUserPreferencesSchema();
  await dropTenantSettingsSchema();
  await dropCompanySettingsSchema();
  await dropDomainSchema();
  await dropPaymentSchema();
  await dropPlansSchema();
  await dropCompanySchema();
  await dropUserSchema();
  await dropTenantSchema();

  console.log('✓ All schemas dropped successfully');
}
