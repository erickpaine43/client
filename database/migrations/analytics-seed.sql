-- ============================================================================
-- ANALYTICS SEED DATA FOR NILEDB OLAP DATABASE
-- ============================================================================
-- This script populates the analytics tables with realistic test data
-- for development and testing purposes.
--
-- USAGE:
-- psql -h localhost -p 5444 -U nile -d nile < analytics-seed.sql
--
-- NOTE: Run analytics-schema.sql first to create the tables
-- ============================================================================

-- Clear existing data
TRUNCATE TABLE cross_domain_analytics CASCADE;
TRUNCATE TABLE mailbox_analytics CASCADE;
TRUNCATE TABLE domain_analytics CASCADE;

-- ============================================================================
-- SEED DOMAIN ANALYTICS
-- ============================================================================

INSERT INTO domain_analytics (
  domain_id, company_id, domain_name,
  sent, delivered, opened_tracked, clicked_tracked, replied, bounced, unsubscribed, spam_complaints,
  authentication_spf, authentication_dkim, authentication_dmarc,
  created_at, updated_at
) VALUES
  -- Domain 1: High-performing domain
  (
    'domain-1',
    'company-test',
    'marketing.example.com',
    5000, 4750, 2000, 750, 250, 150, 50, 10,
    true, true, true,
    NOW() - INTERVAL '30 days',
    NOW()
  ),
  
  -- Domain 2: Medium-performing domain
  (
    'domain-2',
    'company-test',
    'sales.example.com',
    3000, 2700, 1100, 350, 120, 200, 30, 15,
    true, true, false,
    NOW() - INTERVAL '45 days',
    NOW()
  ),
  
  -- Domain 3: New domain (warming up)
  (
    'domain-3',
    'company-test',
    'outreach.example.com',
    500, 450, 150, 40, 15, 30, 5, 2,
    true, false, false,
    NOW() - INTERVAL '7 days',
    NOW()
  ),
  
  -- Domain 4: Low-performing domain (needs attention)
  (
    'domain-4',
    'company-test',
    'support.example.com',
    2000, 1600, 500, 120, 40, 300, 40, 25,
    false, true, false,
    NOW() - INTERVAL '60 days',
    NOW()
  ),
  
  -- Domain 5: Well-established domain
  (
    'domain-5',
    'company-test',
    'newsletter.example.com',
    8000, 7600, 3500, 1200, 400, 200, 80, 15,
    true, true, true,
    NOW() - INTERVAL '90 days',
    NOW()
  );

-- ============================================================================
-- SEED MAILBOX ANALYTICS
-- ============================================================================

-- Domain 1 mailboxes (5 mailboxes)
INSERT INTO mailbox_analytics (
  mailbox_id, domain_id, company_id, email,
  sent, delivered, opened_tracked, clicked_tracked, replied, bounced, unsubscribed, spam_complaints,
  warmup_status, warmup_progress, daily_limit, current_volume, health_score, provider,
  created_at, updated_at
) VALUES
  ('mb-1-1', 'domain-1', 'company-test', 'john@marketing.example.com',
   1000, 950, 400, 150, 50, 30, 10, 2,
   'WARMED', 100, 100, 85, 92, 'LOCAL_SMTP',
   NOW() - INTERVAL '30 days', NOW()),
  
  ('mb-1-2', 'domain-1', 'company-test', 'sarah@marketing.example.com',
   1000, 960, 420, 160, 55, 25, 12, 1,
   'WARMED', 100, 100, 90, 95, 'LOCAL_SMTP',
   NOW() - INTERVAL '30 days', NOW()),
  
  ('mb-1-3', 'domain-1', 'company-test', 'mike@marketing.example.com',
   1000, 940, 380, 140, 45, 35, 10, 3,
   'WARMED', 100, 100, 80, 88, 'LOCAL_SMTP',
   NOW() - INTERVAL '28 days', NOW()),
  
  ('mb-1-4', 'domain-1', 'company-test', 'emma@marketing.example.com',
   1000, 950, 400, 150, 50, 30, 9, 2,
   'WARMING', 85, 100, 75, 90, 'LOCAL_SMTP',
   NOW() - INTERVAL '20 days', NOW()),
  
  ('mb-1-5', 'domain-1', 'company-test', 'alex@marketing.example.com',
   1000, 950, 400, 150, 50, 30, 9, 2,
   'WARMING', 70, 100, 60, 87, 'LOCAL_SMTP',
   NOW() - INTERVAL '15 days', NOW());

