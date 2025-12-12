"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Eye } from "lucide-react";
import { Lead } from "./MigratedLeadsTable";
import { UnifiedDataTable } from "@/components/design-system/components/unified-data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Mock history data for the view modal
type HistoryItem = {
    id: number;
    action: string;
    date: string;
    description: string;
}

const mockHistory: HistoryItem[] = [
    { id: 1, action: "Email Sent", date: "2024-02-28", description: "Initial outreach email sent" },
    { id: 2, action: "Opened", date: "2024-02-29", description: "Email opened 3 times" },
];

interface MigratedShowLeadListItemButtonProps {
    lead: Lead;
}

export function MigratedShowLeadListItemButton({ lead }: MigratedShowLeadListItemButtonProps) {
  
  const historyColumns: ColumnDef<HistoryItem>[] = [
      {
          accessorKey: "date",
          header: "Date",
          cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.date}</span>
      },
      {
          accessorKey: "action",
          header: "Action",
          cell: ({ row }) => <span className="font-medium text-sm">{row.original.action}</span>
      },
       {
          accessorKey: "description",
          header: "Details",
          cell: ({ row }) => <span className="text-sm">{row.original.description}</span>
      }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-3">
             <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
            </Avatar>
             {lead.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Contact Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex justify-between border-b pb-2">
                    <span className="text-sm font-medium">Email</span>
                    <span className="text-sm text-muted-foreground">{lead.email}</span>
                </div>
                 <div className="flex justify-between border-b pb-2">
                    <span className="text-sm font-medium">Status</span>
                    <Badge variant="outline">{lead.status}</Badge>
                </div>
                <div className="flex justify-between border-b pb-2">
                    <span className="text-sm font-medium">Campaign</span>
                    <span className="text-sm text-muted-foreground">{lead.campaign}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Tags</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {lead.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-sm font-semibold mb-3">Activity History</h3>
            <UnifiedDataTable
                data={mockHistory}
                columns={historyColumns}
                searchable={false}
                paginated={false}
                className="border rounded-md"
            />
          </div>
        </div>
        
        <DialogFooter>
             <DialogClose asChild>
                <Button variant="outline">Close</Button>
             </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
