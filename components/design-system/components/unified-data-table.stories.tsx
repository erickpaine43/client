import type { Meta, StoryObj } from "@storybook/nextjs";
import { UnifiedDataTable } from "./unified-data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import React from "react";

// Sample data type
type Campaign = {
  id: string;
  name: string;
  status: "active" | "draft" | "paused" | "completed";
  sent: number;
  opens: number;
  clicks: number;
};

// Sample data
const sampleCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Welcome Series",
    status: "active",
    sent: 1234,
    opens: 856,
    clicks: 342,
  },
  {
    id: "2",
    name: "Product Launch",
    status: "completed",
    sent: 5432,
    opens: 3211,
    clicks: 1544,
  },
  {
    id: "3",
    name: "Newsletter Q4",
    status: "active",
    sent: 2341,
    opens: 1523,
    clicks: 678,
  },
  {
    id: "4",
    name: "Abandoned Cart",
    status: "paused",
    sent: 876,
    opens: 432,
    clicks: 123,
  },
  {
    id: "5",
    name: "Re-engagement",
    status: "draft",
    sent: 0,
    opens: 0,
    clicks: 0,
  },
];

// Column definitions - cast to unknown to satisfy Storybook types
const columns: ColumnDef<unknown>[] = [
  {
    accessorKey: "name",
    header: "Campaign Name",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return <Badge variant="outline">{status}</Badge>;
    },
  },
  {
    accessorKey: "sent",
    header: "Sent",
  },
  {
    accessorKey: "opens",
    header: "Opens",
  },
  {
    accessorKey: "clicks",
    header: "Clicks",
  },
] as ColumnDef<unknown>[];

const meta = {
  title: "Design System/Components/UnifiedDataTable",
  component: UnifiedDataTable,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A powerful data table component with search, filtering, sorting, and pagination. Built on @tanstack/react-table.",
      },
    },
    layout: "padded",
  },
  argTypes: {
    searchable: {
      control: "boolean",
      description: "Enable search functionality",
    },
    paginated: {
      control: "boolean",
      description: "Enable pagination",
    },
    loading: {
      control: "boolean",
      description: "Show loading state",
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
} satisfies Meta<React.ComponentProps<typeof UnifiedDataTable> & { theme?: string }>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    columns,
    data: sampleCampaigns as unknown[],
    title: "Campaigns",
  },
};

export const WithSearch: Story = {
  args: {
    columns,
    data: sampleCampaigns as unknown[],
    title: "Searchable Campaigns",
    searchable: true,
  },
};

export const WithPagination: Story = {
  args: {
    columns,
    data: [...sampleCampaigns, ...sampleCampaigns, ...sampleCampaigns] as unknown[],
    title: "Paginated Campaigns",
    paginated: true,
  },
};

export const Empty: Story = {
  args: {
    columns,
    data: [] as unknown[],
    title: "No Campaigns",
    emptyMessage: "No campaigns found. Create your first campaign to get started.",
  },
};

export const Loading: Story = {
  args: {
    columns,
    data: [] as unknown[],
    title: "Loading Table",
    loading: true,
  },
};
