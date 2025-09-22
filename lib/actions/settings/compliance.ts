/**
 * Compliance settings actions
 * 
 * This module handles compliance-related settings including unsubscribe links,
 * company information for legal compliance, and regulatory requirements.
 */

"use server";

import { ActionResult } from "@/lib/actions/core/types";
import { ErrorFactory, withErrorHandling } from "@/lib/actions/core/errors";
import { withAuth } from "@/lib/actions/core/auth";
import { 
  ComplianceSettings,
  DeepPartial,
  ERROR_CODES
} from './types';
import { isValidZipCode } from './validation';

/**
 * Get compliance settings
 */
export async function getComplianceSettings(): Promise<ActionResult<ComplianceSettings>> {
  return withAuth(async (_context) => {
    return withErrorHandling(async () => {
      // Simulate database fetch
      await new Promise(resolve => setTimeout(resolve, 100));

      // Mock compliance settings
      const complianceSettings: ComplianceSettings = {
        autoAddUnsubscribeLink: true,
        unsubscribeText: "Click here to unsubscribe",
        unsubscribeLandingPage: "",
        companyName: "",
        addressLine1: "",
        city: "",
        state: "",
        zip: "",
        country: "",
      };

      return {
        success: true,
        data: complianceSettings,
      };
    });
  });
}

/**
 * Update compliance settings
 */
export async function updateComplianceSettings(
  settings: DeepPartial<ComplianceSettings>
): Promise<ActionResult<ComplianceSettings>> {
  return withAuth(async (_context) => {
    return withErrorHandling(async () => {
      // Validate unsubscribeText if provided
      if (settings.unsubscribeText !== undefined && settings.unsubscribeText.length === 0) {
        return ErrorFactory.validation(
          "Unsubscribe text is required",
          "unsubscribeText",
          ERROR_CODES.VALIDATION_FAILED
        );
      }

      // Validate companyName if provided
      if (settings.companyName !== undefined && settings.companyName.length === 0) {
        return ErrorFactory.validation(
          "Company name is required",
          "companyName",
          ERROR_CODES.VALIDATION_FAILED
        );
      }

      // Validate required fields for CAN-SPAM compliance
      if (settings.autoAddUnsubscribeLink === true) {
        if (!settings.companyName && !settings.addressLine1) {
          return ErrorFactory.validation(
            "Company name and address are required when auto-adding unsubscribe links",
            "companyName",
            ERROR_CODES.VALIDATION_FAILED
          );
        }
      }

      // Validate zip code format if provided
      if (settings.zip && settings.zip.length > 0) {
        if (!isValidZipCode(settings.zip)) {
          return ErrorFactory.validation(
            "Please enter a valid zip/postal code",
            "zip",
            ERROR_CODES.VALIDATION_FAILED
          );
        }
      }

      // Validate unsubscribe landing page URL if provided
      if (settings.unsubscribeLandingPage && settings.unsubscribeLandingPage.length > 0) {
        try {
          new URL(settings.unsubscribeLandingPage);
        } catch {
          return ErrorFactory.validation(
            "Please enter a valid URL for the unsubscribe landing page",
            "unsubscribeLandingPage",
            ERROR_CODES.VALIDATION_FAILED
          );
        }
      }

      // Simulate database update
      await new Promise(resolve => setTimeout(resolve, 200));

      // Mock updated settings
      const updatedSettings: ComplianceSettings = {
        autoAddUnsubscribeLink: settings.autoAddUnsubscribeLink ?? true,
        unsubscribeText: settings.unsubscribeText || "Click here to unsubscribe",
        unsubscribeLandingPage: settings.unsubscribeLandingPage || "",
        companyName: settings.companyName || "",
        addressLine1: settings.addressLine1 || "",
        addressLine2: settings.addressLine2 || "",
        city: settings.city || "",
        state: settings.state || "",
        zip: settings.zip || "",
        country: settings.country || "",
      };

      return {
        success: true,
        data: updatedSettings,
      };
    });
  });
}

/**
 * Validate compliance settings for completeness
 */
