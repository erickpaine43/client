"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ProfileLoadingStatesProps {
  isOnline: boolean;
  profileLoading: boolean;
  settingsLoading: boolean;
  isRetryingProfile: boolean;
  retryCount: number;
  maxRetries: number;
  submitLoading: boolean;
}

export default function ProfileLoadingStates({
  isOnline,
  profileLoading,
  settingsLoading,
  isRetryingProfile,
  retryCount,
  maxRetries,
  submitLoading,
}: ProfileLoadingStatesProps) {
  return (
    <>
      {/* Offline/Connectivity Indicator */}
      {!isOnline && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            You&apos;re currently offline. Profile data may not be up to date.
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Loading State */}
      {(profileLoading || settingsLoading) && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            {isRetryingProfile
              ? `Loading your profile... (attempt ${retryCount}/${maxRetries})`
              : settingsLoading
                ? "Loading your settings..."
                : "Loading your profile..."}
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Loading State */}
      {submitLoading && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg border">
            <div className="flex items-center space-x-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <div>
                <h3 className="font-medium">Updating Profile</h3>
                <p className="text-sm text-muted-foreground">
                  Saving your changes...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
