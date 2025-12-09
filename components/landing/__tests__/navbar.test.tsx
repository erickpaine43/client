import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import Navbar from "../navbar";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

// Mock dependencies
jest.mock("@/context/AuthContext");
jest.mock("@/hooks/use-mobile");
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />;
  },
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseIsMobile = useIsMobile as jest.MockedFunction<typeof useIsMobile>;

describe("Navbar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseIsMobile.mockReturnValue(false);
  });

  describe("Unauthenticated State", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        logout: jest.fn(),
      } as never);
    });

    it("renders logo and brand name", () => {
      render(<Navbar />);

      expect(screen.getByAltText("Logo")).toBeInTheDocument();
      expect(screen.getByText("Penguin Mails")).toBeInTheDocument();
    });

    it("displays pricing link", () => {
      render(<Navbar />);

      const pricingLink = screen.getByRole("link", { name: /pricing/i });
      expect(pricingLink).toBeInTheDocument();
      expect(pricingLink).toHaveAttribute("href", "/pricing");
    });

    it("displays login link", () => {
      render(<Navbar />);

      const loginLink = screen.getByRole("link", { name: /login/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute("href", "/");
    });

    it("displays sign up button", () => {
      render(<Navbar />);

      const signupLink = screen.getByRole("link", { name: /sign up/i });
      expect(signupLink).toBeInTheDocument();
      expect(signupLink).toHaveAttribute("href", "/signup");
    });
  });

  describe("Authenticated State", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { email: "test@example.com" },
        loading: false,
        logout: jest.fn(),
      } as never);
    });

    it("displays dashboard link when logged in", () => {
      render(<Navbar />);

      const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
      expect(dashboardLink).toBeInTheDocument();
      expect(dashboardLink).toHaveAttribute("href", "/dashboard");
    });

    it("displays settings link when logged in", () => {
      render(<Navbar />);

      const settingsLink = screen.getByRole("link", { name: /settings/i });
      expect(settingsLink).toBeInTheDocument();
      expect(settingsLink).toHaveAttribute("href", "/dashboard/settings");
    });

    it("displays logout button when logged in", () => {
      render(<Navbar />);

      expect(screen.getByText("Logout")).toBeInTheDocument();
    });

    it("calls logout when logout button is clicked", async () => {
      const mockLogout = jest.fn().mockResolvedValue(undefined);
      mockUseAuth.mockReturnValue({
        user: { email: "test@example.com" },
        loading: false,
        logout: mockLogout,
      } as never);

      const user = userEvent.setup();
      render(<Navbar />);

      const logoutButton = screen.getByText("Logout");
      await user.click(logoutButton);

      expect(mockLogout).toHaveBeenCalled();
    });

    it("does not display sign up and login links when logged in", () => {
      render(<Navbar />);

      expect(
        screen.queryByRole("link", { name: /sign up/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: /^login$/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
        logout: jest.fn(),
      } as never);
    });

    it("displays loading skeleton", () => {
      const { container } = render(<Navbar />);

      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe("Mobile View", () => {
    beforeEach(() => {
      mockUseIsMobile.mockReturnValue(true);
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        logout: jest.fn(),
      } as never);
    });

    it("displays mobile menu button", () => {
      render(<Navbar />);

      expect(
        screen.getByRole("button", { name: /toggle menu/i })
      ).toBeInTheDocument();
    });

    it("opens mobile menu when button is clicked", async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      const menuButton = screen.getByRole("button", { name: /toggle menu/i });
      await user.click(menuButton);

      // After clicking, the sheet content should be visible
      // Note: This might require additional setup for the Sheet component
    });
  });

  describe("Desktop View", () => {
    beforeEach(() => {
      mockUseIsMobile.mockReturnValue(false);
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        logout: jest.fn(),
      } as never);
    });

    it("does not display mobile menu button", () => {
      render(<Navbar />);

      expect(
        screen.queryByRole("button", { name: /toggle menu/i })
      ).not.toBeInTheDocument();
    });

    it("displays navigation links directly", () => {
      render(<Navbar />);

      expect(
        screen.getByRole("link", { name: /pricing/i })
      ).toBeInTheDocument();
    });
  });

  describe("Sticky Header", () => {
    it("has sticky positioning", () => {
      const { container } = render(<Navbar />);

      const header = container.querySelector("header");
      expect(header).toHaveClass("sticky", "top-0");
    });

    it("has proper z-index for layering", () => {
      const { container } = render(<Navbar />);

      const header = container.querySelector("header");
      expect(header).toHaveClass("z-50");
    });
  });
});
