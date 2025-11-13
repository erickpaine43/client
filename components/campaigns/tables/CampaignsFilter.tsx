"use client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, CheckIcon, Search, Server, X } from "lucide-react";
import { useState } from "react";
import DatePicker from "../../ui/custom/DatePicker";
import { availableMailboxes } from "@/lib/data/campaigns";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

enum CampaignStatus {
  All = "all",
  Active = "active",
  Paused = "paused",
  Completed = "completed",
}
enum DateRange {
  AllTime = "all",
  Today = "today",
  ThisWeek = "week",
  ThisMonth = "month",
  ThisQuarter = "quarter",
  Custom = "custom",
}
function CampaignsFilter() {
  const [status, setStatus] = useState<CampaignStatus | undefined>(undefined);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [selectedMailboxes, setSelectedMailboxes] = useState<string[]>([]);
  const [isMailboxOpen, setIsMailboxOpen] = useState(false);

  const handleMailboxChange = (mailbox: string, checked: boolean) => {
    if (checked) {
      setSelectedMailboxes((prev) => [...prev, mailbox]);
    } else {
      setSelectedMailboxes((prev) => prev.filter((m) => m !== mailbox));
    }
  };

  const removeMailbox = (mailbox: string) => {
    setSelectedMailboxes((prev) => prev.filter((m) => m !== mailbox));
  };

  const clearAllMailboxes = () => {
    setSelectedMailboxes([]);
  };

  return (
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center bg-card dark:bg-card p-4 rounded-lg shadow border border-border gap-4">
      <div className="flex items-center space-x-2 border border-border shadow-sm rounded-lg px-2 bg-muted/50 dark:bg-muted/30 peer-focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 w-full lg:w-auto">
        <Search className="text-muted-foreground w-5 h-5" />
        <Input
          type="text"
          placeholder="Search campaigns..."
          className="w-full lg:max-w-md border-none shadow-none focus-visible:border-none focus-visible:ring-0 peer"
          onChange={(_e) => {
            /* Handle search input */
          }}
        />
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-2">
        <Select
          value={status}
          onValueChange={(e) => setStatus(e as CampaignStatus)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select a Status" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(CampaignStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={dateRange}
          onValueChange={(e) => setDateRange(e as DateRange)}
        >
          <SelectTrigger className="w-full sm:w-auto">
            <Calendar />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[
              { value: DateRange.AllTime, label: "All Time" },
              { value: DateRange.Today, label: "Today" },
              { value: DateRange.ThisWeek, label: "This Week" },
              { value: DateRange.ThisMonth, label: "This Month" },
              { value: DateRange.ThisQuarter, label: "This Quarter" },
            ].map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
            <div
              onClick={() => setDateRange(DateRange.Custom)}
              className="cursor-pointer hover:bg-accent dark:hover:bg-accent p-2 rounded text-sm flex justify-between"
            >
              <span>Custom Date</span>
              {dateRange === DateRange.Custom && (
                <CheckIcon className="size-4 text-muted-foreground" />
              )}
            </div>
            {dateRange === DateRange.Custom && (
              <div className="mt-2 flex flex-col gap-2">
                <DatePicker
                  date={startDate}
                  label="Start Date"
                  calendarProps={{
                    defaultMonth: startDate,
                    selected: startDate,
                    onSelect: setStartDate,
                    captionLayout: "dropdown",
                    navLayout: "after",
                    mode: "single",
                  }}
                />
                <DatePicker
                  date={endDate}
                  label="End Date"
                  calendarProps={{
                    defaultMonth: endDate,
                    selected: endDate,
                    onSelect: setEndDate,
                    captionLayout: "dropdown",
                    navLayout: "after",
                    mode: "single",
                  }}
                />
              </div>
            )}
          </SelectContent>
        </Select>
        <Popover open={isMailboxOpen} onOpenChange={setIsMailboxOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full sm:w-auto justify-start text-muted-foreground"
            >
              <Server className="w-4 h-4 mr-2" />
              {selectedMailboxes.length === 0
                ? "Select Mailboxes"
                : `${selectedMailboxes.length} selected`}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80 p-0">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Select Mailboxes</h4>
                {selectedMailboxes.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllMailboxes}
                    className="h-auto p-1 text-xs"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              {selectedMailboxes.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {selectedMailboxes.map((mailbox) => (
                      <div
                        key={mailbox}
                        className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded"
                      >
                        {mailbox}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                          onClick={() => removeMailbox(mailbox)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2 max-h-50 overflow-y-auto ">
                {availableMailboxes.map((mailbox) => (
                  <div
                    key={mailbox}
                    className={cn("flex items-center space-x-2", {
                      "opacity-50": !selectedMailboxes.includes(mailbox),
                    })}
                  >
                    <Checkbox
                      id={mailbox}
                      checked={selectedMailboxes.includes(mailbox)}
                      onCheckedChange={(checked) =>
                        handleMailboxChange(mailbox, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={mailbox}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {mailbox}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

export default CampaignsFilter;
