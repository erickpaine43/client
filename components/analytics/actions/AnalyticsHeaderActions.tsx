"use client";

import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { useAnalytics, useDomainAnalytics } from "@/context/AnalyticsContext";
import { ChartDataPoint } from "@/types/analytics/ui";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";
import { useState, useEffect } from "react";
import { TimeSeriesDataPoint } from "@/types/analytics/core";
import { CampaignAnalyticsService } from "@/lib/services/analytics/CampaignAnalyticsService";

function AnalyticsHeaderActions() {
  const { filters, refreshAll } = useAnalytics();
  const { service } = useDomainAnalytics("campaigns");
  const campaignService = service as CampaignAnalyticsService;
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // Fetch chart data for export
  useEffect(() => {
    async function fetchChartData() {
      if (!campaignService) return;

      try {
        const dataFilters = {
          dateRange: {
            start:
              filters.customDateRange?.start ||
              new Date(
                Date.now() -
                  (filters.dateRange === "7d"
                    ? 7
                    : filters.dateRange === "30d"
                      ? 30
                      : 90) *
                    24 *
                    60 *
                    60 *
                    1000
              )
                .toISOString()
                .split("T")[0],
            end:
              filters.customDateRange?.end ||
              new Date().toISOString().split("T")[0],
          },
          entityIds:
            filters.selectedCampaigns.length > 0
              ? filters.selectedCampaigns
              : undefined,
        };

        const timeSeriesData = await campaignService.getTimeSeriesData(
          filters.selectedCampaigns.length > 0 ? filters.selectedCampaigns : [],
          dataFilters,
          "day",
          undefined
        );

        const formattedData = timeSeriesData.map(
          (point: TimeSeriesDataPoint) => {
            const rates = AnalyticsCalculator.calculateAllRates(point.metrics);

            return {
              name: point.label,
              date: point.date,
              sent: point.metrics.sent,
              opened_tracked: point.metrics.opened_tracked,
              clicked_tracked: point.metrics.clicked_tracked,
              replied: point.metrics.replied,
              openRate: rates.openRate * 100,
              clickRate: rates.clickRate * 100,
              replyRate: rates.replyRate * 100,
            };
          }
        );

        setChartData(formattedData);
      } catch (error) {
        console.error("Failed to fetch chart data for export:", error);
        setChartData([]);
      }
    }

    fetchChartData();
  }, [filters, campaignService]);

  const handleRefresh = async () => {
    try {
      await refreshAll();
      console.log("Analytics data refreshed");
    } catch (error) {
      console.error("Failed to refresh analytics:", error);
    }
  };

  const handleExport = () => {
    if (chartData.length === 0) {
      console.warn("No data available for export");
      return;
    }

    // Create CSV with standardized field names
    const csv = [
      "Date,Sent,Opens,Clicks,Replies,Open Rate,Click Rate,Reply Rate",
      ...chartData.map(
        (d) =>
          `${d.date},${d.sent},${d.opened_tracked},${d.clicked_tracked},${d.replied},${AnalyticsCalculator.formatRateAsPercentage(Number(d.openRate) / 100)},${AnalyticsCalculator.formatRateAsPercentage(Number(d.clickRate) / 100)},${AnalyticsCalculator.formatRateAsPercentage(Number(d.replyRate) / 100)}`
      ),
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
      <Button onClick={handleExport} disabled={chartData.length === 0}>
        <Download className="w-4 h-4" />
        <span>Export</span>
      </Button>
    </div>
  );
}
export default AnalyticsHeaderActions;
