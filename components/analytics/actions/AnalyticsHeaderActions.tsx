"use client";

import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnalytics } from "@/context/AnalyticsContext";

function AnalyticsHeaderActions() {
  const { dateRange, setDateRange, chartData } = useAnalytics();

  const handleRefresh = () => {
    // Trigger refresh by setting date range to itself (react-hooks will re-run useMemo)
    setDateRange(dateRange);
    console.log("Analytics data refreshed");
  };

  const handleExport = () => {
    // Mock export: create CSV from chartData
    const csv = [
      "Date,Sent,Opens,Clicks",
      ...chartData.map(d => `${d.date},${d.sent},${d.opens},${d.clicks}`)
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analytics-data.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center space-x-3">
      <Button variant="outline" onClick={handleRefresh}>
        <RefreshCw className="w-4 h-4" />
      </Button>
      <Button onClick={handleExport}>
        <Download className="w-4 h-4" />
        <span>Export</span>
      </Button>
    </div>
  );
}
export default AnalyticsHeaderActions;
