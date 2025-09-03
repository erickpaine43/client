import StatsCard from "@/components/common/StatsCard";
import { statsCards } from "@/lib/data/stats.mock";

async function StatsCards() {
  return (
    <>
      {statsCards.map((item) => (
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