export async function validateComplianceCompleteness(): Promise<ActionResult<{
  isComplete: boolean;
  missingFields: string[];
  recommendations: string[];
}>> {
  return withAuth(async (_context) => {
    return withErrorHandling(async () => {
      // Get current compliance settings
      const settingsResult = await getComplianceSettings();
      
      if (!settingsResult.success || !settingsResult.data) {
        return ErrorFactory.internal("Failed to retrieve compliance settings");
      }

      const settings = settingsResult.data;
      const missingFields: string[] = [];
      const recommendations: string[] = [];

      // Check required fields for CAN-SPAM compliance
      if (!settings.companyName) {
        missingFields.push("companyName");
      }

      if (!settings.addressLine1) {
        missingFields.push("addressLine1");
      }

      if (!settings.city) {
        missingFields.push("city");
      }

      if (!settings.state) {
        missingFields.push("state");
      }

      if (!settings.zip) {
        missingFields.push("zip");
      }

      if (!settings.country) {
        missingFields.push("country");
      }

      // Check recommendations
      if (!settings.unsubscribeLandingPage) {
        recommendations.push("Consider adding a custom unsubscribe landing page for better user experience");
      }

      if (settings.unsubscribeText === "Click here to unsubscribe") {
        recommendations.push("Consider customizing your unsubscribe text to match your brand voice");
      }

      if (!settings.autoAddUnsubscribeLink) {
        recommendations.push("Auto-adding unsubscribe links is recommended for compliance");
      }

      const isComplete = missingFields.length === 0;

      return {
        success: true,
        data: {
          isComplete,
          missingFields,
          recommendations,
        },
      };
    });
  });
}

/**
 * Get compliance checklist
 */
export async function getComplianceChecklist(): Promise<ActionResult<Array<{
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
  category: 'can-spam' | 'gdpr' | 'ccpa' | 'general';
}>>> {
  return withAuth(async (_context) => {
    return withErrorHandling(async () => {
      // Get current compliance settings to determine completion status
      const settingsResult = await getComplianceSettings();
      
      if (!settingsResult.success || !settingsResult.data) {
        return ErrorFactory.internal("Failed to retrieve compliance settings");
      }

      const settings = settingsResult.data;

      // Mock compliance checklist
      const checklist = [
        {
          id: "unsubscribe-link",
          title: "Unsubscribe Link",
          description: "Include an unsubscribe link in all marketing emails",
          completed: settings.autoAddUnsubscribeLink,
          required: true,
          category: 'can-spam' as const,
        },
        {
          id: "company-info",
          title: "Company Information",
          description: "Include your company name and physical address",
          completed: !!(settings.companyName && settings.addressLine1 && settings.city && settings.state),
          required: true,
          category: 'can-spam' as const,
        },
        {
          id: "unsubscribe-text",
          title: "Clear Unsubscribe Text",
          description: "Use clear, understandable language for unsubscribe links",
          completed: !!settings.unsubscribeText && settings.unsubscribeText.length > 0,
          required: true,
          category: 'can-spam' as const,
        },
        {
          id: "landing-page",
          title: "Unsubscribe Landing Page",
          description: "Provide a dedicated page for unsubscribe confirmations",
          completed: !!settings.unsubscribeLandingPage,
          required: false,
          category: 'general' as const,
        },
        {
          id: "consent-tracking",
          title: "Consent Tracking",
          description: "Track and document user consent for email communications",
          completed: false, // This would be determined by other systems
          required: true,
          category: 'gdpr' as const,
        },
        {
          id: "data-retention",
          title: "Data Retention Policy",
          description: "Implement and document data retention policies",
          completed: false, // This would be determined by other systems
          required: true,
          category: 'gdpr' as const,
        },
      ];

      return {
        success: true,
        data: checklist,
      };
    });
  });
}

/**
 * Export compliance report
 */
export async function exportComplianceReport(): Promise<ActionResult<{
  reportUrl: string;
  expiresAt: Date;
}>> {
  return withAuth(async (context) => {
    return withErrorHandling(async () => {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In production, this would generate a comprehensive compliance report
      // including all settings, checklist status, and recommendations
      
      const reportUrl = `/api/compliance/reports/${context.userId}-${Date.now()}.pdf`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      return {
        success: true,
        data: {
          reportUrl,
          expiresAt,
        },
      };
    });
  });
}
