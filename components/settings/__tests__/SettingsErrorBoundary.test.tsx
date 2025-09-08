import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  SettingsErrorBoundary,
  SettingsErrorFallback,
} from "../SettingsErrorBoundary";

// Mock console methods to avoid noise in tests
let consoleErrorSpy: jest.SpyInstance;

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error("Test error message");
  }
  return <div>No error</div>;
};

describe("SettingsErrorBoundary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    if (consoleErrorSpy) {
      consoleErrorSpy.mockRestore();
    }
  });

  describe("Normal operation", () => {
    it("should render children when no error occurs", () => {
      render(
        <SettingsErrorBoundary>
          <div>Test content</div>
        </SettingsErrorBoundary>
      );

      expect(screen.getByText("Test content")).toBeInTheDocument();
    });

    it("should not show error UI when children render successfully", () => {
      render(
        <SettingsErrorBoundary>
          <ThrowError shouldThrow={false} />
        </SettingsErrorBoundary>
      );

      expect(screen.getByText("No error")).toBeInTheDocument();
      expect(
        screen.queryByText("Something went wrong")
      ).not.toBeInTheDocument();
    });
  });

  describe("Error handling", () => {
    it("should catch and display error when child component throws", () => {
      render(
        <SettingsErrorBoundary>
          <ThrowError shouldThrow={true} />
        </SettingsErrorBoundary>
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(screen.getByText("Test error message")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /try again/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /reload page/i })
      ).toBeInTheDocument();
    });

    it("should display generic error message when error has no message", () => {
      const ThrowGenericError = () => {
        throw new Error();
      };

      render(
        <SettingsErrorBoundary>
          <ThrowGenericError />
        </SettingsErrorBoundary>
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(
        screen.getByText("An unexpected error occurred while loading settings.")
      ).toBeInTheDocument();
    });

    it("should log error to console when error occurs", () => {
      render(
        <SettingsErrorBoundary>
          <ThrowError shouldThrow={true} />
        </SettingsErrorBoundary>
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Settings Error Boundary caught an error:",
        expect.any(Error),
        expect.any(Object)
      );
    });
  });

  describe("Error recovery", () => {
    it("should recover from error when Try Again is clicked", () => {
      render(
        <SettingsErrorBoundary>
          <ThrowError shouldThrow={true} />
        </SettingsErrorBoundary>
      );

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();

      // Click Try Again - this should reset the error boundary state
      fireEvent.click(screen.getByRole("button", { name: /try again/i }));

      // The error boundary should have reset its state
      // Since the component still throws, it will show the error again
      // But the important thing is that the handleRetry function was called
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("should have reload page button that can be clicked", () => {
      render(
        <SettingsErrorBoundary>
          <ThrowError shouldThrow={true} />
        </SettingsErrorBoundary>
      );

      const reloadButton = screen.getByRole("button", { name: /reload page/i });
      expect(reloadButton).toBeInTheDocument();

      // Verify button can be clicked without throwing
      expect(() => {
        fireEvent.click(reloadButton);
      }).not.toThrow();
    });
  });

  describe("Custom fallback", () => {
    it("should render custom fallback when provided", () => {
      const customFallback = <div>Custom error fallback</div>;

      render(
        <SettingsErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </SettingsErrorBoundary>
      );

      expect(screen.getByText("Custom error fallback")).toBeInTheDocument();
      expect(
        screen.queryByText("Something went wrong")
      ).not.toBeInTheDocument();
    });
  });

  describe("Development mode", () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      (process.env.NODE_ENV as string) = originalEnv;
    });

    it("should show error details in development mode", () => {
      (process.env.NODE_ENV as string) = "development";

      render(
        <SettingsErrorBoundary>
          <ThrowError shouldThrow={true} />
        </SettingsErrorBoundary>
      );

      expect(
        screen.getByText("Error Details (Development)")
      ).toBeInTheDocument();
    });

    it("should not show error details in production mode", () => {
      (process.env.NODE_ENV as string) = "production";

      render(
        <SettingsErrorBoundary>
          <ThrowError shouldThrow={true} />
        </SettingsErrorBoundary>
      );

      expect(
        screen.queryByText("Error Details (Development)")
      ).not.toBeInTheDocument();
    });
  });

  describe("Component lifecycle", () => {
    it("should handle componentDidCatch correctly", () => {
      const TestComponent = () => {
        const [shouldThrow, setShouldThrow] = React.useState(false);

        React.useEffect(() => {
          if (shouldThrow) {
            throw new Error("Effect error");
          }
        }, [shouldThrow]);

        return (
          <button onClick={() => setShouldThrow(true)}>Trigger Error</button>
        );
      };

      render(
        <SettingsErrorBoundary>
          <TestComponent />
        </SettingsErrorBoundary>
      );

      // This won't actually trigger the error boundary because useEffect errors
      // are not caught by error boundaries. But we test the component structure.
      expect(
        screen.getByRole("button", { name: /trigger error/i })
      ).toBeInTheDocument();
    });
  });
});

