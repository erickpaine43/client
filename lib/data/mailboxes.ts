import { Mail, Zap } from "lucide-react";
import {mailboxes as mailboxesMock} from "@/lib/data/domains.mock";
export const mailboxes = [
  {
    id: "1",
    email: "john@mycompany.com",
    name: "John Doe",
    status: "ready",
    dailyLimit: 50,
    reputation: "excellent",
  },
  {
    id: "2",
    email: "sarah@mycompany.com",
    name: "Sarah Smith",
    status: "ready",
    dailyLimit: 30,
    reputation: "good",
  },
  {
    id: "3",
    email: "mike@mycompany.com",
    name: "Mike Johnson",
    status: "warming",
    dailyLimit: 25,
    reputation: "building",
  },
];
  
export const tabs = [
  { id: "mailboxes", label: "Mailboxes", count: mailboxesMock.length, icon: Mail },
  {
    id: "warmup",
    label: "Warmup Hub",
    count: mailboxesMock.filter((m) => m.warmupStatus !== "WARMED").length,
    icon: Zap,
  },
]
