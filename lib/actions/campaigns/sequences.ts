/**
 * Campaign Sequence Actions
 * 
 * Actions for managing campaign sequences and steps.
 */

'use server';

import { sequenceSteps } from '@/lib/data/campaigns';
import { withSecurity, SecurityConfigs } from '../core/auth';
import { ActionResult, ActionContext } from '../core/types';
import { ErrorFactory, createActionResult } from '../core/errors';
import { validateString, validateId, validateNumber } from '../core/validation';
import type { SequenceStep } from './types';

/**
 * Get sequence steps for campaigns
 */
export async function getSequenceSteps(): Promise<ActionResult<typeof sequenceSteps>> {
  return withSecurity(
    'get_sequence_steps',
    SecurityConfigs.COMPANY_READ,
    async (context: ActionContext) => {
      // Ensure company context exists
      if (!context.companyId) {
        return ErrorFactory.unauthorized('Company context required');
      }

      // In a real implementation, this would fetch from a database filtered by company
      // For now, return the static mock data
      return createActionResult(sequenceSteps);
    }
  );
}

/**
 * Get sequence steps for a specific campaign
 */
export async function getCampaignSequenceSteps(campaignId: string): Promise<ActionResult<SequenceStep[]>> {
  return withSecurity(
    'get_campaign_sequence_steps',
    SecurityConfigs.COMPANY_READ,
    async (context: ActionContext) => {
      // Ensure company context exists
      if (!context.companyId) {
        return ErrorFactory.unauthorized('Company context required');
      }

      // Validate campaign ID
      const idValidation = validateId(campaignId, 'campaignId');
      if (!idValidation.isValid && idValidation.errors) {
        const firstError = idValidation.errors[0];
        return ErrorFactory.validation(firstError.message, firstError.field, firstError.code);
      }

      // In a real implementation, this would fetch sequence steps for the specific campaign
      // For now, filter mock data by campaign ID
      // Transform sequence steps to match our SequenceStep interface
      const campaignSteps: SequenceStep[] = sequenceSteps
        .filter(step => 'campaignId' in step ? step.campaignId === campaignId : false)
        .map((step, index) => {
          // Parse delay for wait steps
          let delay: number | undefined;
          let delayUnit: 'minutes' | 'hours' | 'days' | undefined;

          if (step.type === 'wait' && 'duration' in step && typeof step.duration === 'string') {
            const match = step.duration.match(/(\d+)\s*(days?|hours?|minutes?)/);
            if (match) {
              delay = parseInt(match[1]);
              const unit = match[2].toLowerCase();
              if (unit.startsWith('day')) delayUnit = 'days';
              else if (unit.startsWith('hour')) delayUnit = 'hours';
              else if (unit.startsWith('minute')) delayUnit = 'minutes';
            }
          }

          return {
            id: step.id,
            campaignId: Number(campaignId),
            stepNumber: index + 1,
            type: step.type,
            subject: 'subject' in step ? step.subject : undefined,
            content: ('content' in step ? step.content : undefined) as string | undefined,
            delay,
            delayUnit,
          };
        });
      
      return createActionResult(campaignSteps);
    }
  );
}

/**
 * Create a new sequence step
 */
