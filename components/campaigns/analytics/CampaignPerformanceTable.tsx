import { Progress } from "@/components/ui/progress";
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
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
// NOTE: Migration change: prefer core PerformanceMetrics from the new core types.
// This component accepts either the legacy display shape (temporary) or the
// canonical PerformanceMetrics shape. We normalize defensively here to avoid
// unsafe `as` casts and rely on AnalyticsCalculator for rate calculations.
import { PerformanceMetrics } from "@/types/analytics/core";
import { CampaignPerformanceData } from "@/types";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";

interface CampaignPerformanceTableProps {
  // Accept either legacy CampaignPerformanceData (precomputed rates)
  // or the new PerformanceMetrics (raw counts) coming from the analytics context.
  data: Array<PerformanceMetrics | CampaignPerformanceData>;
}

function CampaignPerformanceTable({ data }: CampaignPerformanceTableProps) {
  // Normalized row shape used by the table UI
  type NormalizedRow = {
    name: string;
    sent: number;
    opens: number | null;
    clicks: number | null;
    replies: number;
    bounced: number;
    openRate: number; // percent (0..100)
    replyRate: number; // percent (0..100)
  };

  const isLegacy = (it: unknown): it is CampaignPerformanceData => {
    const obj = it as Record<string, unknown> | null;
    return Boolean(
      obj && typeof obj.openRate === "number" && typeof obj.name === "string"
    );
  };

  const formatPercent = (d: number) => Math.round(d * 1000) / 10; // 1 decimal

  const normalize = (item: unknown): NormalizedRow => {
    if (isLegacy(item)) {
      // legacy precomputed rates — keep display values as-is
      return {
        name: item.name,
        sent: Number(item.sent ?? 0),
        opens: item.opens ?? null,
        clicks: item.clicks ?? null,
        replies: Number(item.replies ?? 0),
        bounced: Number(item.bounced ?? 0),
        openRate: Number(item.openRate ?? 0),
        replyRate: Number(item.replyRate ?? 0),
      };
    }

    // Treat as core PerformanceMetrics (defensive extraction)
    // Safely type the item with all possible properties we might access
    const pm: Partial<PerformanceMetrics & { name?: string; id?: string }> = item || {};
    const safeMetrics: PerformanceMetrics = {
      sent: Number(pm.sent ?? 0),
      delivered: Number(pm.delivered ?? 0),
      opened_tracked: Number(pm.opened_tracked ?? 0),
      clicked_tracked: Number(pm.clicked_tracked ?? 0),
      replied: Number(pm.replied ?? 0),
      bounced: Number(pm.bounced ?? 0),
      unsubscribed: Number(pm.unsubscribed ?? 0),
      spamComplaints: Number(pm.spamComplaints ?? 0),
    };

    const rates = AnalyticsCalculator.calculateAllRates(safeMetrics);

    return {
      name: pm.name ?? (typeof pm.id === 'string' ? pm.id : "—"),
      sent: safeMetrics.sent,
      opens: safeMetrics.opened_tracked ?? 0,
      clicks: safeMetrics.clicked_tracked ?? 0,
      replies: safeMetrics.replied ?? 0,
      bounced: safeMetrics.bounced ?? 0,
      openRate: formatPercent(rates.openRate),
      replyRate: formatPercent(rates.replyRate),
    };
  };

  const rows = (data || []).map((d) => normalize(d));
  return (
    <>
      <>
        <div className="overflow-x-auto">
          <TooltipProvider>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Opens</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Replies</TableHead>
                  <TableHead>Bounced</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Open Rate
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Shows percent based on total emails sent. Bar fills
                            from 0% to 100%.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Reply Rate
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Shows percent based on total emails sent. Bar fills
                            only up to 10%. If reply rate is above 10%, bar will
                            still show full but number will be correct.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((campaign, index) => (
                  <TableRow key={index} className={cn("hover:bg-muted/50")}>
                    <TableCell className="font-medium">
                      {campaign.name}
                    </TableCell>
                    <TableCell>{campaign.sent.toLocaleString()}</TableCell>
                    <TableCell>
                      {campaign.opens === 0 || campaign.opens === null ? (
                        <span className="text-xs text-muted-foreground">
                          Not tracked
                        </span>
                      ) : (
                        campaign.opens.toLocaleString()
                      )}
                    </TableCell>
                    <TableCell>
                      {campaign.clicks === 0 || campaign.clicks === null ? (
                        <span className="text-xs text-muted-foreground">
                          Not tracked
                        </span>
                      ) : (
                        campaign.clicks.toLocaleString()
                      )}
                    </TableCell>
                    <TableCell>{campaign.replies.toLocaleString()}</TableCell>
                    <TableCell>
                      {campaign.bounced?.toLocaleString() || "0"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress value={campaign.openRate} />
                        <span className="text-sm font-medium">
                          {campaign.openRate}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress
                          value={campaign.replyRate * 10}
                          className={cn("flex-1 h-2", "[&>div]:bg-green-500")}
                        />
                        <span className="text-sm font-medium">
                          {campaign.replyRate}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TooltipProvider>
        </div>
      </>
    </>
  );
}

export default CampaignPerformanceTable;
