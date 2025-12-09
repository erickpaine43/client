import type { Meta, StoryObj } from "@storybook/nextjs";
import { UnifiedStatsCard } from "./unified-stats-card";
import {
  TrendingUp,
  TrendingDown,
  Send,
  Users,
  DollarSign,
  Mail,
  Activity,
} from "lucide-react";
import React from "react";

const meta = {
  title: "Design System/Components/UnifiedStatsCard",
  component: UnifiedStatsCard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A unified statistics card component with support for trends, benchmarks, and multiple visual variants. Consolidates all StatsCard implementations.",
      },
    },
    layout: "centered",
  },
  argTypes: {
    color: {
      control: "select",
      options: ["primary", "success", "warning", "error", "info"],
      description: "The color scheme",
    },
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
      description: "Card size",
    },
    variant: {
      control: "select",
      options: ["default", "highlighted", "muted"],
      description: "Visual style variant",
    },
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
} satisfies Meta<React.ComponentProps<typeof UnifiedStatsCard> & { theme?: string }>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Total Revenue",
    value: "$45,231",
    icon: DollarSign,
    color: "primary",
  },
};

export const WithTrend: Story = {
  args: {
    title: "Monthly Sales",
    value: "1,234",
    icon: TrendingUp,
    color: "success",
    trend: "up",
    change: "+12.5% vs last month",
    changeType: "increase",
  },
};

export const Success: Story = {
  args: {
    title: "Completed Tasks",
    value: "156",
    icon: Activity,
    color: "success",
    trend: "up",
    change: "+8% this week",
  },
};

export const Warning: Story = {
  args: {
    title: "Pending Reviews",
    value: "23",
    icon: Mail,
    color: "warning",
  },
};

export const Error: Story = {
  args: {
    title: "Failed Deliveries",
    value: "12",
    icon: Send,
    color: "error",
    trend: "up",
    change: "+3 vs yesterday",
    changeType: "increase",
  },
};

export const SmallSize: Story = {
  args: {
    title: "Campaigns",
    value: "42",
    icon: Send,
    color: "primary",
    size: "sm",
  },
};

export const LargeSize: Story = {
  args: {
    title: "Annual Revenue",
    value: "$542,891",
    icon: DollarSign,
    color: "primary",
    size: "lg",
  },
};

export const HighlightedVariant: Story = {
  args: {
    title: "Active Campaigns",
    value: "18",
    icon: Activity,
    color: "info",
    variant: "highlighted",
  },
};

export const MutedVariant: Story = {
  args: {
    title: "Scheduled",
    value: "32",
    icon: Send,
    color: "success",
    variant: "muted",
  },
};

export const WithBenchmark: Story = {
  args: {
    title: "Email Performance",
    value: "94.2",
    icon: Mail,
    color: "success",
    size: "lg",
    benchmark: true,
    target: 90,
    rawValue: 94.2,
    unit: "%",
  },
};
