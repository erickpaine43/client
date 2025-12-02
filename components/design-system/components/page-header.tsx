"use client";

import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { typography, spacing } from "@/lib/design-tokens";

interface PageHeaderProps {
  /**
   * Page title
   */
  title?: string;
  
  /**
   * Page description/subtitle
   */
  description?: string;
  
  /**
   * Breadcrumb navigation items
   */
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  
  /**
   * Action buttons or components to display in header
   */
  actions?: React.ReactNode;
  
  /**
   * Show back button
   */
  showBackButton?: boolean;
  
  /**
   * Back button destination URL
   */
  backHref?: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * PageHeader Component
 * 
 * Standardized page header with breadcrumbs, title, description, and actions.
 * Extracted from DashboardLayout pattern for reusability.
 * 
 * @example
 * ```tsx
 * <PageHeader
 *   title="Campaign Analytics"
 *   description="Monitor your campaign performance"
 *   breadcrumbs={[
 *     { label: "Campaigns", href: "/campaigns" },
 *     { label: "Analytics" }
 *   ]}
 *   actions={
 *     <Button>
 *       <Download className="mr-2 h-4 w-4" />
 *       Export
 *     </Button>
 *   }
 *   showBackButton
 *   backHref="/campaigns"
 * />
 * ```
 */
export function PageHeader({
  title,
  description,
  breadcrumbs = [],
  actions,
  showBackButton = false,
  backHref = "/",
  className,
}: PageHeaderProps) {
  // Don't render if no content
  if (!title && breadcrumbs.length === 0 && !actions && !showBackButton) {
    return null;
  }

  return (
    <div className={cn(spacing.stackMd, className)}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {crumb.href ? (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {/* Title and Actions Row */}
      <div className="flex items-center justify-between">
        <div className={spacing.stackXs}>
          {showBackButton && (
            <Button variant="ghost" size="sm" asChild className="mb-2">
              <Link href={backHref} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
          )}
          {title && (
            <h1 className={typography.h1}>
              {title}
            </h1>
          )}
          {description && (
            <p className={typography.cardSubtitle}>{description}</p>
          )}
        </div>

        {actions && (
          <div className="flex items-center space-x-2">{actions}</div>
        )}
      </div>
    </div>
  );
}

export default PageHeader;
