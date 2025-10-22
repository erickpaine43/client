import StatsCard from "@/components/analytics/cards/StatsCard";
import { LucideIcon } from "lucide-react";

interface StatsItem {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

interface StatsCardsProps {
  stats: StatsItem[];
}

function StatsCards({ stats }: StatsCardsProps) {
  return (
    <>
      {stats.map((item) => (
        <StatsCard
          className="flex-row-reverse justify-end gap-2 "
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
