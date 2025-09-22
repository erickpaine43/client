/**
 * Settings validation utilities
 * 
 * This module provides validation functions specific to settings data,
 * including user settings, company info, and various setting types.
 */

import { DeepPartial, UserSettings, CompanyInfo, BillingAddress } from './types';

/**
 * Validate timezone format
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate VAT ID format
 */
export function isValidVatId(vatId: string): boolean {
  // Basic VAT ID validation - can be enhanced based on requirements
  return /^[A-Z]{2}[0-9A-Z]+$/.test(vatId);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate zip code format
 */
export function isValidZipCode(zipCode: string): boolean {
  // US zip code validation (5 digits or 5+4 format)
  const usZipRegex = /^[0-9]{5}(-[0-9]{4})?$/;
  
  // International postal code validation (more flexible)
  const intlPostalRegex = /^[A-Z0-9\s-]{5,10}$/i;
  
  // Must be at least 5 characters and match either US or international format
  return zipCode.length >= 5 && (usZipRegex.test(zipCode) || intlPostalRegex.test(zipCode));
}

/**
 * Validate billing address
 */
export function validateAddress(address: DeepPartial<BillingAddress>): string | null {
  if (address.zipCode && !isValidZipCode(address.zipCode)) {
    return "Invalid zip code format";
  }
  
  if (address.state && address.state.length > 50) {
    return "State name must be 50 characters or less";
  }
  
  if (address.city && address.city.length > 100) {
    return "City name must be 100 characters or less";
  }
  
  return null;
}

/**
 * Validate company information
 */
export function validateCompanyInfo(company: DeepPartial<CompanyInfo>): string | null {
  if (company.name && company.name.length > 255) {
    return "Company name must be 255 characters or less";
  }
  
  if (company.vatId && !isValidVatId(company.vatId)) {
    return "Invalid VAT ID format";
  }
  
  if (company.website && !isValidUrl(company.website)) {
    return "Invalid website URL";
  }
  
  if (company.address) {
    const addressValidation = validateAddress(company.address);
    if (addressValidation) return addressValidation;
  }
  
  return null;
}

/**
 * Validate user settings
 */
export function validateUserSettings(settings: DeepPartial<UserSettings>): string | null {
  if (settings.timezone && !isValidTimezone(settings.timezone)) {
    return "Invalid timezone format";
  }
  
  if (settings.companyInfo) {
    const companyValidation = validateCompanyInfo(settings.companyInfo);
    if (companyValidation) return companyValidation;
  }
  
  return null;
}
