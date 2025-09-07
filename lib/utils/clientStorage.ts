/**
 * Client-side storage utilities for managing UI preferences
 * 
 * This module provides type-safe localStorage operations with fallback mechanisms
 * for storing user preferences like theme, sidebar state, and language settings.
 */

// Storage keys enum for type safety
export enum StorageKeys {
  THEME = 'pm_theme',
  SIDEBAR_COLLAPSED = 'pm_sidebar_collapsed',
  SIDEBAR_VIEW = 'pm_sidebar_view',
  LANGUAGE = 'pm_language',
  LOCALE = 'pm_locale',
  TIMEZONE = 'pm_timezone',
  DATE_FORMAT = 'pm_date_format',
  TIME_FORMAT = 'pm_time_format',
  FIRST_DAY_OF_WEEK = 'pm_first_day_of_week',
  NOTIFICATIONS_SOUND = 'pm_notifications_sound',
  NOTIFICATIONS_DESKTOP = 'pm_notifications_desktop',
  TABLE_DENSITY = 'pm_table_density',
  RECENT_SEARCHES = 'pm_recent_searches',
  FAVORITE_FILTERS = 'pm_favorite_filters',
  DASHBOARD_LAYOUT = 'pm_dashboard_layout',
  ONBOARDING_COMPLETED = 'pm_onboarding_completed',
  TOUR_COMPLETED = 'pm_tour_completed',
  ANNOUNCEMENT_DISMISSED = 'pm_announcement_dismissed',
  COOKIE_CONSENT = 'pm_cookie_consent',
  DEBUG_MODE = 'pm_debug_mode',
}

// Type definitions for stored values
export type Theme = 'light' | 'dark' | 'system';
export type SidebarView = 'expanded' | 'collapsed' | 'mini';
export type Language = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'ja' | 'zh';
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
export type TimeFormat = '12h' | '24h';
export type TableDensity = 'compact' | 'comfortable' | 'spacious';
export type FirstDayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.

export interface DashboardLayout {
  widgets: string[];
  positions: Record<string, { x: number; y: number; w: number; h: number }>;
}

export interface RecentSearch {
  query: string;
  timestamp: number;
  category?: string;
}

export interface FavoriteFilter {
  id: string;
  name: string;
  filter: Record<string, unknown>;
  createdAt: number;
}

export interface AnnouncementDismissal {
  id: string;
  dismissedAt: number;
  version?: string;
}

// Type mapping for storage keys
interface StorageTypeMap {
  [StorageKeys.THEME]: Theme;
  [StorageKeys.SIDEBAR_COLLAPSED]: boolean;
  [StorageKeys.SIDEBAR_VIEW]: SidebarView;
  [StorageKeys.LANGUAGE]: Language;
  [StorageKeys.LOCALE]: string;
  [StorageKeys.TIMEZONE]: string;
  [StorageKeys.DATE_FORMAT]: DateFormat;
  [StorageKeys.TIME_FORMAT]: TimeFormat;
  [StorageKeys.FIRST_DAY_OF_WEEK]: FirstDayOfWeek;
  [StorageKeys.NOTIFICATIONS_SOUND]: boolean;
  [StorageKeys.NOTIFICATIONS_DESKTOP]: boolean;
  [StorageKeys.TABLE_DENSITY]: TableDensity;
  [StorageKeys.RECENT_SEARCHES]: RecentSearch[];
  [StorageKeys.FAVORITE_FILTERS]: FavoriteFilter[];
  [StorageKeys.DASHBOARD_LAYOUT]: DashboardLayout;
  [StorageKeys.ONBOARDING_COMPLETED]: boolean;
  [StorageKeys.TOUR_COMPLETED]: string[]; // Array of completed tour IDs
  [StorageKeys.ANNOUNCEMENT_DISMISSED]: AnnouncementDismissal[];
  [StorageKeys.COOKIE_CONSENT]: boolean;
  [StorageKeys.DEBUG_MODE]: boolean;
}

