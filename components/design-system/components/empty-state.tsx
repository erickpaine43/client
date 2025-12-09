"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { typography, spacing, textColors } from "@/lib/design-tokens";
import Link from "next/link";

interface EmptyStateProps {
  /**
   * Icon to display (Lucide icon component)
   */
  icon?: LucideIcon;
  
  /**
   * Title text
   */
  title: string;
  
  /**
   * Description text
   */
  description?: string;
  
  /**
   * Action button label
   */
  actionLabel?: string;
  
  /**
   * Action button click handler
   */
  onAction?: () => void;
  
  /**
   * Action button href (if link instead of button)
   */
  actionHref?: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Size variant
   */
  size?: "sm" | "default" | "lg";
}

/**
 * EmptyState Component
 * 
 * Displays a friendly message when there's no data to show.
 * Supports optional icon, description, and action button.
 * 
 * @example
 * ```tsx
 * // Simple empty state
 * <EmptyState
 *   icon={Inbox}
 *   title="No messages yet"
 *   description="Your inbox is empty. Start a conversation to see messages here."
 * />
 * 
 * // With action button
 * <EmptyState
 *   icon={Folder}
 *   title="No campaigns found"
 *   description="Get started by creating your first campaign."
 *   actionLabel="Create Campaign"
 *   actionHref="/campaigns/create"
 * />
 * 
 * // With click handler
 * <EmptyState
 *   icon={Users}
 *   title="No contacts"
 *   actionLabel="Import Contacts"
 *   onAction={() => openImportDialog()}
 * />
 * ```
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className,
  size = "default",
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: "py-8",
      icon: "w-10 h-10",
      spacing: spacing.stackSm,
    },
    default: {
      container: "py-12",
      icon: "w-12 h-12",
      spacing: spacing.stackMd,
    },
    lg: {
      container: "py-16",
      icon: "w-16 h-16",
      spacing: spacing.stackLg,
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        currentSize.container,
        className
      )}
    >
      <div className={currentSize.spacing}>
        {/* Icon */}
        {Icon && (
          <div className="flex justify-center">
            <div className="rounded-full bg-muted p-4">
              <Icon className={cn(currentSize.icon, textColors.secondary)} />
            </div>
          </div>
        )}

        {/* Text Content */}
        <div className={spacing.stackXs}>
          <h3 className={cn(typography.h3, textColors.primary)}>
            {title}
          </h3>
          {description && (
            <p className={cn(typography.bodyDefault, textColors.secondary)}>
              {description}
            </p>
          )}
        </div>

        {/* Action Button */}
        {(actionLabel && (onAction || actionHref)) && (
          <div className="mt-2">
            {actionHref ? (
              <Button asChild>
                <Link href={actionHref}>{actionLabel}</Link>
              </Button>
            ) : (
              <Button onClick={onAction}>{actionLabel}</Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default EmptyState;
