import {
  validateUserSettings,
  validateNotificationPreferences,
  validateClientPreferences,
  validateTeamMember,
  isValidTimezone,
  isValidEmail,
  isValidUrl,
  isValidTheme,
  isValidSidebarView,
  isValidDateFormat,
  isValidTeamMemberRole,
  isValidTeamMemberStatus,
  type NotificationPreferences,
  type ClientPreferences,
  type TeamMember,
} from "../settings";

// Define UserSettings locally for tests since it's not exported
interface UserSettings {
  id?: string;
  userId: string;
  timezone: string;
  companyInfo: any;
  createdAt?: Date;
  updatedAt?: Date;
}

describe("Settings Validation Functions", () => {
  describe("Basic validation helpers", () => {
    it("should validate timezones correctly", () => {
      expect(isValidTimezone("America/New_York")).toBe(true);
      expect(isValidTimezone("Europe/London")).toBe(true);
      expect(isValidTimezone("UTC")).toBe(true);
      expect(isValidTimezone("Invalid/Timezone")).toBe(false);
      expect(isValidTimezone("")).toBe(false);
    });

    it("should validate emails correctly", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("user.name+tag@domain.co.uk")).toBe(true);
      expect(isValidEmail("invalid-email")).toBe(false);
      expect(isValidEmail("@domain.com")).toBe(false);
      expect(isValidEmail("user@")).toBe(false);
    });

    it("should validate URLs correctly", () => {
      expect(isValidUrl("https://example.com")).toBe(true);
      expect(isValidUrl("http://localhost:3000")).toBe(true);
      expect(isValidUrl("ftp://files.example.com")).toBe(true);
      expect(isValidUrl("not-a-url")).toBe(false);
      expect(isValidUrl("")).toBe(false);
    });

    it("should validate enum values correctly", () => {
      expect(isValidTheme("light")).toBe(true);
      expect(isValidTheme("dark")).toBe(true);
      expect(isValidTheme("system")).toBe(true);
      expect(isValidTheme("invalid")).toBe(false);

      expect(isValidSidebarView("expanded")).toBe(true);
      expect(isValidSidebarView("collapsed")).toBe(true);
      expect(isValidSidebarView("invalid")).toBe(false);

      expect(isValidDateFormat("MM/DD/YYYY")).toBe(true);
      expect(isValidDateFormat("DD/MM/YYYY")).toBe(true);
      expect(isValidDateFormat("YYYY-MM-DD")).toBe(true);
      expect(isValidDateFormat("invalid")).toBe(false);

      expect(isValidTeamMemberRole("Admin")).toBe(true);
      expect(isValidTeamMemberRole("Member")).toBe(true);
      expect(isValidTeamMemberRole("Invalid")).toBe(false);

      expect(isValidTeamMemberStatus("active")).toBe(true);
      expect(isValidTeamMemberStatus("inactive")).toBe(true);
      expect(isValidTeamMemberStatus("pending")).toBe(true);
      expect(isValidTeamMemberStatus("invalid")).toBe(false);
    });
  });

  describe("validateUserSettings", () => {
    it("should validate valid user settings", () => {
      const validSettings: Partial<UserSettings> = {
        timezone: "America/New_York",
        companyInfo: {
          name: "Test Company",
          industry: "Technology",
          size: "10-50",
          address: {
            street: "123 Test St",
            city: "Test City",
            state: "TS",
            zipCode: "12345",
            country: "Test Country",
          },
        },
      };

      const result = validateUserSettings(validSettings);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject invalid timezone", () => {
      const invalidSettings: Partial<UserSettings> = {
        timezone: "Invalid/Timezone",
      };

      const result = validateUserSettings(invalidSettings);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe("INVALID_TIMEZONE");
    });

    it("should reject missing company info fields", () => {
      const invalidSettings: Partial<UserSettings> = {
        companyInfo: {
          name: "",
          industry: "",
          size: "",
          address: {
            street: "123 Test St",
            city: "Test City",
            state: "TS",
            zipCode: "12345",
            country: "Test Country",
          },
        },
      };

      const result = validateUserSettings(invalidSettings);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3); // name, industry, size
      expect(result.errors.every(error => error.code === "REQUIRED_FIELD")).toBe(true);
    });
  });

  describe("validateNotificationPreferences", () => {
    it("should validate valid notification preferences", () => {
      const validPrefs: Partial<NotificationPreferences> = {
        newReplies: true,
        campaignUpdates: false,
        weeklyReports: true,
        domainAlerts: false,
        warmupCompletion: true,
      };

      const result = validateNotificationPreferences(validPrefs);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject non-boolean values", () => {
      const invalidPrefs: Record<string, unknown> = {
        newReplies: "not a boolean",
        campaignUpdates: 1,
        weeklyReports: null,
      };

      const result = validateNotificationPreferences(invalidPrefs);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.every(error => error.code === "INVALID_FORMAT")).toBe(true);
    });
  });

  describe("validateClientPreferences", () => {
    it("should validate valid client preferences", () => {
      const validPrefs: Partial<ClientPreferences> = {
        theme: "dark",
        sidebarView: "expanded",
        language: "en",
        dateFormat: "MM/DD/YYYY",
      };

      const result = validateClientPreferences(validPrefs);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject invalid enum values", () => {
      const invalidPrefs: Record<string, unknown> = {
        theme: "invalid-theme",
        sidebarView: "invalid-view",
        dateFormat: "invalid-format",
      };

      const result = validateClientPreferences(invalidPrefs);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors.every(error => error.code === "INVALID_ENUM_VALUE")).toBe(true);
    });

    it("should reject empty language", () => {
      const invalidPrefs: Partial<ClientPreferences> = {
        language: "",
      };

      const result = validateClientPreferences(invalidPrefs);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe("REQUIRED_FIELD");
    });
  });

  describe("validateTeamMember", () => {
    it("should validate valid team member", () => {
      const validMember: Partial<TeamMember> = {
        name: "John Doe",
        email: "john@example.com",
        role: "Admin",
        status: "active",
      };

      const result = validateTeamMember(validMember);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject invalid email", () => {
      const invalidMember: Partial<TeamMember> = {
        email: "invalid-email",
      };

      const result = validateTeamMember(invalidMember);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe("INVALID_EMAIL");
    });

    it("should reject empty name", () => {
      const invalidMember: Partial<TeamMember> = {
        name: "",
      };

      const result = validateTeamMember(invalidMember);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe("REQUIRED_FIELD");
    });

    it("should reject invalid role and status", () => {
      const invalidMember: Record<string, unknown> = {
        role: "InvalidRole",
        status: "invalid-status",
      };

      const result = validateTeamMember(invalidMember);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors.every(error => error.code === "INVALID_ENUM_VALUE")).toBe(true);
    });
  });
});
