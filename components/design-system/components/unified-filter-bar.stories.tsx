import type { Meta, StoryObj } from "@storybook/nextjs";
import { UnifiedFilterBar } from "./unified-filter-bar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, Download, Plus } from "lucide-react";

/**
 * Standardized Filter Bar component for list views.
 * Supports Search, Filters zone, and Actions zone.
 */
const meta: Meta<typeof UnifiedFilterBar> = {
  title: "Design System/Components/UnifiedFilterBar",
  component: UnifiedFilterBar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof UnifiedFilterBar>;

export const Default: Story = {
  args: {
    onSearch: (term) => console.log("Search:", term),
    filters: (
      <>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Status
        </Button>
        <Button variant="outline" size="sm">
          Campaign
        </Button>
      </>
    ),
    actions: (
      <Button size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Create New
      </Button>
    ),
  },
};

export const SearchOnly: Story = {
  args: {
    searchPlaceholder: "Search users...",
  },
};

export const WithBulkActions: Story = {
  args: {
    filters: (
        <Button variant="outline" size="sm">Filter by Date</Button>
    ),
    actions: (
      <>
        <Badge variant="secondary" className="mr-2">3 Selected</Badge>
        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
          Delete
        </Button>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </>
    ),
  },
};
