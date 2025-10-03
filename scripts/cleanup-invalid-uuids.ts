#!/usr/bin/env tsx

/**
 * Cleanup Invalid UUIDs in Database
 *
 * This script identifies and fixes users with invalid UUID formats in the database.
 * It updates user IDs to proper UUID format and maintains referential integrity.
 */

import { getNileClient } from '../lib/niledb/client';
import { randomUUID } from 'crypto';

interface UserWithInvalidId {
  old_id: string;
  email: string;
  name?: string;
}

async function findUsersWithInvalidUuids(): Promise<UserWithInvalidId[]> {
  const nile = getNileClient();

  try {
    // Find users with IDs that don't match UUID format
    const result = await nile.db.query(`
      SELECT id as old_id, email, name
      FROM users.users
      WHERE deleted IS NULL
      AND id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    `);

    return result.rows.map((row: { old_id: string; email: string; name?: string }) => ({
      old_id: row.old_id,
      email: row.email,
      name: row.name,
    }));
  } catch (error) {
    console.error('Failed to find users with invalid UUIDs:', error);
    throw error;
  }
}

async function updateUserId(oldId: string, newId: string): Promise<void> {
  const nile = getNileClient();

  try {
    // Update user ID in users table
    await nile.db.query(
      'UPDATE users.users SET id = $1 WHERE id = $2 AND deleted IS NULL',
      [newId, oldId]
    );

    // Update references in user_profiles
    await nile.db.query(
      'UPDATE public.user_profiles SET user_id = $1 WHERE user_id = $2 AND deleted IS NULL',
      [newId, oldId]
    );

    // Update references in tenant_users
    await nile.db.query(
      'UPDATE users.tenant_users SET user_id = $1 WHERE user_id = $2 AND deleted IS NULL',
      [newId, oldId]
    );

    // Update references in user_companies
    await nile.db.query(
      'UPDATE public.user_companies SET user_id = $1 WHERE user_id = $2 AND deleted IS NULL',
      [newId, oldId]
    );

    // Update references in audit_logs
    await nile.db.query(
      'UPDATE public.audit_logs SET user_id = $1 WHERE user_id = $2',
      [newId, oldId]
    );

    console.log(`✅ Updated user ID: ${oldId} → ${newId}`);
  } catch (error) {
    console.error(`❌ Failed to update user ${oldId}:`, error);
    throw error;
  }
}

async function main(): Promise<void> {
  console.log('🧹 Starting UUID cleanup...\n');

  try {
    const invalidUsers = await findUsersWithInvalidUuids();

    if (invalidUsers.length === 0) {
      console.log('🎉 No users with invalid UUIDs found!');
      return;
    }

    console.log(`Found ${invalidUsers.length} users with invalid UUIDs:`);
    invalidUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.old_id})`);
    });

    console.log('\n🔄 Updating user IDs...\n');

    for (const user of invalidUsers) {
      const newId = randomUUID();
      await updateUserId(user.old_id, newId);
    }

    console.log('\n✅ UUID cleanup completed successfully!');
    console.log(`Updated ${invalidUsers.length} users with valid UUIDs.`);

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}
