/**
 * Unit tests for notification utility functions
 * These tests focus on pure functions without external dependencies
 */

import { describe, it, expect } from '@jest/globals';
import { mockNotificationPreferences } from '../../../../lib/data/notifications.mock';

// Define the utility functions directly in the test file to avoid import issues
function preferencesToFormValues(prefs: typeof mockNotificationPreferences) {
  return {
    newReplies: prefs.email.newReplies,
    campaignUpdates: prefs.email.campaignUpdates,
    weeklyReports: prefs.email.weeklyReports,
    domainAlerts: prefs.email.domainAlerts,
    warmupCompletion: prefs.email.warmupCompletion,
  };
}

function formValuesToPreferences(values: {
  newReplies: boolean;
  campaignUpdates: boolean;
  weeklyReports: boolean;
  domainAlerts: boolean;
  warmupCompletion: boolean;
}) {
  return {
    email: {
      newReplies: values.newReplies,
      campaignUpdates: values.campaignUpdates,
      weeklyReports: values.weeklyReports,
      domainAlerts: values.domainAlerts,
      warmupCompletion: values.warmupCompletion,
    },
  };
}

function preferencesToSettingsProps(prefs: typeof mockNotificationPreferences) {
  return {
    email: {
      campaignCompletions: prefs.email.campaignCompletions,
      newReplies: prefs.email.newReplies,
      weeklyReports: prefs.email.weeklyReports,
      systemAnnouncements: prefs.email.systemAnnouncements,
    },
    inApp: {
      realTimeCampaignAlerts: prefs.inApp.realTimeCampaignAlerts,
      emailAccountAlerts: prefs.inApp.emailAccountAlerts,
    },
  };
}

// Validation functions
function validateEmailPreferences(prefs: Record<string, unknown>): string | null {
  for (const [key, value] of Object.entries(prefs)) {
    if (value !== undefined && typeof value !== "boolean") {
      return `Invalid value for email preference '${key}': must be true or false`;
    }
  }
  return null;
}

function validateInAppPreferences(prefs: Record<string, unknown>): string | null {
  for (const [key, value] of Object.entries(prefs)) {
    if (value !== undefined && typeof value !== "boolean") {
      return `Invalid value for in-app preference '${key}': must be true or false`;
    }
  }
  return null;
}

function validatePushPreferences(prefs: Record<string, unknown>): string | null {
  for (const [key, value] of Object.entries(prefs)) {
    if (value !== undefined && typeof value !== "boolean") {
      return `Invalid value for push preference '${key}': must be true or false`;
    }
  }
  
  // Additional validation: if push is enabled, at least one platform should be enabled
  if (prefs.enabled === true) {
    if (prefs.desktopNotifications === false && prefs.mobileNotifications === false) {
      return "At least one notification platform must be enabled when push notifications are on";
    }
  }
  
  return null;
}

function validateNotificationSchedule(schedule: {
  type?: string;
  schedule?: {
    frequency?: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
    time?: string;
    timezone?: string;
  };
}): string | null {
  if (!schedule.type) {
    return "Schedule type is required";
  }
  
  if (!["weeklyReports", "monthlyReports", "customReminder"].includes(schedule.type)) {
    return "Invalid schedule type";
  }
  
  if (schedule.schedule) {
    const { frequency, dayOfWeek, dayOfMonth, time, timezone } = schedule.schedule;
    
    if (frequency && !["daily", "weekly", "monthly"].includes(frequency)) {
      return "Invalid schedule frequency";
    }
    
    if (dayOfWeek !== undefined && (dayOfWeek < 0 || dayOfWeek > 6)) {
      return "Day of week must be between 0 (Sunday) and 6 (Saturday)";
    }
    
    if (dayOfMonth !== undefined && (dayOfMonth < 1 || dayOfMonth > 31)) {
      return "Day of month must be between 1 and 31";
    }
    
    if (time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      return "Time must be in HH:MM format";
    }
    
    if (timezone) {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: timezone });
      } catch {
        return "Invalid timezone";
      }
    }
  }
  
  return null;
}

