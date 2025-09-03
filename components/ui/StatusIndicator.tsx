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
      colorClass = "bg-green-100";
      textClass = "text-green-800";
      displayText = "Running";
      break;
    case "PAUSED":
      colorClass = "bg-yellow-100";
      textClass = "text-yellow-800";
      displayText = "Paused";
      break;
    case "DRAFT":
      colorClass = "bg-blue-100";
      textClass = "text-blue-800";
      displayText = "Draft";
      break;
    case "COMPLETED":
      colorClass = "bg-gray-100";
      textClass = "text-gray-800";
      displayText = "Completed";
      break;
    case "ARCHIVED":
      colorClass = "bg-gray-200";
      textClass = "text-gray-800";
      displayText = "Archived";
      break;
    default:
      colorClass = "bg-gray-100";
      textClass = "text-gray-800";
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
