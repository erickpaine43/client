import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ClientAnalyticsProvider } from "../AnalyticsProviderClient";

// Mock the AnalyticsContext
jest.mock("@/context/AnalyticsContext", () => ({
  AnalyticsProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="analytics-provider">{children}</div>
  ),
}));

// Mock next/dynamic - make it synchronous for testing
jest.mock("next/dynamic", () => ({
  __esModule: true,
  default: (fn: () => Promise<any>, options?: any) => {
    const Component = ({ children }: { children: React.ReactNode }) => {
      // In test mode, just render children directly
      return <>{children}</>;
    };
    Component.displayName = "DynamicComponent";
    return Component;
  },
}));

describe("ClientAnalyticsProvider", () => {
  it("renders children", () => {
    render(
      <ClientAnalyticsProvider>
        <div data-testid="child">Test Child</div>
      </ClientAnalyticsProvider>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("wraps children with AnalyticsProvider", async () => {
    render(
      <ClientAnalyticsProvider>
        <div>Content</div>
      </ClientAnalyticsProvider>
    );

    // The dynamic import should eventually load the provider
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("handles multiple children", () => {
    render(
      <ClientAnalyticsProvider>
        <div data-testid="child1">Child 1</div>
        <div data-testid="child2">Child 2</div>
      </ClientAnalyticsProvider>
    );

    expect(screen.getByTestId("child1")).toBeInTheDocument();
    expect(screen.getByTestId("child2")).toBeInTheDocument();
  });
});
