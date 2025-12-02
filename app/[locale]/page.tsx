'use client'

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button/button";
import { PasswordInput } from "@/components/ui/custom/password-input";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label";
import { LogIn, User } from "lucide-react";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { loginContent } from "./content";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AuthTemplate } from "@/components/auth/AuthTemplate";
import { Turnstile } from "next-turnstile";
import { verifyTurnstileToken } from "./signup/verifyToken";
import { useTranslations } from "next-intl";
import { initPostHog, ph } from "@/lib/instrumentation-client";
import { getLoginAttemptStatus } from "@/lib/auth/rate-limit";

const MAX_LOGIN_ATTEMPTS = parseInt(
  process.env.NEXT_PUBLIC_MAX_LOGIN_ATTEMPTS || "3",
  10
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTurnstile, setShowTurnstile] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const router = useRouter();
  const { login, user, error: authError } = useAuth();
  const t = useTranslations("Login");

  useEffect(() => {
    initPostHog().then(client => client.capture("login_page_loaded"));
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (email?.includes("@")) {
      const status = getLoginAttemptStatus(email);
      if (status.attempts > 0) {
        setLoginAttempts(status.attempts);
        setShowTurnstile(status.requiresTurnstile);
      }
    }

    if (showTurnstile && !turnstileToken) {
      setError(t("errors.captchaRequired"));
      setIsLoading(false);
      return;
    }

    try {
      if (showTurnstile && turnstileToken) {
        await verifyTurnstileToken(turnstileToken);
        ph().capture("captcha_completed", { email });
      }

      await login(email, password);
      ph().capture("login_attempt", { email, success: true });

      router.push("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      const errorMessage = (err as Error)?.message || loginContent.errors.generic;
      setError(errorMessage);

      const status = getLoginAttemptStatus(email);
      setShowTurnstile(status.requiresTurnstile);
      setLoginAttempts(status.attempts || 0);
      setTurnstileToken(null);

      ph().capture("login_attempt", {
        email,
        success: false,
        error: "Login failed",
        attempts: status.attempts,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && !isLoading) {
      router.push("/dashboard");
      setError(null);
    }
  }, [user, router, isLoading]);

  useEffect(() => {
    if (authError) {
      setError(authError.message);
      if (email && email.includes("@")) {
        const status = getLoginAttemptStatus(email);
        setLoginAttempts(status.attempts || 0);
        setShowTurnstile(status.requiresTurnstile);
      }
    } else {
      setError(null);
    }
  }, [authError, email]);

  const icon = user ? User : LogIn;
  const mode = user ? "loggedIn" : "form";

  const footer = user ? undefined : (
    <div className="flex flex-col items-center space-y-2">
      <p className="text-xs text-muted-foreground">
        {loginContent.signup.text}{" "}
        <Link href="/signup" className="underline font-medium text-primary">
          {loginContent.signup.link}
        </Link>
      </p>
    </div>
  );

  return (
    <LandingLayout>
      <AuthTemplate
        mode={mode}
        icon={icon}
        title={t("title")}
        description={t("description")}
        footer={footer}
        error={mode === "form" ? error : undefined}
      >
        {user ? undefined : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email.label")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("email.placeholder")}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("password.label")}</Label>
                {/* <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline underline-offset-4">
                  {loginContent.forgotPassword}
                </Link> */}
              </div>
              <PasswordInput
                name="password"
                placeholder=""
                value={password}
                onValueChange={setPassword}
                disabled={isLoading}
                required
              />
            </div>

            {loginAttempts > 0 && (
              <div
                className={`px-3 py-2 rounded-md text-sm ${
                  loginAttempts >= MAX_LOGIN_ATTEMPTS
                    ? "bg-red-50 border border-red-200 text-red-800"
                    : "bg-yellow-50 border border-yellow-200 text-yellow-800"
                }`}
              >
                Failed attempts: {loginAttempts}/{MAX_LOGIN_ATTEMPTS}
              </div>
            )}

            {showTurnstile && (
              <div className="space-y-3">
                <div className="bg-orange-50 border border-orange-200 text-orange-800 px-3 py-2 rounded-md text-sm">
                  For security, please complete the verification to continue.
                </div>
                <div className="flex justify-center py-2">
                  {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
                    <Turnstile
                      key={`turnstile-${loginAttempts}`}
                      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                      onVerify={(token: string) => setTurnstileToken(token)}
                    />
                  ) : (
                    <p className="text-sm text-destructive">
                      CAPTCHA is not configured. Please contact support.
                    </p>
                  )}
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={
                isLoading ||
                !email ||
                !email.includes("@") ||
                (showTurnstile && !turnstileToken)
              }
            >
              {isLoading
                ? t("loginButton.loading")
                : loginAttempts >= MAX_LOGIN_ATTEMPTS && !turnstileToken
                ? "Too many attempts. Complete verification."
                : showTurnstile && !turnstileToken
                ? "Complete verification to continue"
                : t("loginButton.default")}
            </Button>
          </form>
        )}
      </AuthTemplate>
    </LandingLayout>
  );
}

// Force dynamic rendering to prevent SSR issues
export const dynamic = "force-dynamic";
