/**
 * Tests for settings validation utilities
 */

import { describe, it, expect } from '@jest/globals';
import {
  isValidTimezone,
  isValidVatId,
  isValidUrl,
  isValidZipCode,
  validateAddress,
  validateCompanyInfo,
  validateUserSettings,
} from '../validation';

describe('Settings Validation Utilities', () => {
  describe('isValidTimezone', () => {
    it('should validate correct timezones', () => {
      expect(isValidTimezone('America/New_York')).toBe(true);
      expect(isValidTimezone('Europe/London')).toBe(true);
      expect(isValidTimezone('Asia/Tokyo')).toBe(true);
      expect(isValidTimezone('UTC')).toBe(true);
    });

    it('should reject invalid timezones', () => {
      expect(isValidTimezone('Invalid/Timezone')).toBe(false);
      expect(isValidTimezone('America/NonExistent')).toBe(false);
      expect(isValidTimezone('')).toBe(false);
    });
  });

  describe('isValidVatId', () => {
    it('should validate correct VAT ID formats', () => {
      expect(isValidVatId('US123456789')).toBe(true);
      expect(isValidVatId('GB123456789')).toBe(true);
      expect(isValidVatId('DE123456789')).toBe(true);
      expect(isValidVatId('FR12345678901')).toBe(true);
    });

    it('should reject invalid VAT ID formats', () => {
      expect(isValidVatId('123456789')).toBe(false); // No country code
      expect(isValidVatId('us123456789')).toBe(false); // Lowercase country code
      expect(isValidVatId('U123456789')).toBe(false); // Single letter country code
      expect(isValidVatId('')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('https://subdomain.example.com')).toBe(true);
      expect(isValidUrl('https://example.com/path')).toBe(true);
      expect(isValidUrl('https://example.com:8080')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('ftp://example.com')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false); // Missing protocol
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('isValidZipCode', () => {
    it('should validate US zip codes', () => {
      expect(isValidZipCode('12345')).toBe(true);
      expect(isValidZipCode('12345-6789')).toBe(true);
    });

    it('should validate international postal codes', () => {
      expect(isValidZipCode('K1A 0A6')).toBe(true); // Canadian
      expect(isValidZipCode('SW1A 1AA')).toBe(true); // UK
      expect(isValidZipCode('10115')).toBe(true); // German
    });

    it('should reject invalid zip codes', () => {
      expect(isValidZipCode('1234')).toBe(false); // Too short
      expect(isValidZipCode('123456789012')).toBe(false); // Too long
      expect(isValidZipCode('12345-67890')).toBe(false); // Invalid extended format
    });
  });

  describe('validateAddress', () => {
    it('should validate correct addresses', () => {
      const address = {
        street: '123 Main St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'US',
      };

      expect(validateAddress(address)).toBeNull();
    });

    it('should reject invalid zip codes', () => {
      const address = {
        zipCode: '123', // Too short
      };

      const result = validateAddress(address);
      expect(result).toContain('Invalid zip code format');
    });

    it('should reject long state names', () => {
      const address = {
        state: 'A'.repeat(51), // Too long
      };

      const result = validateAddress(address);
      expect(result).toContain('State name must be 50 characters or less');
    });

    it('should reject long city names', () => {
      const address = {
        city: 'A'.repeat(101), // Too long
      };

      const result = validateAddress(address);
      expect(result).toContain('City name must be 100 characters or less');
    });
  });

  describe('validateCompanyInfo', () => {
    it('should validate correct company info', () => {
      const company = {
        name: 'Test Company',
        website: 'https://test.com',
        vatId: 'US123456789',
        address: {
          street: '123 Main St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'US',
        },
      };

      expect(validateCompanyInfo(company)).toBeNull();
    });

    it('should reject long company names', () => {
      const company = {
        name: 'A'.repeat(256), // Too long
      };

      const result = validateCompanyInfo(company);
      expect(result).toContain('Company name must be 255 characters or less');
    });

    it('should reject invalid VAT IDs', () => {
      const company = {
        vatId: 'invalid-vat-id',
      };

      const result = validateCompanyInfo(company);
      expect(result).toContain('Invalid VAT ID format');
    });

    it('should reject invalid websites', () => {
      const company = {
        website: 'not-a-valid-url',
      };

      const result = validateCompanyInfo(company);
      expect(result).toContain('Invalid website URL');
    });

    it('should validate nested address', () => {
      const company = {
        address: {
          zipCode: '123', // Too short
        },
      };

      const result = validateCompanyInfo(company);
      expect(result).toContain('Invalid zip code format');
    });
  });

  describe('validateUserSettings', () => {
    it('should validate correct user settings', () => {
      const settings = {
        timezone: 'America/New_York',
        companyInfo: {
          name: 'Test Company',
          website: 'https://test.com',
        },
      };

      expect(validateUserSettings(settings)).toBeNull();
    });

    it('should reject invalid timezones', () => {
      const settings = {
        timezone: 'Invalid/Timezone',
      };

      const result = validateUserSettings(settings);
      expect(result).toContain('Invalid timezone format');
    });

    it('should validate nested company info', () => {
      const settings = {
        companyInfo: {
          name: 'A'.repeat(256), // Too long
        },
      };

      const result = validateUserSettings(settings);
      expect(result).toContain('Company name must be 255 characters or less');
    });

    it('should handle empty settings', () => {
      expect(validateUserSettings({})).toBeNull();
    });

    it('should handle undefined values', () => {
      const settings = {
        timezone: undefined,
        companyInfo: undefined,
      };

      expect(validateUserSettings(settings)).toBeNull();
    });
  });
});
