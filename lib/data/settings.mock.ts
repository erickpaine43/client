import type {
  UserPreferences,
  SecuritySettings,
} from "../../types/settings";

import type {
  AppearanceSettingsEntity as AppearanceSettings,
} from "../../types/settings/appearance";

// Company Information Types
export interface CompanyInfo {
  id: string;
  name: string;
  industry: string;
  size: string;
  address: BillingAddress;
  vatId?: string;
  website?: string;
  founded?: string;
  tenantId: string;
  role: "admin" | "member" | "owner";
}

export interface BillingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// User Settings Types
export interface UserSettings {
  id: string;
  userId: string;
  timezone: string;
  companyInfo: CompanyInfo;
  sidebarView: "expanded" | "collapsed";
  createdAt: Date;
  updatedAt: Date;
}

// Timezone data
export const timezones = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "Eastern Time (US & Canada)" },
  { value: "America/Chicago", label: "Central Time (US & Canada)" },
  { value: "America/Denver", label: "Mountain Time (US & Canada)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US & Canada)" },
  { value: "America/Phoenix", label: "Arizona Time" },
  { value: "America/Anchorage", label: "Alaska Time" },
  { value: "Pacific/Honolulu", label: "Hawaii Time" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Europe/Berlin", label: "Berlin" },
  { value: "Europe/Moscow", label: "Moscow" },
  { value: "Asia/Dubai", label: "Dubai" },
  { value: "Asia/Kolkata", label: "Mumbai, Kolkata, New Delhi" },
  { value: "Asia/Shanghai", label: "Beijing, Shanghai" },
  { value: "Asia/Hong_Kong", label: "Hong Kong" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Asia/Seoul", label: "Seoul" },
  { value: "Australia/Sydney", label: "Sydney" },
  { value: "Australia/Melbourne", label: "Melbourne" },
  { value: "Pacific/Auckland", label: "Auckland" },
];

// Industry options
export const industries = [
  "Technology Services",
  "Software Development",
  "E-commerce",
  "Healthcare",
  "Finance & Banking",
  "Education",
  "Marketing & Advertising",
  "Real Estate",
  "Manufacturing",
  "Retail",
  "Consulting",
  "Non-Profit",
  "Government",
  "Entertainment & Media",
  "Transportation & Logistics",
  "Hospitality & Tourism",
  "Other",
];

// Company size options
export const companySizes = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees",
];

// Mock user settings data
export const mockUserSettings: UserSettings = {
  id: "user-settings-1",
  userId: "user-1",
  timezone: "America/New_York",
  companyInfo: {
    id: "company-1",
    name: "Acme Corporation",
    industry: "Technology Services",
    size: "51-200 employees",
    tenantId: "tenant-123",
    role: "admin",
    address: {
      street: "123 Business Street",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      country: "United States",
    },
    vatId: "US123456789",
    website: "https://acmecorp.com",
    founded: "2019",
  },
  sidebarView: "expanded",
  createdAt: new Date("2024-01-15T10:00:00Z"),
  updatedAt: new Date("2024-12-20T15:30:00Z"),
};

// Mock user preferences - using UserPreferencesResponse for mock data
export const mockUserPreferences: UserPreferences = {
  id: "mock-pref-1",
  userId: "mock-user-1",
  theme: "light",
  language: "en",
  timezone: "America/New_York",
  emailNotifications: true,
  pushNotifications: false,
  weeklyReports: true,
  marketingEmails: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock appearance settings
export const mockAppearanceSettings: AppearanceSettings = {
  id: "mock-appearance-1",
  userId: "mock-user-1",
  theme: "light",
  primaryColor: "#0066CC",
  sidebarCollapsed: false,
  itemsPerPage: 25,
  compactMode: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock general settings (temporarily removed due to type conflicts)

// Mock security settings
export const mockSecuritySettings: SecuritySettings = {
  passwordStrengthIndicator: true,
  sessionTimeout: 30, // minutes
  loginAlerts: true,
  twoFactor: {
    enabled: false,
    method: "app",
  },
  accountBackupCodes: [
    "BACKUP-CODE-001",
    "BACKUP-CODE-002",
    "BACKUP-CODE-003",
    "BACKUP-CODE-004",
    "BACKUP-CODE-005",
    "BACKUP-CODE-006",
  ],
};

// Alternative user settings for testing
export const mockUserSettings2: UserSettings = {
  id: "user-settings-2",
  userId: "user-2",
  timezone: "Europe/London",
  companyInfo: {
    id: "company-2",
    role: "admin",
    tenantId: "tenant-456",
    name: "Tech Innovators Ltd",
    industry: "Software Development",
    size: "11-50 employees",
    address: {
      street: "456 Innovation Drive",
      city: "London",
      state: "",
      zipCode: "SW1A 1AA",
      country: "United Kingdom",
    },
    vatId: "GB123456789",
    website: "https://techinnovators.co.uk",
    founded: "2021",
  },
  sidebarView: "collapsed",
  createdAt: new Date("2024-03-10T09:00:00Z"),
  updatedAt: new Date("2024-12-15T14:00:00Z"),
};

// Language options
export const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
];

// Date format options
export const dateFormats = [
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY (12/31/2024)" },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY (31/12/2024)" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2024-12-31)" },
];

// Email frequency options
export const emailFrequencies = [
  { value: "immediate", label: "Immediate" },
  { value: "daily", label: "Daily Digest" },
  { value: "weekly", label: "Weekly Summary" },
  { value: "never", label: "Never" },
];

// Dashboard layout options
export const dashboardLayouts = [
  { value: "compact", label: "Compact" },
  { value: "comfortable", label: "Comfortable" },
];

// Chart color options
export const chartColorSchemes = [
  { value: "default", label: "Default" },
  { value: "accessibility", label: "High Contrast" },
  { value: "custom", label: "Custom" },
];
