"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAnalytics } from "@/context/AnalyticsContext";

// Type for smart insights items
type SmartInsightItem = {
  id: string;
  icon: React.ComponentType<{ className?: string }> | null;
  borderColor: string;
  iconBackground: string;
  iconColor: string;
  count: string | number;
  label: string;
};
function SmartInsights() {
  const { smartInsightsList } = useAnalytics();
  return (
    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Smart Insights
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {(smartInsightsList as SmartInsightItem[]).map((item) => {
          const IconComponent = item.icon;
          return (
            <Card key={item.id} className={cn(item.borderColor, "p-1")}>
              <CardContent className="flex items-center space-x-3 p-4">
                <div className={cn("rounded-lg p-1.5", item.iconBackground)}>
                  {IconComponent && (
                    <IconComponent className={cn("w-4 h-4 ", item.iconColor)} />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {item.count}
                  </p>
                  <h3 className="text-sm font-medium text-gray-600">
                    {item.label}
                  </h3>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
export default SmartInsights;
