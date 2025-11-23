"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  AlertTriangle,
  RefreshCw,
  WifiOff,
  Shield,
  AlertCircle,
  ServerCrash,
  Lock,
} from "lucide-react";

export type ErrorType =
  | "network"
  | "auth"
  | "validation"
  | "server"
  | "permission"
  | "timeout"
  | "generic";

interface SettingsErrorStateProps {
  error: string;
  errorType?: ErrorType;
  onRetry?: () => void;
  retryLoading?: boolean;
  canRetry?: boolean;
  retryCount?: number;
  maxRetries?: number;
  variant?: "alert" | "card" | "inline";
  showDetails?: boolean;
  className?: string;
}

export function SettingsErrorState({
  error,
  errorType = "generic",
  onRetry,
  retryLoading = false,
  canRetry = true,
  retryCount = 0,
  maxRetries = 3,
  variant = "alert",
  showDetails = false,
  className = "",
}: SettingsErrorStateProps) {
  const getErrorIcon = () => {
    switch (errorType) {
      case "network":
        return <WifiOff className="h-4 w-4" />;
      case "auth":
        return <Lock className="h-4 w-4" />;
      case "validation":
        return <AlertCircle className="h-4 w-4" />;
      case "server":
        return <ServerCrash className="h-4 w-4" />;
      case "permission":
        return <Shield className="h-4 w-4" />;
      case "timeout":
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getErrorVariant = () => {
    switch (errorType) {
      case "auth":
      case "permission":
      case "server":
        return "destructive" as const;
      case "network":
      case "timeout":
        return "default" as const;
      case "validation":
        return "default" as const;
      default:
        return "destructive" as const;
    }
  };

  const getErrorTitle = () => {
    switch (errorType) {
      case "network":
        return "Connection Error";
      case "auth":
        return "Authentication Required";
      case "validation":
        return "Invalid Input";
      case "server":
        return "Server Error";
      case "permission":
        return "Permission Denied";
      case "timeout":
        return "Request Timeout";
      default:
        return "Error";
    }
  };

  const getHelpText = () => {
    switch (errorType) {
      case "network":
        return "Please check your internet connection and try again.";
      case "auth":
        return "Please log in again to continue.";
      case "validation":
        return "Please check your input and try again.";
      case "server":
        return "Our servers are experiencing issues. Please try again later.";
      case "permission":
        return "You don't have permission to perform this action.";
      case "timeout":
        return "The request took too long. Please try again.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  };

  const shouldShowRetry = () => {
    return (
      onRetry &&
      canRetry &&
      retryCount < maxRetries &&
      !["auth", "permission"].includes(errorType)
    );
  };

  const getRetryText = () => {
    if (retryLoading) return "Retrying...";
    if (retryCount > 0) return `Retry (${retryCount}/${maxRetries})`;
    return "Try Again";
  };

  if (variant === "card") {
    return (
      <Card className={`border-destructive/50 ${className}`}>
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            {getErrorIcon()}
            <h3 className="font-semibold">{getErrorTitle()}</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{error}</p>

          {showDetails && (
            <p className="text-xs text-muted-foreground">{getHelpText()}</p>
          )}

          {shouldShowRetry() && (
            <div className="flex gap-2">
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                disabled={retryLoading}
              >
                {retryLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {getRetryText()}
              </Button>

              {errorType === "network" && (
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                >
                  Reload Page
                </Button>
              )}
            </div>
          )}

          {retryCount >= maxRetries && errorType === "network" && (
            <div className="text-xs text-muted-foreground">
              <p>Maximum retry attempts reached.</p>
              <p>Please check your connection or refresh the page.</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (variant === "inline") {
    return (
      <div
        className={`flex items-center justify-between p-3 border rounded-lg border-destructive/50 bg-destructive/5 ${className}`}
      >
        <div className="flex items-center gap-2">
          {getErrorIcon()}
          <span className="text-sm font-medium text-destructive">
            {getErrorTitle()}
          </span>
          <span className="text-sm text-muted-foreground">- {error}</span>
        </div>

        {shouldShowRetry() && (
          <Button
            onClick={onRetry}
            variant="ghost"
            size="sm"
            disabled={retryLoading}
            className="h-7 px-2"
          >
            {retryLoading ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
    );
  }

  // Default alert variant
  return (
    <Alert variant={getErrorVariant()} className={className}>
      {getErrorIcon()}
      <AlertTitle>{getErrorTitle()}</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{error}</p>

        {showDetails && <p className="text-xs opacity-80">{getHelpText()}</p>}

        {shouldShowRetry() && (
          <div className="flex items-center gap-2 mt-3">
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              disabled={retryLoading}
            >
              {retryLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {getRetryText()}
            </Button>

            {errorType === "network" && (
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
              >
                Reload Page
              </Button>
            )}
          </div>
        )}

        {retryCount >= maxRetries && errorType === "network" && (
          <div className="text-xs opacity-80 mt-2">
            <p>
              Maximum retry attempts reached. Please check your connection or
              refresh the page.
            </p>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

// Specialized error components for common scenarios
export function NetworkErrorState({
  onRetry,
  retryLoading,
  className,
}: {
  onRetry?: () => void;
  retryLoading?: boolean;
  className?: string;
}) {
  return (
    <SettingsErrorState
      error="Unable to connect to the server"
      errorType="network"
      onRetry={onRetry}
      retryLoading={retryLoading}
      showDetails
      className={className}
    />
  );
}

export function AuthErrorState({ className }: { className?: string }) {
  return (
    <SettingsErrorState
      error="Your session has expired"
      errorType="auth"
      showDetails
      className={className}
    />
  );
}

export function ValidationErrorState({
  error,
  onRetry,
  className,
}: {
  error: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <SettingsErrorState
      error={error}
      errorType="validation"
      onRetry={onRetry}
      showDetails
      className={className}
    />
  );
}

export function ServerErrorState({
  onRetry,
  retryLoading,
  className,
}: {
  onRetry?: () => void;
  retryLoading?: boolean;
  className?: string;
}) {
  return (
    <SettingsErrorState
      error="Our servers are experiencing issues"
      errorType="server"
      onRetry={onRetry}
      retryLoading={retryLoading}
      showDetails
      className={className}
    />
  );
}
