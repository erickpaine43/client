#!/usr/bin/env tsx

/**
 * Create Missing User Profiles
 *
 * This script identifies users who don't have corresponding profiles in the user_profiles table
 * and creates default profiles for them. This ensures every user has a profile record.
 */

import { getNileClient } from '../lib/niledb/client';

interface MissingProfile {
  user_id: string;
  email: string;
  name?: string;
}

async function findUsersWithoutProfiles(): Promise<MissingProfile[]> {
  const nile = getNileClient();

  try {
    const result = await nile.db.query(`
      SELECT u.id as user_id, u.email, u.name
      FROM users.users u
      LEFT JOIN public.user_profiles up ON u.id = up.user_id
      WHERE up.user_id IS NULL AND u.deleted IS NULL
    `);

    return result.rows.map((row: { user_id: string; email: string; name?: string }) => ({
      user_id: row.user_id,
      email: row.email,
      name: row.name,
    }));
  } catch (error) {
    console.error('Failed to find users without profiles:', error);
    throw error;
  }
}

async function createUserProfiles(missingProfiles: MissingProfile[]): Promise<void> {
  const nile = getNileClient();

  console.log(`Creating profiles for ${missingProfiles.length} users...`);

  for (const profile of missingProfiles) {
    try {
      await nile.db.query(`
        INSERT INTO public.user_profiles (user_id, role, preferences, created, updated)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        profile.user_id,
        'user', // default role
        {} // empty preferences
      ]);

      console.log(`✅ Created profile for user: ${profile.email}`);
    } catch (error) {
      console.error(`❌ Failed to create profile for user ${profile.email}:`, error);
    }
  }
}

async function main(): Promise<void> {
  console.log('🔍 Finding users without profiles...\n');

  try {
    const missingProfiles = await findUsersWithoutProfiles();

    if (missingProfiles.length === 0) {
      console.log('🎉 All users already have profiles!');
      return;
    }

    console.log(`Found ${missingProfiles.length} users without profiles:`);
    missingProfiles.forEach(profile => {
      console.log(`  - ${profile.email} (${profile.user_id})`);
    });

    console.log('');
    await createUserProfiles(missingProfiles);

    console.log('\n✅ Script completed successfully!');
    console.log(`Created ${missingProfiles.length} missing user profiles.`);

  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}
