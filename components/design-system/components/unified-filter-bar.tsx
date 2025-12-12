"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface UnifiedFilterBarProps {
  /**
   * Callback fired when search term changes
   */
  onSearch?: (term: string) => void;
  /**
   * Current value of the search input (controlled mode)
   */
  searchValue?: string;
  /**
   * Placeholder text for search input
   */
  searchPlaceholder?: string;
  /**
   * Filter elements to display (usually Dropdowns or Popovers)
   */
  filters?: React.ReactNode;
  /**
   * Action elements to display (Buttons, Bulk Actions)
   */
  actions?: React.ReactNode;
  /**
   * Additional classes
   */
  className?: string;
}

/**
 * Unified Filter Bar component for listing pages.
 * Provides a standardized layout for Search, Filters, and Actions.
 */
export function UnifiedFilterBar({
  onSearch,
  searchValue,
  searchPlaceholder = "Search...",
  filters,
  actions,
  className,
}: UnifiedFilterBarProps) {
  const [internalSearch, setInternalSearch] = useState(searchValue || "");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInternalSearch(value);
    onSearch?.(value);
  };

  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-4 bg-background border rounded-lg shadow-sm mb-6",
        className
      )}
    >
      {/* Search Section */}
      <div className="flex items-center w-full lg:w-auto flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchValue !== undefined ? searchValue : internalSearch}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            className="pl-9 w-full bg-background"
          />
        </div>
      </div>

      {/* Filters & Actions Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full lg:w-auto">
        {filters && (
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            {filters}
          </div>
        )}
        
        {actions && (
          <div className="flex items-center gap-2 w-full sm:w-auto ml-auto sm:ml-0 border-t sm:border-t-0 pt-2 sm:pt-0 mt-2 sm:mt-0">
             {/* Divider if both exist */}
             {filters && <div className="hidden sm:block h-6 w-px bg-border mx-1" />}
             {actions}
          </div>
        )}
      </div>
    </div>
  );
}
