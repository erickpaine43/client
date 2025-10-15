"use client";

import Icon from "@/components/ui/custom/Icon";
import NavLink from "@/components/settings/general/nav-link";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useClientPreferences } from "@/context/ClientPreferencesContext";
import {
  Bell,
  CreditCard,
  Shield,
  Target,
  User,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const tabs = [
  { id: "", label: "General", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  // { id: "team", label: "Team", icon: Users },
  { id: "tracking", label: "Tracking", icon: Target },
  { id: "billing", label: "Billing", icon: CreditCard },
];

const themeOptions = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

function Layout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before accessing theme to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const { preferences, theme, setTheme, updatePreference, isLoading } =
    useClientPreferences();

  // Early return if preferences are not loaded
  if (!preferences) {
    return <div>Loading preferences...</div>;
  }

  const handleSidebarToggle = () => {
    if (updatePreference) {
      updatePreference("sidebarCollapsed", !preferences.sidebarCollapsed);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    if (setTheme) {
      setTheme(newTheme as "light" | "dark" | "auto");
    }
  };

  // Show loading state while preferences are loading
  if (isLoading || !mounted) {
    return (
      <div className="flex h-full gap-5">
        <div className="min-w-[200px] space-y-4">
          <div className="h-7 bg-gray-200 rounded animate-pulse" />
          <Separator orientation="horizontal" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
        <Separator orientation="vertical" />
        <div className="flex-1">
          <div className="h-full bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const sidebarWidth = preferences.sidebarCollapsed ? "w-16" : "min-w-[200px]";

  return (
    <div className="flex h-full gap-5">
      <div
        className={cn("space-y-4 transition-all duration-200", sidebarWidth)}
      >
        {/* Header with theme switcher and sidebar toggle */}
        <div className="flex items-center justify-between">
          {!preferences.sidebarCollapsed && (
            <h1 className="text-xl font-semibold">Settings</h1>
          )}
          <div className="flex items-center gap-2">
            {/* Theme switcher - only show when sidebar is expanded */}
            {!preferences.sidebarCollapsed && (
              <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                {themeOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={theme === option.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleThemeChange(option.value)}
                    className="h-7 w-7 p-0"
                    title={`Switch to ${option.label} theme`}
                  >
                    <Icon icon={option.icon} className="h-3 w-3" />
                  </Button>
                ))}
              </div>
            )}

            {/* Sidebar toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSidebarToggle}
              className="h-7 w-7 p-0"
              title={
                preferences.sidebarCollapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar"
              }
            >
              <Icon
                icon={preferences.sidebarCollapsed ? ChevronRight : ChevronLeft}
                className="h-3 w-3"
              />
            </Button>
          </div>
        </div>

        <Separator orientation="horizontal" />

        {/* Navigation tabs */}
        <div className="flex flex-col space-y-2">
          {tabs.map((tab) => (
            <NavLink
              key={tab.label}
              href={`/dashboard/settings/${tab.id}`}
              className={cn(
                "flex items-center rounded-lg text-left transition-colors gap-2",
                preferences.sidebarCollapsed
                  ? "px-2 py-2.5 justify-center"
                  : "px-3 py-2.5 w-full"
              )}
              activeClassName="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
            >
              <Icon icon={tab.icon} className="h-4 w-4 flex-shrink-0" />
              {!preferences.sidebarCollapsed && (
                <span className="truncate">{tab.label}</span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Collapsed theme switcher */}
        {preferences.sidebarCollapsed && (
          <>
            <Separator orientation="horizontal" />
            <div className="flex flex-col gap-1">
              {themeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={theme === option.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleThemeChange(option.value)}
                  className="h-8 w-8 p-0"
                  title={`Switch to ${option.label} theme`}
                >
                  <Icon icon={option.icon} className="h-3 w-3" />
                </Button>
              ))}
            </div>
          </>
        )}
      </div>

      <Separator orientation="vertical" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
export default Layout;
