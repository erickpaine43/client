/**
 * Enhanced Authentication System Tests
 *
 * Tests the enhanced AuthContext and related components that integrate
 * with the completed NileDB services and API routes.
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { jest } from "@jest/globals";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useTenantAccess } from "@/hooks/useEnhancedAuth";
import TenantCompanySelector from "@/components/auth/TenantCompanySelector";
import StaffDashboard from "@/components/auth/StaffDashboard";

// Mock fetch globally
const mockFetch = jest.fn() as jest.MockedFunction<typeof global.fetch>;
global.fetch = mockFetch;
// Mock fetch globally

// Mock NileDB hooks
jest.mock("@niledatabase/react", () => ({
  useSignIn: jest.fn(() => ({
    signIn: jest.fn(),
  })),
  useSignUp: jest.fn(() => ({
    signUp: jest.fn(),
  })),
}));

jest.mock("@niledatabase/client", () => ({
  auth: {
    getSession: jest.fn(),
    signOut: jest.fn(),
  },
}));

// Mock toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Test component to access auth context
const TestAuthComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="loading">{auth.loading ? "loading" : "loaded"}</div>
      <div data-testid="user">{auth.user?.email || "no-user"}</div>
      <div data-testid="staff">{auth.isStaff ? "staff" : "not-staff"}</div>
      <div data-testid="tenants">{auth.userTenants.length}</div>
      <div data-testid="companies">{auth.userCompanies.length}</div>
      <button onClick={() => auth.setSelectedTenant("tenant-1")}>
        Select Tenant
      </button>
      <button onClick={() => auth.refreshTenants()}>Refresh Tenants</button>
    </div>
  );
};

describe("Enhanced Authentication System", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe("AuthProvider", () => {
    it("should initialize with loading state", () => {
      render(
        <AuthProvider>
          <TestAuthComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId("loading")).toHaveTextContent("loading");
      expect(screen.getByTestId("user")).toHaveTextContent("no-user");
    });

    it("should fetch user profile on initialization", async () => {
      const mockProfile = {
        id: "user-1",
        email: "test@example.com",
        name: "Test User",
        profile: {
          userId: "user-1",
          role: "user",
          isPenguinMailsStaff: false,
          preferences: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        tenants: ["tenant-1"],
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ authenticated: true }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ profile: mockProfile }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ tenants: [] }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ companies: [] }),
        } as Response);

      render(
        <AuthProvider>
          <TestAuthComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });

      expect(screen.getByTestId("user")).toHaveTextContent("test@example.com");
      expect(screen.getByTestId("staff")).toHaveTextContent("not-staff");
    });

    it("should handle staff users correctly", async () => {
      const mockStaffProfile = {
        id: "staff-1",
        email: "staff@example.com",
        name: "Staff User",
        profile: {
          userId: "staff-1",
          role: "admin",
          isPenguinMailsStaff: true,
          preferences: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        tenants: [],
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ authenticated: true }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ profile: mockStaffProfile }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ tenants: [] }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ companies: [] }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ status: "healthy" }),
        } as Response);

      render(
        <AuthProvider>
          <TestAuthComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("staff")).toHaveTextContent("staff");
      });
    });

    it("should refresh tenants when requested", async () => {
      const mockTenants = [
        { id: "tenant-1", name: "Tenant 1", created: "2024-01-01" },
        { id: "tenant-2", name: "Tenant 2", created: "2024-01-02" },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ tenants: mockTenants }),
      } as Response);

      render(
        <AuthProvider>
          <TestAuthComponent />
        </AuthProvider>
      );

      const refreshButton = screen.getByText("Refresh Tenants");
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/user/tenants", {
          method: "GET",
          credentials: "include",
        });
      });
    });
  });

  describe("useTenantAccess Hook", () => {
    const TestTenantAccess = ({ tenantId }: { tenantId?: string }) => {
      const access = useTenantAccess(tenantId);
      return (
        <div>
          <div data-testid="has-access">{access.hasAccess ? "yes" : "no"}</div>
          <div data-testid="role">{access.role || "no-role"}</div>
          <div data-testid="loading">
            {access.loading ? "loading" : "loaded"}
          </div>
        </div>
      );
    };

    it("should check tenant access via API", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ role: "admin" }),
      } as Response);

      render(
        <AuthProvider>
          <TestTenantAccess tenantId="tenant-1" />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("has-access")).toHaveTextContent("yes");
        expect(screen.getByTestId("role")).toHaveTextContent("admin");
      });
    });

    it("should handle access denied", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
      } as Response);

      render(
        <AuthProvider>
          <TestTenantAccess tenantId="tenant-1" />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("has-access")).toHaveTextContent("no");
      });
    });
  });

  describe("TenantCompanySelector Component", () => {
    it("should render tenant selector", async () => {
      render(
        <AuthProvider>
          <TenantCompanySelector />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Context Selection")).toBeInTheDocument();
      });
      expect(screen.getByText("Tenant")).toBeInTheDocument();
    });

    it("should show staff badge for staff users", async () => {
      const mockStaffProfile = {
        id: "staff-1",
        email: "staff@example.com",
        profile: {
          isPenguinMailsStaff: true,
          role: "admin",
        },
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ authenticated: true }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ profile: mockStaffProfile }),
        } as Response)
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ tenants: [], companies: [] }),
        } as Response);

      render(
        <AuthProvider>
          <TenantCompanySelector />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Staff")).toBeInTheDocument();
      });
    });
  });

  describe("StaffDashboard Component", () => {
    it("should show access denied for non-staff users", () => {
      render(
        <AuthProvider>
          <StaffDashboard />
        </AuthProvider>
      );

      expect(
        screen.getByText("Staff access required to view this dashboard.")
      ).toBeInTheDocument();
    });

    it("should render dashboard for staff users", async () => {
      const mockStaffProfile = {
        id: "staff-1",
        email: "staff@example.com",
        name: "Staff User",
        profile: {
          isPenguinMailsStaff: true,
          role: "admin",
        },
      };

      const mockMetrics = {
        performance: {
          requestsPerMinute: 100,
          averageResponseTime: 250,
          errorRate: 0.01,
        },
        database: {
          connectionCount: 10,
          queryPerformance: 50,
          healthStatus: "healthy",
        },
        users: {
          activeUsers: 50,
          totalUsers: 100,
          staffUsers: 5,
        },
        tenants: {
          totalTenants: 20,
          activeTenants: 18,
        },
        companies: {
          totalCompanies: 45,
          activeCompanies: 40,
        },
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ authenticated: true }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ profile: mockStaffProfile }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ tenants: [], companies: [] }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ status: "healthy" }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ metrics: mockMetrics, alerts: [] }),
        } as Response);

      render(
        <AuthProvider>
          <StaffDashboard />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Staff Dashboard")).toBeInTheDocument();
        expect(
          screen.getByText("System monitoring and administration")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle API errors gracefully", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      render(
        <AuthProvider>
          <TestAuthComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
        expect(screen.getByTestId("user")).toHaveTextContent("no-user");
      });
    });

    it("should handle authentication errors", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
      } as Response);

      render(
        <AuthProvider>
          <TestAuthComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
      });
    });
  });
});
