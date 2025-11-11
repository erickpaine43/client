import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convex schema for analytics data structures.
 * All analytics data is stored with standardized field names and Convex-compatible types.
 */
export default defineSchema({
  // ============================================================================
  // CAMPAIGN ANALYTICS
  // ============================================================================
  campaignAnalytics: defineTable({
    // Entity identification
    campaignId: v.string(),
    campaignName: v.string(),
    companyId: v.string(),
    
    // Time dimension
    date: v.string(), // ISO date string (YYYY-MM-DD)
    
    // Raw performance metrics (standardized field names)
    sent: v.number(),
    delivered: v.number(),
    opened_tracked: v.number(),
    clicked_tracked: v.number(),
    replied: v.number(),
    bounced: v.number(),
    unsubscribed: v.number(),
    spamComplaints: v.number(),
    
    // Campaign-specific data
    status: v.union(v.literal("ACTIVE"), v.literal("PAUSED"), v.literal("COMPLETED"), v.literal("DRAFT")),
    leadCount: v.number(),
    activeLeads: v.number(),
    completedLeads: v.number(),
    
    // Metadata
    updatedAt: v.number(),
  })
    .index("by_campaign", ["campaignId"])
    .index("by_company_date", ["companyId", "date"])
    .index("by_campaign_date", ["campaignId", "date"])
    .index("by_company_campaign", ["companyId", "campaignId"]),

  // ============================================================================
  // DOMAIN ANALYTICS
  // ============================================================================
  domainAnalytics: defineTable({
    // Entity identification
    domainId: v.string(),
    domainName: v.string(),
    companyId: v.string(),
    
    // Time dimension
    date: v.string(), // ISO date string (YYYY-MM-DD)
    
    // Raw performance metrics (aggregated from mailboxes)
    sent: v.number(),
    delivered: v.number(),
    opened_tracked: v.number(),
    clicked_tracked: v.number(),
    replied: v.number(),
    bounced: v.number(),
    unsubscribed: v.number(),
    spamComplaints: v.number(),
    
    // Domain-specific data
    authentication: v.object({
      spf: v.boolean(),
      dkim: v.boolean(),
      dmarc: v.boolean(),
    }),
    
    // Metadata
    updatedAt: v.number(),
  })
    .index("by_domain", ["domainId"])
    .index("by_company_date", ["companyId", "date"])
    .index("by_domain_date", ["domainId", "date"])
    .index("by_company_domain", ["companyId", "domainId"]),

  // ============================================================================
  // MAILBOX ANALYTICS
  // ============================================================================
  mailboxAnalytics: defineTable({
    // Entity identification
    mailboxId: v.string(),
    email: v.string(),
    domain: v.string(),
    provider: v.string(),
    companyId: v.string(),
    
    // Time dimension
    date: v.string(), // ISO date string (YYYY-MM-DD)
    
    // Raw performance metrics
    sent: v.number(),
    delivered: v.number(),
    opened_tracked: v.number(),
    clicked_tracked: v.number(),
    replied: v.number(),
    bounced: v.number(),
    unsubscribed: v.number(),
    spamComplaints: v.number(),
    
    // Mailbox-specific data
    warmupStatus: v.union(
      v.literal("NOT_STARTED"),
      v.literal("WARMING"),
      v.literal("WARMED"),
      v.literal("PAUSED")
    ),
    warmupProgress: v.number(), // 0-100
    dailyLimit: v.number(),
    currentVolume: v.number(),
    
    // Metadata
    updatedAt: v.number(),
  })
    .index("by_mailbox", ["mailboxId"])
    .index("by_company_date", ["companyId", "date"])
    .index("by_mailbox_date", ["mailboxId", "date"])
    .index("by_domain", ["domain"])
    .index("by_company_mailbox", ["companyId", "mailboxId"]),

  // ============================================================================
  // LEAD ANALYTICS
  // ============================================================================
  leadAnalytics: defineTable({
    // Entity identification
    leadId: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    companyId: v.string(),
    
    // Time dimension
    date: v.string(), // ISO date string (YYYY-MM-DD)
    
    // Raw performance metrics (engagement with this lead)
    sent: v.number(),
    delivered: v.number(),
    opened_tracked: v.number(),
    clicked_tracked: v.number(),
    replied: v.number(),
    bounced: v.number(),
    unsubscribed: v.number(),
    spamComplaints: v.number(),
    
    // Lead-specific data
    status: v.union(
      v.literal("ACTIVE"),
      v.literal("REPLIED"),
      v.literal("BOUNCED"),
      v.literal("UNSUBSCRIBED"),
      v.literal("COMPLETED")
    ),
    
    // Metadata
    updatedAt: v.number(),
  })
    .index("by_lead", ["leadId"])
    .index("by_company_date", ["companyId", "date"])
    .index("by_lead_date", ["leadId", "date"])
    .index("by_company_lead", ["companyId", "leadId"]),

  // ============================================================================
  // TEMPLATE ANALYTICS
  // ============================================================================
  templateAnalytics: defineTable({
    // Entity identification
    templateId: v.string(),
    templateName: v.string(),
    category: v.optional(v.string()),
    companyId: v.string(),
    
    // Time dimension
    date: v.string(), // ISO date string (YYYY-MM-DD)
    
    // Raw performance metrics (usage of this template)
    sent: v.number(),
    delivered: v.number(),
    opened_tracked: v.number(),
    clicked_tracked: v.number(),
    replied: v.number(),
    bounced: v.number(),
    unsubscribed: v.number(),
    spamComplaints: v.number(),
    
    // Template-specific data
    usage: v.number(), // Number of times template was used
    
    // Metadata
    updatedAt: v.number(),
  })
    .index("by_template", ["templateId"])
    .index("by_company_date", ["companyId", "date"])
    .index("by_template_date", ["templateId", "date"])
    .index("by_company_template", ["companyId", "templateId"]),

  // ============================================================================
  // BILLING ANALYTICS
  // ============================================================================
  billingAnalytics: defineTable({
    // Entity identification
    companyId: v.string(),
    
    // Time dimension
    date: v.string(), // ISO date string (YYYY-MM-DD)
    
    // Usage metrics
    emailsSent: v.number(),
    emailsRemaining: v.number(),
    domainsUsed: v.number(),
    domainsLimit: v.number(),
    mailboxesUsed: v.number(),
    mailboxesLimit: v.number(),
    
    // Plan information
    planType: v.string(),
    
    // Cost metrics
    currentPeriodCost: v.number(),
    projectedCost: v.number(),
    currency: v.string(),
    
    // Metadata
    updatedAt: v.number(),
  })
    .index("by_company_date", ["companyId", "date"])
    .index("by_company", ["companyId"]),

  // ============================================================================
  // WARMUP ANALYTICS (Specialized for mailbox warmup tracking)
  // ============================================================================
  warmupAnalytics: defineTable({
    // Entity identification
    mailboxId: v.string(),
    companyId: v.string(),
    
    // Time dimension
    date: v.string(), // ISO date string (YYYY-MM-DD)
    
    // Warmup-specific metrics
    totalWarmups: v.number(),
    delivered: v.number(),
    spamComplaints: v.number(),
    replies: v.number(),
    bounced: v.number(),
    
    // Daily warmup stats
    emailsWarmed: v.number(),
    healthScore: v.number(), // 0-100, calculated from performance
    progressPercentage: v.number(), // 0-100
    
    // Metadata
    updatedAt: v.number(),
  })
    .index("by_mailbox", ["mailboxId"])
    .index("by_company_date", ["companyId", "date"])
    .index("by_mailbox_date", ["mailboxId", "date"]),

  // ============================================================================
  // SEQUENCE STEP ANALYTICS (Part of campaign analytics)
  // ============================================================================
  sequenceStepAnalytics: defineTable({
    // Entity identification
    stepId: v.string(),
    campaignId: v.string(),
    companyId: v.string(),
    
    // Time dimension
    date: v.string(), // ISO date string (YYYY-MM-DD)
    
    // Raw performance metrics
    sent: v.number(),
    delivered: v.number(),
    opened_tracked: v.number(),
    clicked_tracked: v.number(),
    replied: v.number(),
    bounced: v.number(),
    unsubscribed: v.number(),
    spamComplaints: v.number(),
    
    // Step-specific data
    stepType: v.union(v.literal("email"), v.literal("wait"), v.literal("action")),
    subject: v.optional(v.string()), // For email steps
    waitDuration: v.optional(v.number()), // For wait steps (in hours)
    sequenceOrder: v.number(),
    
    // Metadata
    updatedAt: v.number(),
  })
    .index("by_step", ["stepId"])
    .index("by_campaign", ["campaignId"])
    .index("by_company_date", ["companyId", "date"])
    .index("by_campaign_date", ["campaignId", "date"])
    .index("by_step_date", ["stepId", "date"]),

  // ============================================================================
  // SETTINGS TABLES
  // Structured settings with explicit fields for better performance and type safety
  // ============================================================================

  // User preferences - individual user settings
  userPreferences: defineTable({
    userId: v.string(),
    theme: v.union(v.literal("light"), v.literal("dark"), v.literal("auto")),
    language: v.string(),
    timezone: v.string(),
    emailNotifications: v.boolean(),
    pushNotifications: v.boolean(),
    weeklyReports: v.boolean(),
    marketingEmails: v.boolean(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  // Company settings - organization-wide settings and limits
  companySettings: defineTable({
    companyId: v.string(),
    maxUsers: v.number(),
    maxDomains: v.number(),
    maxCampaignsPerMonth: v.number(),
    apiRateLimit: v.number(),
    customBranding: v.boolean(),
    advancedAnalytics: v.boolean(),
    prioritySupport: v.boolean(),
    updatedAt: v.number(),
  })
    .index("by_company", ["companyId"]),

  // Tenant settings - tenant-wide defaults and limits
  tenantSettings: defineTable({
    tenantId: v.string(),
    defaultTheme: v.union(v.literal("light"), v.literal("dark"), v.literal("auto")),
    defaultLanguage: v.string(),
    defaultTimezone: v.string(),
    allowCustomBranding: v.boolean(),
    maxCompaniesPerTenant: v.number(),
    globalEmailLimits: v.number(),
    auditLoggingEnabled: v.boolean(),
    updatedAt: v.number(),
  })
    .index("by_tenant", ["tenantId"]),

  // Plans table - subscription plan definitions
  plans: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    maxUsers: v.number(),
    maxDomains: v.number(),
    maxCampaignsPerMonth: v.number(),
    apiRateLimit: v.number(),
    priceMonthly: v.number(), // in cents
    priceYearly: v.number(), // in cents
    features: v.array(v.string()),
    isActive: v.boolean(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_active", ["isActive"]),

  // Domains table - domain management and verification
  domains: defineTable({
    companyId: v.string(),
    domain: v.string(),
    verificationStatus: v.union(v.literal("pending"), v.literal("verified"), v.literal("failed")),
    dnsRecords: v.array(v.object({
      type: v.string(),
      name: v.string(),
      value: v.string(),
      ttl: v.optional(v.number()),
    })),
    isPrimary: v.boolean(),
    verifiedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_company", ["companyId"])
    .index("by_domain", ["domain"])
    .index("by_status", ["verificationStatus"]),

  // ============================================================================
  // ADMIN ANALYTICS TABLES
  // These tables track admin user actions, sessions, and system events
  // for auditing and security purposes.
  // ============================================================================
  // Admin Audit Log - tracks all admin actions
  admin_audit_log: defineTable({
    adminUserId: v.string(), // Staff user ID from NileDB
    action: v.union(
      v.literal("user_status_change"),
      v.literal("company_status_change"),
      v.literal("billing_update"),
      v.literal("system_config"),
      v.literal("role_assignment"),
      v.literal("permission_grant"),
      v.literal("session_start"),
      v.literal("session_end")
    ),
    resourceType: v.union(
      v.literal("user"),
      v.literal("company"),
      v.literal("tenant"),
      v.literal("subscription"),
      v.literal("payment"),
      v.literal("role"),
      v.literal("permission"),
      v.literal("admin_session")
    ),
    resourceId: v.string(),
    tenantId: v.optional(v.string()), // Context tenant (when applicable)
    oldValues: v.optional(v.any()), // Previous state (JSON)
    newValues: v.optional(v.any()), // New state (JSON)
    ipAddress: v.string(),
    userAgent: v.string(),
    timestamp: v.number(), // Convex Date
    notes: v.optional(v.string()), // Optional admin notes
    metadata: v.optional(v.record(v.string(), v.any())), // Additional context
  })
    .index("adminUserId", ["adminUserId"])
    .index("resourceType_tenantId", ["resourceType", "tenantId"])
    .index("timestamp", ["timestamp"]),

  // Admin Sessions - tracks active admin sessions
  admin_sessions: defineTable({
    adminUserId: v.string(), // Staff user ID from NileDB
    sessionToken: v.string(), // Unique session identifier
    ipAddress: v.string(),
    userAgent: v.string(),
    startedAt: v.number(), // Convex Date
    lastActivity: v.number(), // Convex Date
    expiresAt: v.number(), // Convex Date
    isActive: v.boolean(),
    deviceInfo: v.optional(v.object({
      browser: v.string(),
      os: v.string(),
      device: v.string(),
    })),
  })
    .index("adminUserId", ["adminUserId"])
    .index("isActive", ["isActive"])
    .index("expiresAt", ["expiresAt"]),

  // Admin System Events - system-wide admin events
  admin_system_events: defineTable({
    eventType: v.union(
      v.literal("system_startup"),
      v.literal("system_shutdown"),
      v.literal("config_change"),
      v.literal("security_alert"),
      v.literal("performance_issue")
    ),
    severity: v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("error"),
      v.literal("critical")
    ),
    message: v.string(),
    details: v.optional(v.record(v.string(), v.any())),
    adminUserId: v.optional(v.string()), // If triggered by admin action
    tenantId: v.optional(v.string()), // If tenant-specific
    timestamp: v.number(),
    resolvedAt: v.optional(v.number()),
    resolution: v.optional(v.string()),
  })
  .index("eventType", ["eventType"])
  .index("severity", ["severity"])
  .index("timestamp", ["timestamp"]),
});
