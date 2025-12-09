import type { Meta, StoryObj } from "@storybook/nextjs";
import { EmptyState } from "./empty-state";
import {
  Inbox,
  FolderOpen,
  Users,
  Mail,
  FileText,
  Search,
} from "lucide-react";
import React from "react";

const meta = {
  title: "Design System/Components/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Displays a friendly message when there's no data to show. Supports optional icon, description, and action button.",
      },
    },
    layout: "centered",
  },
  argTypes: {
    title: {
      control: "text",
      description: "Title text",
    },
    description: {
      control: "text",
      description: "Description text",
    },
    actionLabel: {
      control: "text",
      description: "Action button label",
    },
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
      description: "Size variant",
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
} satisfies Meta<React.ComponentProps<typeof EmptyState> & { theme?: string }>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    icon: Inbox,
    title: "No messages yet",
  },
};

export const WithDescription: Story = {
  args: {
    icon: FolderOpen,
    title: "No campaigns found",
    description: "Your campaign list is empty. Create your first campaign to get started.",
  },
};

export const WithAction: Story = {
  args: {
    icon: Users,
    title: "No contacts",
    description: "You haven't imported any contacts yet.",
    actionLabel: "Import Contacts",
    onAction: () => alert("Import dialog would open here"),
  },
};

export const NoDataIcon: Story = {
  args: {
    icon: Mail,
    title: "No emails sent",
    description: "You haven't sent any emails from this campaign yet.",
    actionLabel: "Send Test Email",
    onAction: () => alert("Send test email"),
  },
};

export const SearchResults: Story = {
  args: {
    icon: Search,
    title: "No results found",
    description: "Try adjusting your search terms or filters.",
  },
};

export const SmallSize: Story = {
  args: {
    icon: FileText,
    title: "No documents",
    description: "Upload your first document.",
    size: "sm",
    actionLabel: "Upload",
    onAction: () => alert("Upload dialog"),
  },
};

export const LargeSize: Story = {
  args: {
    icon: Inbox,
    title: "Welcome to PenguinMails",
    description: "Get started by creating your first campaign and reaching out to your audience.",
    size: "lg",
    actionLabel: "Create Campaign",
    onAction: () => alert("Create campaign dialog"),
  },
};
