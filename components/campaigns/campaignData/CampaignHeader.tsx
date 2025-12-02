import CampaignsActions, {
  CampaignActionsEnum,
} from "../tables/CampaignsActions";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import BackArrow from "@/components/ui/custom/BackArrow";
import { CampaignDisplay } from "@/types";

function CampaignHeader({
  children,
  campaign,
  backArrow = false,
}: {
  children: ReactNode;
  campaign: CampaignDisplay;
  backArrow?: boolean;
}) {
  const actions = ["EDIT"] as (keyof typeof CampaignActionsEnum)[];

  return (
    <div className="px-6 py-4 border-b border-border flex flex-col gap-4">
      {backArrow && (
        <div className="self-end">
          <BackArrow />
        </div>
      )}
      <div className="flex items-center justify-between">
        {children}
        <div className="flex items-center space-x-4 mt-1">
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
              campaign.status === "active"
                ? "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400"
                : campaign.status === "paused"
                  ? "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-400"
                  : "bg-muted dark:bg-muted/60 text-foreground"
            )}
          >
            {campaign.status}
          </span>
          <span className="text-sm text-muted-foreground">
            {campaign.leadsSent} leads sent
          </span>
          <span className="text-sm text-muted-foreground">
            {campaign.replies} replies
          </span>
          <span className="text-sm text-muted-foreground">
            Last sent {campaign.lastSent}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <CampaignsActions campaignId={campaign.id} actions={actions} />
        </div>
      </div>
    </div>
  );
}
export default CampaignHeader;
