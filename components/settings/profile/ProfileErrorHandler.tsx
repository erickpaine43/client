"use client";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { type ProfileError } from "@/lib/actions/profileActions";

interface ProfileErrorHandlerProps {
  profileError: ProfileError | null;
  profileLoading: boolean;
  isRetryingProfile: boolean;
  retryCount: number;
  maxRetries: number;
  onRetry: () => void;
}

export default function ProfileErrorHandler({
  profileError,
  profileLoading,
  isRetryingProfile,
  retryCount,
  maxRetries,
  onRetry,
}: ProfileErrorHandlerProps) {
  // Helper function to get error variants
  const getErrorVariant = (type: string) => {
    switch (type) {
      case "auth":
        return "destructive";
      case "validation":
        return "default";
      case "network":
        return "default";
      case "server":
        return "destructive";
      default:
        return "default";
    }
  };

  // Helper function to get error icons
  const getErrorIcon = (type: string) => {
    switch (type) {
      case "auth":
        return <AlertTriangle className="h-4 w-4" />;
      case "validation":
        return <AlertCircle className="h-4 w-4" />;
      case "network":
        return <RefreshCw className="h-4 w-4" />;
      case "server":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (!profileError || profileLoading) {
    return null;
  }

  return (
    <Alert variant={getErrorVariant(profileError.type)}>
      {getErrorIcon(profileError.type)}
      <AlertDescription className="flex items-center justify-between">
        <span>{profileError.message}</span>
        {profileError.type === "network" && retryCount < maxRetries && (
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={isRetryingProfile}
              className="h-7 px-2"
            >
              {isRetryingProfile ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1" />
              )}
              Retry
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
