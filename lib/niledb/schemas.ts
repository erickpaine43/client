/**
 * NILEDB Token Schemas
 * 
 * Database schema definitions for token management tables.
 * This schema should be applied to the NileDB database.
 */

import { z } from 'zod';

// Token type enum
export const TokenTypeSchema = z.enum(['password_reset', 'email_verification']);

// Token creation schema
export const CreateTokenSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  tokenType: TokenTypeSchema,
  expiresAt: z.number(),
});

// Token validation result schema
export const TokenInfoSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  token: z.string().min(1),
  tokenType: TokenTypeSchema,
  expiresAt: z.number(),
  used: z.boolean(),
  createdAt: z.number(),
  usedAt: z.number().optional(),
});

// Token statistics schema
export const TokenStatsSchema = z.object({
  total: z.number(),
  used: z.number(),
  expired: z.number(),
  active: z.number(),
});

// SQL migration script for tokens table
export const TOKENS_TABLE_SQL = `
-- Create tokens table for NILEDB token management
CREATE TABLE IF NOT EXISTS public.tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  token_type token_type_enum NOT NULL,
  expires_at BIGINT NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at BIGINT,
  created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
  updated_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
  deleted_at BIGINT,
  deleted BOOLEAN DEFAULT FALSE
);

-- Create token type enum
DO $$ BEGIN
  CREATE TYPE token_type_enum AS ENUM ('password_reset', 'email_verification');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tokens_email ON public.tokens (email);
CREATE INDEX IF NOT EXISTS idx_tokens_token ON public.tokens (token);
CREATE INDEX IF NOT EXISTS idx_tokens_type ON public.tokens (token_type);
CREATE INDEX IF NOT EXISTS idx_tokens_expires_at ON public.tokens (expires_at);
CREATE INDEX IF NOT EXISTS idx_tokens_used ON public.tokens (used);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_tokens_email_type ON public.tokens (email, token_type);
CREATE INDEX IF NOT EXISTS idx_tokens_type_used ON public.tokens (token_type, used);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to manage their own tokens
CREATE POLICY "Users can manage their own tokens" ON public.tokens
  FOR ALL 
  USING (
    email IN (
      SELECT u.email 
      FROM users.users u 
      WHERE u.id = current_user_id()
    )
  );

-- Policy: Allow system-level token operations
CREATE POLICY "System can manage all tokens" ON public.tokens
  FOR ALL 
  USING (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = EXTRACT(EPOCH FROM NOW()) * 1000;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_tokens_updated_at ON public.tokens;
CREATE TRIGGER update_tokens_updated_at
  BEFORE UPDATE ON public.tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
`;

// SQL for cleaning up expired tokens (can be used in migration or maintenance)
export const CLEANUP_EXPIRED_TOKENS_SQL = `
-- Clean up expired and old tokens
DELETE FROM public.tokens 
WHERE expires_at < $1 
   OR (used = true AND created_at < $1 - (30 * 24 * 60 * 60 * 1000)) -- 30 days after use
   OR (deleted = true AND created_at < $1 - (7 * 24 * 60 * 60 * 1000)); -- 7 days after deletion

-- Analyze table after cleanup for better query planning
ANALYZE public.tokens;
`;

// SQL for creating views for token management
export const TOKEN_VIEWS_SQL = `
-- View for active tokens (not used, not expired)
CREATE OR REPLACE VIEW public.active_tokens AS
SELECT 
  id,
  email,
  token,
  token_type,
  expires_at,
  created_at,
  CASE 
    WHEN expires_at < EXTRACT(EPOCH FROM NOW()) * 1000 THEN 'expired'
    WHEN used = true THEN 'used'
    ELSE 'active'
  END as status,
  EXTRACT(EPOCH FROM NOW()) * 1000 - created_at as age_ms,
  expires_at - (EXTRACT(EPOCH FROM NOW()) * 1000) as time_until_expiry_ms
FROM public.tokens 
WHERE deleted = false;

-- View for token statistics
CREATE OR REPLACE VIEW public.token_statistics AS
SELECT 
  token_type,
  COUNT(*) as total_tokens,
  COUNT(CASE WHEN used = false AND expires_at >= EXTRACT(EPOCH FROM NOW()) * 1000 THEN 1 END) as active_tokens,
  COUNT(CASE WHEN used = true THEN 1 END) as used_tokens,
  COUNT(CASE WHEN expires_at < EXTRACT(EPOCH FROM NOW()) * 1000 THEN 1 END) as expired_tokens,
  AVG(CASE WHEN used = true THEN EXTRACT(EPOCH FROM NOW()) * 1000 - created_at END) as avg_usage_time_ms
FROM public.tokens 
WHERE deleted = false
GROUP BY token_type;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tokens TO authenticated;
GRANT SELECT ON public.active_tokens TO authenticated;
GRANT SELECT ON public.token_statistics TO authenticated;
`;

export type TokenType = z.infer<typeof TokenTypeSchema>;
export type CreateTokenInput = z.infer<typeof CreateTokenSchema>;
export type TokenInfo = z.infer<typeof TokenInfoSchema>;
export type TokenStats = z.infer<typeof TokenStatsSchema>;
