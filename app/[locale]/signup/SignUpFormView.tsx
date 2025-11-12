"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/custom/password-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupContent } from "./content";
import type { PasswordStrength } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

import { Turnstile } from "next-turnstile";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignUpFormView() {
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] =
    useState<PasswordStrength | null>(null);
  const { signup, error: authError } = useAuth();
  const [token, setToken] = useState("");
  const router = useRouter();

  // Initialize react-hook-form
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    defaultValues: {
      name: "",
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

    // This prevents the form from submitting if the CAPTCHA hasn’t been completed.
    if (!token) {
      setError("Please complete the CAPTCHA verification.");
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
      // Call centralized signup function
      await signup(data.email, data.password, data.name);

      // Store email for resend functionality
      localStorage.setItem('pendingVerificationEmail', data.email);

      // Trigger email verification via Loop
      let emailSent = false;
      try {
        const response = await fetch('/api/emails/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'verification',
            email: data.email,
            userName: data.name,
            token: 'temp-token', // Backend will generate actual token
          }),
        });

        if (response.ok) {
          emailSent = true;
        } else {
          console.warn('Failed to send verification email, but continuing with signup');
        }
      } catch (emailError) {
        console.warn('Error sending verification email:', emailError);
        // Don't fail signup if email sending fails
      }

      // Show success message with appropriate feedback
      const successMessage = emailSent
        ? "Account created successfully! Check your email for a verification link to activate your account."
        : "Account created successfully! We'll send you a verification link shortly.";

      // Show success toast notification
      toast.success(successMessage, {
        duration: 4000,
      });

      // Redirect to email confirmation
      router.push("/email-confirmation");
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

  useEffect(() => {
    if (authError) setError(authError.message);
  }, [authError]);

  return (
    <>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name">{signupContent.form.name.label}</Label>
          <Input
            id="name"
            type="text"
            placeholder={signupContent.form.name.placeholder}
            {...register("name", {
              required: "Name is required",
            })}
            disabled={isSignUpLoading}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

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
          <Controller
            name="password"
            control={control}
            rules={{
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
            }}
            render={({ field }) => (
              <PasswordInput
                label={signupContent.form.password.label}
                placeholder={signupContent.form.password.placeholder}
                showStrengthMeter={true}
                onStrengthChange={handlePasswordStrengthChange}
                value={field.value}
                onValueChange={field.onChange}
                disabled={isSignUpLoading}
                name={field.name}
                onBlur={field.onBlur}
                ref={field.ref}
              />
            )}
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Controller
            name="confirmPassword"
            control={control}
            rules={{
              required: "Please confirm your password",
              validate: {
                match: (value: string, { password }: FormData) =>
                  value === password || "Passwords do not match",
              },
            }}
            render={({ field }) => (
              <PasswordInput
                label={signupContent.form.confirmPassword.label}
                placeholder={signupContent.form.confirmPassword.placeholder}
                value={field.value}
                onValueChange={field.onChange}
                disabled={isSignUpLoading}
                name={field.name}
                onBlur={field.onBlur}
                ref={field.ref}
              />
            )}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
              onVerify={(token) => setToken(token)}
            />
          ) : (
            <p className="text-sm text-destructive">
              CAPTCHA is not configured. Please contact support.
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSignUpLoading}>
          {isSignUpLoading ? "Signing up..." : "Create Account"}
        </Button>
      </form>
    </>
  );
}