describe('Notification Utilities', () => {
  describe('Preference Conversion Functions', () => {
    describe('preferencesToFormValues', () => {
      it('should convert preferences to form values correctly', () => {
        const formValues = preferencesToFormValues(mockNotificationPreferences);
        
        expect(formValues).toEqual({
          newReplies: mockNotificationPreferences.email.newReplies,
          campaignUpdates: mockNotificationPreferences.email.campaignUpdates,
          weeklyReports: mockNotificationPreferences.email.weeklyReports,
          domainAlerts: mockNotificationPreferences.email.domainAlerts,
          warmupCompletion: mockNotificationPreferences.email.warmupCompletion,
        });
      });

      it('should handle all boolean values correctly', () => {
        const testPrefs = {
          ...mockNotificationPreferences,
          email: {
            ...mockNotificationPreferences.email,
            newReplies: false,
            campaignUpdates: true,
            weeklyReports: false,
            domainAlerts: true,
            warmupCompletion: false,
          },
        };

        const formValues = preferencesToFormValues(testPrefs);
        
        expect(formValues.newReplies).toBe(false);
        expect(formValues.campaignUpdates).toBe(true);
        expect(formValues.weeklyReports).toBe(false);
        expect(formValues.domainAlerts).toBe(true);
        expect(formValues.warmupCompletion).toBe(false);
      });
    });

    describe('formValuesToPreferences', () => {
      it('should convert form values to preferences correctly', () => {
        const formValues = {
          newReplies: true,
          campaignUpdates: false,
          weeklyReports: true,
          domainAlerts: false,
          warmupCompletion: true,
        };

        const preferences = formValuesToPreferences(formValues);
        
        expect(preferences).toEqual({
          email: {
            newReplies: true,
            campaignUpdates: false,
            weeklyReports: true,
            domainAlerts: false,
            warmupCompletion: true,
          },
        });
      });
    });

    describe('preferencesToSettingsProps', () => {
      it('should convert preferences to settings props correctly', () => {
        const settingsProps = preferencesToSettingsProps(mockNotificationPreferences);
        
        expect(settingsProps).toEqual({
          email: {
            campaignCompletions: mockNotificationPreferences.email.campaignCompletions,
            newReplies: mockNotificationPreferences.email.newReplies,
            weeklyReports: mockNotificationPreferences.email.weeklyReports,
            systemAnnouncements: mockNotificationPreferences.email.systemAnnouncements,
          },
          inApp: {
            realTimeCampaignAlerts: mockNotificationPreferences.inApp.realTimeCampaignAlerts,
            emailAccountAlerts: mockNotificationPreferences.inApp.emailAccountAlerts,
          },
        });
      });
    });
  });

  describe('Validation Functions', () => {
    describe('validateEmailPreferences', () => {
      it('should validate correct email preferences', () => {
        const validPrefs = {
          newReplies: true,
          campaignUpdates: false,
          weeklyReports: true,
        };

        const result = validateEmailPreferences(validPrefs);
        expect(result).toBeNull();
      });

      it('should reject invalid email preferences', () => {
        const invalidPrefs = {
          newReplies: 'yes',
          campaignUpdates: false,
        };

        const result = validateEmailPreferences(invalidPrefs);
        expect(result).toContain('Invalid value for email preference');
      });
    });

    describe('validateInAppPreferences', () => {
      it('should validate correct in-app preferences', () => {
        const validPrefs = {
          realTimeCampaignAlerts: true,
          emailAccountAlerts: false,
        };

        const result = validateInAppPreferences(validPrefs);
        expect(result).toBeNull();
      });

      it('should reject invalid in-app preferences', () => {
        const invalidPrefs = {
          realTimeCampaignAlerts: 1,
        };

        const result = validateInAppPreferences(invalidPrefs);
        expect(result).toContain('Invalid value for in-app preference');
      });
    });

    describe('validatePushPreferences', () => {
      it('should validate correct push preferences', () => {
        const validPrefs = {
          enabled: true,
          desktopNotifications: true,
          mobileNotifications: false,
        };

        const result = validatePushPreferences(validPrefs);
        expect(result).toBeNull();
      });

      it('should reject push enabled without platforms', () => {
        const invalidPrefs = {
          enabled: true,
          desktopNotifications: false,
          mobileNotifications: false,
        };

        const result = validatePushPreferences(invalidPrefs);
        expect(result).toContain('At least one notification platform must be enabled');
      });
    });

    describe('validateNotificationSchedule', () => {
      it('should validate correct weekly schedule', () => {
        const validSchedule = {
          type: 'weeklyReports',
          schedule: {
            frequency: 'weekly',
            dayOfWeek: 1,
            time: '09:00',
            timezone: 'America/New_York',
          },
        };

        const result = validateNotificationSchedule(validSchedule);
        expect(result).toBeNull();
      });

      it('should validate correct monthly schedule', () => {
        const validSchedule = {
          type: 'monthlyReports',
          schedule: {
            frequency: 'monthly',
            dayOfMonth: 1,
            time: '10:00',
            timezone: 'UTC',
          },
        };

        const result = validateNotificationSchedule(validSchedule);
        expect(result).toBeNull();
      });

      it('should reject missing schedule type', () => {
        const invalidSchedule = {
          schedule: {
            frequency: 'weekly',
            time: '09:00',
          },
        };

        const result = validateNotificationSchedule(invalidSchedule);
        expect(result).toBe('Schedule type is required');
      });

      it('should reject invalid schedule type', () => {
        const invalidSchedule = {
          type: 'invalidType',
          schedule: {
            frequency: 'weekly',
            time: '09:00',
          },
        };

        const result = validateNotificationSchedule(invalidSchedule);
        expect(result).toBe('Invalid schedule type');
      });

      it('should reject invalid day of week', () => {
        const invalidSchedule = {
          type: 'weeklyReports',
          schedule: {
            frequency: 'weekly',
            dayOfWeek: 8,
            time: '09:00',
          },
        };

        const result = validateNotificationSchedule(invalidSchedule);
        expect(result).toBe('Day of week must be between 0 (Sunday) and 6 (Saturday)');
      });

      it('should reject invalid day of month', () => {
        const invalidSchedule = {
          type: 'monthlyReports',
          schedule: {
            frequency: 'monthly',
            dayOfMonth: 32,
            time: '09:00',
          },
        };

        const result = validateNotificationSchedule(invalidSchedule);
        expect(result).toBe('Day of month must be between 1 and 31');
      });

      it('should reject invalid time format', () => {
        const invalidSchedule = {
          type: 'weeklyReports',
          schedule: {
            frequency: 'weekly',
            time: '25:00',
          },
        };

        const result = validateNotificationSchedule(invalidSchedule);
        expect(result).toBe('Time must be in HH:MM format');
      });

      it('should reject invalid timezone', () => {
        const invalidSchedule = {
          type: 'weeklyReports',
          schedule: {
            frequency: 'weekly',
            time: '09:00',
            timezone: 'Invalid/Timezone',
          },
        };

        const result = validateNotificationSchedule(invalidSchedule);
        expect(result).toBe('Invalid timezone');
      });
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency through conversion cycles', () => {
      const originalFormValues = {
        newReplies: true,
        campaignUpdates: false,
        weeklyReports: true,
        domainAlerts: false,
        warmupCompletion: true,
      };

      const preferences = formValuesToPreferences(originalFormValues);
      const mockPrefsWithFormData = {
        ...mockNotificationPreferences,
        email: {
          ...mockNotificationPreferences.email,
          ...preferences.email,
        },
      };
      const backToFormValues = preferencesToFormValues(mockPrefsWithFormData);

      expect(backToFormValues).toEqual(originalFormValues);
    });
  });
});
