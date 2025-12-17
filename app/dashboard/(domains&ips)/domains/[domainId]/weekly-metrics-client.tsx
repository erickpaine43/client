"use client";

import { CardContent } from "@/components/ui/card";
import { useAnalytics } from "@/context/AnalyticsContext";

export default function WeeklyMetricsClient() {
  const { chartData } = useAnalytics();
  return (
    <CardContent>
      <div className="h-[200px] flex items-center justify-center text-muted-foreground">
        Charts using AnalyticsContext: {chartData.length} data points
      </div>
    </CardContent>
  );
}
