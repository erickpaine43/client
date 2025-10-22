// ============================================================================
// USAGE RECOMMENDATIONS CARD - Usage recommendations display for billing dashboard
// ============================================================================

"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, AlertCircle, CheckCircle } from "lucide-react";

/**
 * Usage recommendations data structure.
 */
interface UsageRecommendations {
  recommendations: string[];
  urgentActions: string[];
  planSuggestions: string[];
}

/**
 * Props for the UsageRecommendationsCard component.
 */
interface UsageRecommendationsCardProps {
  recommendations: UsageRecommendations | null;
}

/**
 * Usage recommendations card component.
 */
export function UsageRecommendationsCard({
  recommendations,
}: UsageRecommendationsCardProps) {
  if (!recommendations) {
    return <div>Loading recommendations...</div>;
  }

  const hasRecommendations =
    recommendations.recommendations.length > 0 ||
    recommendations.urgentActions.length > 0 ||
    recommendations.planSuggestions.length > 0;

  if (!hasRecommendations) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Your usage is optimized. No recommendations at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Recommendations</CardTitle>
        <p className="text-sm text-gray-600">
          Optimize your plan and usage based on current patterns
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Urgent actions */}
        {recommendations.urgentActions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-red-600 mb-2">
              Urgent Actions
            </h4>
            <div className="space-y-2">
              {recommendations.urgentActions.map(
                (action: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{action}</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* General recommendations */}
        {recommendations.recommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-yellow-600 mb-2">
              Recommendations
            </h4>
            <div className="space-y-2">
              {recommendations.recommendations.map(
                (rec: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{rec}</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Plan suggestions */}
        {recommendations.planSuggestions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-blue-600 mb-2">
              Plan Suggestions
            </h4>
            <div className="space-y-2">
              {recommendations.planSuggestions.map(
                (suggestion: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{suggestion}</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