// Default values for each storage key
const DEFAULT_VALUES: StorageTypeMap = {
  [StorageKeys.THEME]: 'system',
  [StorageKeys.SIDEBAR_COLLAPSED]: false,
  [StorageKeys.SIDEBAR_VIEW]: 'expanded',
  [StorageKeys.LANGUAGE]: 'en',
  [StorageKeys.LOCALE]: 'en-US',
  [StorageKeys.TIMEZONE]: Intl.DateTimeFormat().resolvedOptions().timeZone,
  [StorageKeys.DATE_FORMAT]: 'MM/DD/YYYY',
  [StorageKeys.TIME_FORMAT]: '12h',
  [StorageKeys.FIRST_DAY_OF_WEEK]: 0,
  [StorageKeys.NOTIFICATIONS_SOUND]: true,
  [StorageKeys.NOTIFICATIONS_DESKTOP]: false,
  [StorageKeys.TABLE_DENSITY]: 'comfortable',
  [StorageKeys.RECENT_SEARCHES]: [],
  [StorageKeys.FAVORITE_FILTERS]: [],
  [StorageKeys.DASHBOARD_LAYOUT]: { widgets: [], positions: {} },
  [StorageKeys.ONBOARDING_COMPLETED]: false,
  [StorageKeys.TOUR_COMPLETED]: [],
  [StorageKeys.ANNOUNCEMENT_DISMISSED]: [],
  [StorageKeys.COOKIE_CONSENT]: false,
  [StorageKeys.DEBUG_MODE]: false,
};

// In-memory fallback storage for when localStorage is unavailable
// In-memory fallback storage for when localStorage is unavailable
class MemoryStorage {
  private static instance: MemoryStorage | null = null;
  private storage: Map<string, string> = new Map();

  private constructor() {}

  static getInstance(): MemoryStorage {
    if (!MemoryStorage.instance) {
      MemoryStorage.instance = new MemoryStorage();
    }
    return MemoryStorage.instance;
  }

  static resetInstance(): void {
    MemoryStorage.instance = null;
  }

  getItem(key: string): string | null {
    return this.storage.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }

  get length(): number {
    return this.storage.size;
  }

  key(index: number): string | null {
    const keys = Array.from(this.storage.keys());
    return keys[index] || null;
  }
}

// Storage availability check
let isStorageAvailable: boolean | null = null;
let memoryStorage: MemoryStorage | null = null;

// Export for testing to reset global state
export const __resetInternalStateForTesting = () => {
  isStorageAvailable = null;
  memoryStorage = null;
  MemoryStorage.resetInstance();
};

/**
 * Check if localStorage is available and working
 */
export function checkStorageAvailability(): boolean {
  if (isStorageAvailable !== null) {
    return isStorageAvailable;
  }

  try {
    if (typeof window === 'undefined') {
      isStorageAvailable = false;
      return false;
    }

    const testKey = '__localStorage_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    isStorageAvailable = true;
    return true;
  } catch {
    isStorageAvailable = false;
    console.warn('localStorage is not available, falling back to memory storage');
    return false;
  }
}

/**
 * Get the appropriate storage mechanism
 */
function getStorage(): Storage | MemoryStorage {
  if (checkStorageAvailability() && typeof window !== 'undefined') {
    return window.localStorage;
  }
  
  if (!memoryStorage) {
    memoryStorage = MemoryStorage.getInstance();
  }
  
  return memoryStorage;
}

/**
 * Get a value from storage with type safety
 */
export function getStorageItem<K extends StorageKeys>(
  key: K,
  defaultValue?: StorageTypeMap[K]
): StorageTypeMap[K] {
  try {
    const storage = getStorage();
    const item = storage.getItem(key);
    
    if (item === null) {
      return defaultValue !== undefined ? defaultValue : DEFAULT_VALUES[key];
    }
    
    // Parse JSON for complex types
    try {
      return JSON.parse(item) as StorageTypeMap[K];
    } catch {
      // If parsing fails, return as string (for simple string values)
      return item as StorageTypeMap[K];
    }
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return defaultValue !== undefined ? defaultValue : DEFAULT_VALUES[key];
  }
}

/**
 * Set a value in storage with type safety
 */
export function setStorageItem<K extends StorageKeys>(
  key: K,
  value: StorageTypeMap[K]
): boolean {
  try {
    const storage = getStorage();
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    storage.setItem(key, serializedValue);
    
    // Dispatch custom event for storage changes
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('storageChange', {
        detail: { key, value }
      }));
    }
    
    return true;
  } catch (error) {
    console.error(`Error writing ${key} to storage:`, error);
    return false;
  }
}

/**
 * Remove a value from storage
 */
export function removeStorageItem(key: StorageKeys): boolean {
  try {
    const storage = getStorage();
    storage.removeItem(key);
    
    // Dispatch custom event for storage changes
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('storageChange', {
        detail: { key, value: undefined }
      }));
    }
    
    return true;
  } catch (error) {
    console.error(`Error removing ${key} from storage:`, error);
    return false;
  }
}

