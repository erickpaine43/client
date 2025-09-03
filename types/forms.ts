import { z } from "zod";
import { isValidTimeRange } from "@/lib/utils";
import { CampaignEventCondition, CampaignStatus } from "@/types/campaign";
import { TemplateCategory } from "@/types";
import { VerificationStatus } from "@/types/domain";
import {
  EmailProvider,
  DnsProvider,
  DkimManagementType,
} from "@/components/domains/components/constants";
import { WarmupStatus } from "@/types/mailbox";
import { RelayType, DomainAccountCreationType } from "@/types/domain";

const DOMAIN_REGEX =
  /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}$/;

// Campaign schemas
export const campaignStepSchema = z.object({
  id: z.number().optional(),
  sequenceOrder: z.number(),
  delayDays: z.number(),
  delayHours: z.number(),
  templateId: z.number(),
  campaignId: z.number(),
  emailSubject: z.string().min(1, "Email subject is required").optional(),
  emailBody: z.string().optional(),
  condition: z.nativeEnum(CampaignEventCondition),
});

export const campaignFormSchema = z
  .object({
    id: z.number().optional(),
    name: z.string().min(1, "Campaign name is required"),
    fromName: z.string().min(1, "From name is required"),
    fromEmail: z.string().email("Invalid email address"),
    status: z.nativeEnum(CampaignStatus).default(CampaignStatus.DRAFT),
    companyId: z.number().optional(),
    createdById: z.string().optional(),
    steps: z.array(campaignStepSchema).min(1, "At least one step is required"),
    sendDays: z.array(z.number()).optional(), // Array of weekday numbers (0-6)
    sendTimeStart: z.string().optional(), // HH:mm format
    sendTimeEnd: z.string().optional(), // HH:mm format
    emailsPerDay: z.number().optional(),
    timezone: z.string().optional().default("UTC"),
    clients: z.array(z.string().email("Invalid email address")),
    metrics: z
      .object({
        recipients: z
          .object({
            sent: z.number(),
            total: z.number(),
          })
          .optional(),
        opens: z
          .object({
            total: z.number(),
            rate: z.number(),
          })
          .optional(),
        clicks: z
          .object({
            total: z.number(),
            rate: z.number(),
          })
          .optional(),
        replies: z
          .object({
            total: z.number(),
            rate: z.number(),
          })
          .optional(),
        bounces: z
          .object({
            total: z.number(),
            rate: z.number(),
          })
          .optional(),
      })
      .optional(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
  })
  .refine(
    (data) => {
      const { sendTimeStart = "", sendTimeEnd = "" } = data;
      return isValidTimeRange(sendTimeStart, sendTimeEnd);
    },
    {
      message: "Start time must be earlier than end time",
      path: ["sendTimeStart"],
    },
  )
  .refine(
    (data) => {
      const { sendTimeStart = "", sendTimeEnd = "" } = data;
      return isValidTimeRange(sendTimeStart, sendTimeEnd);
    },
    {
      message: "End time must be later than start time",
      path: ["sendTimeEnd"],
    },
  );

// Template schemas
export const templateFormSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
  category: z.nativeEnum(TemplateCategory),
  subject: z.string().min(1, "Subject line is required"),
  body: z.string().min(1, "Email body is required"),
});

export const newFolderFormSchema = z.object({
  folderName: z
    .string()
    .min(1, "Folder name is required")
    .max(50, "Folder name must be less than 50 characters")
    .regex(
      /^[a-zA-Z0-9\s-_]+$/,
      "Folder name can only contain letters, numbers, spaces, hyphens, and underscores",
    ),
});

// Contact form schema
export const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  file: z.instanceof(File).optional(),
});

// Settings schemas
export const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(30, "Name must not be longer than 30 characters"),
  email: z.string().email("Please enter a valid email address"),
  avatarUrl: z.string().optional(),
  username: z.string().optional(),
  role: z.string().optional(),
});

export const passwordSettingsSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters long"),
    confirmNewPassword: z.string().min(1, "Confirm new password is required"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"],
  });

// Domain schemas
export const domainFormSchema = z.object({
  domain: z
    .string()
    .min(1, "Domain is required")
    .regex(DOMAIN_REGEX, "Invalid domain format"),
  provider: z.nativeEnum(DnsProvider, {
    message: "Please select a valid DNS provider",
  }),
  spfRecordValue: z.string().optional(),
  spfStatus: z.nativeEnum(VerificationStatus).optional(),
  dkimManagementType: z.nativeEnum(DkimManagementType),
  dkimSelector: z.string().optional(),
  dkimPublicKey: z.string().optional(),
  dkimStatus: z.nativeEnum(VerificationStatus).optional(),
  dmarcRecordValue: z.string().optional(),
  dmarcStatus: z.nativeEnum(VerificationStatus).optional(),
  overallAuthStatus: z.string().optional(),
});

