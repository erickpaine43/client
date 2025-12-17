# Settings Management Actions

## Overview

This module contains server actions for managing user and application settings, including user preferences, notification settings, security settings, and application configuration. All actions follow established patterns for type safety, error handling, and validation.

## Actions

### User Settings

#### `updateUserSettings`

Updates user-specific settings and preferences.

```typescript
interface UpdateUserSettingsArgs {
  settings: Partial<UserSettings>;
}

export async function updateUserSettings(
  args: UpdateUserSettingsArgs
): Promise<ActionResult<UserSettings>> {
  // Implementation
}
```

#### `getUserSettings`

Retrieves current user settings.

```typescript
export async function getUserSettings(): Promise<ActionResult<UserSettings>> {
  // Implementation
}
```

#### `resetUserSettings`

Resets user settings to default values.

```typescript
interface ResetUserSettingsArgs {
  categories?: SettingsCategory[];
}

export async function resetUserSettings(
  args: ResetUserSettingsArgs
): Promise<ActionResult<UserSettings>> {
  // Implementation
}
```

### Notification Settings

#### `updateNotificationSettings`

Updates notification preferenfor various event types.

```typescript
interface UpdateNotificationSettingsArgs {
  settings: Partial<NotificationSettings>;
}

export async function updateNotificationSettings(
  args: UpdateNotificationSettingsArgs
): Promise<ActionResult<NotificationSettings>> {
  // Implementation
}
```

#### `getNotificationSettings`

Retrieves current notification settings.

```typescript
export async function getNotificationSettings(): Promise<
  ActionResult<NotificationSettings>
> {
  // Implementation
}
```

### Security Settings

#### `updateSecuritySettings`

Updates security-related settings.

```typescript
interface UpdateSecuritySettingsArgs {
  settings: Partial<SecuritySettings>;
}

export async function updateSecuritySettings(
  args: UpdateSecuritySettingsArgs
): Promise<ActionResult<SecuritySettings>> {
  // Implementation
}
```

#### `enableTwoFactorAuth`

Enables two-factor authentication for the user.

```typescript
interface EnableTwoFactorAuthArgs {
  method: "2fa_app" | "sms";
  phoneNumber?: string;
}

export async function enableTwoFactorAuth(
  args: EnableTwoFactorAuthArgs
): Promise<ActionResult<TwoFactorSetup>> {
  // Implementation
}
```

#### `disableTwoFactorAuth`

Disables two-factor authentication.

```typescript
interface DisableTwoFactorAuthArgs {
  confirmationCode: string;
}

export async function disableTwoFactorAuth(
  args: DisableTwoFactorAuthArgs
): Promise<ActionResult<void>> {
  // Implementation
}
```

### Application Settings

#### `updateAppSettings`

Updates application-wide settings (admin only).

```typescript
interface UpdateAppSettingsArgs {
  settings: Partial<AppSettings>;
}

export async function updateAppSettings(
  args: UpdateAppSettingsArgs
): Promise<ActionResult<AppSettings>> {
  // Implementation
}
```

#### `getAppSettings`

Retrieves application settings.

```typescript
export async function getAppSettings(): Promise<ActionResult<AppSettings>> {
  // Implementation
}
```

### API Settings

#### `generateApiKey`

Generates a new API key for the user.

```typescript
interface GenerateApiKeyArgs {
  name: string;
  permissions: ApiPermission[];
  expiresAt?: Date;
}

export async function generateApiKey(
  args: GenerateApiKeyArgs
): Promise<ActionResult<ApiKey>> {
  // Implementation
}
```

#### `revokeApiKey`

Revokes an existing API key.

```typescript
interface RevokeApiKeyArgs {
  keyId: string;
}

export async function revokeApiKey(
  args: RevokeApiKeyArgs
): Promise<ActionResult<void>> {
  // Implementation
}
```

#### `listApiKeys`

Lists all API keys for the user.

```typescript
export async function listApiKeys(): Promise<ActionResult<ApiKey[]>> {
  // Implementation
}
```

## Types

### Core Types

