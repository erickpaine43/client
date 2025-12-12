"use client";

import React, { useState, useMemo } from "react";
import { MigratedLeadsFilter } from "./MigratedLeadsFilter";
import { MigratedLeadsTable, Lead } from "./MigratedLeadsTable";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { sampleLeads } from "@/lib/data/leads";
import { Button } from "@/components/ui/button";
import { Tag, Send, Download, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Placeholders for migrated modals - normally would import them here
// import { MigratedEditLeadListButton } from "./MigratedEditLeadListButton";

export default function MigratedContactsTab() {
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [selectedContactIds, setSelectedContactIds] = useState<number[]>([]);
  // Counter to force table reset when clearing selections
  // This ensures the table's internal selection state is properly reset
  const [tableResetCounter, setTableResetCounter] = useState(0);

  // NOTE: In a real app this would come from an API hook
  const [contacts, setContacts] = useState<Lead[]>([
    ...sampleLeads,
  ] as unknown as Lead[]);

  // Filter logic
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      // Search
      const matchesSearch =
        contact.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchValue.toLowerCase());

      // Status
      const matchesStatus =
        statusFilter === "all" ||
        contact.status.toLowerCase() === statusFilter.toLowerCase();

      // Campaign
      const matchesCampaign =
        campaignFilter === "all" || contact.campaign === campaignFilter;

      return matchesSearch && matchesStatus && matchesCampaign;
    });
  }, [contacts, searchValue, statusFilter, campaignFilter]);

  const handleEdit = (lead: Lead) => {
    console.log("Edit lead", lead);
    // TODO: Open MigratedEditLeadListButton
  };

  const currentSelectionCount = selectedContactIds.length;

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="p-0">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-2">
          {/* Passing filters to the container */}
          <div className="w-full">
            <MigratedLeadsFilter
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              campaignFilter={campaignFilter}
              onCampaignChange={setCampaignFilter}
            />
          </div>
        </div>

        {/* Bulk Actions overlay - inspired by existing ContactsTab logic */}
        {currentSelectionCount > 0 && (
          <div className="flex items-center gap-4 p-2 bg-muted/50 rounded-lg mb-4 animate-in fade-in slide-in-from-top-2">
            <span className="text-sm font-medium ml-2">
              {currentSelectionCount} selected
            </span>

            <div className="flex items-center gap-2">
              <Select>
                <SelectTrigger className="h-8 w-[180px]">
                  <SelectValue placeholder="Bulk Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assign-tag">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" /> <span>Assign Tag</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="add-to-campaign">
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" /> <span>Add to Campaign</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="export">
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4" /> <span>Export</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="delete" className="text-destructive">
                    <div className="flex items-center gap-2">
                      <Trash2 className="w-4 h-4" /> <span>Delete</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedContactIds([]);
                  setTableResetCounter((c) => c + 1);
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <MigratedLeadsTable
          key={tableResetCounter}
          data={filteredContacts}
          onSelectionChange={setSelectedContactIds}
          onEdit={handleEdit}
        />
      </CardContent>
    </Card>
  );
}
