import type { Meta, StoryObj } from "@storybook/nextjs";
import MigratedDashboardContent from "./MigratedDashboardContent";
import { CampaignAnalytics } from "@/types/analytics/domain-specific";
import type { RecentReply, WarmupSummaryData } from "@/types/campaign";
import React from "react";

const meta = {
  title: "App/Dashboard/MigratedDashboardContent",
  component: MigratedDashboardContent,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Migrated Dashboard Content with real-time analytics KPIs. Replaces conflicting dashboard KPIs with AnalyticsCalculator calculations. Uses standardized field names and Convex subscriptions for real-time updates.",
      },
    },
    layout: "fullscreen",
    nextjs: {
      navigation: {
        pathname: "/dashboard",
        query: {},
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
} satisfies Meta<
  React.ComponentProps<typeof MigratedDashboardContent> & { theme?: string }
>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data generators
const generateMockCampaignAnalytics = (): CampaignAnalytics[] => [
  {
    id: "1",
    name: "Welcome Series",
    campaignId: "1",
    campaignName: "Welcome Series",
    status: "ACTIVE",
    leadCount: 1250,
    activeLeads: 890,
    completedLeads: 360,
    // BaseAnalytics fields
    sent: 12450,
    delivered: 12200,
    opened_tracked: 4880,
    clicked_tracked: 976,
    replied: 244,
    bounced: 250,
    unsubscribed: 12,
    spamComplaints: 8,
    updatedAt: Date.now(),
  },
  {
    id: "2",
    name: "Product Launch",
    campaignId: "2",
    campaignName: "Product Launch",
    status: "ACTIVE",
    leadCount: 850,
    activeLeads: 720,
    completedLeads: 130,
    // BaseAnalytics fields
    sent: 8500,
    delivered: 8320,
    opened_tracked: 3744,
    clicked_tracked: 916,
    replied: 208,
    bounced: 180,
    unsubscribed: 6,
    spamComplaints: 4,
    updatedAt: Date.now(),
  },
];

const mockRecentReplies: RecentReply[] = [
  {
    name: "Sarah Johnson",
    email: "sarah@techcorp.com",
    company: "TechCorp Inc",
    message:
      "Thanks for reaching out! I'd love to schedule a call to discuss this further.",
    time: "2 hours ago",
    type: "positive",
  },
  {
    name: "Mike Chen",
    email: "mike@startupbb.com",
    company: "StartupBB",
    message:
      "Not interested at this time, but please keep us in mind for the future.",
    time: "4 hours ago",
    type: "neutral",
  },
  {
    name: "Lisa Rodriguez",
    email: "lisa@enterprise-inc.com",
    company: "Enterprise Inc",
    message:
      "This looks interesting. Can you send me more information about pricing?",
    time: "6 hours ago",
    type: "positive",
  },
  {
    name: "David Park",
    email: "david@innovate.co",
    company: "Innovate Co",
    message:
      "We're currently evaluating similar solutions. Would love to see a demo.",
    time: "8 hours ago",
    type: "positive",
  },
  {
    name: "Emma Wilson",
    email: "emma@digitalagency.com",
    company: "Digital Agency",
    message:
      "Not the right fit for our current needs, but appreciate the follow-up.",
    time: "1 day ago",
    type: "neutral",
  },
];

const mockWarmupSummary: WarmupSummaryData = {
  activeMailboxes: 8,
  warmingUp: 3,
  readyToSend: 5,
  needsAttention: 2,
};

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          "Default state with empty analytics data (temporarily disabled).",
      },
    },
  },
};

// TODO: Currently using empty args which doesn't demonstrate the component's data-driven state.
// This story should be updated to use the mock data generators defined above:
// - generateMockCampaignAnalytics() for campaign analytics
// - mockRecentReplies for recent replies data
// - mockWarmupSummary for warmup status data
//
// The component expects these props to properly render the dashboard with data.
// Update args to pass the generated mock data to see the full functionality.
//
// Example fix:
// args: {
//   campaignAnalytics: generateMockCampaignAnalytics(),
//   recentReplies: mockRecentReplies,
//   warmupSummaryData: mockWarmupSummary,
// }
export const WithData: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: "Dashboard with full campaign analytics and data loaded.",
      },
    },
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: "Dashboard in loading state showing skeleton loaders.",
      },
    },
  },
};

export const EmptyState: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: "Dashboard with no recent replies but warmup data available.",
      },
    },
  },
};

export const MinimalWarmupData: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          "Dashboard with recent replies but minimal warmup data (no mailboxes warming up).",
      },
    },
  },
};

export const HighVolumeDashboard: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          "Dashboard with high-volume campaign data and many recent replies.",
      },
    },
  },
};
