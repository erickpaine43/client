/**
 * Client Preferences Context
 * Provides user preferences throughout the React component tree
 * Updated to work with new structured settings tables
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserPreferencesResponse } from '@/types/settings/user';

// This implementation will fail until API integration is added
interface ClientPreferencesContextType {
  preferences: UserPreferencesResponse | null;
  theme?: "light" | "dark" | "auto";
  setTheme?: (theme: "light" | "dark" | "auto") => void;
  updatePreference?: (key: string, value: any) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  updatePreferences: (updates: Partial<UserPreferencesResponse>) => Promise<void>;
  refreshPreferences: () => Promise<void>;
}

const ClientPreferencesContext = createContext<ClientPreferencesContextType | undefined>(undefined);

interface ClientPreferencesProviderProps {
  children: ReactNode;
}

export function ClientPreferencesProvider({ children }: ClientPreferencesProviderProps) {
  const [preferences, setPreferences] = useState<UserPreferencesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract theme for convenience (defaults to 'light')
  const theme = preferences?.theme || 'light';

  // Load user preferences on mount
  useEffect(() => {
    refreshPreferences();
  }, []);

  const refreshPreferences = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Implement API call to fetch user preferences
      // const response = await fetch('/api/settings/user');
      // const data = await response.json();
      // setPreferences(data);

      throw new Error('User preferences API not integrated');
    } catch (err: any) {
      setError(err.message || 'Failed to load preferences');
      console.error('Error loading preferences:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferencesResponse>) => {
    try {
      setError(null);

      // TODO: Implement API call to update user preferences
      // const response = await fetch('/api/settings/user', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updates)
      // });
      // const data = await response.json();
      // setPreferences(data);

      throw new Error('User preferences API not integrated');
    } catch (err: any) {
      setError(err.message || 'Failed to update preferences');
      console.error('Error updating preferences:', err);
      throw err;
    }
  };

  const setTheme = (newTheme: "light" | "dark" | "auto") => {
    // This would update the theme in preferences when API is integrated
    console.log('Setting theme to:', newTheme);
  };

  const updatePreference = async (key: string, value: any) => {
    // This would update a preference when API is integrated
    console.log('Updating preference:', key, value);
  };

  const value: ClientPreferencesContextType = {
    preferences,
    theme,
    setTheme,
    updatePreference,
    isLoading,
    error,
    updatePreferences,
    refreshPreferences,
  };

  return (
    <ClientPreferencesContext.Provider value={value}>
      {children}
    </ClientPreferencesContext.Provider>
  );
}

export function useClientPreferences(): ClientPreferencesContextType {
  const context = useContext(ClientPreferencesContext);
  if (context === undefined) {
    throw new Error('useClientPreferences must be used within a ClientPreferencesProvider');
  }
  return context;
}

// Legacy hook for backward compatibility - will be removed after migration
export function usePreferences() {
  console.warn('usePreferences is deprecated. Use useClientPreferences instead.');
  return useClientPreferences();
}
