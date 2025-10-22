"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Mail,
  Globe,
  Users,
  FileText,
  CreditCard,
  TrendingUp,
} from "lucide-react";

/**
 * Migrated Analytics Navigation Links with updated routes and icons.
 * Provides navigation to different analytics domains.
 */
function MigratedAnalyticsNavLinks() {
  const pathname = usePathname();

  const navLinks = [
    {
      href: "/dashboard/analytics",
      label: "Overview",
      icon: BarChart3,
      description: "Overall performance metrics",
    },
    {
      href: "/dashboard/analytics/campaigns",
      label: "Campaigns",
      icon: TrendingUp,
      description: "Campaign performance analytics",
    },
    {
      href: "/dashboard/analytics/mailboxes",
      label: "Mailboxes",
      icon: Mail,
      description: "Mailbox health and warmup",
    },
    {
      href: "/dashboard/analytics/domains",
      label: "Domains",
      icon: Globe,
      description: "Domain reputation and authentication",
    },
    {
      href: "/dashboard/analytics/leads",
      label: "Leads",
      icon: Users,
      description: "Lead engagement analytics",
    },
    {
      href: "/dashboard/analytics/templates",
      label: "Templates",
      icon: FileText,
      description: "Template performance metrics",
    },
    {
      href: "/dashboard/analytics/billing",
      label: "Usage & Billing",
      icon: CreditCard,
      description: "Usage analytics and billing",
    },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8 overflow-x-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors",
                isActive
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default MigratedAnalyticsNavLinks;
