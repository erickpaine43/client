"use client";

import React from "react";
import { UnifiedDataTable } from "@/components/design-system/components/unified-data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowUpDown } from "lucide-react";
import { MigratedEditLeadListButton } from "./MigratedEditLeadListButton";
import { MigratedShowLeadListItemButton } from "./MigratedShowLeadListItemButton";
import { Checkbox } from "@/components/ui/checkbox";

// Define the shape of our Lead data (matching legacy)
export interface Lead {
  id: number;
  name: string;
  email: string;
  status: string;
  tags: string[];
  campaign: string | null;
  lastContact?: string | null;
}

interface MigratedLeadsTableProps {
  data: Lead[];
  loading?: boolean;
  onEdit?: (lead: Lead) => void;
  onView?: (lead: Lead) => void;
  onSelectionChange?: (selectedIds: number[]) => void;
}

const getStatusColor = (status: string) => {
  const statusLower = status.toLowerCase().replaceAll(" ", "_");
  const colors: Record<string, string> = {
    replied: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
    sent: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    bounced: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
    not_used: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
  };
  return colors[statusLower] || colors.not_used;
};

export function MigratedLeadsTable({
  data,
  loading = false,
  onSelectionChange,
}: MigratedLeadsTableProps) {
  
  const columns: ColumnDef<Lead>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      meta: {
        headerClassName: "w-12",
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent font-semibold"
          >
            Contact
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const lead = row.original;
        const initials = lead.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2);

        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-sm leading-none">{lead.name}</span>
              <span className="text-xs text-muted-foreground mt-1">{lead.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge variant="outline" className={getStatusColor(status)}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {row.original.tags.map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-[10px] px-1 py-0 h-5">
              {tag}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "campaign",
      header: "List",
      cell: ({ row }) => <span className="text-sm">{row.original.campaign}</span>,
    },
    {
      accessorKey: "lastContact",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent font-semibold"
          >
            Last Contact
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = row.original.lastContact;
        return (
          <span className="text-sm text-muted-foreground">
            {date ? new Date(date).toLocaleDateString() : "Not Used Yet"}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <MigratedShowLeadListItemButton lead={row.original} />
          <MigratedEditLeadListButton lead={row.original} />
        </div>
      ),
      header: "Actions",
      meta: {
        headerClassName: "text-right",
        cellClassName: "text-right",
      } as any,
    },
  ];

  return (
    <UnifiedDataTable
      columns={columns}
      data={data}
      loading={loading}
      onRowSelect={React.useCallback((rows: import("@tanstack/react-table").Row<Lead>[]) => {
        const selectedIds = rows.map((r) => r.original.id);
        onSelectionChange?.(selectedIds);
      }, [onSelectionChange])}
      searchable={false} // We handle search externally via UnifiedFilterBar
      paginated={false}
      className="border-none shadow-none"
      contentClassName="p-0"
      tableContainerClassName="rounded-xl border"
    />
  );
}
