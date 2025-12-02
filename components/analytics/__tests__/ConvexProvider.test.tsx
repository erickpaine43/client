import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ConvexProvider, useConvexStatus } from "../ConvexProvider";
import { renderHook } from "@testing-library/react";

// Mock convex/react
jest.mock("convex/react", () => ({
  ConvexProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="convex-provider">{children}</div>
  ),
  ConvexReactClient: jest.fn().mockImplementation(() => ({
    query: jest.fn(),
    mutation: jest.fn(),
  })),
}));

describe("ConvexProvider", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("renders children when Convex URL is provided", () => {
    process.env.NEXT_PUBLIC_CONVEX_URL = "https://test.convex.cloud";

    render(
      <ConvexProvider>
        <div data-testid="child">Test Child</div>
      </ConvexProvider>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders children directly when no Convex URL is provided", () => {
    delete process.env.NEXT_PUBLIC_CONVEX_URL;

    render(
      <ConvexProvider>
        <div data-testid="child">Test Child</div>
      </ConvexProvider>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.queryByTestId("convex-provider")).not.toBeInTheDocument();
  });

  it("logs warning when Convex URL is missing", () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
    delete process.env.NEXT_PUBLIC_CONVEX_URL;

    render(
      <ConvexProvider>
        <div>Content</div>
      </ConvexProvider>
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      "NEXT_PUBLIC_CONVEX_URL not found. Real-time features will be disabled."
    );

    consoleSpy.mockRestore();
  });

  it("wraps children with BaseConvexProvider when URL is available", () => {
    process.env.NEXT_PUBLIC_CONVEX_URL = "https://test.convex.cloud";

    render(
      <ConvexProvider>
        <div data-testid="child">Content</div>
      </ConvexProvider>
    );

    expect(screen.getByTestId("convex-provider")).toBeInTheDocument();
  });
});

describe("useConvexStatus", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns available status when URL is set", () => {
    process.env.NEXT_PUBLIC_CONVEX_URL = "https://test.convex.cloud";

    const { result } = renderHook(() => useConvexStatus());

    expect(result.current.isAvailable).toBe(true);
    expect(result.current.isConnected).toBe(true);
    expect(result.current.url).toBe("https://test.convex.cloud");
  });

  it("returns unavailable status when URL is not set", () => {
    delete process.env.NEXT_PUBLIC_CONVEX_URL;

    const { result } = renderHook(() => useConvexStatus());

    expect(result.current.isAvailable).toBe(false);
    expect(result.current.isConnected).toBe(false);
    expect(result.current.url).toBeUndefined();
  });
});
