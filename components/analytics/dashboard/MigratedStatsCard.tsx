"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import React from "react";

interface MigratedStatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  className?: string;
  target?: number;
  rawValue?: number;
  unit?: string;
  trend?: "up" | "down" | "stable";
  change?: string;
  changeType?: "increase" | "decrease" | "stable";
}

/**
 * Migrated Stats Card component with enhanced KPI display features.
 * Supports benchmarks, trends, and standardized color coding.
 */
const MigratedStatsCard: React.FC<MigratedStatsCardProps> = ({
  title,
  value,
  icon,
  color,
  className,
  target,
  rawValue,
  unit,
  trend,
  change,
  changeType,
}) => {
  const Icon = icon;

  // Determine if value meets target benchmark
  const meetsTarget = target && rawValue ? rawValue >= target : null;

  // Get trend icon and color
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case "down":
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      case "stable":
        return <Minus className="w-3 h-3 text-gray-500" />;
      default:
        return null;
    }
  };

  // Get change color based on type
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

  return (
    <Card
      className={cn("shadow-sm hover:shadow-md transition-shadow", className)}
    >
      <CardContent className="flex items-center justify-between p-6">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {meetsTarget !== null && (
              <div
                className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  meetsTarget
                    ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400"
                    : "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
                )}
              >
                {meetsTarget ? "On Target" : "Below Target"}
              </div>
            )}
          </div>

          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {trend && (
              <div className="flex items-center space-x-1">
                {getTrendIcon()}
              </div>
            )}
          </div>

          {/* Target benchmark display */}
          {target && unit === "%" && (
            <p className="text-xs text-gray-500 mt-1">
              Target: {(target * 100).toFixed(1)}%
            </p>
          )}

          {/* Change indicator */}
          {change && (
            <div className="flex items-center space-x-1 mt-2">
              <p className={cn("text-xs", getChangeColor())}>{change}</p>
            </div>
          )}
        </div>

        <div className={cn("p-3 rounded-lg ml-4", color)}>
          <Icon className="w-6 h-6" />
        </div>
      </CardContent>
    </Card>
  );
};

export default MigratedStatsCard;
