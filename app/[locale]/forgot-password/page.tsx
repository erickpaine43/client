"use client"; // Uses client state

import React, { useState } from "react";
import Link from "next/link"; // Import Link
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { KeyRound, MailCheck, User } from "lucide-react"; // Icons
import { LandingLayout } from "@/components/landing/LandingLayout";
import { forgotPasswordContent } from "./content";
import { AuthTemplate } from "@/components/auth/AuthTemplate";
import { useAuth } from "@/context/AuthContext";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { user } = useAuth();

  const handlePasswordResetRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setIsSubmitted(false);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset link');
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error('Forgot password request error:', err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send reset link. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const icon = user ? User : KeyRound;
  const title = user
    ? "You are already signed in."
    : isSubmitted
      ? forgotPasswordContent.alerts.success.title
      : forgotPasswordContent.title;
  const description = user
    ? ""
    : isSubmitted
      ? ""
      : forgotPasswordContent.description.initial;
  const mode = user ? "loggedIn" : "form";

  return (
    <LandingLayout>
      <AuthTemplate
        mode={mode}
        icon={icon}
        title={title}
        description={description}
        footer={
          user ? undefined : (
            <div className="flex flex-col items-center space-y-2">
              <p className="text-xs text-muted-foreground">
                {forgotPasswordContent.footer.text}{" "}
                <Link href="/" className="underline font-medium text-primary">
                  {forgotPasswordContent.footer.linkText}
                </Link>
              </p>
            </div>
          )
        }
        error={mode === "form" && !isSubmitted ? error : undefined}
      >
        {user ? undefined : isSubmitted ? (
          <Alert>
            <MailCheck className="h-4 w-4" />
            <AlertTitle>
              {forgotPasswordContent.alerts.success.title}
            </AlertTitle>
            <AlertDescription>
              {forgotPasswordContent.alerts.success.description(email)}
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handlePasswordResetRequest} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                {forgotPasswordContent.form.email.label}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={forgotPasswordContent.form.email.placeholder}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? forgotPasswordContent.form.button.sending
                : forgotPasswordContent.form.button.send}
            </Button>
          </form>
        )}
      </AuthTemplate>
    </LandingLayout>
  );
}