// Email account schema
export const emailAccountFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  provider: z.nativeEnum(EmailProvider),
  status: z
    .enum(["PENDING", "ACTIVE", "ISSUE", "SUSPENDED", "DELETED"])
    .default("PENDING"),
  reputation: z.number().min(0).max(100).default(100),
  warmupStatus: z.nativeEnum(WarmupStatus).default(WarmupStatus.NOT_STARTED),
  dayLimit: z.number().min(1).max(2000).default(100),
  sent24h: z.number().default(0),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
  accountType: z
    .nativeEnum(DomainAccountCreationType)
    .default(DomainAccountCreationType.VIRTUAL_USER_DB),

  // Account-specific SMTP Auth Status
  accountSmtpAuthStatus: z
    .nativeEnum(VerificationStatus)
    .default(VerificationStatus.NOT_CONFIGURED)
    .optional(),

  // Relay settings
  relayType: z.nativeEnum(RelayType).default(RelayType.DEFAULT_SERVER_CONFIG),
  relayHost: z.string().optional(),

  // Mailbox configuration
  virtualMailboxMapping: z.string().optional(),
  mailboxPath: z.string().optional(),
  mailboxQuotaMB: z.number().positive().optional(),

  // Warmup strategy
  warmupDailyIncrement: z.number().positive().optional(),
  warmupTargetDailyVolume: z.number().positive().optional(),

  // Overall account statuses
  accountSetupStatus: z.string().optional(),
  accountDeliverabilityStatus: z.string().optional(),
});

// Inferred TypeScript types
export type CampaignStepValues = z.infer<typeof campaignStepSchema>;
export type CampaignFormValues = z.infer<typeof campaignFormSchema>;
export type TemplateFormValues = z.infer<typeof templateFormSchema>;
export type NewFolderFormValues = z.infer<typeof newFolderFormSchema>;
export type ContactFormValues = z.infer<typeof contactFormSchema>;
export type DomainFormValues = z.infer<typeof domainFormSchema>;
export type EmailAccountFormValues = z.infer<typeof emailAccountFormSchema>;
export type ProfileFormValues = z.infer<typeof profileFormSchema>;
export type PasswordSettingsFormValues = z.infer<typeof passwordSettingsSchema>;

// Form validation error and field types
export interface FormFieldError {
  message: string;
  code?: string;
  path?: (string | number)[];
}

export interface FormValidationResult<T = unknown> {
  success: boolean;
  data?: T;
  errors?: FormFieldError[];
}

export interface FieldValidationType<T = unknown> {
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  customValidator?: (value: T) => boolean | Promise<boolean>;
}

// Contact form data structure for form submission
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  file?: File;
}

// Enhanced validation utilities
export const validateFormField = async <T = Record<string, unknown>>(
  value: T,
  validationRules: FieldValidationType<T>,
): Promise<FormValidationResult<T>> => {
  const errors: FormFieldError[] = [];

  // Required check
  if (
    validationRules.required &&
    (value === null || value === undefined || value === "")
  ) {
    errors.push({ message: "This field is required", code: "REQUIRED" });
  }

  // Length checks
  if (typeof value === "string") {
    if (validationRules.minLength && value.length < validationRules.minLength) {
      errors.push({
        message: `Minimum length is ${validationRules.minLength}`,
        code: "MIN_LENGTH",
      });
    }
    if (validationRules.maxLength && value.length > validationRules.maxLength) {
      errors.push({
        message: `Maximum length is ${validationRules.maxLength}`,
        code: "MAX_LENGTH",
      });
    }
  }

  // Pattern check
  if (validationRules.pattern && typeof value === "string") {
    const regex = new RegExp(validationRules.pattern);
    if (!regex.test(value)) {
      errors.push({ message: "Invalid format", code: "PATTERN_MISMATCH" });
    }
  }

  // Custom validator
  if (
    validationRules.customValidator &&
    value !== null &&
    value !== undefined
  ) {
    try {
      const isValid = await validationRules.customValidator(value);
      if (!isValid) {
        errors.push({
          message: "Custom validation failed",
          code: "CUSTOM_VALIDATION",
        });
      }
    } catch {
      errors.push({
        message: "Validation error occurred",
        code: "VALIDATION_ERROR",
      });
    }
  }

  return {
    success: errors.length === 0,
    data: value,
    errors,
  };
};

// Re-export all schemas for easy access
export const schemas = {
  campaign: {
    step: campaignStepSchema,
    form: campaignFormSchema,
  },
  template: {
    form: templateFormSchema,
    folder: newFolderFormSchema,
  },
  contact: {
    form: contactFormSchema,
  },
  domain: {
    form: domainFormSchema,
  },
  emailAccount: {
    form: emailAccountFormSchema,
  },
  settings: {
    profile: profileFormSchema,
    password: passwordSettingsSchema,
  },
};