```typescript
interface UserSettings {
  id: string;
  userId: string;
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
  emailDigest: "daily" | "weekly" | "monthly" | "never";
  defaultView: "dashboard" | "campaigns" | "analytics";
  itemsPerPage: number;
  autoSave: boolean;
  updatedAt: Date;
}

interface NotificationSettings {
  id: string;
  userId: string;
  email: {
    campaignUpdates: boolean;
    systemAlerts: boolean;
    weeklyReports: boolean;
    securityAlerts: boolean;
    marketingEmails: boolean;
  };
  push: {
    campaignUpdates: boolean;
    systemAlerts: boolean;
    mentions: boolean;
  };
  sms: {
    securityAlerts: boolean;
    criticalAlerts: boolean;
  };
  updatedAt: Date;
}

interface SecuritySettings {
  id: string;
  userId: string;
  twoFactorEnabled: boolean;
  twoFactorMethod: "2fa_app" | "sms" | null;
  sessionTimeout: number; // minutes
  ipWhitelist: string[];
  loginNotifications: boolean;
  passwordChangeNotifications: boolean;
  updatedAt: Date;
}

interface AppSettings {
  id: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  maxUsersPerTeam: number;
  maxCampaignsPerUser: number;
  defaultUserRole: string;
  supportEmail: string;
  companyName: string;
  logoUrl?: string;
  updatedAt: Date;
}

interface ApiKey {
  id: string;
  userId: string;
  name: string;
  key: string; // Only returned on creation
  keyHash: string; // Stored hash
  permissions: ApiPermission[];
  lastUsedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  isActive: boolean;
}
```

### Enums

```typescript
enum SettingsCategory {
  APPEARANCE = "appearance",
  NOTIFICATIONS = "notifications",
  SECURITY = "security",
  API = "api",
  PREFERENCES = "preferences",
}

enum ApiPermission {
  READ_CAMPAIGNS = "read_campaigns",
  WRITE_CAMPAIGNS = "write_campaigns",
  READ_ANALYTICS = "read_analytics",
  READ_DOMAINS = "read_domains",
  WRITE_DOMAINS = "write_domains",
  READ_TEMPLATES = "read_templates",
  WRITE_TEMPLATES = "write_templates",
}
```

## Usage Examples

### Updating User Settings

```typescript
import { updateUserSettings } from "@/lib/actions/settings";

const handleThemeChange = async (theme: "light" | "dark" | "system") => {
  const result = await updateUserSettings({
    settings: { theme },
  });

  if (result.success) {
    console.log("Theme updated:", result.data.theme);
  } else {
    console.error("Failed to update theme:", result.error);
  }
};
```

### Managing Notification Settings

```typescript
import { updateNotificationSettings } from "@/lib/actions/settings";

const handleNotificationUpdate = async (
  emailSettings: Partial<NotificationSettings["email"]>
) => {
  const result = await updateNotificationSettings({
    settings: {
      email: emailSettings,
    },
  });

  if (result.success) {
    console.log("Notifications updated:", result.data);
  } else {
    console.error("Failed to update notifications:", result.error);
  }
};
```

### API Key Management

```typescript
import {
  generateApiKey,
  revokeApiKey,
  listApiKeys,
} from "@/lib/actions/settings";

const handleGenerateApiKey = async (
  name: string,
  permissions: ApiPermission[]
) => {
  const result = await generateApiKey({
    name,
    permissions,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
  });

  if (result.success) {
    console.log("API key generated:", result.data.key);
    // Store the key securely - it won't be shown again
  } else {
    console.error("Failed to generate API key:", result.error);
  }
};

const handleRevokeApiKey = async (keyId: string) => {
  const result = await revokeApiKey({ keyId });

  if (result.success) {
    console.log("API key revoked");
  } else {
    console.error("Failed to revoke API key:", result.error);
  }
};
```

### Two-Factor Authentication

```typescript
import {
  enableTwoFactorAuth,
  disableTwoFactorAuth,
} from "@/lib/actions/settings";

const handleEnable2FA = async (
  method: "2fa_app" | "sms",
  phoneNumber?: string
) => {
  const result = await enableTwoFactorAuth({
    method,
    phoneNumber,
  });

  if (result.success) {
    console.log("2FA setup:", result.data);
    // Show QR code or SMS confirmation
  } else {
    console.error("Failed to enable 2FA:", result.error);
  }
};

const handleDisable2FA = async (confirmationCode: string) => {
  const result = await disableTwoFactorAuth({
    confirmationCode,
  });

  if (result.success) {
    console.log("2FA disabled");
  } else {
    console.error("Failed to disable 2FA:", result.error);
  }
};
```

