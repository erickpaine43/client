/**
 * User Preferences Table Schema - Single Source of Truth
 *
 * This file contains the SQL schema definitions for the user_preferences table.
 * User preferences define individual user settings and notification preferences.
 */

export const CREATE_USER_PREFERENCES_TABLE = `
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Theme and appearance settings
    theme VARCHAR(50) NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    timezone VARCHAR(100) NOT NULL DEFAULT 'UTC',

    -- Notification preferences
    email_notifications BOOLEAN NOT NULL DEFAULT true,
    push_notifications BOOLEAN NOT NULL DEFAULT false,
    weekly_reports BOOLEAN NOT NULL DEFAULT true,
    marketing_emails BOOLEAN NOT NULL DEFAULT false,

    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    -- Constraints
    UNIQUE(user_id),
    CHECK (language ~ '^[a-z]{2}(-[A-Z]{2})?$'),
    CHECK (timezone ~ '^[A-Za-z/_+-]+$')
);
`;

export const CREATE_USER_PREFERENCES_INDEXES = `
-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_theme ON user_preferences(theme);
`;

export const CREATE_USER_PREFERENCES_TRIGGERS = `
-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_user_preferences_updated_at();
`;

export const DROP_USER_PREFERENCES_TRIGGERS = `
DROP TRIGGER IF EXISTS trigger_update_user_preferences_updated_at ON user_preferences;
`;

export const DROP_USER_PREFERENCES_INDEXES = `
DROP INDEX IF EXISTS idx_user_preferences_user_id;
DROP INDEX IF EXISTS idx_user_preferences_theme;
`;

export const DROP_USER_PREFERENCES_TABLE = `
DROP TABLE IF EXISTS user_preferences;
`;

export async function createUserPreferencesSchema(): Promise<void> {
  const { getMigrationClient } = await import('../config');
  const nile = getMigrationClient();

  try {
    console.log('Creating user preferences schema...');

    // Execute table creation
    await nile.db.query(CREATE_USER_PREFERENCES_TABLE);

    // Execute indexes creation
    await nile.db.query(CREATE_USER_PREFERENCES_INDEXES);

    // Execute triggers creation
    await nile.db.query(CREATE_USER_PREFERENCES_TRIGGERS);

    console.log('✓ User preferences schema created successfully');
  } catch (error) {
    console.error('✗ Failed to create user preferences schema:', error);
    throw error;
  }
}

export async function dropUserPreferencesSchema(): Promise<void> {
  const { getMigrationClient } = await import('../config');
  const nile = getMigrationClient();

  try {
    console.log('Dropping user preferences schema...');

    // Drop triggers first
    await nile.db.query(DROP_USER_PREFERENCES_TRIGGERS);

    // Drop indexes
    await nile.db.query(DROP_USER_PREFERENCES_INDEXES);

    // Drop table
    await nile.db.query(DROP_USER_PREFERENCES_TABLE);

    console.log('✓ User preferences schema dropped successfully');
  } catch (error) {
    console.error('✗ Failed to drop user preferences schema:', error);
    throw error;
  }
}