export async function createSequenceStep(data: {
  campaignId: string;
  type: 'email' | 'wait' | 'action';
  stepNumber: number;
  subject?: string;
  content?: string;
  waitDuration?: number;
  waitUnit?: 'minutes' | 'hours' | 'days';
}): Promise<ActionResult<{ id: string; message: string }>> {
  return withSecurity(
    'create_sequence_step',
    SecurityConfigs.COMPANY_WRITE,
    async (context: ActionContext) => {
      // Ensure company context exists
      if (!context.companyId) {
        return ErrorFactory.unauthorized('Company context required');
      }

      // Validate required fields
      const campaignIdValidation = validateId(data.campaignId, 'campaignId');
      if (!campaignIdValidation.isValid && campaignIdValidation.errors) {
        const firstError = campaignIdValidation.errors[0];
        return ErrorFactory.validation(firstError.message, firstError.field, firstError.code);
      }

      const stepNumberValidation = validateNumber(data.stepNumber, 'stepNumber', { min: 1, max: 100 });
      if (!stepNumberValidation.isValid && stepNumberValidation.errors) {
        const firstError = stepNumberValidation.errors[0];
        return ErrorFactory.validation(firstError.message, firstError.field, firstError.code);
      }

      // Validate email step requirements
      if (data.type === 'email') {
        if (!data.subject) {
          return ErrorFactory.validation('Subject is required for email steps', 'subject');
        }
        const subjectValidation = validateString(data.subject, 'subject', { minLength: 1, maxLength: 200 });
        if (!subjectValidation.isValid && subjectValidation.errors) {
          const firstError = subjectValidation.errors[0];
          return ErrorFactory.validation(firstError.message, firstError.field, firstError.code);
        }
      }

      // Validate wait step requirements
      if (data.type === 'wait') {
        if (!data.waitDuration || data.waitDuration <= 0) {
          return ErrorFactory.validation('Wait duration is required for wait steps', 'waitDuration');
        }
        if (!data.waitUnit) {
          return ErrorFactory.validation('Wait unit is required for wait steps', 'waitUnit');
        }
      }

      // In a real implementation, this would create a sequence step in the database
      const newStepId = `step_${Date.now()}`;
      
      console.log(`Creating sequence step for campaign ${data.campaignId}:`, data);

      return createActionResult({
        id: newStepId,
        message: 'Sequence step created successfully',
      });
    }
  );
}

/**
 * Update a sequence step
 */
export async function updateSequenceStep(
  stepId: string,
  data: Partial<{
    subject?: string;
    content?: string;
    waitDuration?: number;
    waitUnit?: 'minutes' | 'hours' | 'days';
  }>
): Promise<ActionResult<{ message: string }>> {
  return withSecurity(
    'update_sequence_step',
    SecurityConfigs.COMPANY_WRITE,
    async (context: ActionContext) => {
      // Ensure company context exists
      if (!context.companyId) {
        return ErrorFactory.unauthorized('Company context required');
      }

      // Validate step ID
      const idValidation = validateId(stepId, 'stepId');
      if (!idValidation.isValid && idValidation.errors) {
        const firstError = idValidation.errors[0];
        return ErrorFactory.validation(firstError.message, firstError.field, firstError.code);
      }

      // Validate subject if provided
      if (data.subject) {
        const subjectValidation = validateString(data.subject, 'subject', { minLength: 1, maxLength: 200 });
        if (!subjectValidation.isValid && subjectValidation.errors) {
          const firstError = subjectValidation.errors[0];
          return ErrorFactory.validation(firstError.message, firstError.field, firstError.code);
        }
      }

      // In a real implementation, this would update the sequence step in the database
      console.log(`Updating sequence step ${stepId}:`, data);

      return createActionResult({
        message: 'Sequence step updated successfully',
      });
    }
  );
}

/**
 * Delete a sequence step
 */
export async function deleteSequenceStep(stepId: string): Promise<ActionResult<{ message: string }>> {
  return withSecurity(
    'delete_sequence_step',
    SecurityConfigs.COMPANY_WRITE,
    async (context: ActionContext) => {
      // Ensure company context exists
      if (!context.companyId) {
        return ErrorFactory.unauthorized('Company context required');
      }

      // Validate step ID
      const idValidation = validateId(stepId, 'stepId');
      if (!idValidation.isValid && idValidation.errors) {
        const firstError = idValidation.errors[0];
        return ErrorFactory.validation(firstError.message, firstError.field, firstError.code);
      }

      // In a real implementation, this would delete the sequence step from the database
      console.log(`Deleting sequence step ${stepId}`);

      return createActionResult({
        message: 'Sequence step deleted successfully',
      });
    }
  );
}
