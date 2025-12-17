/**
 * Campaign Scheduling Actions
 * 
 * Actions for managing campaign scheduling, timezones, and sending accounts.
 */

'use server';

import { withSecurity, SecurityConfigs } from '../core/auth';
import { ActionResult, ActionContext } from '../core/types';
import { ErrorFactory, createActionResult } from '../core/errors';
import { validateString } from '../core/validation';
import type { SendingAccount } from './types';

// Common timezone identifiers used in email scheduling
const availableTimezones = [
  "UTC",
  "America/New_York",
  "America/Chicago", 
  "America/Denver",
  "America/Los_Angeles",
  "America/Vancouver",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Pacific/Auckland"
];

/**
 * Get available timezones for campaign scheduling
 */
export async function getTimezones(): Promise<ActionResult<string[]>> {
  return withSecurity(
    'get_timezones',
    SecurityConfigs.USER_READ,
    async (_context: ActionContext) => {
      // Return common timezones for scheduling
      return createActionResult(availableTimezones);
    }
  );
}

/**
 * Get sending accounts for a company
 */
export async function getCampaignSendingAccounts(companyId?: string): Promise<ActionResult<SendingAccount[]>> {
  return withSecurity(
    'get_campaign_sending_accounts',
    SecurityConfigs.COMPANY_READ,
    async (context: ActionContext) => {
      // Use context company ID for security
      const effectiveCompanyId = context.companyId || companyId;
      
      if (!effectiveCompanyId) {
        return ErrorFactory.unauthorized('Company context required');
      }

      console.log("Fetching sending accounts for company:", effectiveCompanyId);
      
      // In a real implementation, this would fetch sending accounts from the database
      // For now, return mock data
      const mockSendingAccounts: SendingAccount[] = [
        {
          id: 'account_1',
          email: 'sender1@example.com',
          provider: 'Gmail',
          status: 'active',
          dailyLimit: 500,
          currentVolume: 150,
        },
        {
          id: 'account_2',
          email: 'sender2@example.com',
          provider: 'Outlook',
          status: 'warming',
          dailyLimit: 200,
          currentVolume: 50,
        },
      ];

      return createActionResult(mockSendingAccounts);
    }
  );
}

/**
 * Create a campaign schedule
 */
export async function createCampaignSchedule(data: {
  campaignId: string;
  timezone: string;
  startTime: string;
  endTime: string;
  days: number[];
  sendingAccountIds: string[];
}): Promise<ActionResult<{ id: string; message: string }>> {
  return withSecurity(
    'create_campaign_schedule',
    SecurityConfigs.COMPANY_WRITE,
    async (context: ActionContext) => {
      // Ensure company context exists
      if (!context.companyId) {
        return ErrorFactory.unauthorized('Company context required');
      }

      // Validate required fields
      const campaignIdValidation = validateString(data.campaignId, 'campaignId', { minLength: 1 });
      if (!campaignIdValidation.isValid && campaignIdValidation.errors) {
        const firstError = campaignIdValidation.errors[0];
        return ErrorFactory.validation(firstError.message, firstError.field, firstError.code);
      }

      const timezoneValidation = validateString(data.timezone, 'timezone', { minLength: 1 });
      if (!timezoneValidation.isValid && timezoneValidation.errors) {
        const firstError = timezoneValidation.errors[0];
        return ErrorFactory.validation(firstError.message, firstError.field, firstError.code);
      }

      // Validate timezone is in available list
      if (!availableTimezones.includes(data.timezone)) {
        return ErrorFactory.validation('Invalid timezone', 'timezone');
      }

      // Validate time format (basic validation)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(data.startTime)) {
        return ErrorFactory.validation('Invalid start time format (HH:MM)', 'startTime');
      }
      if (!timeRegex.test(data.endTime)) {
        return ErrorFactory.validation('Invalid end time format (HH:MM)', 'endTime');
      }

      // Validate days array
      if (!Array.isArray(data.days) || data.days.length === 0) {
        return ErrorFactory.validation('At least one day must be selected', 'days');
      }
      
      const validDays = data.days.every(day => Number.isInteger(day) && day >= 0 && day <= 6);
      if (!validDays) {
        return ErrorFactory.validation('Days must be integers between 0-6 (Sunday-Saturday)', 'days');
      }

      // Validate sending accounts
      if (!Array.isArray(data.sendingAccountIds) || data.sendingAccountIds.length === 0) {
        return ErrorFactory.validation('At least one sending account must be selected', 'sendingAccountIds');
      }

      // In a real implementation, this would create a schedule in the database
      const newScheduleId = `schedule_${Date.now()}`;
      
      console.log(`Creating campaign schedule for campaign ${data.campaignId}:`, data);

      return createActionResult({
        id: newScheduleId,
        message: 'Campaign schedule created successfully',
      });
    }
  );
}

/**
 * Update a campaign schedule
 */
export async function updateCampaignSchedule(
  scheduleId: string,
  data: Partial<{
    timezone: string;
    startTime: string;
    endTime: string;
    days: number[];
    sendingAccountIds: string[];
  }>
): Promise<ActionResult<{ message: string }>> {
  return withSecurity(
    'update_campaign_schedule',
    SecurityConfigs.COMPANY_WRITE,
    async (context: ActionContext) => {
      // Ensure company context exists
      if (!context.companyId) {
        return ErrorFactory.unauthorized('Company context required');
      }

      // Validate schedule ID
      const idValidation = validateString(scheduleId, 'scheduleId', { minLength: 1 });
      if (!idValidation.isValid && idValidation.errors) {
        const firstError = idValidation.errors[0];
        return ErrorFactory.validation(firstError.message, firstError.field, firstError.code);
      }

      // Validate timezone if provided
      if (data.timezone) {
        if (!availableTimezones.includes(data.timezone)) {
          return ErrorFactory.validation('Invalid timezone', 'timezone');
        }
      }

      // Validate time formats if provided
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (data.startTime && !timeRegex.test(data.startTime)) {
        return ErrorFactory.validation('Invalid start time format (HH:MM)', 'startTime');
      }
      if (data.endTime && !timeRegex.test(data.endTime)) {
        return ErrorFactory.validation('Invalid end time format (HH:MM)', 'endTime');
      }

      // Validate days if provided
      if (data.days) {
        if (!Array.isArray(data.days) || data.days.length === 0) {
          return ErrorFactory.validation('At least one day must be selected', 'days');
        }
        
        const validDays = data.days.every(day => Number.isInteger(day) && day >= 0 && day <= 6);
        if (!validDays) {
          return ErrorFactory.validation('Days must be integers between 0-6 (Sunday-Saturday)', 'days');
        }
      }

      // In a real implementation, this would update the schedule in the database
      console.log(`Updating campaign schedule ${scheduleId}:`, data);

      return createActionResult({
        message: 'Campaign schedule updated successfully',
      });
    }
  );
}
