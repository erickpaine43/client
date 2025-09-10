import { domains, mailboxes } from "@/lib/data/domains.mock";
import { Globe, Mail, Server, Zap } from "lucide-react";

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
      return "bg-gray-100 text-gray-800";
  }
};

export const tabs = [
  { id: "", label: "Domains", count: domains.length, icon: Globe },
  { id: "mailboxes", label: "Mailboxes", count: mailboxes.length, icon: Mail },
  {
    id: "warmup",
    label: "Warmup Hub",
    count: mailboxes.filter((m) => m.warmupStatus !== "WARMED").length,
    icon: Zap,
  },
  {
    id:"ip-manager", label: "IP Manager", count: 0, icon: Server
  }
];
