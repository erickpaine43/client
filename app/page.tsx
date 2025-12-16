"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/custom/password-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, User } from "lucide-react";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { loginContent } from "./content";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Turnstile } from '@marsidev/react-turnstile';
import { AuthTemplate } from "@/components/auth/AuthTemplate";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTurnstile, setShowTurnstile] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const router = useRouter();
  const { login, user } = useAuth();

  useEffect(() => {
    const checkTurnstileRequirement = async () => {
      if (!email || !email.includes('@')) return;

      try {
        const response = await fetch(
          `/api/auth/login-attempts?email=${encodeURIComponent(email)}`
        );

        if (response.ok) {
          const data = await response.json();
          setShowTurnstile(data.requiresTurnstile);
          setLoginAttempts(data.attempts || 0);
        }
      } catch (err) {
        console.error('Error verificando requisitos de Turnstile:', err);
      }
    };

    const timer = setTimeout(checkTurnstileRequirement, 500);
    return () => clearTimeout(timer);
  }, [email]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {

      await login(email, password, turnstileToken || undefined);

      router.push("/dashboard");
    } catch (err) {
      const errorMessage = (err as Error)?.message || loginContent.errors.generic;
      setError(errorMessage);


      try {
        const response = await fetch(
          `/api/auth/login-attempts?email=${encodeURIComponent(email)}`
        );

        if (response.ok) {
          const data = await response.json();
          setShowTurnstile(data.requiresTurnstile);
          setLoginAttempts(data.attempts || 0);


          setTurnstileToken(null);
        }
      } catch (checkErr) {
        console.error('Error actualizando estado de intentos:', checkErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const icon = user ? User : LogIn;
  const title = user ? "You are already signed in." : loginContent.title;
  const description = user ? "" : loginContent.description;
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
        title={title}
        description={description}
        footer={footer}
        error={mode === "form" ? error : undefined}
      >
        {user ? undefined : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{loginContent.email.label}</Label>
              <Input
                id="email"
                type="email"
                placeholder={loginContent.email.placeholder}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{loginContent.password.label}</Label>
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


            {loginAttempts > 0 && loginAttempts < 3 && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded-md text-sm">
                Intentos fallidos: {loginAttempts}/3
              </div>
            )}


            {showTurnstile && (
              <div className="space-y-3">
                <div className="bg-orange-50 border border-orange-200 text-orange-800 px-3 py-2 rounded-md text-sm">
                  Por seguridad, completa la verificación para continuar.
                </div>
                <div className="flex justify-center py-2">
                  <Turnstile
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                    onSuccess={(token: string) => setTurnstileToken(token)}
                    onError={() => {
                      setError("Error en la verificación de seguridad");
                      setTurnstileToken(null);
                    }}
                    onExpire={() => setTurnstileToken(null)}
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || (showTurnstile && !turnstileToken)}
            >
              {isLoading
                ? loginContent.loginButton.loading
                : showTurnstile && !turnstileToken
                  ? "Complete la verificación para continuar"
                  : loginContent.loginButton.default}
            </Button>
          </form>
        )}
      </AuthTemplate>
    </LandingLayout>
  );
}

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';