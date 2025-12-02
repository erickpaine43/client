import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import TemplateItem from "../template-item";
import { Template } from "@/types";

// Mock next/link
jest.mock("next/link", () => {
  const MockLink = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = "Link";
  return MockLink;
});

// Mock TemplateActions
jest.mock("../template-actions", () => {
  return function TemplateActions() {
    return <div data-testid="template-actions">Actions</div>;
  };
});

describe("TemplateItem", () => {
  const mockTemplate: Template = {
    id: 1,
    name: "Welcome Email Template",
    subject: "Welcome to our platform!",
    body: "Sample body content",
    bodyHtml: "<p>Sample body content</p>",
    category: "OUTREACH",
    usage: 150,
    openRate: "45%",
    replyRate: "12%",
    lastUsed: "2 days ago",
    companyId: 1,
    description: "Welcome template",
    createdById: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("renders template name", () => {
    render(<TemplateItem template={mockTemplate} />);
    expect(screen.getByText("Welcome Email Template")).toBeInTheDocument();
  });

  it("renders template subject", () => {
    render(<TemplateItem template={mockTemplate} />);
    expect(screen.getByText(/Welcome to our platform!/)).toBeInTheDocument();
  });

  it("displays usage count", () => {
    render(<TemplateItem template={mockTemplate} />);
    expect(screen.getByText("150")).toBeInTheDocument();
  });

  it("displays open rate", () => {
    render(<TemplateItem template={mockTemplate} />);
    expect(screen.getByText("45%")).toBeInTheDocument();
  });

  it("displays reply rate", () => {
    render(<TemplateItem template={mockTemplate} />);
    expect(screen.getByText("12%")).toBeInTheDocument();
  });

  it("displays last used information", () => {
    render(<TemplateItem template={mockTemplate} />);
    expect(screen.getByText("2 days ago")).toBeInTheDocument();
  });

  it("renders link to template detail page", () => {
    const { container } = render(<TemplateItem template={mockTemplate} />);
    const links = container.querySelectorAll(
      'a[href="/dashboard/templates/1"]'
    );
    expect(links.length).toBeGreaterThan(0);
  });

  it("renders template actions", () => {
    render(<TemplateItem template={mockTemplate} />);
    expect(screen.getByTestId("template-actions")).toBeInTheDocument();
  });

  it("renders all stat icons", () => {
    const { container } = render(<TemplateItem template={mockTemplate} />);
    const icons = container.querySelectorAll("svg");
    // Should have icons for: Mail (header), Mail (usage), Eye (open rate), TrendingUp (reply rate), Clock (last used)
    expect(icons.length).toBeGreaterThanOrEqual(5);
  });

  it("applies hover shadow effect", () => {
    const { container } = render(<TemplateItem template={mockTemplate} />);
    const card = container.querySelector('[class*="hover:shadow"]');
    expect(card).toBeInTheDocument();
  });

  it("shows subject label", () => {
    render(<TemplateItem template={mockTemplate} />);
    expect(screen.getByText(/Subject :/)).toBeInTheDocument();
  });

  it("truncates long template name", () => {
    const { container } = render(<TemplateItem template={mockTemplate} />);
    const titleElement = container.querySelector('[class*="line-clamp-1"]');
    expect(titleElement).toBeInTheDocument();
  });

  it("truncates long subject", () => {
    const { container } = render(<TemplateItem template={mockTemplate} />);
    const subjectElement = container.querySelector('[class*="line-clamp-2"]');
    expect(subjectElement).toBeInTheDocument();
  });

  it("renders as a card component", () => {
    const { container } = render(<TemplateItem template={mockTemplate} />);
    expect(container.querySelector('[class*="card"]')).toBeInTheDocument();
  });
});
