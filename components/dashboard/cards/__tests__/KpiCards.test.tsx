import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  Mail,
  Users,
  BarChart2,
  MousePointer,
  type LucideIcon,
} from "lucide-react";
import { StatsCardData } from "@/types/campaign";
import KpiCards from "../KpiCards";

// Mock the KpiCard component
jest.mock("@/components/analytics/cards/StatsCard", () => ({
  __esModule: true,
  default: ({
    title,
    value,
    color,
  }: {
    title: string;
    value: string;
    icon: LucideIcon;
    color: string;
  }) => (
    <div data-testid={`kpi-card-${title}`} className={color}>
      <div>{title}</div>
      <div>{value}</div>
      <div data-testid={`icon-${title}`}>icon</div>
    </div>
  ),
}));

describe("KpiCards", () => {
  const mockCards: StatsCardData[] = [
    {
      title: "Total Campaigns",
      value: "24",
      icon: Mail,
      color: "primary",
    },
    {
      title: "Active Leads",
      value: "1,234",
      icon: Users,
      color: "success",
    },
    {
      title: "Open Rate",
      value: "45%",
      icon: BarChart2,
      color: "info",
    },
    {
      title: "Click Rate",
      value: "12%",
      icon: MousePointer,
      color: "warning",
    },
  ];

  it("renders all KPI cards", () => {
    render(<KpiCards cards={mockCards} />);

    expect(screen.getByLabelText("Statistics for Total Campaigns")).toBeInTheDocument();
expect(screen.getByLabelText("Statistics for Active Leads")).toBeInTheDocument();
expect(screen.getByLabelText("Statistics for Open Rate")).toBeInTheDocument();
expect(screen.getByLabelText("Statistics for Click Rate")).toBeInTheDocument();
  });

  it("displays correct titles and values", () => {
    render(<KpiCards cards={mockCards} />);

    expect(screen.getByText("Total Campaigns")).toBeInTheDocument();
    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getByText("Active Leads")).toBeInTheDocument();
    expect(screen.getByText("1,234")).toBeInTheDocument();
    expect(screen.getByText("Open Rate")).toBeInTheDocument();
    expect(screen.getByText("45%")).toBeInTheDocument();
  });

  it("applies grid layout", () => {
    const { container } = render(<KpiCards cards={mockCards} />);

    const grid = container.querySelector(".grid");
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass("grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-4");
  });

  it("renders empty grid when no cards provided", () => {
    const { container } = render(<KpiCards cards={[]} />);

    const grid = container.querySelector(".grid");
    expect(grid).toBeInTheDocument();
    expect(grid?.children.length).toBe(0);
  });

  it("passes color prop correctly to cards", () => {
    render(<KpiCards cards={mockCards} />);

    const campaignCard = screen.getByLabelText("Statistics for Total Campaigns");
    expect(campaignCard).toHaveClass("border-primary/20"); 
  });

  it("handles single card", () => {
    const singleCard: StatsCardData[] = [
      {
        title: "Single Card",
        value: "100",
        icon: Mail,
        color: "error",
      },
    ];

    render(<KpiCards cards={singleCard} />);

    expect(screen.getByLabelText("Statistics for Single Card")).toBeInTheDocument();
    expect(screen.getByText("Single Card")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("renders icons for each card", () => {
  render(<KpiCards cards={mockCards} />);

  
  const totalCampaignsCard = screen.getByLabelText("Statistics for Total Campaigns");
  const activeLeadsCard = screen.getByLabelText("Statistics for Active Leads");
  const openRateCard = screen.getByLabelText("Statistics for Open Rate");
  const clickRateCard = screen.getByLabelText("Statistics for Click Rate");

 
  expect(totalCampaignsCard.querySelector('svg')).not.toBeNull();
  expect(activeLeadsCard.querySelector('svg')).not.toBeNull();
  expect(openRateCard.querySelector('svg')).not.toBeNull();
  expect(clickRateCard.querySelector('svg')).not.toBeNull();
});

  it("uses title as unique key", () => {
    const { container } = render(<KpiCards cards={mockCards} />);

    const cards = container.querySelectorAll('[data-slot="card"]');
expect(cards.length).toBe(mockCards.length);
  });
});
