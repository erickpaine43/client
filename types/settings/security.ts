import { z } from "zod";
import type { BaseEntity, ActionResult } from "./base";

// ============================================================================
// SECURITY TYPES
// ============================================================================

// Password Strength
export interface PasswordStrength {
  level: "weak" | "medium" | "strong" | "very-strong";
  text: string;
  color: string;
  percentage: number;
}

// Two-Factor Authentication Types
export const twoFactorSchema = z.object({
  enabled: z.boolean(),
  method: z.enum(["sms", "app"]).optional(),
  secret: z.string().optional(),
  backupCodes: z.array(z.string()).optional(),
});

export type TwoFactorFormValues = z.infer<typeof twoFactorSchema>;

// Security Settings (Full entity)
export interface SecuritySettingsEntity extends BaseEntity {
  userId: string;
  passwordStrengthIndicator: boolean;
  sessionTimeout: number;
  loginAlerts: boolean;
  twoFactor: TwoFactorFormValues;
  accountBackupCodes: string[];
}

// Security Settings (Legacy - for mock compatibility)
export interface SecuritySettings {
  passwordStrengthIndicator?: boolean;
  sessionTimeout: number;
  loginAlerts: boolean;
  twoFactor: TwoFactorFormValues;
  accountBackupCodes: string[];
}

// Security Events
export interface SecurityEvent extends BaseEntity {
  userId: string;
  type: "login" | "password_change" | "two_factor_disabled" | "account_locked";
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
}

// Security Recommendations
export interface SecurityRecommendation {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  resolved: boolean;
  actionUrl?: string;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

// Security Configuration Types
export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type PasswordFormValues = z.infer<typeof passwordSchema>;

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export type SecuritySettingsResponse = ActionResult<SecuritySettingsEntity>;

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface PasswordToggleProps {
  show: boolean;
  onToggle: () => void;
}

export interface PasswordStrengthIndicatorProps {
  password: string;
}
