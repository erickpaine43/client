#!/usr/bin/env tsx

/**
 * Database Seeding
 *
 * Populates development and testing environments with realistic mock data.
 * Prevents execution in production environments.
 */

import { getNileClient, type Server } from '../../lib/niledb/client';

// Simple type for database query results
interface DbRow {
  [key: string]: unknown;
}

interface SeedData {
  id: string;
  name: string;
  description: string;
  seed: (nile: Server) => Promise<void>;
  rollback?: (nile: Server) => Promise<void>;
}

// Environment check
function isProduction(): boolean {
  return process.env.NODE_ENV === 'production' ||
         process.env.NILEDB_ENV === 'production' ||
         process.env.VERCEL_ENV === 'production';
}

function isDevelopmentOrTest(): boolean {
  return process.env.NODE_ENV === 'development' ||
         process.env.NODE_ENV === 'test' ||
         process.env.NILEDB_ENV === 'development' ||
         process.env.NILEDB_ENV === 'test';
}

// Seed data definitions
const seedData: SeedData[] = [
  {
    id: 'sample_tenants',
    name: 'Sample Tenants',
    description: 'Creates sample tenant organizations',
    seed: async (nile: Server) => {
      const tenants = [
        { name: 'Acme Corporation' },
        { name: 'TechStart Inc' },
        { name: 'Global Solutions Ltd' },
      ];

      for (const tenant of tenants) {
        await nile.db.query(
          'INSERT INTO tenants (name) VALUES ($1) ON CONFLICT DO NOTHING',
          [tenant.name]
        );
      }
    },
    rollback: async (nile: Server) => {
      await nile.db.query(
        "DELETE FROM tenants WHERE name IN ('Acme Corporation', 'TechStart Inc', 'Global Solutions Ltd')"
      );
    },
  },

  {
    id: 'sample_users',
    name: 'Sample Users',
    description: 'Creates sample users with profiles',
    seed: async (nile: Server) => {
      // Note: In NileDB, users are typically created through auth system
      // This creates user profiles for existing users
      const profiles = [
        {
          user_id: '550e8400-e29b-41d4-a716-446655440000', // Mock UUID
          role: 'admin',
          is_staff: true,
          preferences: { theme: 'dark', notifications: { email: true } }
        },
        {
          user_id: '550e8400-e29b-41d4-a716-446655440001',
          role: 'user',
          is_staff: false,
          preferences: { theme: 'light', notifications: { email: false } }
        },
      ];

      for (const profile of profiles) {
        await nile.db.query(`
          INSERT INTO public.user_profiles (user_id, role, is_penguinmails_staff, preferences)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (user_id) DO NOTHING
        `, [profile.user_id, profile.role, profile.is_staff, profile.preferences]);
      }
    },
    rollback: async (nile: Server) => {
      await nile.db.query(`
        DELETE FROM public.user_profiles
        WHERE user_id IN ('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001')
      `);
    },
  },

  {
    id: 'sample_tenant_users',
    name: 'Sample Tenant Users',
    description: 'Links users to tenants',
    seed: async (nile: Server) => {
      // Get first tenant
      const tenantResult = await nile.db.query('SELECT id FROM tenants LIMIT 1');
      if (tenantResult.rows.length === 0) return;

      const tenantId = (tenantResult.rows[0] as DbRow).id;
      const userIds = ['550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001'];

      for (const userId of userIds) {
        await nile.db.query(`
          INSERT INTO users.tenant_users (tenant_id, user_id, email, roles)
          VALUES ($1, $2, $3 || '@example.com', $4)
          ON CONFLICT (tenant_id, user_id) DO NOTHING
        `, [tenantId, userId, 'user' + userId.slice(-4), ['member']]);
      }
    },
    rollback: async (nile: Server) => {
      const userIds = ['550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001'];
      await nile.db.query(`
        DELETE FROM users.tenant_users
        WHERE user_id = ANY($1)
      `, [userIds]);
    },
  },
];

export async function seedDatabase(): Promise<void> {
  if (isProduction()) {
    throw new Error('❌ Seeding is not allowed in production environment');
  }

  if (!isDevelopmentOrTest()) {
    console.warn('⚠️  Environment not recognized as development/test. Seeding anyway...');
  }

  const nile = getNileClient();

  console.log('🌱 Starting database seeding...\n');

  try {
    for (const seed of seedData) {
      console.log(`🌱 Seeding: ${seed.name}`);
      console.log(`   ${seed.description}`);

      await seed.seed(nile);
      console.log(`✅ Seeding completed: ${seed.id}\n`);
    }

    console.log('🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('💥 Database seeding failed:', error);
    throw error;
  }
}

export async function rollbackSeed(): Promise<void> {
  if (isProduction()) {
    throw new Error('❌ Seed rollback is not allowed in production environment');
  }

  const nile = getNileClient();

  console.log('🔄 Starting seed rollback...\n');

  try {
    // Rollback in reverse order
    for (const seed of [...seedData].reverse()) {
      if (seed.rollback) {
        console.log(`🔄 Rolling back: ${seed.name}`);
        await seed.rollback(nile);
        console.log(`✅ Rollback completed: ${seed.id}\n`);
      }
    }

    console.log('🎉 Seed rollback completed successfully!');

  } catch (error) {
    console.error('💥 Seed rollback failed:', error);
    throw error;
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];

  if (command === 'rollback') {
    rollbackSeed()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  } else if (command === 'seed' || !command) {
    seedDatabase()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  } else {
    console.log('Usage: tsx seed.ts [seed|rollback]');
    process.exit(1);
  }
}
