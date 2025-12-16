-- ============================================================================
-- ANALYTICS SCHEMA FOR NILEDB OLAP DATABASE (Port 5444)
-- ============================================================================
-- This schema creates the analytics tables needed for the migrated
-- Convex to NileDB analytics system.
--
-- USAGE:
-- psql -h localhost -p 5444 -U nile -d nile < analytics-schema.sql
-- ============================================================================

-- Drop existing tables if they exist (for clean reinstall)
DROP TABLE IF EXISTS cross_domain_analytics CASCADE;
DROP TABLE IF EXISTS domain_analytics CASCADE;
DROP TABLE IF EXISTS mailbox_analytics CASCADE;

-- ============================================================================
-- DOMAIN ANALYTICS TABLE
-- ============================================================================
-- Stores aggregated analytics data for each domain
-- Data is typically aggregated from mailbox-level metrics

CREATE TABLE domain_analytics (
  -- Primary identification
  domain_id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL,
  domain_name TEXT NOT NULL,
  
  -- Email volume metrics
  sent INTEGER DEFAULT 0 NOT NULL,
  delivered INTEGER DEFAULT 0 NOT NULL,
  opened_tracked INTEGER DEFAULT 0 NOT NULL,
  clicked_tracked INTEGER DEFAULT 0 NOT NULL,
  replied INTEGER DEFAULT 0 NOT NULL,
  bounced INTEGER DEFAULT 0 NOT NULL,
  unsubscribed INTEGER DEFAULT 0 NOT NULL,
  spam_complaints INTEGER DEFAULT 0 NOT NULL,
  
  -- Authentication status
  authentication_spf BOOLEAN DEFAULT false NOT NULL,
  authentication_dkim BOOLEAN DEFAULT false NOT NULL,
  authentication_dmarc BOOLEAN DEFAULT false NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_domain_analytics_company ON domain_analytics(company_id);
CREATE INDEX idx_domain_analytics_updated ON domain_analytics(updated_at DESC);
CREATE INDEX idx_domain_analytics_domain_name ON domain_analytics(domain_name);

-- ============================================================================
-- MAILBOX ANALYTICS TABLE
-- ============================================================================
-- Stores analytics data for individual mailboxes
-- This is the source of truth for mailbox-level metrics

CREATE TABLE mailbox_analytics (
  -- Primary identification
  mailbox_id TEXT PRIMARY KEY,
  domain_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  email TEXT NOT NULL,
  
  -- Email volume metrics
  sent INTEGER DEFAULT 0 NOT NULL,
  delivered INTEGER DEFAULT 0 NOT NULL,
  opened_tracked INTEGER DEFAULT 0 NOT NULL,
  clicked_tracked INTEGER DEFAULT 0 NOT NULL,
  replied INTEGER DEFAULT 0 NOT NULL,
  bounced INTEGER DEFAULT 0 NOT NULL,
  unsubscribed INTEGER DEFAULT 0 NOT NULL,
  spam_complaints INTEGER DEFAULT 0 NOT NULL,
  
  -- Mailbox status
  warmup_status TEXT DEFAULT 'NOT_STARTED' NOT NULL,
  warmup_progress INTEGER DEFAULT 0 NOT NULL,
  daily_limit INTEGER DEFAULT 50 NOT NULL,
  current_volume INTEGER DEFAULT 0 NOT NULL,
  health_score INTEGER DEFAULT 100 NOT NULL,
  
  -- Provider information
  provider TEXT DEFAULT 'LOCAL_SMTP' NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  
  -- Foreign key constraint
  CONSTRAINT fk_mailbox_domain FOREIGN KEY (domain_id) 
    REFERENCES domain_analytics(domain_id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_mailbox_analytics_domain ON mailbox_analytics(domain_id);
CREATE INDEX idx_mailbox_analytics_company ON mailbox_analytics(company_id);
CREATE INDEX idx_mailbox_analytics_email ON mailbox_analytics(email);
CREATE INDEX idx_mailbox_analytics_updated ON mailbox_analytics(updated_at DESC);
CREATE INDEX idx_mailbox_analytics_warmup ON mailbox_analytics(warmup_status);

-- ============================================================================
-- CROSS-DOMAIN ANALYTICS TABLE
-- ============================================================================
-- Stores joined analytics data for mailbox-domain relationships
-- This is a denormalized table for faster cross-domain queries

CREATE TABLE cross_domain_analytics (
  -- Primary identification
  id TEXT PRIMARY KEY,
  domain_id TEXT NOT NULL,
  mailbox_id TEXT,
  company_id TEXT NOT NULL,
  
  -- Email volume metrics (aggregated)
  sent INTEGER DEFAULT 0 NOT NULL,
  delivered INTEGER DEFAULT 0 NOT NULL,
  opened_tracked INTEGER DEFAULT 0 NOT NULL,
  clicked_tracked INTEGER DEFAULT 0 NOT NULL,
  replied INTEGER DEFAULT 0 NOT NULL,
  bounced INTEGER DEFAULT 0 NOT NULL,
  unsubscribed INTEGER DEFAULT 0 NOT NULL,
  spam_complaints INTEGER DEFAULT 0 NOT NULL,
  
  -- Performance metrics (calculated)
  delivery_rate DECIMAL(5,4) DEFAULT 0.0000,
  open_rate DECIMAL(5,4) DEFAULT 0.0000,
  click_rate DECIMAL(5,4) DEFAULT 0.0000,
  reply_rate DECIMAL(5,4) DEFAULT 0.0000,
  bounce_rate DECIMAL(5,4) DEFAULT 0.0000,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  
  -- Foreign key constraints
  CONSTRAINT fk_cross_domain FOREIGN KEY (domain_id) 
    REFERENCES domain_analytics(domain_id) ON DELETE CASCADE,
  CONSTRAINT fk_cross_mailbox FOREIGN KEY (mailbox_id) 
    REFERENCES mailbox_analytics(mailbox_id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX idx_cross_domain_company ON cross_domain_analytics(company_id);
CREATE INDEX idx_cross_domain_domain ON cross_domain_analytics(domain_id);
CREATE INDEX idx_cross_domain_mailbox ON cross_domain_analytics(mailbox_id);
CREATE INDEX idx_cross_domain_updated ON cross_domain_analytics(updated_at DESC);
CREATE INDEX idx_cross_domain_created ON cross_domain_analytics(created_at DESC);

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATE
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for each table
CREATE TRIGGER update_domain_analytics_updated_at
  BEFORE UPDATE ON domain_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mailbox_analytics_updated_at
  BEFORE UPDATE ON mailbox_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cross_domain_analytics_updated_at
  BEFORE UPDATE ON cross_domain_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Domain summary with mailbox count
CREATE OR REPLACE VIEW domain_summary AS
SELECT 
  d.domain_id,
  d.company_id,
  d.domain_name,
  d.sent,
  d.delivered,
  d.opened_tracked,
  d.clicked_tracked,
  d.replied,
  d.bounced,
  d.authentication_spf,
  d.authentication_dkim,
  d.authentication_dmarc,
  COUNT(m.mailbox_id) as mailbox_count,
  COALESCE(SUM(m.daily_limit), 0) as total_capacity,
  COALESCE(SUM(m.current_volume), 0) as total_volume,
  COALESCE(AVG(m.health_score), 0) as avg_health_score,
  d.created_at,
  d.updated_at
FROM domain_analytics d
LEFT JOIN mailbox_analytics m ON d.domain_id = m.domain_id
GROUP BY d.domain_id, d.company_id, d.domain_name, d.sent, d.delivered, 
         d.opened_tracked, d.clicked_tracked, d.replied, d.bounced,
         d.authentication_spf, d.authentication_dkim, d.authentication_dmarc,
         d.created_at, d.updated_at;

-- View: Mailbox performance with calculated rates
CREATE OR REPLACE VIEW mailbox_performance AS
SELECT 
  mailbox_id,
  domain_id,
  company_id,
  email,
  sent,
  delivered,
  opened_tracked,
  clicked_tracked,
  replied,
  bounced,
  warmup_status,
  health_score,
  CASE WHEN sent > 0 THEN ROUND((delivered::DECIMAL / sent::DECIMAL), 4) ELSE 0 END as delivery_rate,
  CASE WHEN delivered > 0 THEN ROUND((opened_tracked::DECIMAL / delivered::DECIMAL), 4) ELSE 0 END as open_rate,
  CASE WHEN delivered > 0 THEN ROUND((clicked_tracked::DECIMAL / delivered::DECIMAL), 4) ELSE 0 END as click_rate,
  CASE WHEN delivered > 0 THEN ROUND((replied::DECIMAL / delivered::DECIMAL), 4) ELSE 0 END as reply_rate,
  CASE WHEN sent > 0 THEN ROUND((bounced::DECIMAL / sent::DECIMAL), 4) ELSE 0 END as bounce_rate,
  created_at,
  updated_at
FROM mailbox_analytics;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE domain_analytics IS 'Aggregated analytics data for email domains';
COMMENT ON TABLE mailbox_analytics IS 'Individual mailbox-level analytics and health metrics';
COMMENT ON TABLE cross_domain_analytics IS 'Denormalized cross-domain analytics for fast queries';

COMMENT ON COLUMN domain_analytics.domain_id IS 'Unique identifier for the domain (matches domains table)';
COMMENT ON COLUMN domain_analytics.company_id IS 'Company/tenant identifier for multi-tenancy';
COMMENT ON COLUMN mailbox_analytics.warmup_status IS 'Current warmup status: NOT_STARTED, WARMING, WARMED, PAUSED';
COMMENT ON COLUMN mailbox_analytics.health_score IS 'Calculated health score (0-100) based on performance metrics';

-- ============================================================================
-- GRANT PERMISSIONS (adjust as needed for your setup)
-- ============================================================================

-- Grant permissions to nile user (adjust username as needed)
GRANT SELECT, INSERT, UPDATE, DELETE ON domain_analytics TO nile;
GRANT SELECT, INSERT, UPDATE, DELETE ON mailbox_analytics TO nile;
GRANT SELECT, INSERT, UPDATE, DELETE ON cross_domain_analytics TO nile;
GRANT SELECT ON domain_summary TO nile;
GRANT SELECT ON mailbox_performance TO nile;

-- ============================================================================
-- SCHEMA CREATION COMPLETE
-- ============================================================================
