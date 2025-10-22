"use client";

import { Eye, Mail, MousePointer, Reply, CheckCircle } from "lucide-react";
import { KPIDisplayConfig } from "@/types/analytics/ui";
import MigratedStatsCard from "./MigratedStatsCard";

interface MigratedAnalyticsStatisticsProps {
  kpiConfigs: KPIDisplayConfig[];
}

/**
 * Migrated Analytics Statistics component using KPIDisplayConfig interface.
 * Displays standardized KPI cards with proper color coding and benchmarks.
 */
function MigratedAnalyticsStatistics({
  kpiConfigs,
}: MigratedAnalyticsStatisticsProps) {
  // Icon mapping for different KPI types
  const getIconForKPI = (id: string) => {
    switch (id) {
      case "total-sent":
        return Mail;
      case "open-rate":
        return Eye;
      case "click-rate":
        return MousePointer;
      case "reply-rate":
        return Reply;
      case "delivery-rate":
        return CheckCircle;
      default:
        return Mail;
    }
  };

  // Color mapping for KPI cards
  const getColorForKPI = (color?: KPIDisplayConfig["color"]) => {
    switch (color) {
      case "positive":
        return "bg-green-100 text-green-600";
      case "warning":
        return "bg-yellow-100 text-yellow-600";
      case "danger":
        return "bg-red-100 text-red-600";
      case "neutral":
      default:
        return "bg-blue-100 text-blue-600";
    }
  };

  return (
    <>
      {kpiConfigs.map((kpi) => (
        <MigratedStatsCard
          key={kpi.id}
          title={kpi.name}
          value={kpi.displayValue}
          icon={getIconForKPI(kpi.id)}
          color={getColorForKPI(kpi.color)}
          target={kpi.target}
          rawValue={kpi.rawValue}
          unit={kpi.unit}
          trend={kpi.trend}
          change={kpi.change}
          changeType={kpi.changeType}
        />
      ))}
    </>
  );
}

export default MigratedAnalyticsStatistics;
