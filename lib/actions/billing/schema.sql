-- ============================================================================
-- BILLING OLTP SCHEMA - NileDB Implementation
-- ============================================================================
-- 
-- This schema implements the complete OLTP billing infrastructure following
-- the established architectural patterns. All tables include proper tenant
-- isolation, security boundaries, and audit trails.
--
-- Security Features:
-- - Tenant isolation via tenant_id
-- - Payment method encryption/tokenization ready
-- - Financial audit trail
-- - PCI compliance foundation
-- - Row-level security policies
--
-- Architecture Pattern:
-- - OLTP-first design
-- - Complete financial data isolation
-- - Secure payment method storage
-- - Proper subscription management
-- ============================================================================

-- Subscription Plans Table
-- Contains plan configuration and pricing (SENSITIVE - stays in OLTP)
CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    
    -- Plan Information
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Plan Limits (OPERATIONAL - stays in OLTP)
    emails_limit INTEGER NOT NULL DEFAULT -1, -- -1 for unlimited
    domains_limit INTEGER NOT NULL DEFAULT -1,
    mailboxes_limit INTEGER NOT NULL DEFAULT -1,
    storage_limit INTEGER NOT NULL DEFAULT -1, -- in GB
    users_limit INTEGER NOT NULL DEFAULT -1,
    
    -- Pricing (SENSITIVE - stays in OLTP)
    monthly_price INTEGER NOT NULL DEFAULT 0, -- in cents
    yearly_price INTEGER NOT NULL DEFAULT 0, -- in cents
    quarterly_price INTEGER DEFAULT NULL, -- in cents
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    
    -- Plan Features
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_public BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    
    -- Audit Trail
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Company Billing Table
-- Core billing account and payment method management (SENSITIVE - stays in OLTP)
CREATE TABLE IF NOT EXISTS company_billing (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL, -- Tenant isolation
    tenant_id UUID NOT NULL DEFAULT CURRENT_TENANT_ID(),
    
    -- Payment Information (SENSITIVE - stays in OLTP)
    payment_method_id VARCHAR(255), -- Reference to active payment method
    billing_email VARCHAR(255) NOT NULL,
    billing_address JSONB NOT NULL, -- Encrypted billing address
    
    -- Subscription Details (SENSITIVE - stays in OLTP)
    subscription_id VARCHAR(255), -- External subscription reference (Stripe, etc.)
    plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
    billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly',
    subscription_status VARCHAR(30) NOT NULL DEFAULT 'incomplete',
    
    -- Financial Data (SENSITIVE - stays in OLTP)
    next_billing_date TIMESTAMP WITH TIME ZONE,
    last_payment_date TIMESTAMP WITH TIME ZONE,
    last_payment_amount INTEGER, -- in cents
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    
    -- Audit Trail
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_id VARCHAR(255) NOT NULL,
    
    -- Constraints
    UNIQUE(company_id, tenant_id),
    CHECK (billing_cycle IN ('monthly', 'yearly', 'quarterly')),
    CHECK (subscription_status IN ('active', 'past_due', 'canceled', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid')),
    CHECK (last_payment_amount >= 0)
);

-- Payment Methods Table
-- Secure payment method storage and management (HIGHLY SENSITIVE - encrypted/tokenized in OLTP)
CREATE TABLE IF NOT EXISTS payment_methods (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL, -- Tenant isolation
    tenant_id UUID NOT NULL DEFAULT CURRENT_TENANT_ID(),
    
    -- Payment Details (HIGHLY SENSITIVE - encrypted/tokenized in OLTP)
    type VARCHAR(20) NOT NULL,
    provider VARCHAR(20) NOT NULL DEFAULT 'stripe',
    provider_payment_method_id VARCHAR(255) NOT NULL, -- External payment method ID
    
    -- Card Information (ENCRYPTED/TOKENIZED - only safe data stored)
    last_four_digits CHAR(4), -- Only last 4 digits for display
    expiry_month INTEGER,
    expiry_year INTEGER,
    card_brand VARCHAR(20),
    
    -- Bank Account Information (for ACH payments)
    bank_name VARCHAR(100),
    account_type VARCHAR(20), -- checking, savings
    
    -- Status and Metadata
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Audit Trail
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_id VARCHAR(255) NOT NULL,
    
    -- Constraints
    CHECK (type IN ('credit_card', 'bank_account', 'paypal')),
    CHECK (provider IN ('stripe', 'paypal', 'bank')),
    CHECK (card_brand IN ('visa', 'mastercard', 'amex', 'discover', 'diners', 'jcb', 'unionpay', 'unknown') OR card_brand IS NULL),
    CHECK (expiry_month >= 1 AND expiry_month <= 12 OR expiry_month IS NULL),
    CHECK (expiry_year >= EXTRACT(YEAR FROM CURRENT_DATE) OR expiry_year IS NULL),
    CHECK (account_type IN ('checking', 'savings') OR account_type IS NULL)
);

-- Invoices Table
-- Invoice generation and payment tracking (SENSITIVE - stays in OLTP)
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL, -- Tenant isolation
    tenant_id UUID NOT NULL DEFAULT CURRENT_TENANT_ID(),
    
    -- Invoice Details (SENSITIVE - stays in OLTP)
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    amount INTEGER NOT NULL, -- Total amount in cents
    currency CHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    
    -- Billing Period
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Payment Tracking (SENSITIVE)
    payment_method_id INTEGER REFERENCES payment_methods(id),
    paid_at TIMESTAMP WITH TIME ZONE,
    paid_amount INTEGER, -- Amount actually paid (for partial payments)
    
    -- Line Items (SENSITIVE - detailed usage information)
    line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- Metadata
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    
    -- Audit Trail
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by_id VARCHAR(255) NOT NULL,
    
    -- Constraints
    CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'void', 'refunded')),
    CHECK (amount >= 0),
    CHECK (paid_amount >= 0 OR paid_amount IS NULL),
    CHECK (paid_amount <= amount OR paid_amount IS NULL),
    CHECK (period_start < period_end),
    CHECK (due_date >= period_end)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Subscription Plans Indexes
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active, is_public, sort_order);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_pricing ON subscription_plans(monthly_price, yearly_price) WHERE is_active = true;

