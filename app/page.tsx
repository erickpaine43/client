"use client";
import React, { useState } from "react";
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
import { AuthTemplate } from "@/components/auth/AuthTemplate";
import { Turnstile } from "next-turnstile";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, user } = useAuth();
  const [token, setToken] = useState(""); // ✅ NEW — stores Turnstile token when user verifies


  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // This prevents the form from submitting if the CAPTCHA hasn’t been completed.
    if (!token) {
      setError("Please complete the CAPTCHA verification.");
      setIsLoading(false);
      return;
    }

    try {
      // Verify Turnstile token on your backend
      const verifyRes = await fetch("/api/verify-turnstile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!verifyRes.ok) {
        throw new Error("Turnstile verification failed");
      }

      // Proceed with Nile login only if token is valid
      await login(email, password);
      router.push("/dashboard");
      setToken(""); // ✅ reset after successful login
    } catch (err) {
      console.error("Login failed:", err);
      setError((err as Error)?.message || loginContent.errors.generic);
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
                {/* <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline underline-offset-4"
                >
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
            {/* ✅ NEW - Turnstile Widget */}
            <div className="flex justify-center">
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                onVerify={(token) => setToken(token)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? loginContent.loginButton.loading
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
