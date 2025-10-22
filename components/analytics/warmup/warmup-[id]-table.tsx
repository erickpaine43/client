"use client";

import { DropDownFilter, Filter } from "@/components/ui/custom/Filter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar, Download, HelpCircle } from "lucide-react";
import { useAnalytics } from "@/context/AnalyticsContext";
import { WarmupChartData } from "@/types";

import type { ReactElement } from "react";

const headers = [
  { key: "date", label: "Date", tooltip: null },
  {
    key: "emailsWarmed",
    label: "Emails Warmed",
    tooltip:
      "The total number of warmup emails sent from your mailbox on this day.",
  },
  {
    key: "delivered",
    label: "Delivered",
    tooltip:
      "Emails that were successfully delivered to the inbox (not spam or bounced)",
  },
  {
    key: "spam",
    label: "Spam",
    tooltip:
      "Number of emails that first landed in the spam folder but were then rescued and moved to inbox.",
  },
  {
    key: "replies",
    label: "Replies",
    tooltip: "Number of warmup replies received by your mailbox for that day.",
  },
  {
    key: "bounce",
    label: "Bounce",
    tooltip:
      "Emails that failed to send (e.g. invalid addresses or server errors).",
  },
  {
    key: "healthScore",
    label: "Health Score",
    tooltip:
      "Daily score based on how many emails got delivered vs flagged as spam or bounced.",
  },
];
function WarmUpTable({
  mailboxId: _mailboxId,
}: {
  mailboxId: string;
}): ReactElement {
  const { warmupChartData } = useAnalytics();

  if (!warmupChartData || warmupChartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            No warmup data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Filter>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4" />
          <DropDownFilter
            placeholder="Select a date range"
            options={[
              { label: "Last 7 days", value: "7d" },
              {
                label: "Last 30 days",
                value: "30d",
              },
              {
                label: "Last 90 days",
                value: "90d",
              },
            ]}
          />
        </div>
        <div>
          <Button>
            <Download />
            Export CSV
          </Button>
        </div>
      </Filter>
      <Card>
        <CardHeader>
          <CardTitle>Daily Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((header) => (
                  <TableHead key={header.key}>
                    <div className="flex items-center gap-1">
                      {header.label}
                      {header.tooltip && (
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="w-3 h-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>{header.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {warmupChartData.map((stat: WarmupChartData) => (
                <TableRow key={stat.date}>
                  <TableCell>{stat.date}</TableCell>
                  <TableCell>{stat.totalWarmups}</TableCell>
                  <TableCell className="text-green-600">
                    {/* Placeholder - would need to calculate from context */}-
                  </TableCell>
                  <TableCell className="text-red-600">
                    {stat.spamFlags}
                  </TableCell>
                  <TableCell className="text-blue-600">
                    {stat.replies}
                  </TableCell>
                  <TableCell className="text-orange-600">
                    {/* Placeholder for bounce - not in WarmupChartData */}-
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-500">
                      {/* Placeholder - would need to calculate or fetch healthScore per period */}
                      N/A
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

export default WarmUpTable;