/**
 * Clear all storage items with our prefix
 */
export function clearAllStorage(): boolean {
  try {
    const storage = getStorage();
    const keysToRemove: string[] = [];

    // Collect all our storage keys
    Object.values(StorageKeys).forEach(key => {
      if (storage.getItem(key) !== null) {
        keysToRemove.push(key);
      }
    });

    // Remove collected keys
    keysToRemove.forEach(key => storage.removeItem(key));

    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
}

// Specific utility functions for common operations

/**
 * Get and set theme preference
 */
export function getTheme(): Theme {
  return getStorageItem(StorageKeys.THEME);
}

export function setTheme(theme: Theme): boolean {
  return setStorageItem(StorageKeys.THEME, theme);
}

/**
 * Get and set sidebar state
 */
export function getSidebarCollapsed(): boolean {
  return getStorageItem(StorageKeys.SIDEBAR_COLLAPSED);
}

export function setSidebarCollapsed(collapsed: boolean): boolean {
  return setStorageItem(StorageKeys.SIDEBAR_COLLAPSED, collapsed);
}

export function getSidebarView(): SidebarView {
  return getStorageItem(StorageKeys.SIDEBAR_VIEW);
}

export function setSidebarView(view: SidebarView): boolean {
  return setStorageItem(StorageKeys.SIDEBAR_VIEW, view);
}

/**
 * Get and set language preference
 */
export function getLanguage(): Language {
  return getStorageItem(StorageKeys.LANGUAGE);
}

export function setLanguage(language: Language): boolean {
  return setStorageItem(StorageKeys.LANGUAGE, language);
}

/**
 * Get and set locale preference
 */
export function getLocale(): string {
  return getStorageItem(StorageKeys.LOCALE);
}

export function setLocale(locale: string): boolean {
  return setStorageItem(StorageKeys.LOCALE, locale);
}

/**
 * Manage recent searches
 */
export function getRecentSearches(): RecentSearch[] {
  return getStorageItem(StorageKeys.RECENT_SEARCHES);
}

export function addRecentSearch(query: string, category?: string): boolean {
  const searches = getRecentSearches();
  const newSearch: RecentSearch = {
    query,
    timestamp: Date.now(),
    category,
  };
  
  // Remove duplicate if exists
  const filtered = searches.filter(s => s.query !== query);
  
  // Add to beginning and limit to 10 items
  const updated = [newSearch, ...filtered].slice(0, 10);
  
  return setStorageItem(StorageKeys.RECENT_SEARCHES, updated);
}

export function clearRecentSearches(): boolean {
  return setStorageItem(StorageKeys.RECENT_SEARCHES, []);
}

/**
 * Manage favorite filters
 */
export function getFavoriteFilters(): FavoriteFilter[] {
  return getStorageItem(StorageKeys.FAVORITE_FILTERS);
}

export function addFavoriteFilter(name: string, filter: Record<string, unknown>): string {
  const filters = getFavoriteFilters();
  const newFilter: FavoriteFilter = {
    id: `filter_${Date.now()}`,
    name,
    filter,
    createdAt: Date.now(),
  };
  
  const updated = [...filters, newFilter];
  setStorageItem(StorageKeys.FAVORITE_FILTERS, updated);
  
  return newFilter.id;
}

export function removeFavoriteFilter(id: string): boolean {
  const filters = getFavoriteFilters();
  const updated = filters.filter(f => f.id !== id);
  return setStorageItem(StorageKeys.FAVORITE_FILTERS, updated);
}

/**
 * Manage dashboard layout
 */
export function getDashboardLayout(): DashboardLayout {
  return getStorageItem(StorageKeys.DASHBOARD_LAYOUT);
}

export function setDashboardLayout(layout: DashboardLayout): boolean {
  return setStorageItem(StorageKeys.DASHBOARD_LAYOUT, layout);
}

export function updateWidgetPosition(
  widgetId: string,
  position: { x: number; y: number; w: number; h: number }
): boolean {
  const layout = getDashboardLayout();
  layout.positions[widgetId] = position;
  return setDashboardLayout(layout);
}

/**
 * Manage tour completion
 */
export function getTourCompleted(): string[] {
  return getStorageItem(StorageKeys.TOUR_COMPLETED);
}

export function markTourCompleted(tourId: string): boolean {
  const completed = getTourCompleted();
  if (!completed.includes(tourId)) {
    completed.push(tourId);
    return setStorageItem(StorageKeys.TOUR_COMPLETED, completed);
  }
  return true;
}

export function isTourCompleted(tourId: string): boolean {
  return getTourCompleted().includes(tourId);
}

/**
 * Manage announcement dismissals
 */
export function getAnnouncementDismissals(): AnnouncementDismissal[] {
  return getStorageItem(StorageKeys.ANNOUNCEMENT_DISMISSED);
}

export function dismissAnnouncement(id: string, version?: string): boolean {
  const dismissals = getAnnouncementDismissals();
  const dismissal: AnnouncementDismissal = {
    id,
    dismissedAt: Date.now(),
    version,
  };
  
  // Remove old dismissal if exists
  const filtered = dismissals.filter(d => d.id !== id);
  const updated = [...filtered, dismissal];
  
  return setStorageItem(StorageKeys.ANNOUNCEMENT_DISMISSED, updated);
}

export function isAnnouncementDismissed(id: string, version?: string): boolean {
  const dismissals = getAnnouncementDismissals();
  const dismissal = dismissals.find(d => d.id === id);
  
  if (!dismissal) return false;
  if (version && dismissal.version !== version) return false;
  
  return true;
}

/**
 * Storage change listener
 */
export function onStorageChange(
  callback: (key: StorageKeys, value: unknown) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handler = (event: Event) => {
    if (event instanceof CustomEvent) {
      callback(event.detail.key, event.detail.value);
    }
  };

  window.addEventListener('storageChange', handler);
  
  // Also listen to native storage events for cross-tab communication
  const nativeHandler = (event: StorageEvent) => {
    if (event.key && event.key.startsWith('pm_')) {
      const key = event.key as StorageKeys;
      let value;
      
      try {
        value = event.newValue ? JSON.parse(event.newValue) : undefined;
      } catch {
        value = event.newValue;
      }
      
      callback(key, value);
    }
  };
  
  window.addEventListener('storage', nativeHandler);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('storageChange', handler);
    window.removeEventListener('storage', nativeHandler);
  };
}

