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
import { DataGranularity } from "@/types/analytics/core";
import { DateRangePreset } from "@/types/analytics/ui";
import { CampaignAnalytics } from "@/types/analytics/domain-specific";
import { AnalyticsMetricConfig } from "@/types/analytics/ui";
import { ChevronDown, Mail, Settings, Target } from "lucide-react";
import { DropDownFilter, Filter } from "../../ui/custom/Filter";

interface MailboxFilter {
  id: string;
  name: string;
}

interface PerformanceFilterProps {
  campaignData: CampaignAnalytics[];
  mailboxes: MailboxFilter[];
  metrics: AnalyticsMetricConfig[];
}

const dateRangeOptions = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "1y", label: "Last year" },
  { value: "custom", label: "Custom range" },
];

const granularityOptions = [
  { value: "day", label: "Daily" },
  { value: "week", label: "Weekly" },
  { value: "month", label: "Monthly" },
];

function PerformanceFilter({
  campaignData,
  mailboxes,
  metrics,
}: PerformanceFilterProps) {
  const { filters } = useAnalytics();
  const {
    visibleMetrics,
    setVisibleMetrics,
    showCustomDate,
    setShowCustomDate,
    dateRange,
    setDateRange,
    granularity,
    setGranularity,
    allowedGranularities,
    customDateStart,
    setCustomDateStart,
    customDateEnd,
    setCustomDateEnd,
    selectedCampaigns,
    setSelectedCampaigns,
    selectedMailboxes,
    setSelectedMailboxes,
  } = filters;

  // Filter granularity options based on allowed granularities
  const filteredGranularityOptions = granularityOptions.filter((option) =>
    (allowedGranularities || []).includes(option.value as DataGranularity)
  );

  const handleDateRangeChange = (value: string) => {
    setDateRange?.(value as DateRangePreset);
    setShowCustomDate?.(value === "custom");
  };

  return (
    <Filter className="shadow-none  border-none">
      <div className="flex items-center space-x-2">
        {/* Date Range Filter */}
        <DropDownFilter
          options={dateRangeOptions}
          placeholder="Select date range"
          value={dateRange}
          onChange={handleDateRangeChange}
        />

        {/* Custom Date Picker */}
        {showCustomDate && (
          <div className="flex items-center space-x-2">
            <Input
              type="date"
              value={customDateStart}
              onChange={(e) => setCustomDateStart?.(e.target.value)}
              className="w-auto"
            />
            <span className="text-muted-foreground">to</span>
            <Input
              type="date"
              value={customDateEnd}
              onChange={(e) => setCustomDateEnd?.(e.target.value)}
              className="w-auto"
            />
          </div>
        )}

        {/* Granularity Filter */}
        <DropDownFilter
          options={filteredGranularityOptions}
          placeholder="Granularity"
          value={granularity}
          onChange={(value: string) =>
            setGranularity?.(value as DataGranularity)
          }
        />

        {/* Campaign Filter */}
        <FilterPopover
          icon={<Target className="w-4 h-4" />}
          label="Campaigns"
          title="Filter by Campaign"
          items={campaignData.map((campaign) => campaign.campaignName)}
          selectedItems={selectedCampaigns}
          onItemsChange={(items) => setSelectedCampaigns?.(items)}
        />

        {/* Mailbox Filter */}
        <FilterPopover
          icon={<Mail className="w-4 h-4" />}
          label="Mailboxes"
          title="Filter by Mailbox"
          items={mailboxes.map((mailbox) => mailbox.name)}
          selectedItems={selectedMailboxes}
          onItemsChange={(items) => setSelectedMailboxes?.(items)}
        />

        {/* Metrics Visibility Filter */}
        <FilterPopover
          icon={<Settings className="w-4 h-4" />}
          label="Metrics"
          title="Show/Hide Metrics"
          items={metrics.map((metric) => metric.label)}
          selectedItems={metrics
            .filter((metric) => (visibleMetrics || []).includes(metric.key))
            .map((metric) => metric.label)}
          onItemsChange={(items: string[]) => {
            const newVisibleMetrics = metrics
              .filter((metric) => items.includes(metric.label))
              .map((metric) => metric.key);
            setVisibleMetrics?.(newVisibleMetrics);
          }}
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
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  items: string[];
  selectedItems?: string[];
  onItemsChange?: (items: string[]) => void;
}) {
  const handleItemToggle = (item: string) => {
    if (!onItemsChange) return;

    const newItems = selectedItems.includes(item)
      ? selectedItems.filter((i) => i !== item)
      : [...selectedItems, item];

    onItemsChange(newItems);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          {icon}
          <span>{label}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium">{title}</h4>
        </div>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item} className="flex items-center space-x-2">
              <Checkbox
                id={item}
                checked={selectedItems.includes(item)}
                onCheckedChange={() => handleItemToggle(item)}
              />
              <Label htmlFor={item} className="text-sm">
                {item}
              </Label>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default PerformanceFilter;