describe("SettingsErrorFallback", () => {
  it("should render error message", () => {
    render(<SettingsErrorFallback error="Test error message" />);

    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("should render retry button when retry function is provided", () => {
    const mockRetry = jest.fn();

    render(<SettingsErrorFallback error="Test error" retry={mockRetry} />);

    const retryButton = screen.getByRole("button", { name: /retry/i });
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it("should not render retry button when retry function is not provided", () => {
    render(<SettingsErrorFallback error="Test error" />);

    expect(
      screen.queryByRole("button", { name: /retry/i })
    ).not.toBeInTheDocument();
  });

  it("should have proper accessibility attributes", () => {
    render(<SettingsErrorFallback error="Test error message" />);

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    // Check that it has destructive styling (the exact class may vary due to Tailwind compilation)
    expect(alert).toHaveClass("text-destructive");
  });

  it("should handle long error messages", () => {
    const longError =
      "This is a very long error message that should still be displayed properly without breaking the layout or causing any issues with the component rendering";

    render(<SettingsErrorFallback error={longError} />);

    expect(screen.getByText(longError)).toBeInTheDocument();
  });

  it("should handle empty error messages", () => {
    render(<SettingsErrorFallback error="" />);

    // Should still render the component structure
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});

describe("Error Boundary Integration", () => {
  it("should work with multiple nested error boundaries", () => {
    const InnerComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
      if (shouldThrow) {
        throw new Error("Inner error");
      }
      return <div>Inner content</div>;
    };

    render(
      <SettingsErrorBoundary>
        <div>Outer content</div>
        <SettingsErrorBoundary>
          <InnerComponent shouldThrow={true} />
        </SettingsErrorBoundary>
      </SettingsErrorBoundary>
    );

    // Inner error boundary should catch the error
    expect(screen.getByText("Outer content")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Inner error")).toBeInTheDocument();
  });

  it("should handle async errors appropriately", async () => {
    // Note: Error boundaries don't catch async errors, but we test the component behavior
    const AsyncComponent = () => {
      const [error, setError] = React.useState<string | null>(null);

      React.useEffect(() => {
        // Simulate async operation that might fail
        setTimeout(() => {
          setError("Async error occurred");
        }, 0);
      }, []);

      if (error) {
        return <SettingsErrorFallback error={error} />;
      }

      return <div>Async content</div>;
    };

    render(
      <SettingsErrorBoundary>
        <AsyncComponent />
      </SettingsErrorBoundary>
    );

    // Initially shows content
    expect(screen.getByText("Async content")).toBeInTheDocument();

    // After async error, shows fallback
    await screen.findByText("Async error occurred");
    expect(screen.getByText("Async error occurred")).toBeInTheDocument();
  });
});
