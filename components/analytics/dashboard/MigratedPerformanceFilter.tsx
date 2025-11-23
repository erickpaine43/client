"use client";

import { Button } from "@/components/ui/button/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAnalytics } from "@/context/AnalyticsContext";
import { CampaignAnalytics } from "@/types/analytics/domain-specific";
import { DateRangePreset, DataGranularity } from "@/types";
import { ChevronDown, Mail, Settings, Target, Loader2 } from "lucide-react";
import { DropDownFilter, Filter } from "../../ui/custom/Filter";

interface MailboxFilter {
  id: string;
  name: string;
}

interface MigratedPerformanceFilterProps {
  campaignData: CampaignAnalytics[];
  mailboxes: MailboxFilter[];
  loading?: boolean;
}

/**
 * Migrated Performance Filter using standardized UI filters and real-time updates.
 * Integrates with the simplified AnalyticsContext for filter management.
 */
function MigratedPerformanceFilter({
  campaignData,
  mailboxes,
  loading = false,
}: MigratedPerformanceFilterProps) {
  const { filters, updateFilters, getAllowedGranularities } = useAnalytics();

  const dateRangeOptions: { value: string; label: string }[] = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
    { value: "1y", label: "Last year" },
    { value: "custom", label: "Custom range" },
  ];

  const granularityOptions: { value: string; label: string }[] = [
    { value: "day", label: "Daily" },
    { value: "week", label: "Weekly" },
    { value: "month", label: "Monthly" },
  ];

  // Filter granularity options based on allowed granularities
  const allowedGranularities = getAllowedGranularities();
  const filteredGranularityOptions = granularityOptions.filter((option) =>
    allowedGranularities.includes(option.value as DataGranularity)
  );

  // Standardized metrics using new field names
  const standardizedMetrics = [
    { key: "sent", label: "Emails Sent" },
    { key: "delivered", label: "Delivered" },
    { key: "opened_tracked", label: "Opens (Tracked)" },
    { key: "clicked_tracked", label: "Clicks (Tracked)" },
    { key: "replied", label: "Replies" },
    { key: "bounced", label: "Bounced" },
    { key: "unsubscribed", label: "Unsubscribed" },
    { key: "spamComplaints", label: "Spam Complaints" },
  ];

  const handleDateRangeChange = (value: string) => {
    const preset = value as DateRangePreset;
    updateFilters({
      dateRange: preset,
      customDateRange:
        preset === "custom" ? filters.customDateRange : undefined,
    });
  };

  const handleCustomDateChange = (field: "start" | "end", value: string) => {
    const existing = filters.customDateRange ?? { start: "", end: "" };
    updateFilters({
      customDateRange: {
        ...existing,
        [field]: value,
      },
    });
  };

  const handleGranularityChange = (value: string) => {
    updateFilters({
      granularity: value as DataGranularity,
    });
  };

  const handleCampaignSelectionChange = (selectedCampaigns: string[]) => {
    updateFilters({
      selectedCampaigns,
    });
  };

  const handleMailboxSelectionChange = (selectedMailboxes: string[]) => {
    updateFilters({
      selectedMailboxes,
    });
  };

  const handleMetricsVisibilityChange = (selectedMetrics: string[]) => {
    updateFilters({
      visibleMetrics: selectedMetrics,
    });
  };

  return (
    <Filter className="shadow-none border-none">
      <div className="flex items-center space-x-2">
        {/* Loading indicator */}
        {loading && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading...</span>
          </div>
        )}

        {/* Date Range Filter */}
        <DropDownFilter
          options={dateRangeOptions}
          placeholder="Select date range"
          value={filters.dateRange}
          onChange={handleDateRangeChange}
        />

        {/* Custom Date Picker */}
        {filters.dateRange === "custom" && (
          <div className="flex items-center space-x-2">
            <Input
              type="date"
              value={filters.customDateRange?.start || ""}
              onChange={(e) => handleCustomDateChange("start", e.target.value)}
              className="w-auto"
              disabled={loading}
            />
            <span className="text-muted-foreground">to</span>
            <Input
              type="date"
              value={filters.customDateRange?.end || ""}
              onChange={(e) => handleCustomDateChange("end", e.target.value)}
              className="w-auto"
              disabled={loading}
            />
          </div>
        )}

        {/* Granularity Filter */}
        <DropDownFilter
          options={filteredGranularityOptions}
          placeholder="Granularity"
          value={filters.granularity}
          onChange={handleGranularityChange}
        />

        {/* Campaign Filter */}
        <FilterPopover
          icon={<Target className="w-4 h-4" />}
          label="Campaigns"
          title="Filter by Campaign"
          items={campaignData.map((campaign) => campaign.campaignName)}
          selectedItems={filters.selectedCampaigns}
          onItemsChange={handleCampaignSelectionChange}
          disabled={loading}
        />

        {/* Mailbox Filter */}
        <FilterPopover
          icon={<Mail className="w-4 h-4" />}
          label="Mailboxes"
          title="Filter by Mailbox"
          items={mailboxes.map((mailbox) => mailbox.name)}
          selectedItems={filters.selectedMailboxes}
          onItemsChange={handleMailboxSelectionChange}
          disabled={loading}
        />

        {/* Metrics Visibility Filter */}
        <FilterPopover
          icon={<Settings className="w-4 h-4" />}
          label="Metrics"
          title="Show/Hide Metrics"
          items={standardizedMetrics.map((metric) => metric.label)}
          selectedItems={standardizedMetrics
            .filter((metric) => filters.visibleMetrics.includes(metric.key))
            .map((metric) => metric.label)}
          onItemsChange={(items) => {
            const selectedKeys = standardizedMetrics
              .filter((metric) => items.includes(metric.label))
              .map((metric) => metric.key);
            handleMetricsVisibilityChange(selectedKeys);
          }}
          disabled={loading}
        />
      </div>
    </Filter>
  );
}

function FilterPopover({
  icon,
  label,
  title,
  items,
  selectedItems = [],
  onItemsChange,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  items: string[];
  selectedItems?: string[];
  onItemsChange?: (items: string[]) => void;
  disabled?: boolean;
}) {
  const handleItemToggle = (item: string) => {
    if (!onItemsChange || disabled) return;

    const newItems = selectedItems.includes(item)
      ? selectedItems.filter((i) => i !== item)
      : [...selectedItems, item];

    onItemsChange(newItems);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center space-x-2"
          disabled={disabled}
        >
          {icon}
          <span>{label}</span>
          {selectedItems.length > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {selectedItems.length}
            </span>
          )}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">{title}</h4>
          {selectedItems.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onItemsChange?.([])}
              className="text-xs"
            >
              Clear All
            </Button>
          )}
        </div>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div key={item} className="flex items-center space-x-2">
              <Checkbox
                id={item}
                checked={selectedItems.includes(item)}
                onCheckedChange={() => handleItemToggle(item)}
                disabled={disabled}
              />
              <Label htmlFor={item} className="text-sm flex-1">
                {item}
              </Label>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default MigratedPerformanceFilter;
