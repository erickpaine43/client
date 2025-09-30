/**
 * Enhanced Authentication System Tests
 *
 * Comprehensive test suite for the enhanced authentication system from Task 10,
 * including UI components, hooks, and integration with completed services.
 */

import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock the NileDB client and services
jest.mock("@/lib/niledb/client");
jest.mock("@/lib/niledb/auth");
jest.mock("@/lib/niledb/tenant");
jest.mock("@/lib/niledb/company");
jest.mock("@/lib/niledb/monitoring");

// Import components and hooks to test
import { AuthProvider, useAuth } from "@/context/AuthContext";
import {
  useTenantAccess,
  useCompanyAccess,
  useStaffAccess,
  useErrorRecovery,
} from "@/hooks/useEnhancedAuth";
import TenantCompanySelector from "@/components/auth/TenantCompanySelector";
import EnhancedErrorBoundary from "@/components/auth/EnhancedErrorBoundary";
import StaffDashboard from "@/components/auth/StaffDashboard";
import AuthDemo from "@/components/auth/AuthDemo";

// Mock data
const mockUser = {
  id: "user-123",
  email: "test@example.com",
  name: "Test User",
  displayName: "Test User",
  profile: {
    userId: "user-123",
    role: "user" as const,
    isPenguinMailsStaff: false,
    preferences: { theme: "light" as const },
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  tenants: ["tenant-1", "tenant-2"],
};

const mockStaffUser = {
  ...mockUser,
  id: "staff-123",
  email: "staff@penguinmails.com",
  profile: {
    ...mockUser.profile,
    userId: "staff-123",
    role: "admin" as const,
    isPenguinMailsStaff: true,
  },
};

const mockTenants = [
  {
    tenant: {
      id: "tenant-1",
      name: "Test Tenant 1",
      created: new Date().toISOString(),
    },
    companies: [
      {
        id: "company-1",
        name: "Test Company 1",
        role: "owner" as const,
      },
    ],
  },
  {
    tenant: {
      id: "tenant-2",
      name: "Test Tenant 2",
      created: new Date().toISOString(),
    },
    companies: [
      {
        id: "company-2",
        name: "Test Company 2",
        role: "admin" as const,
      },
    ],
  },
];

const mockCompanies = [
  {
    userId: "user-123",
    companyId: "company-1",
    tenantId: "tenant-1",
    role: "owner" as const,
    permissions: { all: true },
    company: {
      id: "company-1",
      name: "Test Company 1",
      email: "company1@example.com",
      tenantId: "tenant-1",
      settings: { plan: "pro" },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Mock fetch for API calls
global.fetch = jest.fn();

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe("Enhanced Authentication System", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.MockedFunction<typeof fetch>).mockClear();
  });

  describe("Enhanced AuthContext", () => {
    it("should provide enhanced authentication state", async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

      // Mock API responses
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ user: mockUser }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ tenants: mockTenants }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ companies: mockCompanies }),
        } as Response);

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await waitFor(() => {
        expect(result.current.user).toBeDefined();
      });

      expect(result.current.user?.uid).toBe("user-123");
      expect(result.current.isStaff).toBe(false);
      expect(result.current.userTenants).toBeDefined();
      expect(result.current.userCompanies).toBeDefined();
    });

    it("should handle staff user authentication", async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ user: mockStaffUser }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ tenants: mockTenants }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ companies: mockCompanies }),
        } as Response);

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await waitFor(() => {
        expect(result.current.user).toBeDefined();
      });

      expect(result.current.user?.uid).toBe("staff-123");
      expect(result.current.isStaff).toBe(true);
      expect(result.current.isStaff).toBe(true);
    });

    it("should manage tenant and company selection", async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ user: mockUser }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ tenants: mockTenants }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ companies: mockCompanies }),
        } as Response);

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await waitFor(() => {
        expect(result.current.user).toBeDefined();
      });

      // Test tenant selection
      act(() => {
        result.current.setSelectedTenant("tenant-1");
      });

      expect(result.current.selectedTenantId).toBe("tenant-1");

      // Test company selection
      act(() => {
        result.current.setSelectedCompany("company-1");
      });

      expect(result.current.selectedCompanyId).toBe("company-1");
    });

    it("should handle authentication errors gracefully", async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

      mockFetch.mockRejectedValueOnce(new Error("Authentication failed"));

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeDefined();
    });
  });

  describe("Enhanced Authentication Hooks", () => {
    describe("useTenantAccess", () => {
      it("should validate tenant access for regular user", async () => {
        const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            tenantAccess: true,
            userRole: "member",
            tenant: { id: "tenant-1", name: "Test Tenant 1" },
          }),
        } as Response);

        const { result } = renderHook(() => useTenantAccess("tenant-1"));

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.hasAccess).toBe(true);
        expect(result.current.role).toBe("member");
        expect(result.current.error).toBeNull();
      });

      it("should handle tenant access denial", async () => {
        const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 403,
          json: async () => ({
            error: "Access denied to tenant",
            code: "TENANT_ACCESS_DENIED",
          }),
        } as Response);

        const { result } = renderHook(() =>
          useTenantAccess("tenant-unauthorized")
        );

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.hasAccess).toBe(false);
        expect(result.current.error).toBe("Access denied to tenant");
      });

      it("should allow staff access to any tenant", async () => {
        const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            tenantAccess: true,
            userRole: "staff",
            tenant: { id: "any-tenant", name: "Any Tenant" },
            staffAccess: true,
          }),
        } as Response);

        const { result } = renderHook(() => useTenantAccess("any-tenant"));

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.hasAccess).toBe(true);
        expect(result.current.role).toBe("staff");
      });
    });

    describe("useCompanyAccess", () => {
      it("should validate company access with role hierarchy", async () => {
        const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            companyAccess: true,
            userRole: "admin",
            company: { id: "company-1", name: "Test Company 1" },
            permissions: { canManageUsers: true },
          }),
        } as Response);

        const { result } = renderHook(() =>
          useCompanyAccess("company-1", "tenant-1")
        );

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.hasAccess).toBe(true);
        expect(result.current.role).toBe("admin");
        expect(result.current.permissions?.canManageUsers).toBe(true);
      });

      it("should handle insufficient company permissions", async () => {
        const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 403,
          json: async () => ({
            error: "Insufficient permissions for company",
            code: "COMPANY_ACCESS_DENIED",
          }),
        } as Response);

        const { result } = renderHook(() =>
          useCompanyAccess("company-restricted", "tenant-1")
        );

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.hasAccess).toBe(false);
        expect(result.current.error).toBe(
          "Insufficient permissions for company"
        );
      });
    });

    describe("useStaffAccess", () => {
      it("should provide staff functionality for staff users", async () => {
        const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            status: "healthy",
            checks: {
              database: { status: "healthy" },
              authentication: { status: "healthy" },
            },
            metrics: {
              totalUsers: 150,
              totalTenants: 25,
            },
          }),
        } as Response);

        const { result } = renderHook(() => useStaffAccess());

        await waitFor(() => {
          expect(result.current.loading).toBe(false);
        });

        expect(result.current.isStaff).toBe(true);
        expect(result.current.systemHealth).toBeDefined();
        expect(result.current.systemHealth?.status).toBe("healthy");
      });

      it("should deny staff functionality for regular users", () => {
        const { result } = renderHook(() => useStaffAccess());

        expect(result.current.isStaff).toBe(false);
        expect(result.current.systemHealth).toBeNull();
      });
    });

    describe("useErrorRecovery", () => {
      it("should handle error recovery with retry mechanisms", async () => {
        const { result } = renderHook(() => useErrorRecovery());

        // Simulate an error
        act(() => {
          result.current.reportError(new Error("Test error"), "unknown");
        });

        expect(result.current.error).toBeDefined();
        expect(result.current.errorMessage).toBe("Test error");
        expect(result.current.canRecover).toBe(true);

        // Test recovery
        const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ recovered: true }),
        } as Response);

        await act(async () => {
          await result.current.recoverFromError();
        });

        expect(result.current.error).toBeNull();
      });

      it("should classify errors correctly", () => {
        const { result } = renderHook(() => useErrorRecovery());

        // Test authentication error
        act(() => {
          result.current.reportError(
            new Error("Authentication required"),
            "authentication"
          );
        });

        expect(result.current.errorType).toBe("authentication");
        expect(result.current.canRecover).toBe(true);

        // Test validation error
        act(() => {
          result.current.reportError(
            new Error("Invalid input"),
            "validation"
          );
        });

        expect(result.current.errorType).toBe("validation");
        expect(result.current.canRecover).toBe(false);
      });
    });
  });

  describe("UI Components", () => {
    describe("TenantCompanySelector", () => {
      it("should render tenant and company selectors", async () => {
        const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ user: mockUser }),
          } as Response)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ tenants: mockTenants }),
          } as Response)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ companies: mockCompanies }),
          } as Response);

        render(
          <TestWrapper>
            <TenantCompanySelector />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText("Select Tenant")).toBeInTheDocument();
        });

        expect(screen.getByText("Select Company")).toBeInTheDocument();
      });

      it("should handle tenant selection", async () => {
        const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ user: mockUser }),
          } as Response)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ tenants: mockTenants }),
          } as Response)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ companies: mockCompanies }),
          } as Response);

        render(
          <TestWrapper>
            <TenantCompanySelector />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText("Select Tenant")).toBeInTheDocument();
        });

        // Click tenant selector
        const tenantSelector = screen.getByText("Select Tenant");
        fireEvent.click(tenantSelector);

        // Should show tenant options
        await waitFor(() => {
          expect(screen.getByText("Test Tenant 1")).toBeInTheDocument();
        });
      });

      it("should show staff badge for staff users", async () => {
        const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ user: mockStaffUser }),
          } as Response)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ tenants: mockTenants }),
          } as Response)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ companies: mockCompanies }),
          } as Response);

        render(
          <TestWrapper>
            <TenantCompanySelector />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText("Staff")).toBeInTheDocument();
        });
      });
    });

    describe("EnhancedErrorBoundary", () => {
      const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
        if (shouldThrow) {
          throw new Error("Test error");
        }
        return <div>No error</div>;
      };

      it("should catch and display errors", () => {
        const consoleSpy = jest
          .spyOn(console, "error")
          .mockImplementation(() => {});

        render(
          <EnhancedErrorBoundary>
            <ThrowError shouldThrow={true} />
          </EnhancedErrorBoundary>
        );

        expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
        expect(screen.getByText("Retry")).toBeInTheDocument();

        consoleSpy.mockRestore();
      });

      it("should provide retry functionality", () => {
        const consoleSpy = jest
          .spyOn(console, "error")
          .mockImplementation(() => {});

        const { rerender } = render(
          <EnhancedErrorBoundary>
            <ThrowError shouldThrow={true} />
          </EnhancedErrorBoundary>
        );

        expect(screen.getByText("Retry")).toBeInTheDocument();

        // Click retry button
        fireEvent.click(screen.getByText("Retry"));

        // Re-render with no error
        rerender(
          <EnhancedErrorBoundary>
            <ThrowError shouldThrow={false} />
          </EnhancedErrorBoundary>
        );

        expect(screen.getByText("No error")).toBeInTheDocument();

        consoleSpy.mockRestore();
      });

      it("should show technical details when enabled", () => {
        const consoleSpy = jest
          .spyOn(console, "error")
          .mockImplementation(() => {});

        render(
          <EnhancedErrorBoundary showDetails={true}>
            <ThrowError shouldThrow={true} />
          </EnhancedErrorBoundary>
        );

        expect(screen.getByText("Show Details")).toBeInTheDocument();

        // Click to show details
        fireEvent.click(screen.getByText("Show Details"));

        expect(screen.getByText(/Error: Test error/)).toBeInTheDocument();

        consoleSpy.mockRestore();
      });
    });

    describe("StaffDashboard", () => {
      it("should render staff dashboard for staff users", async () => {
        const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            status: "healthy",
            checks: {
              database: { status: "healthy", responseTime: 45 },
              authentication: { status: "healthy", responseTime: 12 },
            },
            metrics: {
              totalUsers: 150,
              totalTenants: 25,
              totalCompanies: 75,
            },
          }),
        } as Response);

        render(
          <TestWrapper>
            <StaffDashboard />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText("Staff Dashboard")).toBeInTheDocument();
        });

        expect(screen.getByText("System Health")).toBeInTheDocument();
        expect(screen.getByText("Metrics")).toBeInTheDocument();
      });

      it("should show access denied for non-staff users", () => {
        render(
          <TestWrapper>
            <StaffDashboard />
          </TestWrapper>
        );

        expect(screen.getByText("Staff access required")).toBeInTheDocument();
      });

      it("should display system health status", async () => {
        const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            status: "warning",
            checks: {
              database: { status: "healthy", responseTime: 45 },
              authentication: { status: "warning", responseTime: 150 },
            },
          }),
        } as Response);

        render(
          <TestWrapper>
            <StaffDashboard />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText("warning")).toBeInTheDocument();
        });
      });
    });

    describe("AuthDemo", () => {
      it("should demonstrate all authentication features", async () => {
        const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ user: mockUser }),
          } as Response)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ tenants: mockTenants }),
          } as Response)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ companies: mockCompanies }),
          } as Response);

        render(
          <TestWrapper>
            <AuthDemo />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText("Authentication Demo")).toBeInTheDocument();
        });

        expect(screen.getByText("User Profile")).toBeInTheDocument();
        expect(screen.getByText("Tenant Access")).toBeInTheDocument();
        expect(screen.getByText("Company Access")).toBeInTheDocument();
      });

      it("should show staff features for staff users", async () => {
        const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ user: mockStaffUser }),
          } as Response)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ tenants: mockTenants }),
          } as Response)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ companies: mockCompanies }),
          } as Response);

        render(
          <TestWrapper>
            <AuthDemo />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText("Staff Privileges")).toBeInTheDocument();
        });

        expect(screen.getByText("System Health")).toBeInTheDocument();
      });
    });
  });

  describe("Integration Testing", () => {
    it("should handle complete authentication flow", async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

      // Mock login flow
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ user: mockUser }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ tenants: mockTenants }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ companies: mockCompanies }),
        } as Response);

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await waitFor(() => {
        expect(result.current.user).toBeDefined();
      });

      // User should be authenticated
      expect(result.current.user?.uid).toBe("user-123");
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();

      // Should have tenant and company data
      expect(result.current.userTenants).toBeDefined();
      expect(result.current.userCompanies).toBeDefined();
    });

    it("should handle logout flow", async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ user: mockUser }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ tenants: mockTenants }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ companies: mockCompanies }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        } as Response);

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await waitFor(() => {
        expect(result.current.user).toBeDefined();
      });

      // Logout
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.selectedTenantId).toBeNull();
      expect(result.current.selectedCompanyId).toBeNull();
    });

    it("should handle context switching", async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ user: mockUser }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ tenants: mockTenants }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ companies: mockCompanies }),
        } as Response);

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await waitFor(() => {
        expect(result.current.user).toBeDefined();
      });

      // Switch tenant context
      act(() => {
        result.current.setSelectedTenant("tenant-2");
      });

      expect(result.current.selectedTenantId).toBe("tenant-2");

      // Switch company context
      act(() => {
        result.current.setSelectedCompany("company-2");
      });

      expect(result.current.selectedCompanyId).toBe("company-2");
    });
  });

  describe("Error Handling Integration", () => {
    it("should handle API errors gracefully", async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeDefined();
    });

    it("should recover from temporary errors", async () => {
      const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

      // First call fails
      mockFetch.mockRejectedValueOnce(new Error("Temporary error"));

      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });

      // Mock successful retry
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ user: mockUser }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ tenants: mockTenants }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ companies: mockCompanies }),
        } as Response);

      // Retry authentication
      await act(async () => {
        await result.current.refreshProfile();
      });

      expect(result.current.user).toBeDefined();
      expect(result.current.error).toBeNull();
    });
  });
});
