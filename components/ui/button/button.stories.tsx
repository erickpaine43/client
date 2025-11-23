import type { Meta, StoryObj } from "@storybook/nextjs";
import { withTests } from "@storybook/addon-jest";
import results from '../../../.jest-test-results.json';
import { Button } from "./button";

const meta = {
  title: "components/ui/button",
  component: Button,
  decorators: [withTests({ results })],
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A customizable button component with various variants and sizes.",
      },
    },
    layout: "centered",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "default",
    size: "sm",
    disabled: false,
    onClick: () => alert("Button clicked!"),
    children: "Default Button",
  },
};

export const Destructive: Story = {
  args: {
    labelKey: "label",
    variant: "destructive",
    size: "sm",
    onClick: () => alert("Button clicked!"),
    children: "Destructive Button",
    className: "border-2 border-black",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    size: "sm",
    children: "Outline Button",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    size: "sm",
    asChild: false,
    children: "Secondary Button",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    size: "sm",
    children: "Ghost Button",
  },
};

export const Link: Story = {
  args: {
    variant: "link",
    size: "sm",
    children: "Link",
  },
};
