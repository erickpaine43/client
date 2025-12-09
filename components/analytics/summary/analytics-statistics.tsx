import { Eye, Mail, MousePointer, Reply } from "lucide-react";
import { UnifiedStatsCard } from "@/components/design-system/components/unified-stats-card";

function AnalyticsStatistics({
  totalSent,
  openRate,
  replyRate,
  clickRate,
}: {
  totalSent: number | string;
  openRate: number | string;
  replyRate: number | string;
  clickRate: number | string;
}) {
  const cards = [
    {
      id: "total-sent",
      title: "Total Sent",
      value: totalSent,
      icon: Mail,
      color: "info" as const,
    },
    {
      id: "open-rate",
      title: "Open Rate",
      value: `${openRate}%`,
      icon: Eye,
      color: "primary" as const,
    },
    {
      id: "reply-rate",
      title: "Reply Rate",
      value: `${replyRate}%`,
      icon: Reply,
      color: "success" as const,
    },
    {
      id: "click-rate",
      title: "Click Rate",
      value: `${clickRate}%`,
      icon: MousePointer,
      color: "warning" as const,
    },
  ];
  return cards.map((card) => (
    <UnifiedStatsCard
      key={card.id}
      title={card.title}
      value={card.value}
      icon={card.icon}
      color={card.color}
    />
  ));
}
export default AnalyticsStatistics;
