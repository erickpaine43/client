// ============================================================================
// REFRESH CONTROLS - Real-time indicator and refresh controls for billing dashboard
// ============================================================================

"use client";

import React from "react";
import { Button } from "@/components/ui/button/button";
import { RefreshCw } from "lucide-react";

/**
 * Props for the RefreshControls component.
 */
interface RefreshControlsProps {
  isRealTime: boolean;
  isRefreshing: boolean;
  isUpdating: boolean;
  onRefresh: () => void;
}

/**
 * Header controls with real-time indicator and refresh button.
 */
export function RefreshControls({
  isRealTime,
  isRefreshing,
  isUpdating,
  onRefresh,
}: RefreshControlsProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">Billing Analytics</h2>
        <p className="text-gray-600 dark:text-muted-foreground">
          Real-time usage monitoring and cost tracking
        </p>
      </div>

      <div className="flex items-center space-x-4">
        {/* Real-time indicator */}
        <div className="flex items-center space-x-2">
          <div
            className={`h-2 w-2 rounded-full ${
              isRealTime ? "bg-green-500 animate-pulse" : "bg-gray-400"
            }`}
          />
          <span className="text-sm text-gray-600 dark:text-muted-foreground">
            {isRealTime ? "Live" : "Cached"}
          </span>
        </div>

        {/* Refresh button */}
        <Button
          onClick={onRefresh}
          variant="outline"
          size="sm"
          disabled={isRefreshing || isUpdating}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>
    </div>
  );
}
