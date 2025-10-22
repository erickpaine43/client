// Barrel exports for all centralized TypeScript types
// This allows importing types from '@types/...' using the tsconfig path mapping

// Export all campaign related types
export * from "./campaign";

// Export all domain related types
export * from "./domains";

// Export all mailbox related types
export * from "./mailbox";

// Export all template related types
export * from "./templates";

// Export all conversation/inbox related types
export * from "./conversation";

// Export navigation related types
export * from "./nav-link";

// Export notification related types
export * from "./notification";

// Export authentication and user related types
export * from "./auth";

// Export tab/ui related types
export * from "./tab";

// Export common/shared utility types
// Export settings and configuration types
export type { TeamMember as SettingsTeamMember } from "./settings";
// Export client and lead related types
export * from "./clients-leads";
export * from "./common";

// Export UI and component prop types
export * from "./ui";

// Export analytics related types (selectively to avoid conflicts)
export type {
  // Non-conflicting analytics types
  CampaignAnalytics,
  MailboxAnalytics,
  LeadAnalytics,
  TemplateAnalytics,
  BillingAnalytics,
  SequenceStepAnalytics,
  WarmupAnalytics,
  DailyWarmupStats,
  // Core analytics types
  PerformanceMetrics,
  CalculatedRates,
  TimeSeriesDataPoint,
  BaseAnalytics,
  AnalyticsFilters,
  AnalyticsComputeOptions,
  FilteredDataset,
  DataGranularity,
  // Mailbox analytics types
  MailboxWarmupData,
  MailboxAnalyticsData,
  ProgressiveAnalyticsState,
  WarmupChartData,
  CampaignPerformanceData,
  // UI analytics types
  DateRangePreset,
  AnalyticsUIFilters,
  AnalyticsMetricConfig,
  KPIDisplayConfig,
  ChartDataPoint,
  SmartInsightDisplay,
  AnalyticsLoadingState,
  AnalyticsDomain,
  MetricToggleProps,
  DateRangePickerProps,
  EntityFilterProps,
  FormattedAnalyticsStats,
  PerformanceThresholds,
} from "./analytics";

// Explicit re-exports for analytics types that conflict - use "Analytics" prefixed versions
export type {
  DomainAnalytics as AnalyticsDomainAnalytics, // Conflicts with types/domains.ts DomainAnalytics
} from "./analytics/domain-specific";

export type {
  CampaignStatus as AnalyticsCampaignStatus, // Conflicts with types/campaign.ts CampaignStatus
} from "./analytics/domain-specific";

export type {
  WarmupStatus as AnalyticsWarmupStatus,   // Conflicts with types/mailbox.ts WarmupStatus & domains WarmupStatusType
} from "./analytics/domain-specific";

export type {
  LeadStatus as AnalyticsLeadStatus,        // Conflicts with types/clients-leads.ts LeadStatus
} from "./analytics/domain-specific";

// Export team management related types
export * from "./team";

// Export company related types
export * from "./company";

// Export consolidated auth types
export type {
  Tenant,
  ConsolidatedUser as User, // Consolidated User as main User type
  UserClaims,
  UserProfile,
  NileDBUser,
} from "./auth";

export {
  mapNileDBUserToConsolidatedUser,
  mapTenantInfoToTenant,
} from "./auth";

// Keep legacy types with prefix for backward compatibility
export type {
  User as LegacyUser, // Legacy User type for migration
} from "./auth";
