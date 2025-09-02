"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
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
import { Terminal, User } from "lucide-react"; // Icons
import { LandingLayout } from "@/components/layout/landing";
import { signupContent } from "./content";
import type { PasswordStrength } from "@/lib/utils";

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
}

// Separate component for handling search params

export default function SignUpPage() {
  return (
    <LandingLayout>
      <div className="flex-grow flex items-center justify-center py-12 px-4">
        <SignUpForm />
      </div>
    </LandingLayout>
  );
}

function SignUpForm() {
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);
  const router = useRouter();
  const { signup, logout, user } = useAuth();

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Add loading state for form
  const [isSignUpLoading, setIsSignUpLoading] = useState(false);


  // Handle password strength changes
  const handlePasswordStrengthChange = (strength: PasswordStrength | null) => {
    setPasswordStrength(strength);
  };


  const onSubmit = async (data: FormData) => {
    setError(null);
    setIsSignUpLoading(true);

    try {
      console.log("Form data:", data);
      // Call centralized signup function
      await signup(data.email, data.password);
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Signup failed:", err);
      if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as { message?: unknown }).message === "string"
      ) {
        setError((err as { message: string }).message);
      } else {
        setError("Signup failed. Please try again.");
      }
    } finally {
      setIsSignUpLoading(false);
    }
  };

  if (user) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <User className="mx-auto h-8 w-8 mb-2 text-primary" />
          <CardTitle className="text-2xl">
            You are already signed in.
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p>Welcome, {user.displayName}!</p>
            <p>Email: {user.email}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={async () => {
              try {
                await logout();
              } catch (err) {
                console.error("Logout failed:", err);
              }
            }}
          >
            Logout
          </Button>
          <Button
            className="py-5"
            onClick={() => router.push("/dashboard")}
          >
            <Terminal className="h-4 w-4 mr-2" />
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{signupContent.header.title}</CardTitle>
        <CardDescription>{signupContent.header.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email">{signupContent.form.email.label}</Label>
          <Input
            id="email"
            type="email"
            placeholder={signupContent.form.email.placeholder}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Please enter a valid email address",
              },
            })}
            disabled={isSignUpLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <PasswordInput
            label={signupContent.form.password.label}
            placeholder={signupContent.form.password.placeholder}
            showStrengthMeter={true}
            onStrengthChange={handlePasswordStrengthChange}
            value={watch("password")}
            onValueChange={(value) => setValue("password", value)}
            disabled={isSignUpLoading}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
              validate: {
                strength: () => {
                  if (passwordStrength && passwordStrength.score < 2) {
                    return "Password is too weak. Please include at least 2 of: uppercase, lowercase, number, special character";
                  }
                  return true;
                },
              },
            })}
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <PasswordInput
            label={signupContent.form.confirmPassword.label}
            placeholder={signupContent.form.confirmPassword.placeholder}
            value={watch("confirmPassword")}
            onValueChange={(value) => setValue("confirmPassword", value)}
            disabled={isSignUpLoading}
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: {
                match: (value: string, { password }: FormData) =>
                  value === password || "Passwords do not match",
              },
            })}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>{signupContent.alerts.error.title}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={isSignUpLoading}>
          {isSignUpLoading ? "Signing up..." : "Create Account"}
        </Button>
      </form>
    </CardContent>
    <CardFooter className="flex flex-col items-center space-y-2">
      <p className="text-xs text-muted-foreground">
        {signupContent.footer.haveAccount} {/* Use Link */}
        <Link href="/login" className="underline font-medium text-primary">
          {signupContent.footer.login}
        </Link>
      </p>
    </CardFooter>
    </Card>
  );
}
