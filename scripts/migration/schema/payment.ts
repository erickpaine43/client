/**
 * Payment Schema Creation Script
 *
 * Creates the payment table schema in NileDB.
 * Payments handle payment-related data.
 */

import { getMigrationClient } from '../config';

export async function createPaymentSchema(): Promise<void> {
  const nile = getMigrationClient();

  try {
    console.log('Creating payment schema...');

    // Create payment table
    await nile.db.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount BIGINT NOT NULL CHECK (amount > 0),
        currency VARCHAR(3) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        "processedAt" TIMESTAMP WITH TIME ZONE
      );
    `);

    // Create indexes
    await nile.db.query(`
      CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
      CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
      CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments("createdAt");
    `);

    console.log('✓ Payment schema created successfully');
  } catch (error) {
    console.error('✗ Failed to create payment schema:', error);
    throw error;
  }
}

export async function dropPaymentSchema(): Promise<void> {
  const nile = getMigrationClient();

  try {
    console.log('Dropping payment schema...');

    // Drop indexes
    await nile.db.query(`
      DROP INDEX IF EXISTS idx_payments_user_id;
      DROP INDEX IF EXISTS idx_payments_status;
      DROP INDEX IF EXISTS idx_payments_created_at;
    `);

    // Drop table
    await nile.db.query(`DROP TABLE IF EXISTS payments;`);

    console.log('✓ Payment schema dropped successfully');
  } catch (error) {
    console.error('✗ Failed to drop payment schema:', error);
    throw error;
  }
}