## Validation

### Input Validation

```typescript
import { z } from "zod";

const updateUserSettingsSchema = z.object({
  settings: z.object({
    theme: z.enum(["light", "dark", "system"]).optional(),
    language: z.string().min(2).max(5).optional(),
    timezone: z.string().optional(),
    dateFormat: z.string().optional(),
    timeFormat: z.enum(["12h", "24h"]).optional(),
    emailDigest: z.enum(["daily", "weekly", "monthly", "never"]).optional(),
    defaultView: z.enum(["dashboard", "campaigns", "analytics"]).optional(),
    itemsPerPage: z.number().min(10).max(100).optional(),
    autoSave: z.boolean().optional(),
  }),
});

const generateApiKeySchema = z.object({
  name: z.string().min(1).max(50),
  permissions: z.array(z.nativeEnum(ApiPermission)).min(1),
  expiresAt: z.date().optional(),
});

const enableTwoFactorAuthSchema = z
  .object({
    method: z.enum(["2fa_app", "sms"]),
    phoneNumber: z.string().optional(),
  })
  .refine((data) => data.method !== "sms" || data.phoneNumber, {
    message: "Phone number is required for SMS 2FA",
    path: ["phoneNumber"],
  });
```

### Settings Validation

```typescript
function validateTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

function validateLanguage(language: string): boolean {
  const supportedLanguages = [
    "en",
    "es",
    "fr",
    "de",
    "it",
    "pt",
    "ja",
    "ko",
    "zh",
  ];
  return supportedLanguages.includes(language);
}

function validateApiPermissions(
  permissions: ApiPermission[],
  userRole: string
): boolean {
  // Admin users can have any permissions
  if (userRole === "admin") {
    return true;
  }

  // Regular users cannot have write permissions to sensitive resources
  const restrictedPermissions = [ApiPermission.WRITE_DOMAINS];

  return !permissions.some((p) => restrictedPermissions.includes(p));
}
```

## Error Handling

### Common Error Types

```typescript
enum SettingsActionError {
  INVALID_TIMEZONE = "invalid_timezone",
  INVALID_LANGUAGE = "invalid_language",
  INVALID_PERMISSIONS = "invalid_permissions",
  TWO_FACTOR_ALREADY_ENABLED = "two_factor_already_enabled",
  TWO_FACTOR_NOT_ENABLED = "two_factor_not_enabled",
  INVALID_CONFIRMATION_CODE = "invalid_confirmation_code",
  API_KEY_LIMIT_REACHED = "api_key_limit_reached",
  API_KEY_NOT_FOUND = "api_key_not_found",
  INSUFFICIENT_PERMISSIONS = "insufficient_permissions",
}
```

### Error Handling Examples

```typescript
export async function updateUserSettings(
  args: UpdateUserSettingsArgs
): Promise<ActionResult<UserSettings>> {
  try {
    // Validate input
    const validation = updateUserSettingsSchema.safeParse(args);
    if (!validation.success) {
      return {
        success: false,
        error: {
          code: "validation_error",
          message: "Invalid settings data",
          details: validation.error.errors,
        },
      };
    }

    const { settings } = validation.data;

    // Validate timezone if provided
    if (settings.timezone && !validateTimezone(settings.timezone)) {
      return {
        success: false,
        error: {
          code: SettingsActionError.INVALID_TIMEZONE,
          message: "Invalid timezone",
        },
      };
    }

    // Validate language if provided
    if (settings.language && !validateLanguage(settings.language)) {
      return {
        success: false,
        error: {
          code: SettingsActionError.INVALID_LANGUAGE,
          message: "Unsupported language",
        },
      };
    }

    // Update settings
    const updatedSettings = await updateUserSettingsInDB(settings);

    return {
      success: true,
      data: updatedSettings,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "unknown_error",
        message: error.message,
      },
    };
  }
}
```

## Security Considerations

