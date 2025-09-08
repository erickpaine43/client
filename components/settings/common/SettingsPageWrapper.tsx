"use client";

import { ReactNode, Suspense } from "react";
import { SettingsErrorBoundary } from "@/components/settings/SettingsErrorBoundary";
import { SettingsLoadingSkeleton } from "./SettingsLoadingSkeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

interface SettingsPageWrapperProps {
  children: ReactNode;
  title?: string;
  description?: string;
  loadingVariant?:
    | "form"
    | "table"
    | "cards"
    | "profile"
    | "notifications"
    | "security"
    | "appearance";
  showOfflineIndicator?: boolean;
  className?: string;
}

export function SettingsPageWrapper({
  children,
  title,
  description,
  loadingVariant = "form",
  showOfflineIndicator = true,
  className = "",
}: SettingsPageWrapperProps) {
  const { isOnline } = useOnlineStatus();

  return (
    <SettingsErrorBoundary>
      <div className={`space-y-6 ${className}`}>
        {/* Page Header */}
        {(title || description) && (
          <div className="space-y-2">
            {title && (
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            )}
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
        )}

        {/* Offline Indicator */}
        {showOfflineIndicator && !isOnline && (
          <Alert className="border-orange-200 bg-orange-50">
            <WifiOff className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              You&apos;re currently offline. Some features may not work properly
              until your connection is restored.
            </AlertDescription>
          </Alert>
        )}

        {/* Content with Suspense */}
        <Suspense
          fallback={
            <SettingsLoadingSkeleton
              variant={loadingVariant}
              showHeader={false}
            />
          }
        >
          {children}
        </Suspense>
      </div>
    </SettingsErrorBoundary>
  );
}

// Specialized wrappers for different settings pages
export function ProfilePageWrapper({ children }: { children: ReactNode }) {
  return (
    <SettingsPageWrapper
      title="Profile Settings"
      description="Manage your personal information and preferences"
      loadingVariant="profile"
    >
      {children}
    </SettingsPageWrapper>
  );
}

export function NotificationsPageWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SettingsPageWrapper
      title="Notification Preferences"
      description="Choose how and when you want to be notified"
      loadingVariant="notifications"
    >
      {children}
    </SettingsPageWrapper>
  );
}

export function BillingPageWrapper({ children }: { children: ReactNode }) {
  return (
    <SettingsPageWrapper
      title="Billing & Subscription"
      description="Manage your subscription, billing information, and usage"
      loadingVariant="cards"
    >
      {children}
    </SettingsPageWrapper>
  );
}

export function TeamPageWrapper({ children }: { children: ReactNode }) {
  return (
    <SettingsPageWrapper
      title="Team Management"
      description="Manage team members, roles, and permissions"
      loadingVariant="table"
    >
      {children}
    </SettingsPageWrapper>
  );
}

export function SecurityPageWrapper({ children }: { children: ReactNode }) {
  return (
    <SettingsPageWrapper
      title="Security Settings"
      description="Protect your account with security features and recommendations"
      loadingVariant="security"
    >
      {children}
    </SettingsPageWrapper>
  );
}

export function AppearancePageWrapper({ children }: { children: ReactNode }) {
  return (
    <SettingsPageWrapper
      title="Appearance"
      description="Customize the look and feel of your interface"
      loadingVariant="appearance"
    >
      {children}
    </SettingsPageWrapper>
  );
}
