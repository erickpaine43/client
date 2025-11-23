"use client";
import { Filter, SearchInput } from "@/components/ui/custom/Filter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { campaignsData } from "@/lib/data/campaigns";
import { mailboxes } from "@/lib/data/mailboxes";
import { cn } from "@/lib/utils";
import {
  Archive,
  AtSign,
  Clock,
  Inbox,
  Mail,
  Send,
  Tag,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function InboxFilter() {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [campaignFilter, setCampaignFilter] = useState<string[]>([]);
  const [mailboxFilter, setMailboxFilter] = useState<string[]>([]);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState("all");

  const router = useRouter();
  const currentSearchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(currentSearchParams);
    const filter = params.get("filter") || "all";
    setSelectedFilter(filter);
    const campaigns = params.getAll("campaigns");
    setCampaignFilter(campaigns);
    const mailboxes = params.getAll("mailboxes");
    setMailboxFilter(mailboxes);
    const tags = params.getAll("tags");
    setTagFilter(tags);

    const time = params.get("time") || "all";
    setTimeFilter(time);
  }, [currentSearchParams]);

  const filters = [
    { id: "all", label: "All Messages", count: 156, icon: Inbox },
    { id: "unread", label: "Unread", count: 24, icon: Mail },
    { id: "sent", label: "Sent", count: 89, icon: Send },
    { id: "archived", label: "Archived", count: 43, icon: Archive },
    { id: "trash", label: "Trash", count: 12, icon: Trash2 },
  ];
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedFilter !== "all") params.append("filter", selectedFilter);
    campaignFilter.forEach((c) => params.append("campaigns", c));
    tagFilter.forEach((t) => params.append("tags", t));
    mailboxFilter.forEach((m) => params.append("mailboxes", m));
    if (timeFilter !== "all") params.append("time", timeFilter);
    router.push(`/dashboard/inbox?${params.toString()}`, { scroll: false });
  }, [
    selectedFilter,
    campaignFilter,
    tagFilter,
    mailboxFilter,
    timeFilter,
    router,
  ]);

  const tags = ["Interested", "Not Interested", "Maybe Later", "Follow Up"];

  const handleMultiSelectToggle = (
    value: string,
    currentSelection: string[],
    setSelection: (selection: string[]) => void
  ) => {
    if (currentSelection.includes(value)) {
      setSelection(currentSelection.filter((item) => item !== value));
    } else {
      setSelection([...currentSelection, value]);
    }
  };

  const clearMultiSelect = (setSelection: (selection: string[]) => void) => {
    setSelection([]);
  };

  const renderMultiSelectFilter = (
    title: string,
    items: string[],
    selectedItems: string[],
    setSelectedItems: (items: string[]) => void,
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  ) => {
    const Icon = icon;
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{title}</span>
          </div>
          {selectedItems.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearMultiSelect(setSelectedItems)}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {selectedItems.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {selectedItems.map((item) => (
              <Badge
                key={item}
                variant="secondary"
                className="text-xs flex items-center gap-1"
              >
                {item}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleMultiSelectToggle(
                      item,
                      selectedItems,
                      setSelectedItems
                    )
                  }
                  className="h-3 w-3 p-0 ml-1 hover:bg-gray-300"
                >
                  <X className="w-2 h-2" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        <Select
          value=""
          onValueChange={(value) =>
            handleMultiSelectToggle(value, selectedItems, setSelectedItems)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={`Select ${title.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {items
              .filter((item) => !selectedItems.includes(item))
              .map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  return (
    <>
      <Filter
        className={cn(
          "bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out lg:flex-col rounded-none"
        )}
      >
        <SearchInput />

        {/* Filters */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <Button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  variant={selectedFilter === filter.id ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-between h-auto py-2.5 px-3",
                    selectedFilter === filter.id
                      ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                      : "text-gray-700"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={cn(
                        "w-4 h-4",
                        selectedFilter === filter.id
                          ? "text-blue-600"
                          : "text-gray-500"
                      )}
                    />
                    <span className="text-sm font-medium">{filter.label}</span>
                  </div>
                  <Badge
                    variant={
                      selectedFilter === filter.id ? "default" : "secondary"
                    }
                    className="text-xs"
                  >
                    {filter.count}
                  </Badge>
                </Button>
              );
            })}
          </div>

          {/* Additional Filters */}
          <div className="mt-6 space-y-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Filter By
            </h3>

            {/* Campaigns Filter */}
            {renderMultiSelectFilter(
              "Campaigns",
              campaignsData.map((c) => c.name),
              campaignFilter,
              setCampaignFilter,
              TrendingUp
            )}

            {/* Mailboxes Filter */}
            {renderMultiSelectFilter(
              "Mailboxes",
              mailboxes.map((m) => m.email),
              mailboxFilter,
              setMailboxFilter,
              AtSign
            )}

            {/* Tags Filter */}
            {renderMultiSelectFilter(
              "Tags",
              tags,
              tagFilter,
              setTagFilter,
              Tag
            )}

            {/* Time Filter (single select) */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-foreground">
                  Time
                </span>
              </div>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Filter>
    </>
  );
}
export default InboxFilter;
