"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SettingsLoadingSkeleton } from "@/components/settings/common/SettingsLoadingSkeleton";
import { SettingsErrorState } from "@/components/settings/common/SettingsErrorState";
import { showAppearanceUpdateSuccess } from "@/components/settings/common/SettingsSuccessNotification";
import { useClientPreferences } from "@/context/ClientPreferencesContext";
import { usePreferenceSync } from "@/hooks/usePreferenceSync";
import { Sun, Moon, Monitor, Loader2 } from "lucide-react";
import React, { useState } from "react";
import type { TableDensity } from "@/lib/utils/clientStorage";

const themeOptions = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

const densityOptions = [
  { value: "compact", label: "Compact" },
  { value: "comfortable", label: "Comfortable" },
  { value: "spacious", label: "Spacious" },
];

const AppearanceSettings: React.FC = () => {
  const { preferences, theme, setTheme, updatePreference, isLoading, error } =
    useClientPreferences();

  const { syncToServer } = usePreferenceSync();

  // Local state for campaign previews and loading states
  const [showCampaignPreviews, setShowCampaignPreviews] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);

  if (!preferences) {
    return <div>Loading preferences...</div>;
  }

  const handleThemeChange = async (newTheme: string) => {
    setSyncLoading(true);
    try {
      if (setTheme) {
        setTheme(newTheme as "light" | "dark" | "auto");
      }
      await syncToServer();
      showAppearanceUpdateSuccess();
    } catch (error) {
      console.error("Failed to sync theme preference to server:", error);
      // Could show error toast here
    } finally {
      setSyncLoading(false);
    }
  };

  const handleDensityChange = async (newDensity: string) => {
    setSyncLoading(true);
    try {
      if (updatePreference) {
        updatePreference("tableDensity", newDensity as TableDensity);
      }
      await syncToServer();
      showAppearanceUpdateSuccess();
    } catch (error) {
      console.error("Failed to sync density preference to server:", error);
      // Could show error toast here
    } finally {
      setSyncLoading(false);
    }
  };

  const handleCampaignPreviewsChange = async (checked: boolean) => {
    setSyncLoading(true);
    try {
      setShowCampaignPreviews(checked);
      // This could also be stored in localStorage or synced to server
      await syncToServer();
      showAppearanceUpdateSuccess();
    } catch (error) {
      console.error("Failed to sync campaign preview preference:", error);
    } finally {
      setSyncLoading(false);
    }
  };

  const handleSidebarToggle = async (checked: boolean) => {
    setSyncLoading(true);
    try {
      if (updatePreference) {
        updatePreference("sidebarCollapsed", !checked);
      }
      await syncToServer();
      showAppearanceUpdateSuccess();
    } catch (error) {
      console.error("Failed to sync sidebar preference:", error);
    } finally {
      setSyncLoading(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return <SettingsLoadingSkeleton variant="appearance" />;
  }

  // Show error state
  if (error) {
    return (
      <SettingsErrorState
        error={error}
        errorType="generic"
        variant="card"
        showDetails
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize the appearance of the application. Changes are saved
          automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Theme</Label>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.value}
                  variant={theme === option.value ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => handleThemeChange(option.value)}
                  disabled={syncLoading}
                >
                  {syncLoading && theme === option.value ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className="mr-2 h-4 w-4" />
                  )}
                  {option.label}
                </Button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            Choose your preferred color scheme. System will match your device
            settings.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Table Density</Label>
          <div className="grid grid-cols-3 gap-2">
            {densityOptions.map((option) => (
              <Button
                key={option.value}
                variant={
                  preferences.tableDensity === option.value
                    ? "default"
                    : "outline"
                }
                className="justify-start"
                onClick={() => handleDensityChange(option.value)}
                disabled={syncLoading}
              >
                {syncLoading && preferences.tableDensity === option.value ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {option.label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Adjust the spacing and size of table rows and data displays.
          </p>
        </div>

        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Show Campaign Previews</h4>
              <p className="text-xs text-muted-foreground">
                Show previews when hovering over campaign names
              </p>
            </div>
            <Switch
              checked={showCampaignPreviews}
              onCheckedChange={handleCampaignPreviewsChange}
              disabled={syncLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Sidebar Auto-collapse</h4>
              <p className="text-xs text-muted-foreground">
                Automatically collapse sidebar on smaller screens
              </p>
            </div>
            <Switch
              checked={!preferences.sidebarCollapsed}
              onCheckedChange={handleSidebarToggle}
              disabled={syncLoading}
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Current preferences:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Theme: {theme}</li>
              <li>
                Sidebar:{" "}
                {preferences.sidebarCollapsed ? "Collapsed" : "Expanded"}
              </li>
              <li>Density: {preferences.tableDensity}</li>
              <li>Language: {preferences.language}</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppearanceSettings;
