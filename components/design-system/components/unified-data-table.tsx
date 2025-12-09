"use client";

import React, { useState } from "react";
import {
  ColumnDef,
  flexRender,
  SortingState,
  getPaginationRowModel,
  getFilteredRowModel,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Search, Settings2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UnifiedDataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data?: TData[];
  title?: string;
  searchable?: boolean;
  filterable?: boolean;
  paginated?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  onRowSelect?: (rows: Row<TData>[]) => void;
  renderActions?: (row: Row<TData>) => React.ReactNode;
}

/**
 * Unified Data Table component that consolidates all data table variants
 * Uses existing UI components (Table, Card, Input, Button, Badge) and Tailwind utilities
 * Supports search, filtering, pagination, and row selection
 */
export function UnifiedDataTable<TData>({
  columns,
  data = [],
  title,
  searchable = true,
  filterable = false,
  paginated = true,
  loading = false,
  emptyMessage = "No data found.",
  className,
  onRowSelect,
  renderActions,
}: UnifiedDataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({});

  const table = useReactTable({
    data: data,
    columns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(paginated && { getPaginationRowModel: getPaginationRowModel() }),
    enableRowSelection: !!onRowSelect,
  });

  // Handle row selection callback
  React.useEffect(() => {
    if (onRowSelect) {
      onRowSelect(table.getFilteredSelectedRowModel().rows);
    }
  }, [rowSelection, onRowSelect, table]);

  const renderTable = () => (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="font-semibold"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className={cn(
                  "transition-colors hover:bg-muted/50",
                  row.getIsSelected() && "bg-muted"
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
                {renderActions && (
                  <TableCell>
                    {renderActions(row)}
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length + (renderActions ? 1 : 0)}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );

  const renderToolbar = () => (
    <div className="flex items-center justify-between space-y-2 py-4">
      <div className="flex items-center space-x-2 flex-1">
        {searchable && (
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {filterable && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuItem key={column.id}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={column.getIsVisible()}
                        onChange={(e) =>
                          column.toggleVisibility(e.target.checked)
                        }
                        className="rounded"
                      />
                      {column.id}
                    </label>
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Selection info */}
      {table.getFilteredSelectedRowModel().rows.length > 0 && (
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            {table.getFilteredSelectedRowModel().rows.length} selected
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.resetRowSelection()}
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );

  const renderPagination = () => {
    if (!paginated) return null;

    return (
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} results
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        {title && (
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-72 bg-muted animate-pulse rounded" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4 px-6">
        {renderToolbar()}
        {renderTable()}
        {renderPagination()}
      </CardContent>
    </Card>
  );
}

export default UnifiedDataTable;
