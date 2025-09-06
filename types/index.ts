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

// Export analytics related types
export * from "./analytics";

// Export team management related types
export * from "./team";
