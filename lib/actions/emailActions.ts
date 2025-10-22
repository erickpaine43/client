/**
 * Email Actions for Transactional Emails
 *
 * Server actions for sending transactional emails using Loop service.
 * Handles verification, password reset, and welcome emails.
 */

'use server';

import { getLoopService } from '@/lib/services/loop';
import { z } from 'zod';

// Schema for email actions
const sendVerificationEmailSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  userName: z.string().optional(),
});

const sendPasswordResetEmailSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  userName: z.string().optional(),
});

const sendWelcomeEmailSchema = z.object({
  email: z.string().email(),
  userName: z.string().min(1),
  companyName: z.string().optional(),
});

/**
 * Send verification email
 */
export async function sendVerificationEmail(data: z.infer<typeof sendVerificationEmailSchema>) {
  try {
    const validatedData = sendVerificationEmailSchema.parse(data);
    const loopService = getLoopService();

    const result = await loopService.sendVerificationEmail(
      validatedData.email,
      validatedData.token,
      validatedData.userName
    );

    if (!result.success) {
      throw new Error(result.message || 'Failed to send verification email');
    }

    return {
      success: true,
      contactId: result.contactId,
    };
  } catch (error) {
    console.error('Send verification email error:', error);
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(data: z.infer<typeof sendPasswordResetEmailSchema>) {
  try {
    const validatedData = sendPasswordResetEmailSchema.parse(data);
    const loopService = getLoopService();

    const result = await loopService.sendPasswordResetEmail(
      validatedData.email,
      validatedData.token,
      validatedData.userName
    );

    if (!result.success) {
      throw new Error(result.message || 'Failed to send password reset email');
    }

    return {
      success: true,
      contactId: result.contactId,
    };
  } catch (error) {
    console.error('Send password reset email error:', error);
    throw error;
  }
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(data: z.infer<typeof sendWelcomeEmailSchema>) {
  try {
    const validatedData = sendWelcomeEmailSchema.parse(data);
    const loopService = getLoopService();

    const result = await loopService.sendWelcomeEmail(
      validatedData.email,
      validatedData.userName,
      validatedData.companyName
    );

    if (!result.success) {
      throw new Error(result.message || 'Failed to send welcome email');
    }

    return {
      success: true,
      contactId: result.contactId,
    };
  } catch (error) {
    console.error('Send welcome email error:', error);
    throw error;
  }
}

/**
 * Send transactional email (generic function)
 */
export async function sendTransactionalEmail(
  transactionalId: string,
  email: string,
  dataVariables?: Record<string, any>
) {
  try {
    const loopService = getLoopService();

    const result = await loopService.sendTransactionalEmail({
      transactionalId,
      email,
      dataVariables: dataVariables || {},
    });

    if (!result.success) {
      throw new Error(result.message || 'Failed to send transactional email');
    }

    return {
      success: true,
      contactId: result.contactId,
    };
  } catch (error) {
    console.error('Send transactional email error:', error);
    throw error;
  }
}

