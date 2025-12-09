import type { Meta, StoryObj } from "@storybook/nextjs";
import { Eye, MousePointer, Reply, TrendingUp } from "lucide-react";
import KpiCards from "@/components/dashboard/cards/KpiCards";
import MigratedKpiCards from "@/components/dashboard/cards/MigratedKpiCards";
import { StatsCardData } from "@/types/campaign";
import React from "react";

/**
 * REAL COMPARISON: KpiCards vs MigratedKpiCards
 *
 * This story shows the comparison of REAL components from the project:
 * - KpiCards: Migrated component that uses UnifiedStatsCard
 * - MigratedKpiCards: Advanced version with analytics logic
 *
 * Both already use the Design System, but this comparison demonstrates
 * how to validate that different implementations have visual parity.
 */

const meta: Meta = {
  title: "Design System/Visual Verification/Real Components Comparison",
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
**Real Components Comparison**

This example uses REAL components from the project to demonstrate the verification strategy:

- **KpiCards**: Simple component that renders stats cards
- **MigratedKpiCards**: Advanced version with analytics calculations

Both already use \`UnifiedStatsCard\` from the Design System, which guarantees visual consistency.
        `,
      },
    },
  },
  argTypes: {
    theme: {
      control: { type: "select" },
      options: ["light", "dark"],
      description: "Toggle between light and dark mode",
      defaultValue: "light",
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.args.theme || "light";

      React.useEffect(() => {
        const htmlElement = document.documentElement;
        if (theme === "dark") {
          htmlElement.classList.add("dark");
        } else {
          htmlElement.classList.remove("dark");
        }

        return () => {
          htmlElement.classList.remove("dark");
        };
      }, [theme]);

      return <Story />;
    },
  ],
};

export default meta;
type Story = StoryObj;

// Mock data for stories
const mockKpiData: StatsCardData[] = [
  {
    title: "Open Rate",
    value: "24.5%",
    icon: Eye,
    color: "success",
  },
  {
    title: "Click Rate",
    value: "3.2%",
    icon: MousePointer,
    color: "info",
  },
  {
    title: "Reply Rate",
    value: "8.7%",
    icon: Reply,
    color: "warning",
  },
  {
    title: "Health Score",
    value: "87/100",
    icon: TrendingUp,
    color: "success",
  },
];

// Mock analytics data para MigratedKpiCards
const mockAnalyticsData = [
  {
    campaign_id: "1",
    sent: 1000,
    delivered: 980,
    opened_tracked: 245,
    clicked_tracked: 32,
    replied: 87,
    bounced: 20,
    unsubscribed: 5,
  },
];

/**
 * Story 1: Simple KpiCards Comparison
 *
 * Shows the KpiCards component that already uses UnifiedStatsCard
 */
export const KpiCardsExample: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">
          ✅ KpiCards (Design System)
        </h3>
        <p className="text-sm text-muted-foreground">
          Simple component that already uses UnifiedStatsCard from the Design
          System
        </p>
      </div>

      <KpiCards cards={mockKpiData} />

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <span className="text-xl">ℹ️</span>
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Migrated Component
            </p>
            <p className="text-blue-700 dark:text-blue-300">
              This component already uses design tokens through
              UnifiedStatsCard. No additional migration needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * Story 2: MigratedKpiCards with Analytics
 *
 * Advanced version with rate calculations and benchmarks
 */
export const MigratedKpiCardsExample: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">
          ✅ MigratedKpiCards (Advanced)
        </h3>
        <p className="text-sm text-muted-foreground">
          Advanced version with automatic rate and benchmark calculations
        </p>
      </div>

      <MigratedKpiCards campaignAnalytics={mockAnalyticsData as any} />

      <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-start gap-3">
          <span className="text-xl">✅</span>
          <div className="text-sm">
            <p className="font-medium text-green-900 dark:text-green-100 mb-1">
              Advanced Component
            </p>
            <p className="text-green-700 dark:text-green-300">
              Includes business logic (rate calculation) but maintains visual
              consistency using UnifiedStatsCard from the Design System.
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * Story 3: Side by Side Comparison
 *
 * Shows both components to validate visual consistency
 */
export const SideBySideComparison: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="text-sm text-muted-foreground mb-4">
        <p className="font-medium mb-2">🎯 Goal:</p>
        <p>
          Validate that different components using UnifiedStatsCard maintain
          visual consistency
        </p>
      </div>

      {/* KpiCards Simple */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h3 className="text-lg font-semibold">Simple KpiCards</h3>
          <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded">
            Direct rendering
          </span>
        </div>
        <KpiCards cards={mockKpiData} />
      </div>

      <div className="border-t border-border my-6" />

      {/* MigratedKpiCards con lógica */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h3 className="text-lg font-semibold">MigratedKpiCards</h3>
          <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded">
            With analytics calculations
          </span>
        </div>
        <MigratedKpiCards campaignAnalytics={mockAnalyticsData as any} />
      </div>

      {/* Checklist */}
      <div className="border-t pt-6 mt-8">
        <h4 className="font-medium mb-3">✓ Consistency Verification:</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Both use UnifiedStatsCard internally</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Grid layout is consistent (1-2-4 responsive columns)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Colors come from design tokens (success, info, warning)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Icons have same size and style</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <span>Spacing between cards is uniform</span>
          </li>
        </ul>
      </div>
    </div>
  ),
};

/**
 * Story 4: Loading and Error States
 *
 * Demonstrates how MigratedKpiCards handles different states
 */
export const StateComparison: Story = {
  render: () => (
    <div className="space-y-8">
      {/* Loading state */}
      <div>
        <h3 className="text-lg font-semibold mb-4">State: Loading</h3>
        <MigratedKpiCards loading={true} />
      </div>

      <div className="border-t border-border my-6" />

      {/* No data state */}
      <div>
        <h3 className="text-lg font-semibold mb-4">State: No data</h3>
        <MigratedKpiCards campaignAnalytics={[]} />
      </div>

      <div className="border-t border-border my-6" />

      {/* With data state */}
      <div>
        <h3 className="text-lg font-semibold mb-4">State: With data</h3>
        <MigratedKpiCards campaignAnalytics={mockAnalyticsData as any} />
      </div>
    </div>
  ),
};

/**
 * Story 5: Dark Mode
 */
export const DarkModeComparison: Story = {
  parameters: {
    backgrounds: { default: "dark" },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="space-y-8">
      <div className="mb-4 text-white/70">
        <p>🌙 Dark Mode Validation - All components use design tokens</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 text-white">
          KpiCards - Dark
        </h3>
        <KpiCards cards={mockKpiData} />
      </div>

      <div className="border-t border-border my-6" />

      <div>
        <h3 className="text-lg font-semibold mb-4 text-white">
          MigratedKpiCards - Dark
        </h3>
        <MigratedKpiCards campaignAnalytics={mockAnalyticsData as any} />
      </div>

      <div className="mt-8 p-4 bg-green-900/30 rounded-lg border border-green-700">
        <div className="flex items-start gap-3">
          <span className="text-2xl">✅</span>
          <div className="text-sm">
            <p className="font-medium text-green-100 mb-1">
              Successful Dark Mode
            </p>
            <p className="text-green-300">
              Design tokens automatically handle theme switching. No additional
              logic needed in components.
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
};
