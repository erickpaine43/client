/**
 * Campaigns Actions - Main Module
 *
 * This module provides campaign management actions with standardized
 * error handling, authentication, and type safety.
 *
 * NOTE: This file has been converted to a regular export file because
 * Next.js 15 "use server" files can only export async functions.
 * All actual server actions are in the respective module files.
 */

// Re-export all campaign functions for easy importing
export * from './campaigns';
export * from './analytics';
export * from './sequences';
export * from './scheduling';

// Export types for external use
export type {
  CampaignFilters,
  CampaignSummary,
  CampaignCreateData,
  CampaignUpdateData,
} from './types';
