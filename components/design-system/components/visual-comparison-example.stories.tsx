import type { Meta, StoryObj } from "@storybook/nextjs";
import { TrendingUp, Mail, Eye, MousePointer, Reply } from 'lucide-react';
import { UnifiedStatsCard } from '@/components/design-system/components/unified-stats-card';

/**
 * Visual Comparison Story Example
 * 
 * This file demonstrates the visual verification strategy using Storybook.
 * Shows how to compare components BEFORE (legacy with hardcoded styles) and 
 * AFTER (migrated to design tokens) side by side.
 * 
 * NOTE: This is a demonstrative example. In your real case:
 * 1. You would create a .legacy copy of the original component
 * 2. You would migrate the original component to use design tokens
 * 3. You would compare both versions in a story like this
 */

const meta: Meta = {
  title: 'Design System/Visual Verification/Example Comparison',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Purpose of This Story:**

This story demonstrates the visual verification strategy for component migration.
Shows examples side by side to validate that the old style looks the same as the new one.

**How to use this strategy:**

1. **Before migrating:** Copy the original component to \`.legacy.tsx\`
2. **Create story:** Create a comparison story like this
3. **Migrate:** Update the original component to use design tokens
4. **Verify:** Visually compare in Storybook that they look identical
5. **Approve:** If identical, delete the \`.legacy\` file
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

/**
 * Simulated Legacy Component - SIMPLE Version without Design System
 * 
 * This represents how a StatsCard looked BEFORE the design system:
 * - Hardcoded inline styles
 * - Simpler structure
 * - Fewer features (no trends, no benchmarks)
 * 
 * UnifiedStatsCard is the EVOLUTION of this component, adding:
 * - Design tokens for colors
 * - Support for trends and benchmarks
 * - More customization options
 * - But maintaining VISUAL COMPATIBILITY with legacy
 */
const LegacyStatsCard = ({ 
  title, 
  value, 
}: any) => {
  return (
    // EXACT simulation of UnifiedStatsCard + shadcn/ui Card
    // Container: Card (ui/card.tsx) + UnifiedStatsCard styles
    // Combines: py-6 (Card) + p-6 (Unified) + gap-6 (Card)
    <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md p-6 border-border">
      
      {/* Header: CardHeader (ui/card.tsx) + UnifiedStatsCard styles */}
      {/* Combina: px-6 (CardHeader) + pb-3 (Unified) */}
      <div className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] flex flex-row items-center justify-between space-y-0 pb-3">
        
        {/* Title: CardTitle (ui/card.tsx) + UnifiedStatsCard styles */}
        {/* Combina: leading-none font-semibold (CardTitle) + text-muted-foreground text-sm font-medium (Unified) */}
        <div className="leading-none font-semibold text-muted-foreground text-sm font-medium">
          {title}
        </div>
      </div>

      {/* Content: CardContent (ui/card.tsx) + UnifiedStatsCard styles */}
      {/* Combina: px-6 (CardContent) + space-y-3 (Unified) */}
      <div className="px-6 space-y-3">
        <div className="flex items-baseline space-x-2">
          {/* Value: UnifiedStatsCard styles */}
          <p className="text-foreground text-2xl font-bold">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Story 1: Basic Comparison
 * 
 * Shows a single component side by side to validate identical styles
 */
export const BasicComparison: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="text-sm text-muted-foreground mb-4">
        <p className="font-medium mb-2">📋 Visual Parity Verification:</p>
        <p>Demonstration that <strong>UnifiedStatsCard</strong> can look IDENTICAL to legacy by disabling optional features.</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* 1. Legacy Original */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <h3 className="text-lg font-semibold">❌ Legacy (Simple)</h3>
          </div>
          <LegacyStatsCard
            title="Total Revenue"
            value="$45,231"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Simple original component
          </p>
        </div>

        {/* 2. UnifiedStatsCard (Strict Match) */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <h3 className="text-lg font-semibold">✅ UnifiedStatsCard (Base)</h3>
          </div>
          <UnifiedStatsCard
            title="Total Revenue"
            value="$45,231"
            color="secondary" // Use neutral color to match legacy
            // No icon, no trend, no change
          />
          <p className="text-xs text-muted-foreground mt-2">
            Disabled features = Exact visual parity
          </p>
        </div>
      </div>

      {/* Border separator */}
      <div className="border-t border-border my-6" />

      {/* 3. UnifiedStatsCard (With Features) */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h3 className="text-lg font-semibold">✨ UnifiedStatsCard (With Optional Features)</h3>
          <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded">
            Evolution
          </span>
        </div>
        <div className="max-w-xs">
          <UnifiedStatsCard
            title="Total Revenue"
            value="$45,231"
            icon={TrendingUp}
            color="primary"
            trend="up"
            change="+12.5%"
            changeType="increase"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Same base props, but enabling optional features
        </p>
      </div>

      {/* Explanation */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
              Optional Features
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              The differences (icons, colors, trends) are <strong>completely optional</strong>.
              If you don&apos;t pass those props, the component looks identical to legacy.
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * Story 2: Multi-Variant Comparison
 * 
 * Shows all color variants side by side
 */
/**
 * Story 2: Multi-Variant Comparison
 * 
 * Shows how UnifiedStatsCard can stay simple or evolve with variants
 */
export const AllVariantsComparison: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="text-sm text-muted-foreground mb-4">
        <p className="font-medium mb-2">📋 Variant Verification:</p>
        <p>The Legacy component is simple (no variants). UnifiedStatsCard can match it (Base) or add variants (Evolution).</p>
      </div>

      {/* 1. Base Comparison (Strict Parity) */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="mb-4 text-lg font-semibold">❌ Legacy (Simple)</h3>
          <div className="space-y-4">
            <LegacyStatsCard title="Open Rate" value="24.5%" />
            <LegacyStatsCard title="Click Rate" value="3.2%" />
            <LegacyStatsCard title="Reply Rate" value="8.7%" />
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-semibold">✅ UnifiedStatsCard (Base)</h3>
          <div className="space-y-4">
            {/* Base configuration to match Legacy */}
            <UnifiedStatsCard title="Open Rate" value="24.5%" color="secondary" />
            <UnifiedStatsCard title="Click Rate" value="3.2%" color="secondary" />
            <UnifiedStatsCard title="Reply Rate" value="8.7%" color="secondary" />
          </div>
        </div>
      </div>

      <div className="border-t border-border my-6" />

      {/* 2. Evolution (Active Variants) */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">✨ UnifiedStatsCard (Evolution with Variants)</h3>
        <div className="grid grid-cols-3 gap-4">
          <UnifiedStatsCard
            title="Success Variant"
            value="24.5%"
            color="success"
            icon={Eye}
            trend="up"
            change="+8.2%"
          />
          <UnifiedStatsCard
            title="Info Variant"
            value="3.2%"
            color="info"
            icon={MousePointer}
            trend="up"
            change="+15.3%"
          />
          <UnifiedStatsCard
            title="Warning Variant"
            value="8.7%"
            color="warning"
            icon={Reply}
            trend="down"
            change="-0.5%"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          By enabling the `color` prop, the component evolves visually while maintaining the base structure.
        </p>
      </div>
    </div>
  ),
};

/**
 * Story 3: Dark Mode Comparison
 * 
 * Validates strict parity in dark mode
 */
export const DarkModeComparison: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
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
        <p>🌙 Dark Mode Validation: Legacy vs Unified (Base)</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="mb-4 text-lg font-semibold text-white">❌ Legacy - Dark</h3>
          <LegacyStatsCard
            title="Total Sent"
            value="12,543"
          />
        </div>
        <div>
          <h3 className="mb-4 text-lg font-semibold text-white">✅ Unified (Base) - Dark</h3>
          <UnifiedStatsCard
            title="Total Sent"
            value="12,543"
            color="secondary"
          />
        </div>
      </div>

      <div className="border-t border-gray-700 my-6" />

      <div>
        <h3 className="mb-4 text-lg font-semibold text-white">✨ Unified (Evolved) - Dark</h3>
        <div className="max-w-xs">
          <UnifiedStatsCard
            title="Total Sent"
            value="12,543"
            icon={Mail}
            color="primary"
            trend="up"
            change="+23.1%"
            changeType="increase"
          />
        </div>
      </div>
    </div>
  ),
};

/**
 * Story 4: Complete Grid - Real Comparison
 * 
 * Shows a complete dashboard comparing Legacy vs Base vs Evolved
 */
export const CompleteGridComparison: Story = {
  render: () => (
    <div className="space-y-8">
      {/* 1. Legacy Grid */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">❌ Legacy Dashboard (Simple)</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <LegacyStatsCard title="Open Rate" value="24.5%" />
          <LegacyStatsCard title="Click Rate" value="3.2%" />
          <LegacyStatsCard title="Reply Rate" value="8.7%" />
          <LegacyStatsCard title="Health Score" value="87/100" />
        </div>
      </div>

      <div className="border-t border-border my-8" />

      {/* 2. Unified Base Grid (Strict Parity) */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">✅ Unified Dashboard (Base - Exact Parity)</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <UnifiedStatsCard title="Open Rate" value="24.5%" color="secondary" />
          <UnifiedStatsCard title="Click Rate" value="3.2%" color="secondary" />
          <UnifiedStatsCard title="Reply Rate" value="8.7%" color="secondary" />
          <UnifiedStatsCard title="Health Score" value="87/100" color="secondary" />
        </div>
      </div>

      <div className="border-t border-border my-8" />

      {/* 3. Unified Evolved Grid */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">✨ Unified Dashboard (Complete Evolution)</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <UnifiedStatsCard
            title="Open Rate"
            value="24.5%"
            icon={Eye}
            color="success"
            trend="up"
            change="+8%"
            changeType="increase"
          />
          <UnifiedStatsCard
            title="Click Rate"
            value="3.2%"
            icon={MousePointer}
            color="info"
            trend="up"
            change="+15%"
            changeType="increase"
          />
          <UnifiedStatsCard
            title="Reply Rate"
            value="8.7%"
            icon={Reply}
            color="warning"
            trend="down"
            change="-2%"
            changeType="decrease"
          />
          <UnifiedStatsCard
            title="Health Score"
            value="87/100"
            icon={TrendingUp}
            color="success"
            trend="up"
            change="+5"
            changeType="increase"
          />
        </div>
      </div>
    </div>
  ),
};
