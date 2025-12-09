import { domains } from "@/lib/data/domains.mock";
import { Globe, Server } from "lucide-react";

export const getStatusColor = (status: string) => {
  switch (status) {
    case "verified":
    case "active":
    case "WARMED":
      return "bg-green-100 text-green-800";
    case "pending":
    case "WARMING":
      return "bg-orange-100 text-orange-800";
    case "NOT_STARTED":
    case "failed":
    case "PAUSED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 dark:bg-muted text-gray-800 dark:text-foreground";
  }
};

export const tabs = [
  { id: "domains", label: "Domains", count: domains.length, icon: Globe },

  {
    id:"ip-manager", label: "IP Manager", count: 0, icon: Server
  }
];
