/**
 * Payment Table Schema - Single Source of Truth
 *
 * This file contains the SQL schema definitions for the payments table.
 * Payments handle payment-related data and billing transactions.
 */

export const CREATE_PAYMENTS_TABLE = `
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "processedAt" TIMESTAMP WITH TIME ZONE,

  -- Plan and billing relationships
  plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  next_payment_due_at TIMESTAMP WITH TIME ZONE
);
`;

export const CREATE_PAYMENTS_INDEXES = `
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments("createdAt");
`;

export const DROP_PAYMENTS_INDEXES = `
DROP INDEX IF EXISTS idx_payments_user_id;
DROP INDEX IF EXISTS idx_payments_status;
DROP INDEX IF EXISTS idx_payments_created_at;
`;

export const DROP_PAYMENTS_TABLE = `
DROP TABLE IF EXISTS payments;
`;

export async function createPaymentSchema(): Promise<void> {
  const { getMigrationClient } = await import('../config');
  const nile = getMigrationClient();

  try {
    console.log('Creating payment schema...');

    // Execute table creation
    await nile.db.query(CREATE_PAYMENTS_TABLE);

    // Execute indexes creation
    await nile.db.query(CREATE_PAYMENTS_INDEXES);

    console.log('✓ Payment schema created successfully');
  } catch (error) {
    console.error('✗ Failed to create payment schema:', error);
    throw error;
  }
}

export async function dropPaymentSchema(): Promise<void> {
  const { getMigrationClient } = await import('../config');
  const nile = getMigrationClient();

  try {
    console.log('Dropping payment schema...');

    // Drop indexes
    await nile.db.query(DROP_PAYMENTS_INDEXES);

    // Drop table
    await nile.db.query(DROP_PAYMENTS_TABLE);

    console.log('✓ Payment schema dropped successfully');
  } catch (error) {
    console.error('✗ Failed to drop payment schema:', error);
    throw error;
  }
}
