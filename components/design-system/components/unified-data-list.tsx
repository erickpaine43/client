"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { spacing } from "@/lib/design-tokens";

interface UnifiedDataListProps<TData> {
  /** Array of data items to display */
  data: TData[];

  /** Custom rendering function for each list item */
  renderItem: (item: TData, index: number) => React.ReactNode;

  /** Function to extract unique keys for each item (recommended for better React performance) */
  keyExtractor?: (item: TData, index: number) => string | number;

  /** Optional title for the list */
  title?: string;

  /** Enable search functionality */
  searchable?: boolean;

  /** Keys to search within (for searchable lists) */
  searchKeys?: (keyof TData)[];

  /** Enable pagination */
  paginated?: boolean;

  /** Number of items per page (default: 10) */
  itemsPerPage?: number;

  /** Loading state */
  loading?: boolean;

  /** Message to show when list is empty */
  emptyMessage?: string;

  /** Additional className for the container */
  className?: string;

  /** Additional className for each list item */
  itemClassName?: string;

  /** Callback when an item is clicked */
  onItemClick?: (item: TData, index: number) => void;
}

/**
 * Unified Data List component for vertical list layouts
 * Provides search, pagination, and loading states with customizable item rendering
 */
export function UnifiedDataList<TData>({
  data = [],
  renderItem,
  keyExtractor,
  title,
  searchable = false,
  searchKeys = [],
  paginated = false,
  itemsPerPage = 10,
  loading = false,
  emptyMessage = "No items found.",
  className,
  itemClassName,
  onItemClick,
}: UnifiedDataListProps<TData>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchable || !searchQuery || searchKeys.length === 0) {
      return data;
    }

    return data.filter((item) => {
      return searchKeys.some((key) => {
        const value = item[key];
        if (typeof value === "string") {
          return value.toLowerCase().includes(searchQuery.toLowerCase());
        }
        return false;
      });
    });
  }, [data, searchQuery, searchable, searchKeys]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!paginated) {
      return filteredData;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, paginated, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const renderSearch = () => {
    if (!searchable) return null;

    return (
      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>
    );
  };

  const renderPagination = () => {
    if (!paginated || totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages} ({filteredData.length} items)
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  const renderLoadingState = () => (
    <div className={spacing.stackXs}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-8 text-muted-foreground">{emptyMessage}</div>
  );

  const renderList = () => {
    if (paginatedData.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className={spacing.stackXs}>
        {paginatedData.map((item, index) => {
          const handleClick = onItemClick
            ? () => onItemClick(item, index)
            : undefined;

          // Use keyExtractor if provided, otherwise fallback to index for backward compatibility
          const itemKey = keyExtractor ? keyExtractor(item, index) : index;

          return (
            <div
              key={itemKey}
              className={cn(itemClassName, handleClick && "cursor-pointer")}
              onClick={handleClick}
            >
              {renderItem(item, index)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {renderSearch()}
        {loading ? renderLoadingState() : renderList()}
        {renderPagination()}
      </CardContent>
    </Card>
  );
}

export default UnifiedDataList;
