/**
 * User Preferences TypeScript Interface
 * Defines the structure for individual user preference settings
 */

export interface UserPreferences {
  id?: string;
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyReports: boolean;
  marketingEmails: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * User Preferences creation/update payload
 */
export interface UserPreferencesInput {
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  timezone?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  weeklyReports?: boolean;
  marketingEmails?: boolean;
}

/**
 * User Preferences response (without internal fields)
 */
export interface UserPreferencesResponse {
  id: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyReports: boolean;
  marketingEmails: boolean;
  sidebarCollapsed?: boolean;
  tableDensity?: string;
  sidebarView?: string;
  updatedAt: string;
}
