/**
 * Create Monitoring and Recovery Schema
 * 
 * Creates the necessary database tables for the enhanced error handling,
 * monitoring, and recovery system.
 */

import { withoutTenantContext } from '../lib/niledb/client';
import { logError } from '../lib/niledb/errors';

async function createMonitoringSchema() {
  try {
    console.log('Creating monitoring and recovery schema...');

    await withoutTenantContext(async (nile) => {
      // Create recovery_points table
      await nile.db.query(`
        CREATE TABLE IF NOT EXISTS public.recovery_points (
          id VARCHAR(255) NOT NULL,
          tenant_id UUID NOT NULL REFERENCES public.tenants(id),
          timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          operation VARCHAR(255) NOT NULL,
          metadata JSONB DEFAULT '{}',
          checksum VARCHAR(255),
          created TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          deleted TIMESTAMPTZ,
          PRIMARY KEY (id, tenant_id)
        );
      `);

      // Create system_backups table
      await nile.db.query(`
        CREATE TABLE IF NOT EXISTS public.system_backups (
          id VARCHAR(255) PRIMARY KEY,
          timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          tables JSONB NOT NULL DEFAULT '[]',
          record_counts JSONB NOT NULL DEFAULT '{}',
          checksums JSONB NOT NULL DEFAULT '{}',
          metadata JSONB NOT NULL DEFAULT '{}',
          created TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          deleted TIMESTAMPTZ
        );
      `);

      // Create error_logs table for centralized error tracking
      await nile.db.query(`
        CREATE TABLE IF NOT EXISTS public.error_logs (
          id UUID NOT NULL DEFAULT gen_random_uuid(),
          tenant_id UUID NOT NULL REFERENCES public.tenants(id),
          timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          error_type VARCHAR(255) NOT NULL,
          error_code VARCHAR(255),
          message TEXT NOT NULL,
          stack_trace TEXT,
          context JSONB DEFAULT '{}',
          user_id UUID,
          request_id VARCHAR(255),
          endpoint VARCHAR(255),
          severity VARCHAR(50) DEFAULT 'error',
          resolved BOOLEAN DEFAULT FALSE,
          created TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id, tenant_id)
        );
      `);

      // Create performance_metrics table
      await nile.db.query(`
        CREATE TABLE IF NOT EXISTS public.performance_metrics (
          id UUID NOT NULL DEFAULT gen_random_uuid(),
          tenant_id UUID NOT NULL REFERENCES public.tenants(id),
          timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          request_id VARCHAR(255),
          operation VARCHAR(255) NOT NULL,
          duration_ms INTEGER NOT NULL,
          status_code INTEGER,
          user_id UUID,
          endpoint VARCHAR(255),
          method VARCHAR(10),
          error_message TEXT,
          created TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id, tenant_id)
        );
      `);

      // Create alert_rules table
      await nile.db.query(`
        CREATE TABLE IF NOT EXISTS public.alert_rules (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          condition_type VARCHAR(100) NOT NULL,
          condition_config JSONB NOT NULL DEFAULT '{}',
          severity VARCHAR(50) NOT NULL DEFAULT 'medium',
          cooldown_ms INTEGER NOT NULL DEFAULT 300000,
          enabled BOOLEAN NOT NULL DEFAULT TRUE,
          last_triggered TIMESTAMPTZ,
          created_by UUID,
          created TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          deleted TIMESTAMPTZ
        );
      `);

      // Create alert_history table
      await nile.db.query(`
        CREATE TABLE IF NOT EXISTS public.alert_history (
          id SERIAL PRIMARY KEY,
          alert_rule_id VARCHAR(255) REFERENCES public.alert_rules(id),
          timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          severity VARCHAR(50) NOT NULL,
          message TEXT NOT NULL,
          metrics JSONB DEFAULT '{}',
          acknowledged BOOLEAN DEFAULT FALSE,
          acknowledged_by UUID,
          acknowledged_at TIMESTAMPTZ,
          created TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create indexes for performance
      await nile.db.query(`
        CREATE INDEX IF NOT EXISTS idx_recovery_points_timestamp 
        ON public.recovery_points(timestamp);
      `);

      await nile.db.query(`
        CREATE INDEX IF NOT EXISTS idx_recovery_points_operation 
        ON public.recovery_points(operation);
      `);

      await nile.db.query(`
        CREATE INDEX IF NOT EXISTS idx_recovery_points_tenant_id 
        ON public.recovery_points(tenant_id);
      `);

      await nile.db.query(`
        CREATE INDEX IF NOT EXISTS idx_system_backups_timestamp 
        ON public.system_backups(timestamp);
      `);

      await nile.db.query(`
        CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp 
        ON public.error_logs(timestamp);
      `);

      await nile.db.query(`
        CREATE INDEX IF NOT EXISTS idx_error_logs_error_type 
        ON public.error_logs(error_type);
      `);

      await nile.db.query(`
        CREATE INDEX IF NOT EXISTS idx_error_logs_user_id 
        ON public.error_logs(user_id);
      `);

      await nile.db.query(`
        CREATE INDEX IF NOT EXISTS idx_error_logs_tenant_id 
        ON public.error_logs(tenant_id);
      `);

      await nile.db.query(`
        CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp 
        ON public.performance_metrics(timestamp);
      `);

      await nile.db.query(`
        CREATE INDEX IF NOT EXISTS idx_performance_metrics_operation 
        ON public.performance_metrics(operation);
      `);

      await nile.db.query(`
        CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id 
        ON public.performance_metrics(user_id);
      `);

      await nile.db.query(`
        CREATE INDEX IF NOT EXISTS idx_alert_rules_enabled 
        ON public.alert_rules(enabled);
      `);

      await nile.db.query(`
        CREATE INDEX IF NOT EXISTS idx_alert_history_timestamp 
        ON public.alert_history(timestamp);
      `);

      await nile.db.query(`
        CREATE INDEX IF NOT EXISTS idx_alert_history_alert_rule_id 
        ON public.alert_history(alert_rule_id);
      `);

      console.log('✅ Monitoring and recovery schema created successfully');
    });

  } catch (error) {
    console.error('❌ Failed to create monitoring schema:', error);
    logError(error, { operation: 'create_monitoring_schema' });
    throw error;
  }
}

async function insertDefaultAlertRules() {
  try {
    console.log('Inserting default alert rules...');

    await withoutTenantContext(async (nile) => {
      // High error rate alert
      await nile.db.query(`
        INSERT INTO public.alert_rules (
          id, name, condition_type, condition_config, severity, cooldown_ms, enabled
        ) VALUES (
          'high_error_rate',
          'High Error Rate',
          'error_rate_threshold',
          '{"threshold": 0.1, "window_minutes": 5}',
          'high',
          300000,
          true
        ) ON CONFLICT (id) DO NOTHING;
      `);

      // Slow response time alert
      await nile.db.query(`
        INSERT INTO public.alert_rules (
          id, name, condition_type, condition_config, severity, cooldown_ms, enabled
        ) VALUES (
          'slow_response_time',
          'Slow Response Time',
          'response_time_threshold',
          '{"threshold_ms": 5000, "window_minutes": 5}',
          'medium',
          300000,
          true
        ) ON CONFLICT (id) DO NOTHING;
      `);

      // Database health alert
      await nile.db.query(`
        INSERT INTO public.alert_rules (
          id, name, condition_type, condition_config, severity, cooldown_ms, enabled
        ) VALUES (
          'database_unhealthy',
          'Database Unhealthy',
          'health_check_failure',
          '{"component": "database"}',
          'critical',
          120000,
          true
        ) ON CONFLICT (id) DO NOTHING;
      `);

      // High memory usage alert
      await nile.db.query(`
        INSERT INTO public.alert_rules (
          id, name, condition_type, condition_config, severity, cooldown_ms, enabled
        ) VALUES (
          'high_memory_usage',
          'High Memory Usage',
          'memory_usage_threshold',
          '{"threshold_percentage": 90}',
          'medium',
          600000,
          true
        ) ON CONFLICT (id) DO NOTHING;
      `);

      console.log('✅ Default alert rules inserted successfully');
    });

  } catch (error) {
    console.error('❌ Failed to insert default alert rules:', error);
    logError(error, { operation: 'insert_default_alert_rules' });
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting monitoring schema creation...');
    
    await createMonitoringSchema();
    await insertDefaultAlertRules();
    
    console.log('✅ Monitoring schema setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Monitoring schema setup failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { createMonitoringSchema, insertDefaultAlertRules };
