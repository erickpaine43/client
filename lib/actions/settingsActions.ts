/**
 * @deprecated This file has been split into separate modules for better maintainability.
 * Please import from the specific modules instead:
 * - General settings: @/lib/actions/settings/general
 * - Security settings: @/lib/actions/settings/security
 * - Compliance settings: @/lib/actions/settings/compliance
 * - Notification preferences: @/lib/actions/settings/notifications
 * 
 * This file is kept for backward compatibility and will be removed in a future version.
 */

"use server";

// Re-export all functions from the new modular structure for backward compatibility
export * from './settings';


