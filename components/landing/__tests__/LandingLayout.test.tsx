import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { LandingLayout } from "../LandingLayout";

// Mock child components
jest.mock("../navbar", () => ({
  __esModule: true,
  default: () => <div data-testid="navbar">Navbar</div>,
}));

jest.mock("../footer", () => ({
  __esModule: true,
  default: () => <div data-testid="footer">Footer</div>,
}));

jest.mock("../go-to-top", () => ({
  __esModule: true,
  default: () => <div data-testid="go-to-top">Go To Top</div>,
}));

describe("LandingLayout", () => {
  it("renders all layout components", () => {
    render(
      <LandingLayout>
        <div>Content</div>
      </LandingLayout>
    );

    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    expect(screen.getByTestId("go-to-top")).toBeInTheDocument();
  });

  it("renders children content", () => {
    render(
      <LandingLayout>
        <div data-testid="child-content">Test Content</div>
      </LandingLayout>
    );

    expect(screen.getByTestId("child-content")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("applies constrained width by default", () => {
    const { container } = render(
      <LandingLayout>
        <div>Content</div>
      </LandingLayout>
    );

    const contentWrapper = container.querySelector(".max-w-7xl");
    expect(contentWrapper).toBeInTheDocument();
  });

  it("applies full width when fullWidth prop is true", () => {
    const { container } = render(
      <LandingLayout fullWidth={true}>
        <div>Content</div>
      </LandingLayout>
    );

    const contentWrapper = container.querySelector(".px-0");
    expect(contentWrapper).toBeInTheDocument();
  });

  it("has min-h-screen for full viewport height", () => {
    const { container } = render(
      <LandingLayout>
        <div>Content</div>
      </LandingLayout>
    );

    const main = container.querySelector("main");
    expect(main).toHaveClass("min-h-screen");
  });

  it("renders navbar at the top", () => {
    const { container } = render(
      <LandingLayout>
        <div>Content</div>
      </LandingLayout>
    );

    const navbar = screen.getByTestId("navbar");
    const main = container.querySelector("main");

    expect(navbar.compareDocumentPosition(main!)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it("renders footer after main content", () => {
    const { container } = render(
      <LandingLayout>
        <div>Content</div>
      </LandingLayout>
    );

    const main = container.querySelector("main");
    const footer = screen.getByTestId("footer");

    expect(main!.compareDocumentPosition(footer)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it("handles multiple children", () => {
    render(
      <LandingLayout>
        <div data-testid="child1">Child 1</div>
        <div data-testid="child2">Child 2</div>
      </LandingLayout>
    );

    expect(screen.getByTestId("child1")).toBeInTheDocument();
    expect(screen.getByTestId("child2")).toBeInTheDocument();
  });

  it("applies proper flexbox layout", () => {
    const { container } = render(
      <LandingLayout>
        <div>Content</div>
      </LandingLayout>
    );

    const main = container.querySelector("main");
    expect(main).toHaveClass("flex", "flex-col");
  });
});
