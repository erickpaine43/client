/**
 * Preference synchronization utilities
 * 
 * This module handles synchronization between server-side user preferences
 * and client-side UI preferences stored in localStorage.
 */

import {
  getStorageItem,
  setStorageItem,
  StorageKeys,
  type Theme,
  type Language,
  type SidebarView,
  type TableDensity,
} from "./clientStorage";

// Re-export types for use in other modules
export type { SidebarView, TableDensity };

// Types for server-side preferences (these would come from server actions)
export interface ServerUserPreferences {
  id: string;
  userId: string;
  timezone: string;
  language: Language;
  dateFormat: string;
  timeFormat: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Types for client-side preferences
export interface ClientUIPreferences {
  theme: Theme;
  sidebarView: SidebarView;
  sidebarCollapsed: boolean;
  tableDensity: TableDensity;
}

// Combined preferences interface
export interface SyncedPreferences {
  server: Partial<ServerUserPreferences>;
  client: ClientUIPreferences;
}

/**
 * Sync server preferences to client storage
 * This is called when server preferences are loaded
 */
export function syncServerToClient(serverPrefs: Partial<ServerUserPreferences>): boolean {
  try {
    // Only sync preferences that should be available on client
    if (serverPrefs.language) {
      setStorageItem(StorageKeys.LANGUAGE, serverPrefs.language);
    }

    // Note: We don't sync theme, sidebar state, etc. from server
    // as these are purely client-side UI preferences
    
    return true;
  } catch (error) {
    console.error("Failed to sync server preferences to client:", error);
    return false;
  }
}

/**
 * Get preferences that should be synced to server
 * This extracts client preferences that should be persisted server-side
 */
export function getClientPreferencesForServer(): Partial<ServerUserPreferences> {
  try {
    const language = getStorageItem(StorageKeys.LANGUAGE);
    
    // Only return preferences that should be stored on server
    return {
      language,
      // Add other preferences that should be server-side here
    };
  } catch (error) {
    console.error("Failed to get client preferences for server sync:", error);
    return {};
  }
}

/**
 * Get all client UI preferences
 */
export function getAllClientPreferences(): ClientUIPreferences {
  try {
    return {
      theme: getStorageItem(StorageKeys.THEME),
      sidebarView: getStorageItem(StorageKeys.SIDEBAR_VIEW),
      sidebarCollapsed: getStorageItem(StorageKeys.SIDEBAR_COLLAPSED),
      tableDensity: getStorageItem(StorageKeys.TABLE_DENSITY),
    };
  } catch (error) {
    console.error("Failed to get client preferences:", error);
    return {
      theme: "system",
      sidebarView: "expanded",
      sidebarCollapsed: false,
      tableDensity: "comfortable",
    };
  }
}

/**
 * Merge server and client preferences
 * This creates a unified view of all user preferences
 */
export function mergePreferences(
  serverPrefs: Partial<ServerUserPreferences>,
  clientPrefs?: ClientUIPreferences
): SyncedPreferences {
  const client = clientPrefs || getAllClientPreferences();
  
  return {
    server: serverPrefs,
    client,
  };
}

/**
 * Validate preference values
 */
export function validatePreferences(prefs: Partial<SyncedPreferences>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate server preferences
  if (prefs.server) {
    if (prefs.server.language && !["en", "es", "fr", "de", "pt", "ja", "zh"].includes(prefs.server.language)) {
      errors.push("Invalid language preference");
    }
    
    if (prefs.server.timezone && typeof prefs.server.timezone !== "string") {
      errors.push("Invalid timezone preference");
    }
  }

  // Validate client preferences
  if (prefs.client) {
    if (prefs.client.theme && !["light", "dark", "system"].includes(prefs.client.theme)) {
      errors.push("Invalid theme preference");
    }
    
    if (prefs.client.sidebarView && !["expanded", "collapsed", "mini"].includes(prefs.client.sidebarView)) {
      errors.push("Invalid sidebar view preference");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Reset all preferences to defaults
 */
export function resetAllPreferences(): boolean {
  try {
    // Reset client preferences
    setStorageItem(StorageKeys.THEME, "system");
    setStorageItem(StorageKeys.SIDEBAR_VIEW, "expanded");
    setStorageItem(StorageKeys.SIDEBAR_COLLAPSED, false);
    setStorageItem(StorageKeys.LANGUAGE, "en");
    setStorageItem(StorageKeys.TABLE_DENSITY, "comfortable");
    
    return true;
  } catch (error) {
    console.error("Failed to reset preferences:", error);
    return false;
  }
}

/**
 * Export preferences for backup/migration
 */
export function exportAllPreferences(): {
  client: ClientUIPreferences;
  timestamp: number;
  version: string;
} {
  return {
    client: getAllClientPreferences(),
    timestamp: Date.now(),
    version: "1.0.0",
  };
}

/**
 * Import preferences from backup
 */
export function importPreferences(data: {
  client: ClientUIPreferences;
  timestamp: number;
  version: string;
}): boolean {
  try {
    const validation = validatePreferences({ client: data.client });
    if (!validation.isValid) {
      console.error("Invalid preferences data:", validation.errors);
      return false;
    }

    // Import client preferences
    setStorageItem(StorageKeys.THEME, data.client.theme);
    setStorageItem(StorageKeys.SIDEBAR_VIEW, data.client.sidebarView);
    setStorageItem(StorageKeys.SIDEBAR_COLLAPSED, data.client.sidebarCollapsed);
    setStorageItem(StorageKeys.TABLE_DENSITY, data.client.tableDensity);
    
    return true;
  } catch (error) {
    console.error("Failed to import preferences:", error);
    return false;
  }
}

/**
 * Hook for preference synchronization
 * This would be used in components that need to sync preferences
 */
export function createPreferenceSyncHook() {
  return {
    syncServerToClient,
    getClientPreferencesForServer,
    getAllClientPreferences,
    mergePreferences,
    validatePreferences,
    resetAllPreferences,
    exportAllPreferences,
    importPreferences,
  };
}
