"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { PasswordInput } from "./password-input";
import { type PasswordInputProps } from "./password-input";

export interface PasswordConfirmationProps {
  passwordName?: string;
  confirmPasswordName?: string;
  passwordProps?: Omit<PasswordInputProps, "name" | "value" | "onValueChange">;
  confirmPasswordProps?: Omit<
    PasswordInputProps,
    "name" | "value" | "onValueChange"
  >;
  className?: string;
}

export const PasswordConfirmation = React.forwardRef<
  HTMLDivElement,
  PasswordConfirmationProps
>(
  (
    {
      passwordName = "password",
      confirmPasswordName = "confirmPassword",
      passwordProps,
      confirmPasswordProps,
      className,
    },
    ref,
  ) => {
    const formContext = useFormContext();

    if (!formContext) {
      console.warn(
        "PasswordConfirmation must be used within a react-hook-form FormProvider",
      );
      return null;
    }

    const { watch } = formContext;
    const passwordValue = watch(passwordName);
    const confirmPasswordValue = watch(confirmPasswordName);

    return (
      <div ref={ref} className={cn("grid grid-cols-1 gap-4", className)}>
        <PasswordInput
          name={passwordName}
          label={passwordProps?.label || "Password"}
          value={passwordValue}
          onValueChange={(value) => formContext.setValue(passwordName, value)}
          showStrengthMeter
          required
          {...passwordProps}
        />

        <PasswordInput
          name={confirmPasswordName}
          label={confirmPasswordProps?.label || "Confirm Password"}
          value={confirmPasswordValue}
          onValueChange={(value) =>
            formContext.setValue(confirmPasswordName, value)
          }
          showStrengthMeter={false}
          required
          {...confirmPasswordProps}
        />
      </div>
    );
  },
);

PasswordConfirmation.displayName = "PasswordConfirmation";

// Utility to validate password confirmation
export const validatePasswordMatch = (
  value: string,
  allFormData: Record<string, unknown>,
  passwordFieldName = "password",
) => {
  const password = allFormData[passwordFieldName];
  if (typeof password !== "string") {
    return "Password is required";
  }
  if (value !== password) {
    return "Passwords do not match";
  }
  return true;
};
