"use client";

import React from "react";
import { UnifiedFilterBar } from "@/components/design-system/components/unified-filter-bar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Filter } from "lucide-react";

interface MigratedLeadsFilterProps {
  /**
   * Current search term
   */
  searchValue: string;
  /**
   * Callback for search updates
   */
  onSearchChange: (value: string) => void;
  /**
   * Currently selected status filter
   */
  statusFilter: string;
  /**
   * Callback for status filter updates
   */
  onStatusChange: (value: string) => void;
  /**
   * Currently selected campaign filter
   */
  campaignFilter: string;
  /**
   * Callback for campaign updates
   */
  onCampaignChange: (value: string) => void;
  /**
   * Loading state
   */
  loading?: boolean;
}

/**
 * Filter component for Leads module using UnifiedFilterBar.
 * replaces the legacy inline filters in ContactsTab.
 */
export function MigratedLeadsFilter({
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusChange,
  campaignFilter,
  onCampaignChange,
  loading,
}: MigratedLeadsFilterProps) {
  const statusOptions = [
    { value: "all", label: "Status" },
    { value: "bounced", label: "Bounced" },
    { value: "replied", label: "Replied" },
    { value: "sent", label: "Sent" },
    { value: "not-used", label: "Not Used" },
  ];

  const campaignOptions = [
    { value: "all", label: "Campaigns" },
    { value: "Q1 SaaS Outreach", label: "Q1 SaaS Outreach" },
    { value: "Enterprise Prospects", label: "Enterprise Prospects" },
    { value: "SMB Follow-up", label: "SMB Follow-up" },
  ];

  const filters = (
    <>
      {/* Status Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={loading}
          >
            <Filter className="h-4 w-4 text-muted-foreground" />
            {statusOptions.find((o) => o.value === statusFilter)?.label ||
              "Status"}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuRadioGroup
            value={statusFilter}
            onValueChange={onStatusChange}
          >
            {statusOptions.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Campaign Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={loading}
          >
            {campaignOptions.find((o) => o.value === campaignFilter)?.label ||
              "Campaigns"}
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuRadioGroup
            value={campaignFilter}
            onValueChange={onCampaignChange}
          >
            {campaignOptions.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  return (
    <UnifiedFilterBar
      searchValue={searchValue}
      onSearch={onSearchChange}
      searchPlaceholder="Search leads..."
      filters={filters}
      className="mb-4 border-none shadow-none p-0 bg-transparent"
    />
  );
}
