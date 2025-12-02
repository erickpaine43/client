import React from "react";
import { UnifiedStatsCard } from "@/components/design-system/components/unified-stats-card";
import { StatsCardData } from "@/types/campaign";

interface KpiCardsProps {
  cards: StatsCardData[];
}

function KpiCards({ cards }: KpiCardsProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 ">
      {cards.map((card) => (
        <UnifiedStatsCard
          key={card.title}
          title={card.title}
          value={card.value}
          icon={card.icon}
          color={card.color as "primary" | "secondary" | "success" | "warning" | "error" | "info"}
        />
      ))}
    </div>
  );
}
export default KpiCards;