/**
 * Migration utilities for storage schema changes
 */
export function migrateStorage(fromVersion: string, toVersion: string): boolean {
  try {
    console.log(`Migrating storage from ${fromVersion} to ${toVersion}`);
    
    // Example migration logic
    if (fromVersion === '1.0.0' && toVersion === '2.0.0') {
      // Migrate old theme values
      const oldTheme = getStorage().getItem('theme');
      if (oldTheme === 'auto') {
        setTheme('system');
        getStorage().removeItem('theme');
      }
    }
    
    return true;
  } catch (error) {
    console.error('Storage migration failed:', error);
    return false;
  }
}

/**
 * Export all preferences as JSON
 */
export function exportPreferences(): Record<string, unknown> {
  const preferences: Record<string, unknown> = {};
  
  Object.values(StorageKeys).forEach((key) => {
    preferences[key] = getStorageItem(key as StorageKeys);
  });
  
  return preferences;
}

/**
 * Import preferences from JSON
 */
export function importPreferences(preferences: Record<string, unknown>): boolean {
  try {
    for (const [key, value] of Object.entries(preferences)) {
      if (Object.values(StorageKeys).includes(key as StorageKeys)) {
        const success = setStorageItem(
          key as StorageKeys,
          value as
            | Theme
            | boolean
            | SidebarView
            | Language
            | string
            | DateFormat
            | TimeFormat
            | FirstDayOfWeek
            | RecentSearch[]
            | FavoriteFilter[]
            | DashboardLayout
            | AnnouncementDismissal[]
        );
        if (!success) {
          return false; // Return false if any setStorageItem fails
        }
      }
      // Skip invalid keys instead of failing
    }

    return true;
  } catch (error) {
    console.error('Failed to import preferences:', error);
    return false;
  }
}

/**
 * Get storage size information
 */
export function getStorageInfo(): {
  used: number;
  available: number;
  quota: number;
} {
  if (!checkStorageAvailability()) {
    return { used: 0, available: 0, quota: 0 };
  }

  try {
    let used = 0;
    const storage = getStorage();
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key && key.startsWith('pm_')) {
        const value = storage.getItem(key);
        if (value) {
          used += key.length + value.length;
        }
      }
    }
    
    // Estimate available space (5MB is typical localStorage limit)
    const quota = 5 * 1024 * 1024; // 5MB in bytes
    const available = quota - used;
    
    return { used, available, quota };
  } catch (error) {
    console.error('Failed to get storage info:', error);
    return { used: 0, available: 0, quota: 0 };
  }
}