### API Key Security

```typescript
import crypto from "crypto";

function generateSecureApiKey(): { key: string; hash: string } {
  // Generate a secure random key
  const key = crypto.randomBytes(32).toString("hex");

  // Create a hash for storage
  const hash = crypto.createHash("sha256").update(key).digest("hex");

  return { key, hash };
}

function validateApiKey(providedKey: string, storedHash: string): boolean {
  const providedHash = crypto
    .createHash("sha256")
    .update(providedKey)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(providedHash, "hex"),
    Buffer.from(storedHash, "hex")
  );
}
```

### Two-Factor Authentication

```typescript
import speakeasy from "speakeasy";

function generateTwoFactorSecret(): { secret: string; qrCode: string } {
  const secret = speakeasy.generateSecret({
    name: "Your App Name",
    length: 32,
  });

  return {
    secret: secret.base32,
    qrCode: secret.otpauth_url,
  };
}

function verifyTwoFactorToken(token: string, secret: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 2, // Allow 2 time steps of variance
  });
}
```

## Testing

### Unit Tests

```typescript
import { updateUserSettings, generateApiKey } from "../settings-actions";
import { ApiPermission } from "../types";

describe("Settings Actions", () => {
  describe("updateUserSettings", () => {
    it("should update user settings with valid data", async () => {
      const args = {
        settings: {
          theme: "dark" as const,
          language: "en",
          timezone: "America/New_York",
        },
      };

      const result = await updateUserSettings(args);

      expect(result.success).toBe(true);
      expect(result.data?.theme).toBe("dark");
      expect(result.data?.language).toBe("en");
    });

    it("should fail with invalid timezone", async () => {
      const args = {
        settings: {
          timezone: "Invalid/Timezone",
        },
      };

      const result = await updateUserSettings(args);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("invalid_timezone");
    });
  });

  describe("generateApiKey", () => {
    it("should generate API key with valid permissions", async () => {
      const args = {
        name: "Test API Key",
        permissions: [
          ApiPermission.READ_CAMPAIGNS,
          ApiPermission.READ_ANALYTICS,
        ],
      };

      const result = await generateApiKey(args);

      expect(result.success).toBe(true);
      expect(result.data?.name).toBe("Test API Key");
      expect(result.data?.key).toBeDefined();
      expect(result.data?.permissions).toEqual(args.permissions);
    });

    it("should fail when API key limit is reached", async () => {
      // Mock reaching the limit
      mockApiKeyCount(10); // Assume limit is 10

      const args = {
        name: "Test API Key",
        permissions: [ApiPermission.READ_CAMPAIGNS],
      };

      const result = await generateApiKey(args);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("api_key_limit_reached");
    });
  });
});
```

### Integration Tests

```typescript
describe("Settings Integration", () => {
  it("should update settings and reflect changes in UI", async () => {
    // Update theme setting
    const result = await updateUserSettings({
      settings: { theme: "dark" },
    });

    expect(result.success).toBe(true);

    // Verify the change is reflected
    const settings = await getUserSettings();
    expect(settings.data?.theme).toBe("dark");
  });

  it("should enable 2FA and require it for sensitive operations", async () => {
    // Enable 2FA
    const result = await enableTwoFactorAuth({
      method: "2fa_app",
    });

    expect(result.success).toBe(true);

    // Verify 2FA is required for sensitive operations
    const securitySettings = await getSecuritySettings();
    expect(securitySettings.data?.twoFactorEnabled).toBe(true);
  });
});
```

## Best Practices

1. **Input Validation**: Always validate settings data before processing
2. **Security**: Hash API keys and use secure random generation
3. **Audit Logging**: Log all settings changes for security and compliance
4. **Rate Limiting**: Implement rate limiting for sensitive operations like 2FA
5. **Encryption**: Encrypt sensitive settings data at rest
6. **Backup**: Maintain backups of critical settings
7. **Versioning**: Consider versioning for settings schema changes

## Related Documentation

- [Settings Types](../../../types/settings.ts)
- [Security Patterns](../../../docs/development/authentication.md)
- [Action Patterns](../README.md)
- [Team Actions](../team/README.md)
- [User Profile Actions](../profile/README.md)
