import React from "react";
import KpiCard from "@/components/analytics/cards/StatsCard";
import { StatsCardData } from "@/types/campaign";

interface KpiCardsProps {
  cards: StatsCardData[];
}

function KpiCards({ cards }: KpiCardsProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 ">
      {cards.map((card) => (
        <KpiCard
          key={card.title}
          title={card.title}
          value={card.value}
          icon={card.icon}
          color={`${card.color} text-white`}
        />
      ))}
    </div>
  );
}
export default KpiCards;
