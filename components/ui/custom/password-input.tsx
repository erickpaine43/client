"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  calculatePasswordStrength,
  debounce,
  type PasswordStrength,
} from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordStrengthMeter } from "./password-strength-meter";

interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  name: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  dataTestId?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  containerClassName?: string;
  showStrengthMeter?: boolean;
  onStrengthChange?: (strength: PasswordStrength | null) => void;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      className,
      inputClassName,
      labelClassName,
      containerClassName,
      label,
      name,
      value,
      defaultValue,
      onValueChange,
      placeholder,
      required,
      disabled,
      autoComplete = "current-password",
      dataTestId,
      showStrengthMeter = false,
      onStrengthChange,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [passwordStrength, setPasswordStrength] =
      React.useState<PasswordStrength | null>(null);
    const [inputValue, setInputValue] = React.useState(
      value || defaultValue || "",
    );

    const testId = dataTestId ?? `password-input-${name}`;

    const togglePasswordVisibility = React.useCallback(() => {
      setShowPassword((prev) => !prev);
    }, []);

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          togglePasswordVisibility();
        }
      },
      [togglePasswordVisibility],
    );

    // Debounced password strength calculation
    const debouncedCalculateStrength = React.useMemo(
      () =>
        debounce((password: string) => {
          if (showStrengthMeter) {
            const strength = calculatePasswordStrength(password);
            setPasswordStrength(strength);
            onStrengthChange?.(strength);
          }
        }, 300),
      [showStrengthMeter, onStrengthChange],
    );

    // Calculate strength when password changes
    React.useEffect(() => {
      const currentPassword = value !== undefined ? value : inputValue;
      if (showStrengthMeter) {
        debouncedCalculateStrength(currentPassword);
      } else {
        setPasswordStrength(null);
        onStrengthChange?.(null);
      }
    }, [
      value,
      inputValue,
      showStrengthMeter,
      debouncedCalculateStrength,
      onStrengthChange,
    ]);

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onValueChange?.(newValue);
      },
      [onValueChange],
    );

    const inputProps = {
      type: showPassword ? "text" : "password",
      id: name,
      name,
      placeholder,
      autoComplete,
      disabled,
      required,
      "data-testid": testId,
      onChange: handleChange,
      ...props,
    } as React.InputHTMLAttributes<HTMLInputElement> & {
      "data-testid"?: string;
    };

    if (value !== undefined) {
      inputProps.value = value;
    } else if (defaultValue !== undefined) {
      inputProps.defaultValue = defaultValue;
    }

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <Label htmlFor={name} className={cn(labelClassName)}>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}

        <div className="relative">
          <Input
            ref={ref}
            className={cn("pr-10", inputClassName)}
            {...inputProps}
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={togglePasswordVisibility}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            aria-label={showPassword ? "Hide password" : "Show password"}
            data-testid={`${testId}-toggle`}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>

        {showStrengthMeter && passwordStrength && (
          <PasswordStrengthMeter
            strength={passwordStrength}
            dataTestId={dataTestId}
            name={name}
            className={className}
          />
        )}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput, type PasswordInputProps };
