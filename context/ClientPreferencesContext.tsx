"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  getStorageItem,
  setStorageItem,
  StorageKeys,
  onStorageChange,
  type SidebarView,
  type Language,
  type TableDensity,
} from "@/lib/utils/clientStorage";

interface ClientPreferences {
  sidebarView: SidebarView;
  language: Language;
  tableDensity: TableDensity;
  sidebarCollapsed: boolean;
}

interface ClientPreferencesContextType {
  preferences: ClientPreferences;
  theme: string | undefined;
  setTheme: (theme: string) => void;
  updatePreference: <K extends keyof ClientPreferences>(
    key: K,
    value: ClientPreferences[K]
  ) => void;
  resetPreferences: () => void;
  isLoading: boolean;
}

const ClientPreferencesContext = createContext<
  ClientPreferencesContextType | undefined
>(undefined);

const defaultPreferences: ClientPreferences = {
  sidebarView: "expanded",
  language: "en",
  tableDensity: "comfortable",
  sidebarCollapsed: false,
};

export function ClientPreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, setTheme: setNextTheme } = useTheme();
  const [preferences, setPreferences] =
    useState<ClientPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const loadedPreferences: ClientPreferences = {
          sidebarView: getStorageItem(StorageKeys.SIDEBAR_VIEW),
          language: getStorageItem(StorageKeys.LANGUAGE),
          tableDensity: getStorageItem(StorageKeys.TABLE_DENSITY),
          sidebarCollapsed: getStorageItem(StorageKeys.SIDEBAR_COLLAPSED),
        };

        setPreferences(loadedPreferences);
      } catch (error) {
        console.error("Failed to load client preferences:", error);
        setPreferences(defaultPreferences);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Listen for storage changes (cross-tab synchronization)
  useEffect(() => {
    const unsubscribe = onStorageChange((key, value) => {
      switch (key) {
        case StorageKeys.SIDEBAR_VIEW:
          setPreferences((prev) => ({
            ...prev,
            sidebarView: value as SidebarView,
          }));
          break;
        case StorageKeys.LANGUAGE:
          setPreferences((prev) => ({
            ...prev,
            language: value as Language,
          }));
          break;
        case StorageKeys.TABLE_DENSITY:
          setPreferences((prev) => ({
            ...prev,
            tableDensity: value as TableDensity,
          }));
          break;
        case StorageKeys.SIDEBAR_COLLAPSED:
          setPreferences((prev) => ({
            ...prev,
            sidebarCollapsed: value as boolean,
          }));
          break;
      }
    });

    return unsubscribe;
  }, []);

  const updatePreference = <K extends keyof ClientPreferences>(
    key: K,
    value: ClientPreferences[K]
  ) => {
    try {
      // Update local state
      setPreferences((prev) => ({
        ...prev,
        [key]: value,
      }));

      // Persist to localStorage
      const storageKey = getStorageKeyForPreference(key);
      if (storageKey) {
        setStorageItem(storageKey, value as string);
      }
    } catch (error) {
      console.error(`Failed to update preference ${key}:`, error);
    }
  };

  const setTheme = (newTheme: string) => {
    setNextTheme(newTheme);
    // next-themes handles localStorage persistence automatically
  };

  const resetPreferences = () => {
    try {
      setPreferences(defaultPreferences);

      // Reset in localStorage
      setStorageItem(StorageKeys.SIDEBAR_VIEW, defaultPreferences.sidebarView);
      setStorageItem(StorageKeys.LANGUAGE, defaultPreferences.language);
      setStorageItem(
        StorageKeys.TABLE_DENSITY,
        defaultPreferences.tableDensity
      );
      setStorageItem(
        StorageKeys.SIDEBAR_COLLAPSED,
        defaultPreferences.sidebarCollapsed
      );
    } catch (error) {
      console.error("Failed to reset preferences:", error);
    }
  };

  const value: ClientPreferencesContextType = {
    preferences,
    theme,
    setTheme,
    updatePreference,
    resetPreferences,
    isLoading,
  };

  return (
    <ClientPreferencesContext.Provider value={value}>
      {children}
    </ClientPreferencesContext.Provider>
  );
}

export function useClientPreferences() {
  const context = useContext(ClientPreferencesContext);
  if (context === undefined) {
    throw new Error(
      "useClientPreferences must be used within a ClientPreferencesProvider"
    );
  }
  return context;
}

// Helper function to map preference keys to storage keys
function getStorageKeyForPreference(
  key: keyof ClientPreferences
): StorageKeys | null {
  switch (key) {
    case "sidebarView":
      return StorageKeys.SIDEBAR_VIEW;
    case "language":
      return StorageKeys.LANGUAGE;
    case "tableDensity":
      return StorageKeys.TABLE_DENSITY;
    case "sidebarCollapsed":
      return StorageKeys.SIDEBAR_COLLAPSED;
    default:
      return null;
  }
}
