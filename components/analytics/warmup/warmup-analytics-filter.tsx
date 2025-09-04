import { DropDownFilter, Filter } from "@/components/ui/custom/Filter";
import Icon from "@/components/ui/custom/Icon";
import { Calendar, Filter as FilterIcon } from "lucide-react";
import { useAnalytics } from "@/context/AnalyticsContext";
import { DataGranularity, DateRangePreset } from "@/types";

const dateRangeOptions = [
  { label: "Last 7 days", value: "7d" as DateRangePreset },
  { label: "Last 30 days", value: "30d" as DateRangePreset },
  { label: "Last 90 days", value: "90d" as DateRangePreset },
  { label: "Last 1 Year", value: "1y" as DateRangePreset },
];

const granularityOptions = [
  { label: "Daily", value: "day" as DataGranularity },
  { label: "Weekly", value: "week" as DataGranularity },
  { label: "Monthly", value: "month" as DataGranularity },
];

function WarmupAnalyticsFilter() {
  const { dateRange, setDateRange, granularity, setGranularity, allowedGranularities } = useAnalytics();

  const handleDateRangeChange = (value: string) => {
    setDateRange(value as DateRangePreset);
  };

  const handleGranularityChange = (value: string) => {
    setGranularity(value as DataGranularity);
  };

  // Filter granularity options to only show allowed ones
  const availableGranularityOptions = granularityOptions.filter(option =>
    allowedGranularities.includes(option.value)
  );

  return (
    <Filter className="shadow-none border-none ">
      <div className="flex items-center space-x-4 ml-auto">
        <div className="flex items-center space-x-4 ">
          <Icon icon={Calendar} className="text-gray-500 w-5  h-5" />
          <DropDownFilter
            placeholder="Select date range"
            options={dateRangeOptions}
            value={dateRange}
            onChange={handleDateRangeChange}
          />
        </div>
        <div className="flex items-center space-x-4">
          <Icon icon={FilterIcon} className="text-gray-500 w-5  h-5" />
          <DropDownFilter
            placeholder="Select granularity"
            options={availableGranularityOptions}
            value={granularity}
            onChange={handleGranularityChange}
          />
        </div>
      </div>
    </Filter>
  );
}
export default WarmupAnalyticsFilter;
