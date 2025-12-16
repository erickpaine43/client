---
title: "Analytics Types Usage Examples"
description: "Documentation for Analytics Types Usage Examples - USAGE EXAMPLES"
last_modified_date: "2025-11-19"
level: 2
persona: "Documentation Users"
---

# Analytics Types Usage Examples

This document provides comprehensive examples of how to use the standardized analytics types and utilities in the new domain-driven architecture.

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Advanced Patterns](#advanced-patterns)
3. [Server Actions](#server-actions)
4. [React Hooks](#react-hooks)
5. [Data Validation](#data-validation)
6. [Performance Optimization](#performance-optimization)
7. [Testing Patterns](#testing-patterns)

## Basic Usage

### 1. Campaign Analytics Component

```typescript
import React from 'react';
import { CampaignAnalytics } from '@/types/analytics';
import { AnalyticsCalculator } from '@/lib/utils/analytics-calculator';

interface CampaignStatsProps {
  campaign: CampaignAnalytics;
}

export function CampaignStats({ campaign }: CampaignStatsProps) {
  // Calculate rates on-demand
  const rates = AnalyticsCalculator.calculateAllRates(campaign);
  const healthScore = AnalyticsCalculator.calculateHealthScore(campaign);

  return (
    <div className="campaign-stats">
      <h3>{campaign.campaignName}</h3>

      {/* Raw counts */}
      <div className="metrics">
        <div>Sent: {AnalyticsCalculator.formatNumber(campaign.sent)}</div>
        <div>Delivered: {AnalyticsCalculator.formatNumber(campaign.delivered)}</div>
        <div>Opened: {AnalyticsCalculator.formatNumber(campaign.opened_tracked)}</div>
        <div>Clicked: {AnalyticsCalculator.formatNumber(campaign.clicked_tracked)}</div>
        <div>Replied: {AnalyticsCalculator.formatNumber(campaign.replied)}</div>
      </div>

      {/* Calculated rates */}
      <div className="rates">
        <div>Open Rate: {AnalyticsCalculator.formatRateAsPercentage(rates.openRate)}</div>
        <div>Click Rate: {AnalyticsCalculator.formatRateAsPercentage(rates.clickRate)}</div>
        <div>Reply Rate: {AnalyticsCalculator.formatRateAsPercentage(rates.replyRate)}</div>
        <div>Bounce Rate: {AnalyticsCalculator.formatRateAsPercentage(rates.bounceRate)}</div>
      </div>

      {/* Health score */}
      <div className="health">
        <div>Health Score: {healthScore}/100</div>
      </div>
    </div>
  );
}
```

### 2. Time Series Chart Data

```typescript
import { TimeSeriesDataPoint } from "@/types/analytics";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";

interface ChartData {
  date: string;
  sent: number;
  openRate: number; // As percentage for chart display
  clickRate: number;
  replyRate: number;
}

export function prepareChartData(
  timeSeriesData: TimeSeriesDataPoint[]
): ChartData[] {
  return timeSeriesData.map((point) => {
    const rates = AnalyticsCalculator.calculateAllRates(point.metrics);

    return {
      date: point.date,
      sent: point.metrics.sent,
      openRate: rates.openRate * 100, // Convert to percentage for charts
      clickRate: rates.clickRate * 100,
      replyRate: rates.replyRate * 100,
    };
  });
}
```

### 3. Mailbox Performance Dashboard

```typescript
import React from 'react';
import { MailboxAnalytics } from '@/types/analytics';
import { AnalyticsCalculator } from '@/lib/utils/analytics-calculator';

interface MailboxDashboardProps {
  mailboxes: MailboxAnalytics[];
}

export function MailboxDashboard({ mailboxes }: MailboxDashboardProps) {
  // Aggregate metrics across all mailboxes
  const aggregatedMetrics = AnalyticsCalculator.aggregateMetrics(mailboxes);
  const overallRates = AnalyticsCalculator.calculateAllRates(aggregatedMetrics);
  const overallHealth = AnalyticsCalculator.calculateHealthScore(aggregatedMetrics);

  return (
    <div className="mailbox-dashboard">
      <div className="overview">
        <h2>Overall Performance</h2>
        <div>Total Sent: {AnalyticsCalculator.formatNumber(aggregatedMetrics.sent)}</div>
        <div>Open Rate: {AnalyticsCalculator.formatRateAsPercentage(overallRates.openRate)}</div>
        <div>Health Score: {overallHealth}/100</div>
      </div>

      <div className="mailbox-list">
        {mailboxes.map(mailbox => {
          const rates = AnalyticsCalculator.calculateAllRates(mailbox);
          const health = AnalyticsCalculator.calculateHealthScore(mailbox);

          return (
            <div key={mailbox.mailboxId} className="mailbox-card">
              <h3>{mailbox.email}</h3>
              <div>Status: {mailbox.warmupStatus}</div>
              <div>Progress: {mailbox.warmupProgress}%</div>
              <div>Open Rate: {AnalyticsCalculator.formatRateAsPercentage(rates.openRate)}</div>
              <div>Health: {health}/100</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### 4. Data Validation Example

```typescript
import { PerformanceMetrics } from "@/types/analytics";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";

export function validateAndProcessMetrics(
  rawData: any
): PerformanceMetrics | null {
  // Convert raw data to standardized format
  const metrics: PerformanceMetrics = {
    sent: rawData.sent || 0,
    delivered: rawData.delivered || rawData.sent - rawData.bounced || 0,
    opened_tracked: rawData.opened_tracked || rawData.opens || 0,
    clicked_tracked: rawData.clicked_tracked || rawData.clicks || 0,
    replied: rawData.replied || rawData.replies || 0,
    bounced: rawData.bounced || rawData.bounces || 0,
    unsubscribed: rawData.unsubscribed || 0,
    spamComplaints: rawData.spamComplaints || rawData.spamFlags || 0,
  };

  // Validate the metrics
  const validation = AnalyticsCalculator.validateMetrics(metrics);

  if (!validation.isValid) {
    console.error("Invalid metrics:", validation.errors);
    return null;
  }

  return metrics;
}
```

### 5. Server Action Example

```typescript
import { CampaignAnalytics } from "@/types/analytics";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";

export async function getCampaignAnalytics(
  campaignId: string
): Promise<CampaignAnalytics> {
  // Fetch raw data from database
  const rawData = await fetchCampaignData(campaignId);

  // Convert to standardized format
  const analytics: CampaignAnalytics = {
    id: rawData.id,
    name: rawData.name,
    campaignId: rawData.id,
    campaignName: rawData.name,
    status: rawData.status,
    leadCount: rawData.leadCount,
    activeLeads: rawData.activeLeads,
    completedLeads: rawData.completedLeads,
    sent: rawData.sent,
    delivered: rawData.delivered,
    opened_tracked: rawData.opened_tracked,
    clicked_tracked: rawData.clicked_tracked,
    replied: rawData.replied,
    bounced: rawData.bounced,
    unsubscribed: rawData.unsubscribed,
    spamComplaints: rawData.spamComplaints,
    updatedAt: Date.now(),
  };

  // Validate before returning
  const validation = AnalyticsCalculator.validateMetrics(analytics);
  if (!validation.isValid) {
    throw new Error(
      `Invalid campaign analytics: ${validation.errors.join(", ")}`
    );
  }

  return analytics;
}
```

### 6. React Hook for Analytics

```typescript
import { useState, useEffect } from "react";
import { CampaignAnalytics, CalculatedRates } from "@/types/analytics";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";

export function useCampaignAnalytics(campaignId: string) {
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [rates, setRates] = useState<CalculatedRates | null>(null);
  const [healthScore, setHealthScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const data = await getCampaignAnalytics(campaignId);

        // Calculate rates and health score
        const calculatedRates = AnalyticsCalculator.calculateAllRates(data);
        const health = AnalyticsCalculator.calculateHealthScore(data);

        setAnalytics(data);
        setRates(calculatedRates);
        setHealthScore(health);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch analytics"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [campaignId]);

  return {
    analytics,
    rates,
    healthScore,
    loading,
    error,
    // Helper functions
    formatRate: (rate: number) =>
      AnalyticsCalculator.formatRateAsPercentage(rate),
    formatNumber: (num: number) => AnalyticsCalculator.formatNumber(num),
  };
}
```

### 7. Filtering and Aggregation

```typescript
import { CampaignAnalytics, PerformanceMetrics } from "@/types/analytics";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";

export class AnalyticsService {
  // Filter campaigns by performance criteria
  static filterHighPerformingCampaigns(
    campaigns: CampaignAnalytics[],
    minOpenRate: number = 0.25,
    minReplyRate: number = 0.05
  ): CampaignAnalytics[] {
    return campaigns.filter((campaign) => {
      const rates = AnalyticsCalculator.calculateAllRates(campaign);
      return rates.openRate >= minOpenRate && rates.replyRate >= minReplyRate;
    });
  }

  // Get top performing campaigns
  static getTopCampaigns(
    campaigns: CampaignAnalytics[],
    sortBy: "openRate" | "replyRate" | "healthScore" = "healthScore",
    limit: number = 5
  ): CampaignAnalytics[] {
    return campaigns
      .sort((a, b) => {
        if (sortBy === "healthScore") {
          const healthA = AnalyticsCalculator.calculateHealthScore(a);
          const healthB = AnalyticsCalculator.calculateHealthScore(b);
          return healthB - healthA;
        } else {
          const ratesA = AnalyticsCalculator.calculateAllRates(a);
          const ratesB = AnalyticsCalculator.calculateAllRates(b);
          return ratesB[sortBy] - ratesA[sortBy];
        }
      })
      .slice(0, limit);
  }

  // Calculate performance benchmarks
  static calculateBenchmarks(campaigns: CampaignAnalytics[]) {
    if (campaigns.length === 0) return null;

    const allRates = campaigns.map((campaign) =>
      AnalyticsCalculator.calculateAllRates(campaign)
    );

    return {
      avgOpenRate:
        allRates.reduce((sum, rates) => sum + rates.openRate, 0) /
        allRates.length,
      avgClickRate:
        allRates.reduce((sum, rates) => sum + rates.clickRate, 0) /
        allRates.length,
      avgReplyRate:
        allRates.reduce((sum, rates) => sum + rates.replyRate, 0) /
        allRates.length,
      avgBounceRate:
        allRates.reduce((sum, rates) => sum + rates.bounceRate, 0) /
        allRates.length,
    };
  }
}
```

## Key Principles

1. **Separation of Concerns**: Data types contain only raw data, UI formatting is done in components
2. **Calculate on Demand**: Rates are never stored, always calculated when needed
3. **Validation**: Always validate metrics before processing
4. **Consistency**: Use the shared `AnalyticsCalculator` for all calculations
5. **Type Safety**: Leverage TypeScript for compile-time error checking

## Performance Tips

1. **Memoization**: Use React.useMemo for expensive calculations
2. **Batch Processing**: Process multiple metrics together when possible
3. **Caching**: Cache calculated rates for large datasets
4. **Lazy Loading**: Calculate rates only when needed for display
