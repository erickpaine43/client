'use server';

/**
 * Simple Analytics Validation Example
 * 
 * This demonstrates basic validation patterns using the core validation system
 * without complex Convex API dependencies.
 */

import { 
  createActionResult, 
  ErrorFactory
} from '../core/errors';
import { 
  withValidation,
  commonValidators,
} from '../core/validation-middleware';
import type { ActionResult, ActionContext } from '../core/types';

// Simple data types for demonstration
interface CampaignData {
  campaignId: string;
  campaignName: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  leadCount: number;
}

interface AnalyticsFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  campaignIds?: string[];
}

/**
 * Example: Simple campaign validation
 */
export const validateCampaignData = withValidation(
  {
    campaignId: {
      required: true,
      type: 'string',
      min: 5,
      max: 50,
      pattern: /^camp_[a-zA-Z0-9_-]+$/,
    },
    campaignName: {
      required: true,
      type: 'string',
      min: 3,
      max: 100,
    },
    status: {
      required: true,
      type: 'string',
      enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED'] as const,
    },
    leadCount: {
      required: true,
      type: 'number',
      min: 0,
      max: 10000,
    },
  },
  async (
    data: CampaignData,
    _context?: ActionContext
  ): Promise<ActionResult<{ validated: CampaignData; message: string }>> => {
    // Additional business logic validation
    if (data.status === 'ACTIVE' && data.leadCount === 0) {
      return ErrorFactory.validation(
        'Active campaigns must have at least one lead',
        'leadCount',
        'BUSINESS_RULE_VIOLATION'
      );
    }

    return createActionResult({
      validated: data,
      message: 'Campaign data is valid'
    });
  }
);

/**
 * Example: Analytics filters validation
 */
export async function validateAnalyticsFilters(
  filters: AnalyticsFilters
): Promise<ActionResult<{ valid: boolean; normalized: AnalyticsFilters }>> {
  // Validate date range if provided
  if (filters.dateRange) {
    const startDate = new Date(filters.dateRange.start);
    const endDate = new Date(filters.dateRange.end);
    
    if (isNaN(startDate.getTime())) {
      return ErrorFactory.validation('Invalid start date format', 'dateRange.start');
    }
    
    if (isNaN(endDate.getTime())) {
      return ErrorFactory.validation('Invalid end date format', 'dateRange.end');
    }
    
    if (startDate >= endDate) {
      return ErrorFactory.validation('Start date must be before end date', 'dateRange');
    }
  }

  // Validate campaign IDs if provided
  if (filters.campaignIds) {
    const campaignIdsValidation = commonValidators.stringArray(filters.campaignIds);
    if (!campaignIdsValidation.success) {
      return campaignIdsValidation as ActionResult<{ valid: boolean; normalized: AnalyticsFilters }>;
    }

    // Check campaign ID format
    for (const campaignId of campaignIdsValidation.data!) {
      if (!campaignId.startsWith('camp_')) {
        return ErrorFactory.validation(
          `Invalid campaign ID format: ${campaignId}. Must start with 'camp_'`,
          'campaignIds'
        );
      }
    }
  }

  return createActionResult({
    valid: true,
    normalized: filters
  });
}

/**
 * Example: Bulk validation
 */
export async function validateBulkCampaigns(
  campaigns: CampaignData[]
): Promise<ActionResult<{ validCount: number; invalidCount: number; errors: string[] }>> {
  if (!Array.isArray(campaigns)) {
    return ErrorFactory.validation('Campaigns must be an array');
  }

  if (campaigns.length === 0) {
    return ErrorFactory.validation('At least one campaign is required');
  }

  if (campaigns.length > 50) {
    return ErrorFactory.validation('Cannot process more than 50 campaigns at once');
  }

  const results = {
    validCount: 0,
    invalidCount: 0,
    errors: [] as string[]
  };

  for (let i = 0; i < campaigns.length; i++) {
    const campaign = campaigns[i];
    
    // Validate each campaign
    const validation = await validateCampaignData(campaign);
    
    if (validation.success) {
      results.validCount++;
    } else {
      results.invalidCount++;
      results.errors.push(`Campaign ${i + 1}: ${validation.error?.message || 'Unknown error'}`);
    }
  }

  return createActionResult(results);
}

/**
 * Example: Runtime type checking
 */
export async function validateExternalData(
  data: unknown
): Promise<ActionResult<{ processed: number; skipped: number; errors: string[] }>> {
  if (!Array.isArray(data)) {
    return ErrorFactory.validation('Data must be an array');
  }

  const results = {
    processed: 0,
    skipped: 0,
    errors: [] as string[]
  };

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    
    // Runtime type checking
    if (!item || typeof item !== 'object') {
      results.skipped++;
      results.errors.push(`Item ${i + 1}: Invalid data format`);
      continue;
    }

    const typedItem = item as Record<string, unknown>;
    
    // Check required fields
    if (typeof typedItem.campaignId !== 'string') {
      results.skipped++;
      results.errors.push(`Item ${i + 1}: Missing or invalid campaignId`);
      continue;
    }

    if (typeof typedItem.campaignName !== 'string') {
      results.skipped++;
      results.errors.push(`Item ${i + 1}: Missing or invalid campaignName`);
      continue;
    }

    // Validate the item as campaign data
    try {
      const campaignData: CampaignData = {
        campaignId: typedItem.campaignId,
        campaignName: typedItem.campaignName,
        status: (typedItem.status as CampaignData['status']) || 'DRAFT',
        leadCount: typeof typedItem.leadCount === 'number' ? typedItem.leadCount : 0
      };

      const validation = await validateCampaignData(campaignData);
      
      if (validation.success) {
        results.processed++;
      } else {
        results.skipped++;
        results.errors.push(`Item ${i + 1}: ${validation.error?.message || 'Validation failed'}`);
      }
    } catch (error) {
      results.skipped++;
      results.errors.push(`Item ${i + 1}: Processing error - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return createActionResult(results);
}
