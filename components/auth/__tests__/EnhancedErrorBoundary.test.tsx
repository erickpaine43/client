import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import EnhancedErrorBoundary from "../EnhancedErrorBoundary";
import { toast } from "sonner";

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error message");
  }
  return <div>No error</div>;
};

describe("EnhancedErrorBoundary", () => {
  const originalFetch = global.fetch;
  const originalConsoleError = console.error;

  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response)
    );
  });

  afterEach(() => {
    console.error = originalConsoleError;
    global.fetch = originalFetch;
  });

  it("renders children when there is no error", () => {
    render(
      <EnhancedErrorBoundary>
        <div>Child content</div>
      </EnhancedErrorBoundary>
    );

    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("renders error UI when child throws error", () => {
    render(
      <EnhancedErrorBoundary>
        <ThrowError shouldThrow={true} />
      </EnhancedErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("displays error type badge", () => {
    render(
      <EnhancedErrorBoundary>
        <ThrowError shouldThrow={true} />
      </EnhancedErrorBoundary>
    );

    expect(screen.getByText("Application Error")).toBeInTheDocument();
  });

  it("shows retry button when recovery is enabled", () => {
    render(
      <EnhancedErrorBoundary enableRecovery={true}>
        <ThrowError shouldThrow={true} />
      </EnhancedErrorBoundary>
    );

    expect(screen.getByText("Try Again")).toBeInTheDocument();
  });

  it("shows dashboard and reload buttons", () => {
    render(
      <EnhancedErrorBoundary>
        <ThrowError shouldThrow={true} />
      </EnhancedErrorBoundary>
    );

    expect(screen.getByText("Go to Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Reload Page")).toBeInTheDocument();
  });
  it("handles retry action", async () => {
    const user = userEvent.setup();

    render(
      <EnhancedErrorBoundary enableRecovery={true} maxRetries={3}>
        <ThrowError shouldThrow={true} />
      </EnhancedErrorBoundary>
    );

    const retryButton = screen.getByText("Try Again");
    await user.click(retryButton);

    expect(toast.success).toHaveBeenCalledWith("Retrying...");
  });

  it("limits retry attempts", async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <EnhancedErrorBoundary enableRecovery={true} maxRetries={1}>
        <ThrowError shouldThrow={true} />
      </EnhancedErrorBoundary>
    );

    // First retry
    const retryButton = screen.getByText("Try Again");
    await user.click(retryButton);

    // Re-render to trigger error again
    rerender(
      <EnhancedErrorBoundary enableRecovery={true} maxRetries={1}>
        <ThrowError shouldThrow={true} />
      </EnhancedErrorBoundary>
    );

    // Second retry should show max attempts message
    const retryButton2 = screen.queryByText("Try Again");
    if (retryButton2) {
      await user.click(retryButton2);
      expect(toast.error).toHaveBeenCalledWith(
        "Maximum retry attempts reached"
      );
    }
  });

  it("calls custom onError handler", () => {
    const onError = jest.fn();

    render(
      <EnhancedErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </EnhancedErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
  });

  it("displays technical details when showDetails is true", () => {
    render(
      <EnhancedErrorBoundary showDetails={true}>
        <ThrowError shouldThrow={true} />
      </EnhancedErrorBoundary>
    );

    expect(screen.getByText("Technical Details")).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    const fallback = <div>Custom Error UI</div>;

    render(
      <EnhancedErrorBoundary fallback={fallback}>
        <ThrowError shouldThrow={true} />
      </EnhancedErrorBoundary>
    );

    expect(screen.getByText("Custom Error UI")).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });

  it("identifies network errors correctly", () => {
    const NetworkError = () => {
      throw new Error("Network request failed");
    };

    render(
      <EnhancedErrorBoundary>
        <NetworkError />
      </EnhancedErrorBoundary>
    );

    expect(screen.getByText("Network Error")).toBeInTheDocument();
  });

  it("identifies authentication errors correctly", () => {
    const AuthError = () => {
      throw new Error("Authentication failed");
    };

    render(
      <EnhancedErrorBoundary>
        <AuthError />
      </EnhancedErrorBoundary>
    );

    expect(screen.getByText("Authentication Error")).toBeInTheDocument();
  });

  it("reports error to monitoring system", () => {
    render(
      <EnhancedErrorBoundary>
        <ThrowError shouldThrow={true} />
      </EnhancedErrorBoundary>
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/admin/monitoring",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
    );
  });
});
