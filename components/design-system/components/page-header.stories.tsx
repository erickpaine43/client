import type { Meta, StoryObj } from "@storybook/nextjs";
import { PageHeader } from "./page-header";
import { Button } from "@/components/ui/button";
import { Download, Plus, Settings } from "lucide-react";
import React from "react";

const meta = {
  title: "Design System/Components/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Standardized page header with breadcrumbs, title, description, and actions. Extracted from DashboardLayout pattern for reusability.",
      },
    },
    layout: "padded",
    nextjs: {
      appDirectory: true,
    },
  },
  argTypes: {
    title: {
      control: "text",
      description: "Page title",
    },
    description: {
      control: "text",
      description: "Page description/subtitle",
    },
    showBackButton: {
      control: "boolean",
      description: "Show back button",
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
} satisfies Meta<React.ComponentProps<typeof PageHeader> & { theme?: string }>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    title: "Campaign Analytics",
  },
};

export const WithDescription: Story = {
  args: {
    title: "Campaign Analytics",
    description: "Monitor your campaign performance and engagement metrics",
  },
};

export const WithBreadcrumbs: Story = {
  args: {
    title: "Analytics",
    breadcrumbs: [
      { label: "Campaigns" },
      { label: "Analytics" },
    ],
  },
};

export const WithActions: Story = {
  args: {
    title: "Campaigns",
    description: "Manage all your email campaigns",
    actions: (
      <>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </>
    ),
  },
};

export const WithBackButton: Story = {
  args: {
    title: "Campaign Details",
    description: "View and edit campaign information",
    showBackButton: true,
  },
};

export const FullFeatured: Story = {
  args: {
    title: "Campaign Analytics",
    description: "Monitor your campaign performance and engagement metrics",
    breadcrumbs: [
      { label: "Campaigns" },
      { label: "Welcome Series" },
      { label: "Analytics" },
    ],
    actions: (
      <>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        <Button size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </>
    ),
    showBackButton: true,
  },
};
