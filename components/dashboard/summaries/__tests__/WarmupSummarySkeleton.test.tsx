import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import WarmupSummarySkeleton from "../WarmupSummarySkeleton";

describe("WarmupSummarySkeleton", () => {
  it("renders the warmup status header", () => {
    render(<WarmupSummarySkeleton />);
    expect(screen.getByText("Warmup Status")).toBeInTheDocument();
  });

  it("renders all loading skeleton labels", () => {
    render(<WarmupSummarySkeleton />);

    expect(screen.getByText("Active Mailboxes")).toBeInTheDocument();
    expect(screen.getByText("Warming Up")).toBeInTheDocument();
    expect(screen.getByText("Ready to Send")).toBeInTheDocument();
  });

  it("renders skeleton loaders for values", () => {
    const { container } = render(<WarmupSummarySkeleton />);

    // Should have 4 skeleton elements (3 in content + 1 in footer)
    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
  });

  it("renders as a card component", () => {
    const { container } = render(<WarmupSummarySkeleton />);

    // Check for card structure
    expect(container.querySelector('[class*="card"]')).toBeInTheDocument();
  });

  it("has proper spacing between items", () => {
    const { container } = render(<WarmupSummarySkeleton />);

    const content = container.querySelector('[class*="space-y"]');
    expect(content).toBeInTheDocument();
  });

  it("renders footer with border", () => {
    const { container } = render(<WarmupSummarySkeleton />);

    const footer = container.querySelector('[class*="border-t"]');
    expect(footer).toBeInTheDocument();
  });
});
