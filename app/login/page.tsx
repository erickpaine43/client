"use client";
import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, LogIn, User } from "lucide-react";
import { LandingLayout } from "@/components/layout/landing";
import { loginContent } from "./content";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UserInfo, SignOutButton
} from "@niledatabase/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, logout, user } = useAuth();

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

  if (user) {
    return (
      <LandingLayout>
        <div className="flex-grow flex items-center justify-center py-12 px-4">
          <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
              <User className="mx-auto h-8 w-8 mb-2 text-primary" />
              <CardTitle className="text-2xl">
                You are already signed in.
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <UserInfo />
            </CardContent>
            <CardFooter className="flex justify-between">
              <SignOutButton className="bg-red-500 hover:bg-red-700 hover:text-white hover:rounded-md hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 ease-in-out" />
              <Button
                className="py-5"
                onClick={() => router.push("/dashboard")}
              >
                <Terminal className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      </LandingLayout>
    );
  }

  return (
    <LandingLayout>
      <div className="flex-grow flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <LogIn className="mx-auto h-8 w-8 mb-2 text-primary" />
            <CardTitle className="text-2xl">{loginContent.title}</CardTitle>
            <CardDescription>{loginContent.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  <Label htmlFor="password">
                    {loginContent.password.label}
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-primary hover:underline underline-offset-4"
                  >
                    {loginContent.forgotPassword}
                  </Link>
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

              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>{loginContent.errors.title}</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading
                  ? loginContent.loginButton.loading
                  : loginContent.loginButton.default}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-2">
            <p className="text-xs text-muted-foreground">
              {loginContent.signup.text}{" "}
              <Link
                href="/signup"
                className="underline font-medium text-primary"
              >
                {loginContent.signup.link}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </LandingLayout>
  );
}
