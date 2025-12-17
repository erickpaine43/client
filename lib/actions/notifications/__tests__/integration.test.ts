/**
 * Integration tests for notifications module
 * These tests focus on the actual functionality without complex mocking
 */

import { describe, it, expect } from '@jest/globals';
import {
  preferencesToFormValues,
  formValuesToPreferences,
  preferencesToSettingsProps,
} from '../index';
import { mockNotificationPreferences } from '../../../../lib/data/notifications.mock';

describe('Notifications Module - Integration Tests', () => {
  describe('Helper Functions', () => {
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

      it('should handle mixed boolean values correctly', () => {
        const formValues = {
          newReplies: false,
          campaignUpdates: false,
          weeklyReports: false,
          domainAlerts: false,
          warmupCompletion: false,
        };

        const preferences = formValuesToPreferences(formValues);
        
        expect(preferences.email?.newReplies).toBe(false);
        expect(preferences.email?.campaignUpdates).toBe(false);
        expect(preferences.email?.weeklyReports).toBe(false);
        expect(preferences.email?.domainAlerts).toBe(false);
        expect(preferences.email?.warmupCompletion).toBe(false);
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

      it('should extract only the required fields', () => {
        const settingsProps = preferencesToSettingsProps(mockNotificationPreferences);
        
        // Should only have the specific fields, not all email preferences
        expect(Object.keys(settingsProps.email)).toEqual([
          'campaignCompletions',
          'newReplies',
          'weeklyReports',
          'systemAnnouncements',
        ]);

        // Should only have the specific in-app fields
        expect(Object.keys(settingsProps.inApp)).toEqual([
          'realTimeCampaignAlerts',
          'emailAccountAlerts',
        ]);
      });
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency through conversion cycles', () => {
      // Test form values round trip
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

    it('should handle edge cases gracefully', () => {
      // Test with minimal preferences
      const minimalPrefs = {
        ...mockNotificationPreferences,
        email: {
          ...mockNotificationPreferences.email,
          newReplies: false,
          campaignUpdates: false,
          weeklyReports: false,
          domainAlerts: false,
          warmupCompletion: false,
        },
      };

      expect(() => preferencesToFormValues(minimalPrefs)).not.toThrow();
      expect(() => preferencesToSettingsProps(minimalPrefs)).not.toThrow();
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety in conversions', () => {
      const formValues = preferencesToFormValues(mockNotificationPreferences);
      
      // All form values should be booleans
      expect(typeof formValues.newReplies).toBe('boolean');
      expect(typeof formValues.campaignUpdates).toBe('boolean');
      expect(typeof formValues.weeklyReports).toBe('boolean');
      expect(typeof formValues.domainAlerts).toBe('boolean');
      expect(typeof formValues.warmupCompletion).toBe('boolean');
    });

    it('should maintain proper structure in preferences conversion', () => {
      const formValues = {
        newReplies: true,
        campaignUpdates: false,
        weeklyReports: true,
        domainAlerts: false,
        warmupCompletion: true,
      };

      const preferences = formValuesToPreferences(formValues);
      
      expect(preferences).toHaveProperty('email');
      expect(preferences.email).toHaveProperty('newReplies');
      expect(preferences.email).toHaveProperty('campaignUpdates');
      expect(preferences.email).toHaveProperty('weeklyReports');
      expect(preferences.email).toHaveProperty('domainAlerts');
      expect(preferences.email).toHaveProperty('warmupCompletion');
    });
  });
});