-- Domain 2 mailboxes (4 mailboxes)
INSERT INTO mailbox_analytics (
  mailbox_id, domain_id, company_id, email,
  sent, delivered, opened_tracked, clicked_tracked, replied, bounced, unsubscribed, spam_complaints,
  warmup_status, warmup_progress, daily_limit, current_volume, health_score, provider,
  created_at, updated_at
) VALUES
  ('mb-2-1', 'domain-2', 'company-test', 'david@sales.example.com',
   800, 720, 300, 95, 35, 55, 8, 4,
   'WARMED', 100, 80, 70, 85, 'LOCAL_SMTP',
   NOW() - INTERVAL '45 days', NOW()),
  
  ('mb-2-2', 'domain-2', 'company-test', 'lisa@sales.example.com',
   750, 675, 280, 90, 30, 50, 7, 4,
   'WARMED', 100, 80, 65, 83, 'LOCAL_SMTP',
   NOW() - INTERVAL '45 days', NOW()),
  
  ('mb-2-3', 'domain-2', 'company-test', 'james@sales.example.com',
   750, 675, 270, 85, 28, 52, 8, 4,
   'WARMING', 90, 80, 60, 82, 'LOCAL_SMTP',
   NOW() - INTERVAL '30 days', NOW()),
  
  ('mb-2-4', 'domain-2', 'company-test', 'anna@sales.example.com',
   700, 630, 250, 80, 27, 43, 7, 3,
   'WARMING', 75, 80, 55, 84, 'LOCAL_SMTP',
   NOW() - INTERVAL '25 days', NOW());

-- Domain 3 mailboxes (2 mailboxes - new domain)
INSERT INTO mailbox_analytics (
  mailbox_id, domain_id, company_id, email,
  sent, delivered, opened_tracked, clicked_tracked, replied, bounced, unsubscribed, spam_complaints,
  warmup_status, warmup_progress, daily_limit, current_volume, health_score, provider,
  created_at, updated_at
) VALUES
  ('mb-3-1', 'domain-3', 'company-test', 'tom@outreach.example.com',
   250, 225, 75, 20, 8, 15, 2, 1,
   'WARMING', 40, 50, 20, 78, 'LOCAL_SMTP',
   NOW() - INTERVAL '7 days', NOW()),
  
  ('mb-3-2', 'domain-3', 'company-test', 'kate@outreach.example.com',
   250, 225, 75, 20, 7, 15, 3, 1,
   'WARMING', 35, 50, 18, 76, 'LOCAL_SMTP',
   NOW() - INTERVAL '7 days', NOW());

-- Domain 4 mailboxes (3 mailboxes - problematic domain)
INSERT INTO mailbox_analytics (
  mailbox_id, domain_id, company_id, email,
  sent, delivered, opened_tracked, clicked_tracked, replied, bounced, unsubscribed, spam_complaints,
  warmup_status, warmup_progress, daily_limit, current_volume, health_score, provider,
  created_at, updated_at
) VALUES
  ('mb-4-1', 'domain-4', 'company-test', 'support1@support.example.com',
   700, 560, 170, 40, 15, 100, 15, 10,
   'WARMED', 100, 70, 50, 65, 'LOCAL_SMTP',
   NOW() - INTERVAL '60 days', NOW()),
  
  ('mb-4-2', 'domain-4', 'company-test', 'support2@support.example.com',
   650, 520, 165, 40, 13, 100, 13, 8,
   'WARMED', 100, 70, 48, 67, 'LOCAL_SMTP',
   NOW() - INTERVAL '60 days', NOW()),
  
  ('mb-4-3', 'domain-4', 'company-test', 'support3@support.example.com',
   650, 520, 165, 40, 12, 100, 12, 7,
   'PAUSED', 100, 70, 0, 60, 'LOCAL_SMTP',
   NOW() - INTERVAL '55 days', NOW());

