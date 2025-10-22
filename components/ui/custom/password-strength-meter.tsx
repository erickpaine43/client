import React from "react";
import { cn } from "@/lib/utils";
import { PasswordStrength } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface PasswordStrengthMeterProps {
  strength: PasswordStrength;
  dataTestId?: string;
  name: string;
  className?: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  strength,
  dataTestId,
  name,
  className,
}) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case "red":
        return "text-red-600 dark:text-red-400";
      case "yellow":
        return "text-yellow-600 dark:text-yellow-400";
      case "green":
        return "text-green-600 dark:text-green-400";
      default:
        return "text-green-600 dark:text-green-400";
    }
  };

  const getProgressColor = (color: string) => {
    switch (color) {
      case "red":
        return "bg-red-500";
      case "yellow":
        return "bg-yellow-500";
      case "green":
        return "bg-green-500";
      default:
        return "bg-green-500";
    }
  };

  const testId = dataTestId ?? `password-input-${name}`;
  const colorClasses = getColorClasses(strength.color);
  const progressColor = getProgressColor(strength.color);

  return (
    <div
      className={cn("mt-2 space-y-1", className)}
      data-testid={`${testId}-strength-meter`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Password strength</span>
        <span
          className={cn("text-xs font-medium", colorClasses)}
          data-testid={`${testId}-strength-label`}
        >
          {strength.label}
        </span>
      </div>

      <div className="relative">
        <Progress
          value={(strength.score / 4) * 100}
          className={cn("h-1", progressColor)}
          data-testid={`${testId}-strength-bar`}
        />
      </div>

      {strength.feedback.length > 0 && (
        <div
          className="space-y-0.5"
          data-testid={`${testId}-strength-feedback`}
        >
          {strength.feedback.map((message, index) => (
            <p
              key={index}
              className="text-xs text-muted-foreground leading-tight"
              data-testid={`${testId}-feedback-${index}`}
            >
              • {message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
