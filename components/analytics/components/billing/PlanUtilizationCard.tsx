// ============================================================================
// PLAN UTILIZATION CARD - Plan utilization display for billing dashboard
// ============================================================================

"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { PlanUtilizationCardSkeleton } from "../BillingAnalyticsSkeletons";

/**
 * Plan utilization data structure.
 */
interface PlanUtilization {
  planType: string;
  utilizationPercentages: {
    overall: number;
  };
  recommendations: string[];
  isOverLimit: boolean;
}

/**
 * Props for the PlanUtilizationCard component.
 */
interface PlanUtilizationCardProps {
  planUtilization: PlanUtilization | null;
}

/**
 * Plan utilization card component.
 */
export function PlanUtilizationCard({
  planUtilization,
}: PlanUtilizationCardProps) {
  if (!planUtilization) {
    return <PlanUtilizationCardSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan Utilization</CardTitle>
        <p className="text-sm text-gray-600">
          Current plan: {planUtilization.planType}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeDasharray={`${planUtilization.utilizationPercentages.overall}, 100`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold">
                {planUtilization.utilizationPercentages.overall}%
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Overall Utilization</p>
        </div>

        {planUtilization.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recommendations</h4>
            {planUtilization.recommendations
              .slice(0, 3)
              .map((rec: string, index: number) => (
                <p key={index} className="text-xs text-gray-600">
                  • {rec}
                </p>
              ))}
          </div>
        )}

        {planUtilization.isOverLimit && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You have exceeded your plan limits. Please upgrade or reduce
              usage.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
