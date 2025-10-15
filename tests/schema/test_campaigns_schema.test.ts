import { describe, it, expect } from '@jest/globals';
import { CREATE_CAMPAIGNS_TABLE } from '../../scripts/migration/schema/campaign';

// Test validates that the campaigns table schema matches DB migration expectations

describe('Campaigns Schema Validation', () => {
  it('should validate campaigns table schema exists', () => {
    // Check that schema constant is defined
    expect(CREATE_CAMPAIGNS_TABLE).toBeDefined();
    expect(typeof CREATE_CAMPAIGNS_TABLE).toBe('string');
    expect(CREATE_CAMPAIGNS_TABLE).toContain('CREATE TABLE IF NOT EXISTS campaigns');
  });

  it('should validate required columns exist', () => {
    const expectedColumns = [
      'id',
      'company_id',
      'name',
      'description',
      'status',
      'scheduled_at',
      'completed_at',
      'settings',
      'created_at',
      'updated_at'
    ];

    // Check each column exists in the schema
    expectedColumns.forEach(column => {
      expect(CREATE_CAMPAIGNS_TABLE).toContain(column);
    });

    // Verify total number of expected columns
    expect(expectedColumns.length).toBe(10);
  });

  it('should validate data types and constraints', () => {
    // Check for UUID primary key
    expect(CREATE_CAMPAIGNS_TABLE).toContain('id UUID PRIMARY KEY DEFAULT gen_random_uuid()');

    // Check for company_id foreign key reference
    expect(CREATE_CAMPAIGNS_TABLE).toContain('company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE');

    // Check for name constraints
    expect(CREATE_CAMPAIGNS_TABLE).toContain('name VARCHAR(200) NOT NULL');
    expect(CREATE_CAMPAIGNS_TABLE).toContain('char_length(name) >= 1 AND char_length(name) <= 200');

    // Check for status enum values
    expect(CREATE_CAMPAIGNS_TABLE).toContain('status IN (\'draft\', \'scheduled\', \'running\', \'completed\', \'failed\', \'cancelled\')');

    // Check for settings JSONB
    expect(CREATE_CAMPAIGNS_TABLE).toContain('settings JSONB NOT NULL DEFAULT');

    // Check for timestamps
    expect(CREATE_CAMPAIGNS_TABLE).toContain('created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()');
    expect(CREATE_CAMPAIGNS_TABLE).toContain('updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()');

    // Check for status/completed_at constraints
    expect(CREATE_CAMPAIGNS_TABLE).toContain('completed_at IS NULL OR status = \'completed\'');
  });
});
