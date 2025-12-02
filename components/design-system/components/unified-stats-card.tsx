"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";
import React from "react";

// Design Token Types
type ColorScheme =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info";
type SizeVariant = "sm" | "default" | "lg";
type StatsVariant = "default" | "highlighted" | "muted";
type TrendDirection = "up" | "down" | "stable";

// Design token mappings - moved outside component to prevent recreation on every render
const colorTokens = {
  primary: {
    iconBg: "bg-primary/10 dark:bg-primary/20",
    iconColor: "text-primary",
    border: "border-primary/20",
    badge: "bg-primary/10 text-primary border-primary/20",
  },
  secondary: {
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
    border: "border-border",
    badge: "bg-muted text-muted-foreground",
  },
  success: {
    iconBg: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
    border: "border-green-200 dark:border-green-800",
    badge:
      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
  },
  warning: {
    iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    border: "border-yellow-200 dark:border-yellow-800",
    badge:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  },
  error: {
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
    badge:
      "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
  },
  info: {
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
    badge:
      "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  },
};

// Size configurations using design tokens - moved outside component to prevent recreation on every render
const sizeTokens = {
  sm: {
    container: "p-4",
    title: "text-xs font-medium",
    value: "text-lg font-semibold",
    icon: "w-4 h-4 p-1",
  },
  default: {
    container: "p-6",
    title: "text-sm font-medium",
    value: "text-2xl font-bold",
    icon: "w-5 h-5 p-2",
  },
  lg: {
    container: "p-8",
    title: "text-base font-medium",
    value: "text-4xl font-bold",
    icon: "w-6 h-6 p-3",
  },
};

// Variant configurations - moved outside component to prevent recreation on every render
const variantTokens = {
  default: "border bg-card",
  highlighted: "border-2 bg-card shadow-md",
  muted: "border bg-muted/30",
};

interface UnifiedStatsCardProps {
  // Core content
  title: string;
  value: string | number;
  icon?: LucideIcon | React.ElementType;

  // Styling
  color?: ColorScheme;
  size?: SizeVariant;
  variant?: StatsVariant;
  className?: string;

  // Trend and performance
  trend?: TrendDirection;
  change?: string;
  changeType?: "increase" | "decrease" | "stable";

  // Benchmarks
  benchmark?: boolean;
  target?: number;
  rawValue?: number;
  unit?: string;

  // Accessibility
  "aria-label"?: string;
}

/**
 * Unified Stats Card component that consolidates all StatsCard variants
 * Uses design tokens for consistent styling and standardized props
 */
export const UnifiedStatsCard: React.FC<UnifiedStatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color = "primary",
  className,
  size = "default",
  variant = "default",
  target,
  rawValue,
  unit,
  trend,
  change,
  changeType,
  benchmark = false,
  "aria-label": ariaLabel,
}) => {
  // Note: Design token mappings (colorTokens, sizeTokens, variantTokens)
  // have been moved outside the component to prevent recreation on every render

  // Determine if value meets target benchmark
  const meetsTarget =
    target && rawValue !== undefined ? rawValue >= target : null;

  // Get trend icon and styling
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return (
          <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
        );
      case "down":
        return (
          <TrendingDown className="w-3 h-3 text-red-600 dark:text-red-400" />
        );
      case "stable":
        return <Minus className="w-3 h-3 text-muted-foreground" />;
      default:
        return null;
    }
  };

  // Get change styling based on type
  const getChangeColor = () => {
    switch (changeType) {
      case "increase":
        return "text-green-600 dark:text-green-400";
      case "decrease":
        return "text-red-600 dark:text-red-400";
      case "stable":
        return "text-muted-foreground";
      default:
        return "text-muted-foreground";
    }
  };

  const colorToken = colorTokens[color];
  const sizeToken = sizeTokens[size];

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        variantTokens[variant],
        sizeToken.container,
        colorToken.border,
        className
      )}
      aria-label={ariaLabel || `Statistics for ${title}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className={cn("text-muted-foreground", sizeToken.title)}>
          {title}
        </CardTitle>
        {Icon && (
          <div className={cn("rounded-lg", colorToken.iconBg, sizeToken.icon)}>
            <Icon className={cn("w-full h-full", colorToken.iconColor)} />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Value and trend indicator */}
        <div className="flex items-baseline space-x-2">
          <div className={cn("text-foreground", sizeToken.value)}>
            {value}
            {unit && (
              <span className="text-sm font-normal text-muted-foreground ml-1">
                {unit}
              </span>
            )}
          </div>
          {trend && getTrendIcon()}
        </div>

        {/* Benchmark status badge */}
        {benchmark && meetsTarget !== null && (
          <Badge
            variant="outline"
            className={cn("text-xs font-medium", colorToken.badge)}
          >
            {meetsTarget ? "On Target" : "Below Target"}
          </Badge>
        )}

        {/* Change indicator */}
        {change && (
          <p className={cn("text-xs font-medium", getChangeColor())}>
            {change}
          </p>
        )}

        {/* Target display for percentage metrics */}
        {target && unit === "%" && (
          <p className="text-xs text-muted-foreground">
            Target: {(target * 100).toFixed(1)}%
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default UnifiedStatsCard;
