"use client";

import React, { Component, ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

interface ProfileErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
}

class ProfileErrorBoundary extends Component<
  ProfileErrorBoundaryProps,
  ProfileErrorBoundaryState
> {
  private resetTimeout: NodeJS.Timeout | null = null;

  constructor(props: ProfileErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(
    error: Error,
  ): Partial<ProfileErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error for debugging
    console.error("Profile Error Boundary caught an error:", error, errorInfo);
  }

  componentDidUpdate(prevProps: ProfileErrorBoundaryProps) {
    // Reset error boundary if children change (for routing)
    if (prevProps.children !== this.props.children) {
      this.resetErrorBoundary();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }
  }

  resetErrorBoundary = () => {
    if (!this.state.hasError) return;

    const newRetryCount = this.state.retryCount + 1;
    const maxRetries = this.props.maxRetries || 3;

    // If we've exceeded max retries, don't reset immediately
    if (newRetryCount > maxRetries) {
      return;
    }

    // Exponential backoff for retries
    const delay = Math.pow(2, newRetryCount) * 1000; // 2s, 4s, 8s...

    this.resetTimeout = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: newRetryCount,
      });
    }, delay);
  };

  handleRetry = () => {
    this.resetErrorBoundary();
  };

  handleGoBack = () => {
    window.history.back();
  };

  handleGoHome = () => {
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const retryCount = this.state.retryCount;
      const maxRetries = this.props.maxRetries || 3;
      const canRetry = retryCount < maxRetries;

      return (
        <div className="container mx-auto py-8 px-4">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <CardTitle className="text-xl">Profile Error</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Something went wrong while loading your profile. This could be
                  due to:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Network connectivity issues</li>
                    <li>Temporary server problems</li>
                    <li>Application errors</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {/* Show retry count if we've attempted retries */}
              {retryCount > 0 && (
                <Alert>
                  <RefreshCw className="h-4 w-4" />
                  <AlertDescription>
                    Retry attempt {retryCount} of {maxRetries}
                  </AlertDescription>
                </Alert>
              )}

              {/* Error details in development */}
              {process.env.NODE_ENV === "development" && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium flex items-center gap-2">
                    <Bug className="h-4 w-4" />
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 p-3 bg-muted rounded-md text-xs font-mono whitespace-pre-wrap">
                    <div className="font-bold mb-2">Error:</div>
                    {this.state.error.message}
                    <br />
                    <div className="font-bold mb-2 mt-4">Stack:</div>
                    {this.state.error.stack}
                    {this.state.errorInfo && (
                      <>
                        <br />
                        <div className="font-bold mb-2 mt-4">
                          Component Stack:
                        </div>
                        {this.state.errorInfo.componentStack}
                      </>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                {canRetry && (
                  <Button
                    onClick={this.handleRetry}
                    variant="default"
                    className="flex-1"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again{" "}
                    {retryCount > 0 && `(${retryCount}/${maxRetries})`}
                  </Button>
                )}

                {!canRetry && (
                  <>
                    <Button
                      onClick={this.handleGoBack}
                      variant="outline"
                      className="flex-1"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Go Back
                    </Button>
                    <Button
                      onClick={this.handleGoHome}
                      variant="outline"
                      className="flex-1"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ProfileErrorBoundary;
