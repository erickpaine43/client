import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Providers } from "../providers";

// Mock dependencies
jest.mock("@tanstack/react-query", () => ({
  QueryClient: jest.fn(() => ({
    defaultOptions: {},
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="query-provider">{children}</div>
  ),
}));

jest.mock("next-themes", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
}));

jest.mock("@/context/ClientPreferencesContext", () => ({
  ClientPreferencesProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="preferences-provider">{children}</div>
  ),
}));

jest.mock("@/components/analytics/ConvexProvider", () => ({
  ConvexProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="convex-provider">{children}</div>
  ),
}));

describe("Providers", () => {
  it("renders children", () => {
    render(
      <Providers>
        <div data-testid="child">Test Child</div>
      </Providers>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("wraps children with QueryClientProvider", () => {
    render(
      <Providers>
        <div>Content</div>
      </Providers>
    );

    expect(screen.getByTestId("query-provider")).toBeInTheDocument();
  });

  it("wraps children with ThemeProvider", () => {
    render(
      <Providers>
        <div>Content</div>
      </Providers>
    );

    expect(screen.getByTestId("theme-provider")).toBeInTheDocument();
  });

  it("wraps children with ConvexProvider", () => {
    render(
      <Providers>
        <div>Content</div>
      </Providers>
    );

    expect(screen.getByTestId("convex-provider")).toBeInTheDocument();
  });

  it("wraps children with ClientPreferencesProvider", () => {
    render(
      <Providers>
        <div>Content</div>
      </Providers>
    );

    expect(screen.getByTestId("preferences-provider")).toBeInTheDocument();
  });

  it("renders all providers in correct nesting order", () => {
    render(
      <Providers>
        <div data-testid="content">Content</div>
      </Providers>
    );

    // Verify the nesting structure
    const queryProvider = screen.getByTestId("query-provider");
    const themeProvider = screen.getByTestId("theme-provider");
    const convexProvider = screen.getByTestId("convex-provider");
    const preferencesProvider = screen.getByTestId("preferences-provider");

    expect(queryProvider).toContainElement(themeProvider);
    expect(themeProvider).toContainElement(convexProvider);
    expect(convexProvider).toContainElement(preferencesProvider);
    expect(preferencesProvider).toContainElement(screen.getByTestId("content"));
  });

  it("handles multiple children", () => {
    render(
      <Providers>
        <div data-testid="child1">Child 1</div>
        <div data-testid="child2">Child 2</div>
      </Providers>
    );

    expect(screen.getByTestId("child1")).toBeInTheDocument();
    expect(screen.getByTestId("child2")).toBeInTheDocument();
  });
});
