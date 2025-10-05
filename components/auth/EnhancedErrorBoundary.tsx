/**
 * Enhanced Error Boundary Component
 *
 * Provides enhanced error handling with recovery capabilities using the
 * completed error handling system from Task 9.
 */

"use client";

import React, { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Bug,
  Wifi,
  Shield,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  lastRetry: Date | null;
}

interface EnhancedErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
  showDetails?: boolean;
  enableRecovery?: boolean;
}

class EnhancedErrorBoundary extends Component<
  EnhancedErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: EnhancedErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      lastRetry: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo);

    this.setState({
      errorInfo,
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Report error to monitoring system
    this.reportError(error, errorInfo);
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  private reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Report to monitoring system if available
      await fetch("/api/admin/monitoring", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          type: "client_error",
          error: {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
          },
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      });
    } catch (reportError) {
      console.error("Failed to report error:", reportError);
    }
  };

  private getErrorType = (
    error: Error
  ): {
    type: string;
    icon: ReactNode;
    color: string;
    canRetry: boolean;
  } => {
    const message = error.message.toLowerCase();

    if (message.includes("network") || message.includes("fetch")) {
      return {
        type: "Network Error",
        icon: <Wifi className="h-5 w-5" />,
        color: "text-orange-500",
        canRetry: true,
      };
    }

    if (message.includes("auth") || message.includes("session")) {
      return {
        type: "Authentication Error",
        icon: <Shield className="h-5 w-5" />,
        color: "text-red-500",
        canRetry: false,
      };
    }

    if (message.includes("timeout")) {
      return {
        type: "Timeout Error",
        icon: <Clock className="h-5 w-5" />,
        color: "text-yellow-500",
        canRetry: true,
      };
    }

    return {
      type: "Application Error",
      icon: <Bug className="h-5 w-5" />,
      color: "text-red-500",
      canRetry: true,
    };
  };

  private handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) {
      toast.error("Maximum retry attempts reached");
      return;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: retryCount + 1,
      lastRetry: new Date(),
    });

    toast.success("Retrying...");
  };

  private handleGoHome = () => {
    window.location.href = "/dashboard";
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    const { hasError, error, errorInfo, retryCount, lastRetry } = this.state;
    const {
      children,
      fallback,
      maxRetries = 3,
      showDetails = false,
      enableRecovery = true,
    } = this.props;

    if (hasError && error) {
      if (fallback) {
        return fallback;
      }

      const errorDetails = this.getErrorType(error);
      const canRetry =
        enableRecovery && errorDetails.canRetry && retryCount < maxRetries;

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className={errorDetails.color}>{errorDetails.icon}</div>
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>Something went wrong</span>
                    <Badge variant="destructive" className="text-xs">
                      {errorDetails.type}
                    </Badge>
                  </CardTitle>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {error.message || "An unexpected error occurred"}
                </AlertDescription>
              </Alert>

              {retryCount > 0 && (
                <Alert>
                  <RefreshCw className="h-4 w-4" />
                  <AlertDescription>
                    Retry attempt {retryCount} of {maxRetries}
                    {lastRetry && (
                      <span className="text-muted-foreground ml-2">
                        (Last attempt: {lastRetry.toLocaleTimeString()})
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-wrap gap-2">
                {canRetry && (
                  <Button
                    onClick={this.handleRetry}
                    className="flex items-center space-x-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Try Again</span>
                  </Button>
                )}

                <Button variant="outline" onClick={this.handleGoHome}>
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>

                <Button variant="outline" onClick={this.handleReload}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
              </div>

              {showDetails && errorInfo && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                    Technical Details
                  </summary>
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    <div className="text-xs font-mono space-y-2">
                      <div>
                        <strong>Error:</strong> {error.message}
                      </div>
                      {error.stack && (
                        <div>
                          <strong>Stack:</strong>
                          <pre className="whitespace-pre-wrap text-xs mt-1">
                            {error.stack}
                          </pre>
                        </div>
                      )}
                      {errorInfo.componentStack && (
                        <div>
                          <strong>Component Stack:</strong>
                          <pre className="whitespace-pre-wrap text-xs mt-1">
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </details>
              )}

              <div className="text-xs text-muted-foreground">
                If this problem persists, please contact support with the error
                details above.
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return children;
  }
}

export default EnhancedErrorBoundary;
