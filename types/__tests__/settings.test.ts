import {
  isActionSuccess,
  isActionError,
  isUserSettings,
  isNotificationPreferences,
  isClientPreferences,
  isCompanyInfo,
  isBillingAddress,
  type ActionResult,
  type NotificationPreferences,
  type ClientPreferences,
  type CompanyInfo,
  type BillingAddress,
} from "../settings";

// Define CompanyInfo interface for tests
interface TestCompanyInfo {
  name: string;
  industry: string;
  size: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  vatId?: string;
}

// Define UserSettings locally for tests since it's not exported
interface UserSettings {
  id: string;
  userId: string;
  timezone: string;
  companyInfo: TestCompanyInfo;
  createdAt: Date;
  updatedAt: Date;
}

describe("Settings Type Guards", () => {
  describe("ActionResult type guards", () => {
    it("should correctly identify successful ActionResult", () => {
      const successResult: ActionResult<string> = {
        success: true,
        data: "test data",
      };

      expect(isActionSuccess(successResult)).toBe(true);
      expect(isActionError(successResult)).toBe(false);

      if (isActionSuccess(successResult)) {
        // TypeScript should infer the correct type here
        expect(successResult.data).toBe("test data");
      }
    });

    it("should correctly identify error ActionResult", () => {
      const errorResult: ActionResult<string> = {
        success: false,
        error: "Something went wrong",
        code: "ERROR_CODE",
      };

      expect(isActionSuccess(errorResult)).toBe(false);
      expect(isActionError(errorResult)).toBe(true);

      if (isActionError(errorResult)) {
        // TypeScript should infer the correct type here
        expect(errorResult.error).toBe("Something went wrong");
        expect(errorResult.code).toBe("ERROR_CODE");
      }
    });
  });

  describe("UserSettings type guard", () => {
    it("should correctly identify valid UserSettings", () => {
      const validUserSettings: UserSettings = {
        id: "user-1",
        userId: "user-1",
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
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(isUserSettings(validUserSettings)).toBe(true);
    });

    it("should reject invalid UserSettings", () => {
      const invalidUserSettings = {
        id: "user-1",
        // Missing required fields
      };

      expect(isUserSettings(invalidUserSettings)).toBe(false);
    });
  });

  describe("NotificationPreferences type guard", () => {
    it("should correctly identify valid NotificationPreferences", () => {
      const validNotificationPreferences: NotificationPreferences = {
        id: "notif-1",
        userId: "user-1",
        newReplies: true,
        campaignUpdates: false,
        weeklyReports: true,
        domainAlerts: false,
        warmupCompletion: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(isNotificationPreferences(validNotificationPreferences)).toBe(true);
    });

    it("should reject invalid NotificationPreferences", () => {
      const invalidNotificationPreferences = {
        id: "notif-1",
        userId: "user-1",
        newReplies: "not a boolean", // Invalid type
      };

      expect(isNotificationPreferences(invalidNotificationPreferences)).toBe(false);
    });
  });

  describe("ClientPreferences type guard", () => {
    it("should correctly identify valid ClientPreferences", () => {
      const validClientPreferences: ClientPreferences = {
        theme: "dark",
        sidebarView: "expanded",
        language: "en",
        dateFormat: "MM/DD/YYYY",
      };

      expect(isClientPreferences(validClientPreferences)).toBe(true);
    });

    it("should reject invalid ClientPreferences", () => {
      const invalidClientPreferences = {
        theme: "invalid-theme", // Invalid enum value
        sidebarView: "expanded",
        language: "en",
        dateFormat: "MM/DD/YYYY",
      };

      expect(isClientPreferences(invalidClientPreferences)).toBe(false);
    });
  });

  describe("BillingAddress type guard", () => {
    it("should correctly identify valid BillingAddress", () => {
      const validBillingAddress: BillingAddress = {
        street: "123 Test St",
        city: "Test City",
        state: "TS",
        zipCode: "12345",
        country: "Test Country",
      };

      expect(isBillingAddress(validBillingAddress)).toBe(true);
    });

    it("should reject invalid BillingAddress", () => {
      const invalidBillingAddress = {
        street: "123 Test St",
        // Missing required fields
      };

      expect(isBillingAddress(invalidBillingAddress)).toBe(false);
    });
  });

  describe("CompanyInfo type guard", () => {
    it("should correctly identify valid CompanyInfo", () => {
      const validCompanyInfo: CompanyInfo = {
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
        vatId: "VAT123",
      };

      expect(isCompanyInfo(validCompanyInfo)).toBe(true);
    });

    it("should reject invalid CompanyInfo", () => {
      const invalidCompanyInfo = {
        name: "Test Company",
        // Missing required fields
      };

      expect(isCompanyInfo(invalidCompanyInfo)).toBe(false);
    });
  });
});