-- Domain 5 mailboxes (6 mailboxes - high volume)
INSERT INTO mailbox_analytics (
  mailbox_id, domain_id, company_id, email,
  sent, delivered, opened_tracked, clicked_tracked, replied, bounced, unsubscribed, spam_complaints,
  warmup_status, warmup_progress, daily_limit, current_volume, health_score, provider,
  created_at, updated_at
) VALUES
  ('mb-5-1', 'domain-5', 'company-test', 'news1@newsletter.example.com',
   1400, 1330, 600, 210, 70, 35, 15, 3,
   'WARMED', 100, 150, 130, 94, 'LOCAL_SMTP',
   NOW() - INTERVAL '90 days', NOW()),
  
  ('mb-5-2', 'domain-5', 'company-test', 'news2@newsletter.example.com',
   1350, 1283, 580, 200, 65, 32, 13, 2,
   'WARMED', 100, 150, 125, 93, 'LOCAL_SMTP',
   NOW() - INTERVAL '90 days', NOW()),
  
  ('mb-5-3', 'domain-5', 'company-test', 'news3@newsletter.example.com',
   1350, 1283, 575, 198, 68, 33, 14, 2,
   'WARMED', 100, 150, 128, 93, 'LOCAL_SMTP',
   NOW() - INTERVAL '88 days', NOW()),
  
  ('mb-5-4', 'domain-5', 'company-test', 'news4@newsletter.example.com',
   1300, 1235, 550, 192, 62, 30, 12, 3,
   'WARMED', 100, 150, 120, 92, 'LOCAL_SMTP',
   NOW() - INTERVAL '85 days', NOW()),
  
  ('mb-5-5', 'domain-5', 'company-test', 'news5@newsletter.example.com',
   1300, 1235, 550, 190, 65, 32, 13, 2,
   'WARMING', 95, 150, 115, 91, 'LOCAL_SMTP',
   NOW() - INTERVAL '75 days', NOW()),
  
  ('mb-5-6', 'domain-5', 'company-test', 'news6@newsletter.example.com',
   1000, 950, 445, 210, 70, 38, 13, 3,
   'WARMING', 80, 150, 100, 89, 'LOCAL_SMTP',
   NOW() - INTERVAL '60 days', NOW());

-- ============================================================================
-- SEED CROSS-DOMAIN ANALYTICS
-- ============================================================================
-- Generate cross-domain records for each domain

INSERT INTO cross_domain_analytics (
  id, domain_id, mailbox_id, company_id,
  sent, delivered, opened_tracked, clicked_tracked, replied, bounced, unsubscribed, spam_complaints,
  delivery_rate, open_rate, click_rate, reply_rate, bounce_rate,
  created_at, updated_at
)
SELECT 
  'cross-' || m.mailbox_id as id,
  m.domain_id,
  m.mailbox_id,
  m.company_id,
  m.sent,
  m.delivered,
  m.opened_tracked,
  m.clicked_tracked,
  m.replied,
  m.bounced,
  m.unsubscribed,
  m.spam_complaints,
  CASE WHEN m.sent > 0 THEN ROUND((m.delivered::DECIMAL / m.sent::DECIMAL), 4) ELSE 0 END as delivery_rate,
  CASE WHEN m.delivered > 0 THEN ROUND((m.opened_tracked::DECIMAL / m.delivered::DECIMAL), 4) ELSE 0 END as open_rate,
  CASE WHEN m.delivered > 0 THEN ROUND((m.clicked_tracked::DECIMAL / m.delivered::DECIMAL), 4) ELSE 0 END as click_rate,
  CASE WHEN m.delivered > 0 THEN ROUND((m.replied::DECIMAL / m.delivered::DECIMAL), 4) ELSE 0 END as reply_rate,
  CASE WHEN m.sent > 0 THEN ROUND((m.bounced::DECIMAL / m.sent::DECIMAL), 4) ELSE 0 END as bounce_rate,
  m.created_at,
  m.updated_at
FROM mailbox_analytics m;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Show domain summary
SELECT 
  domain_name,
  sent,
  delivered,
  ROUND((delivered::DECIMAL / NULLIF(sent, 0)::DECIMAL) * 100, 2) as delivery_rate_pct,
  mailbox_count,
  total_capacity,
  ROUND(avg_health_score, 0) as avg_health
FROM domain_summary
ORDER BY domain_name;

-- Show mailbox performance
SELECT 
  email,
  warmup_status,
  health_score,
  sent,
  delivered,
  ROUND(delivery_rate * 100, 2) as delivery_pct,
  ROUND(open_rate * 100, 2) as open_pct
FROM mailbox_performance
ORDER BY domain_id, email;

-- Show cross-domain analytics count
SELECT 
  d.domain_name,
  COUNT(c.id) as cross_domain_records
FROM domain_analytics d
LEFT JOIN cross_domain_analytics c ON d.domain_id = c.domain_id
GROUP BY d.domain_name
ORDER BY d.domain_name;

-- ============================================================================
-- SEED DATA COMPLETE
-- ============================================================================

SELECT 'Analytics seed data loaded successfully!' as status;
SELECT COUNT(*) as domain_count FROM domain_analytics;
SELECT COUNT(*) as mailbox_count FROM mailbox_analytics;
SELECT COUNT(*) as cross_domain_count FROM cross_domain_analytics;