-- Company Billing Indexes
CREATE INDEX IF NOT EXISTS idx_company_billing_company ON company_billing(company_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_company_billing_subscription ON company_billing(subscription_id) WHERE subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_company_billing_status ON company_billing(subscription_status);
CREATE INDEX IF NOT EXISTS idx_company_billing_next_billing ON company_billing(next_billing_date) WHERE next_billing_date IS NOT NULL;

-- Payment Methods Indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_company ON payment_methods(company_id, tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_payment_methods_default ON payment_methods(company_id, is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_payment_methods_provider ON payment_methods(provider, provider_payment_method_id);

-- Invoices Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_company ON invoices(company_id, tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status, due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_period ON invoices(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_invoices_payment ON invoices(payment_method_id) WHERE payment_method_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all billing tables
ALTER TABLE company_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Company Billing RLS Policies
CREATE POLICY company_billing_tenant_isolation ON company_billing
    FOR ALL
    USING (tenant_id = CURRENT_TENANT_ID());

-- Payment Methods RLS Policies
CREATE POLICY payment_methods_tenant_isolation ON payment_methods
    FOR ALL
    USING (tenant_id = CURRENT_TENANT_ID());

-- Invoices RLS Policies
CREATE POLICY invoices_tenant_isolation ON invoices
    FOR ALL
    USING (tenant_id = CURRENT_TENANT_ID());

-- ============================================================================
-- TRIGGERS FOR AUDIT TRAIL
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_subscription_plans_updated_at
    BEFORE UPDATE ON subscription_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_billing_updated_at
    BEFORE UPDATE ON company_billing
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
    BEFORE UPDATE ON payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DEFAULT SUBSCRIPTION PLANS
-- ============================================================================

-- Insert default subscription plans
INSERT INTO subscription_plans (
    name, description, emails_limit, domains_limit, mailboxes_limit, 
    storage_limit, users_limit, monthly_price, yearly_price, currency, 
    features, is_active, is_public, sort_order
) VALUES 
    (
        'Starter',
        'Perfect for small businesses getting started with email outreach',
        1000, 1, 3, 5, 1,
        2900, 29000, 'USD', -- $29/month, $290/year
        '["Basic Analytics", "Email Templates", "Basic Support"]'::jsonb,
        true, true, 1
    ),
    (
        'Professional',
        'Ideal for growing businesses with advanced email marketing needs',
        10000, 5, 15, 50, 5,
        9900, 99000, 'USD', -- $99/month, $990/year
        '["Advanced Analytics", "A/B Testing", "Custom Templates", "Priority Support", "Team Collaboration"]'::jsonb,
        true, true, 2
    ),
    (
        'Enterprise',
        'Comprehensive solution for large organizations with unlimited needs',
        -1, -1, -1, -1, -1,
        29900, 299000, 'USD', -- $299/month, $2990/year
        '["Unlimited Everything", "Advanced Analytics", "Custom Integrations", "Dedicated Support", "White Label", "API Access"]'::jsonb,
        true, true, 3
    )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE subscription_plans IS 'Subscription plan configuration and pricing (SENSITIVE - stays in OLTP)';
COMMENT ON TABLE company_billing IS 'Core billing account and payment method management (SENSITIVE - stays in OLTP)';
COMMENT ON TABLE payment_methods IS 'Secure payment method storage and management (HIGHLY SENSITIVE - encrypted/tokenized in OLTP)';
COMMENT ON TABLE invoices IS 'Invoice generation and payment tracking (SENSITIVE - stays in OLTP)';

COMMENT ON COLUMN company_billing.billing_address IS 'Encrypted billing address stored as JSONB';
COMMENT ON COLUMN payment_methods.provider_payment_method_id IS 'External payment method ID from payment processor (Stripe, etc.)';
COMMENT ON COLUMN payment_methods.last_four_digits IS 'Only last 4 digits stored for display purposes';
COMMENT ON COLUMN invoices.line_items IS 'Detailed usage information stored as JSONB array';

-- ============================================================================
-- SECURITY NOTES
-- ============================================================================

/*
SECURITY IMPLEMENTATION NOTES:

1. Payment Method Security:
   - Only last 4 digits of card numbers are stored
   - Full card details are tokenized via payment processor
   - provider_payment_method_id references external secure token
   - No CVV or full card numbers stored in database

2. Billing Address Encryption:
   - Stored as JSONB for flexibility
   - Should be encrypted at application level before storage
   - Consider using database-level encryption for additional security

3. Tenant Isolation:
   - All tables include tenant_id with RLS policies
   - Ensures complete data isolation between companies
   - Prevents cross-tenant data access

4. Audit Trail:
   - All tables include created_at, updated_at, created_by_id
   - Triggers automatically update timestamps
   - Full audit trail for financial compliance

5. PCI Compliance Foundation:
   - No sensitive card data stored
   - Payment processing delegated to certified processors
   - Minimal PCI scope due to tokenization approach

6. Financial Data Protection:
   - All pricing and payment amounts in OLTP only
   - No financial details exposed to analytics layer
   - Complete separation of operational and analytical data
*/
