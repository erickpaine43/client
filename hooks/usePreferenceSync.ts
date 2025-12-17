"use client";

import { useCallback, useEffect, useState } from "react";
import { useClientPreferences } from "@/context/ClientPreferencesContext";
import {
  syncServerToClient,
  getClientPreferencesForServer,
  mergePreferences,
  type ServerUserPreferences,
  type SyncedPreferences,
  type SidebarView,
  type TableDensity,
} from "@/lib/utils/preferenceSync";

interface UsePreferenceSyncOptions {
  autoSync?: boolean;
  syncInterval?: number;
}

interface UsePreferenceSyncReturn {
  syncedPreferences: SyncedPreferences | null;
  isLoading: boolean;
  error: string | null;
  syncFromServer: (serverPrefs: Partial<ServerUserPreferences>) => Promise<boolean>;
  syncToServer: () => Promise<Partial<ServerUserPreferences>>;
  forcSync: () => Promise<void>;
}

/**
 * Hook for managing preference synchronization between server and client
 */
export function usePreferenceSync(
  options: UsePreferenceSyncOptions = {}
): UsePreferenceSyncReturn {
  const { autoSync = true, syncInterval = 30000 } = options; // 30 seconds default
  const { preferences: clientPrefs, isLoading: clientLoading } = useClientPreferences();

  const [syncedPreferences, setSyncedPreferences] = useState<SyncedPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Sync preferences from server to client
   */
  const syncFromServer = useCallback(async (
    serverPrefs: Partial<ServerUserPreferences>
  ): Promise<boolean> => {
    try {
      setError(null);

      // Sync server preferences to client storage
      const success = syncServerToClient(serverPrefs);

      if (success) {
        if (clientPrefs) {
          // Update merged preferences
          const merged = mergePreferences(serverPrefs, {
            theme: clientPrefs.sidebarView === "expanded" ? "system" : "system", // This would come from actual client prefs
            sidebarView: (clientPrefs.sidebarView || "expanded") as SidebarView,
            sidebarCollapsed: clientPrefs.sidebarCollapsed || false,
            tableDensity: (clientPrefs.tableDensity || "comfortable") as TableDensity,
          });

          setSyncedPreferences(merged);
        } else {
          // If clientPrefs is not available, set merged preferences with safe defaults
          const merged = mergePreferences(serverPrefs, {
            theme: "system",
            sidebarView: "expanded" as SidebarView,
            sidebarCollapsed: false,
            tableDensity: "comfortable" as TableDensity,
          });

          setSyncedPreferences(merged);
        }
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sync from server";
      setError(errorMessage);
      console.error("Sync from server failed:", err);
      return false;
    }
  }, [clientPrefs]);

  /**
   * Get client preferences that should be synced to server
   */
  const syncToServer = useCallback(async (): Promise<Partial<ServerUserPreferences>> => {
    try {
      setError(null);

      const clientPrefsForServer = getClientPreferencesForServer();
      return clientPrefsForServer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to prepare client preferences for server";
      setError(errorMessage);
      console.error("Sync to server failed:", err);
      return {};
    }
  }, []);

  /**
   * Force a full synchronization
   */
  const forcSync = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // In a real implementation, this would fetch server preferences
      // For now, we'll just merge current client preferences
      if (clientPrefs) {
        const merged = mergePreferences({}, {
          theme: "system", // This would come from actual theme context
          sidebarView: clientPrefs.sidebarView as SidebarView,
          sidebarCollapsed: clientPrefs.sidebarCollapsed || false,
          tableDensity: clientPrefs.tableDensity as TableDensity,
        });

        setSyncedPreferences(merged);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to force sync";
      setError(errorMessage);
      console.error("Force sync failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, [clientPrefs]);

  // Initialize synced preferences when client preferences are loaded
  useEffect(() => {
    if (!clientLoading && clientPrefs) {
      const merged = mergePreferences({}, {
        theme: "system", // This would come from actual theme context
        sidebarView: clientPrefs.sidebarView as SidebarView,
        sidebarCollapsed: clientPrefs.sidebarCollapsed || false,
        tableDensity: clientPrefs.tableDensity as TableDensity,
      });

      setSyncedPreferences(merged);
      setIsLoading(false);
    }
  }, [clientLoading, clientPrefs]);

  // Auto-sync interval (if enabled)
  useEffect(() => {
    if (!autoSync || syncInterval <= 0) return;

    const interval = setInterval(() => {
      // In a real implementation, this would check for server updates
      // For now, we'll just update the timestamp
      if (syncedPreferences) {
        setSyncedPreferences({
          ...syncedPreferences,
          server: {
            ...syncedPreferences.server,
            updatedAt: new Date(),
          },
        });
      }
    }, syncInterval);

    return () => clearInterval(interval);
  }, [autoSync, syncInterval, syncedPreferences]);

  return {
    syncedPreferences,
    isLoading: isLoading || clientLoading,
    error,
    syncFromServer,
    syncToServer,
    forcSync,
  };
}

/**
 * Hook for components that only need to read synced preferences
 */
export function useSyncedPreferences(): SyncedPreferences | null {
  const { syncedPreferences } = usePreferenceSync({ autoSync: false });
  return syncedPreferences;
}
