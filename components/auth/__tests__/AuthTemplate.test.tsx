import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { AuthTemplate } from "../AuthTemplate";
import { useRouter } from "next/navigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock Nile components
jest.mock("@niledatabase/react", () => ({
  UserInfo: () => <div data-testid="user-info">User Info Component</div>,
  SignOutButton: ({
    className,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button data-testid="sign-out-button" className={className} {...props}>
      Sign Out
    </button>
  ),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe("AuthTemplate", () => {
  const mockPush = jest.fn();
  const TestIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="test-icon" {...props} />
  );

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as never);
  });

  describe("Form Mode", () => {
    it("renders form mode with title and description", () => {
      render(
        <AuthTemplate
          mode="form"
          title="Login"
          description="Enter your credentials"
        />
      );

      expect(screen.getByText("Login")).toBeInTheDocument();
      expect(screen.getByText("Enter your credentials")).toBeInTheDocument();
    });

    it("renders children in form mode", () => {
      render(
        <AuthTemplate mode="form" title="Login" description="Enter credentials">
          <input placeholder="Email" />
        </AuthTemplate>
      );

      expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    });

    it("displays error message when provided", () => {
      render(
        <AuthTemplate
          mode="form"
          title="Login"
          description="Enter credentials"
          error="Invalid credentials"
        />
      );

      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
      expect(screen.getByText("Error")).toBeInTheDocument();
    });

    it("renders footer in form mode", () => {
      render(
        <AuthTemplate
          mode="form"
          title="Login"
          description="Enter credentials"
          footer={<div>Need an account?</div>}
        />
      );

      expect(screen.getByText("Need an account?")).toBeInTheDocument();
    });

    it("renders icon when provided", () => {
      render(
        <AuthTemplate
          mode="form"
          icon={TestIcon}
          title="Login"
          description="Enter credentials"
        />
      );

      expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    });
  });

  describe("Logged In Mode", () => {
    it("renders logged in mode with user info", () => {
      render(
        <AuthTemplate
          mode="loggedIn"
          title="Welcome Back"
          description="You are logged in"
        />
      );

      expect(screen.getByTestId("user-info")).toBeInTheDocument();
      expect(screen.getByTestId("sign-out-button")).toBeInTheDocument();
    });

    it("shows dashboard button in logged in mode", () => {
      render(
        <AuthTemplate
          mode="loggedIn"
          title="Welcome"
          description="You are logged in"
        />
      );

      expect(screen.getByText("Go to Dashboard")).toBeInTheDocument();
    });

    it("navigates to dashboard when button is clicked", async () => {
      const user = userEvent.setup();

      render(
        <AuthTemplate
          mode="loggedIn"
          title="Welcome"
          description="You are logged in"
        />
      );

      const dashboardButton = screen.getByText("Go to Dashboard");
      await user.click(dashboardButton);

      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });

    it("does not render footer in logged in mode", () => {
      render(
        <AuthTemplate
          mode="loggedIn"
          title="Welcome"
          description="Logged in"
          footer={<div>This should not appear</div>}
        />
      );

      expect(
        screen.queryByText("This should not appear")
      ).not.toBeInTheDocument();
    });

    it("does not render error in logged in mode", () => {
      render(
        <AuthTemplate
          mode="loggedIn"
          title="Welcome"
          description="Logged in"
          error="This error should not appear"
        />
      );

      expect(
        screen.queryByText("This error should not appear")
      ).not.toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("has proper card structure", () => {
      const { container } = render(
        <AuthTemplate mode="form" title="Test" description="Test description" />
      );

      expect(container.querySelector(".max-w-sm")).toBeInTheDocument();
    });

    it("centers content", () => {
      const { container } = render(
        <AuthTemplate mode="form" title="Test" description="Test" />
      );

      expect(
        container.querySelector(".items-center.justify-center")
      ).toBeInTheDocument();
    });
  });
});
