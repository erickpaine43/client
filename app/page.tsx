"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/custom/password-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, User } from "lucide-react";
import { LandingLayout } from "@/components/layout/components/landing";
import { loginContent } from "./content";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AuthTemplate } from "@/components/auth/AuthTemplate";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, user } = useAuth();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
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
