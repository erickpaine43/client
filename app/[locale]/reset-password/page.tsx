"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { AuthTemplate } from "@/components/auth/AuthTemplate";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [isTokenValidating, setIsTokenValidating] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenValid(false);
        setTokenError('No reset token provided');
        return;
      }

      // Validate token format (basic check)
      if (token.length !== 36) { // UUID length
        setTokenValid(false);
        setTokenError('Invalid reset token format');
        return;
      }

      try {
        // Validate token with backend
        const response = await fetch('/api/auth/validate-reset-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          setTokenValid(false);
          setTokenError(data.error || 'Invalid or expired reset token');
          return;
        }

        setTokenValid(true);
      } catch (err) {
        console.error('Token validation error:', err);
        setTokenValid(false);
        setTokenError('Failed to validate reset token');
      } finally {
        setIsTokenValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    // Client-side validation
    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  // Show loading state while validating token
  if (isTokenValidating) {
    return (
      <LandingLayout>
        <AuthTemplate
          mode="form"
          icon={Loader2}
          title="Validating Reset Link..."
          description="Please wait while we validate your password reset link."
        >
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </AuthTemplate>
      </LandingLayout>
    );
  }

  // Show error if token is invalid
  if (tokenValid === false) {
    return (
      <LandingLayout>
        <AuthTemplate
          mode="form"
          icon={AlertCircle}
          title="Invalid Reset Link"
          description={tokenError || "This password reset link is invalid or has expired."}
          footer={
            <div className="flex flex-col items-center space-y-2">
              <p className="text-xs text-muted-foreground">
                Need a new reset link?{' '}
                <Link href="/forgot-password" className="underline font-medium text-primary">
                  Request another one
                </Link>
              </p>
            </div>
          }
        />
      </LandingLayout>
    );
  }

  // Show success message
  if (isSubmitted) {
    return (
      <LandingLayout>
        <AuthTemplate
          mode="form"
          icon={CheckCircle}
          title="Password Reset Successful!"
          description="Your password has been successfully reset. You can now sign in with your new password."
          footer={
            <div className="flex flex-col items-center space-y-2">
              <Link href="/login">
                <Button>Sign In</Button>
              </Link>
            </div>
          }
        />
      </LandingLayout>
    );
  }

  return (
    <LandingLayout>
      <AuthTemplate
        mode="form"
        icon={KeyRound}
        title="Reset Your Password"
        description="Enter your new password below."
        error={error}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">
              New Password
            </Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Enter new password"
              required
              value={formData.newPassword}
              onChange={handleInputChange('newPassword')}
              disabled={isLoading}
              minLength={8}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              required
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              disabled={isLoading}
              minLength={8}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting Password...
              </>
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>
      </AuthTemplate>
    </LandingLayout>
  );
}
