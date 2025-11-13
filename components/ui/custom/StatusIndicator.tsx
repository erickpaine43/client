import React from "react";
import { DisplayStatus } from "@/types/common";
import { CampaignStatus } from "@/types/campaign";

interface StatusIndicatorProps {
  status: CampaignStatus;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  let colorClass = "";
  let textClass = "";
  let displayText: DisplayStatus = "Draft"; // Default value that matches the type

  switch (status) {
    case "ACTIVE":
      colorClass = "bg-green-100 dark:bg-green-500/20";
      textClass = "text-green-800 dark:text-green-400";
      displayText = "Running";
      break;
    case "PAUSED":
      colorClass = "bg-yellow-100 dark:bg-yellow-500/20";
      textClass = "text-yellow-800 dark:text-yellow-400";
      displayText = "Paused";
      break;
    case "DRAFT":
      colorClass = "bg-blue-100 dark:bg-blue-500/20";
      textClass = "text-blue-800 dark:text-blue-400";
      displayText = "Draft";
      break;
    case "COMPLETED":
      colorClass = "bg-muted/50 dark:bg-muted/30";
      textClass = "text-foreground dark:text-muted-foreground";
      displayText = "Completed";
      break;
    case "ARCHIVED":
      colorClass = "bg-muted dark:bg-muted/50";
      textClass = "text-muted-foreground";
      displayText = "Archived";
      break;
    default:
      colorClass = "bg-muted/50 dark:bg-muted/30";
      textClass = "text-foreground dark:text-muted-foreground";
  }

  // Using a slightly different style than the simple dot to match modern UI trends, but keeping the color coding.
  // The screenshot shows a simple dot, this uses a badge style which is common.
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${textClass}`}
    >
      {displayText}
    </span>
  );
};

export default StatusIndicator;
