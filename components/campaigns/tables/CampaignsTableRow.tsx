import { Clock, Pause, Play, Server } from "lucide-react";
import CampaignsActions, { CampaignActionsEnum } from "./CampaignsActions";
import { CampaignDisplay } from "@/types";

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400";
    case "paused":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400";
    case "completed":
      return "bg-muted/50 text-foreground dark:bg-muted/30 dark:text-muted-foreground";
    default:
      return "bg-muted/50 text-foreground dark:bg-muted/30 dark:text-muted-foreground";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <Play className="w-3 h-3" />;
    case "paused":
      return <Pause className="w-3 h-3" />;
    default:
      return <Clock className="w-3 h-3" />;
  }
};
function CampaignsTableRow({ campaign }: { campaign: CampaignDisplay }) {
  const actions = [
    "VIEW",
    "EDIT",
    campaign.status === "active" ? "PAUSE" : "RESUME",
    "COPY",
    "DELETE",
  ] as (keyof typeof CampaignActionsEnum)[];
  return (
    <tr
      key={campaign.id}
      className="hover:bg-muted/50 dark:hover:bg-muted/30 transition-colors group"
    >
      <td className="px-8 py-6">
        <div>
          <h3 className="font-semibold text-foreground cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-lg">
            {campaign.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {campaign.leadsSent} leads sent • {campaign.replies} replies
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Created: {new Date(campaign.createdDate).toLocaleDateString()}
          </p>
        </div>
      </td>
      <td className="px-6 py-6">
        <span
          className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(
            campaign.status
          )}`}
        >
          {getStatusIcon(campaign.status)}
          <span className="capitalize">{campaign.status}</span>
        </span>
      </td>
      <td className="px-6 py-6">
        <div className="flex items-center space-x-2">
          <Server className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {campaign.mailboxes} mailboxes
          </span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {campaign.assignedMailboxes
            .slice(0, 2)
            .map((email) => email.split("@")[0])
            .join(", ")}
          {campaign.assignedMailboxes.length > 2 &&
            ` +${campaign.assignedMailboxes.length - 2} more`}
        </div>
      </td>
      <td className="px-6 py-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-foreground">
              {campaign.openRate}
            </span>
            <span className="text-xs text-muted-foreground">open rate</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              {campaign.replyRate}
            </span>
            <span className="text-xs text-muted-foreground">reply rate</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-6 text-sm text-muted-foreground">
        {campaign.lastSent}
      </td>
      <td className="px-6 py-6 text-right ">
        <CampaignsActions campaignId={campaign.id} actions={actions} />
      </td>
    </tr>
  );
}
export default CampaignsTableRow;
