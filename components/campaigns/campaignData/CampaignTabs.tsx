"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCampaignLeads, getSequenceSteps } from "@/lib/actions/dashboard";
import { BarChart3, Mail, Users } from "lucide-react";
import { useState, useEffect } from "react";

function CampaignTabs({ children }: { children?: React.ReactNode }) {
  const [sequencesCount, setSequencesCount] = useState(0);
  const [leadsCount, setLeadsCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const [sequenceData, leadsData] = await Promise.all([
        getSequenceSteps(),
        getCampaignLeads(),
      ]);
      setSequencesCount(sequenceData.length);
      setLeadsCount(leadsData.length);
    };
    fetchData();
  }, []);

  const tabs = [
    {
      id: "sequence",
      label: "Sequence",
      icon: Mail,
      count: sequencesCount,
    },
    { id: "stats", label: "Stats", icon: BarChart3 },
    { id: "leads", label: "Leads", icon: Users, count: leadsCount },
  ];
  return (
    <Tabs defaultValue="sequence" className="w-full ">
      <TabsList className="flex space-x-8 px-0 bg-transparent border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="py-4 px-1 
                data-[state=active]:shadow-none
                data-[state=inactive]:border-none
                data-[state=active]:border-b-2 
                border-x-0 border-t-0
                rounded-none
                font-medium text-sm transition-colors flex items-center space-x-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 border-transparent text-muted-foreground hover:text-foreground bg-transparent"
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count && (
                <span className="ml-1 px-2 py-1 text-xs bg-muted dark:bg-muted/60 text-foreground rounded-full">
                  {tab.count}
                </span>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {children}
    </Tabs>
  );
}
export default CampaignTabs;
