import { UnifiedStatsCard } from "@/components/design-system/components/unified-stats-card";
import { LucideIcon } from "lucide-react";

interface StatsItem {
  title: string;
  value: string;
  icon: LucideIcon;
  color: "primary" | "secondary" | "success" | "warning" | "error" | "info";
}

interface StatsCardsProps {
  stats: StatsItem[];
}

function StatsCards({ stats }: StatsCardsProps) {
  return (
    <>
      {stats.map((item) => (
        <UnifiedStatsCard
          key={item.title}
          title={item.title}
          value={item.value}
          icon={item.icon}
          color={item.color}
        />
      ))}
    </>
  );
}
export default StatsCards;
