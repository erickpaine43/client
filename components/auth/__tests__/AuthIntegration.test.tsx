/**
 * Simple Integration Test for Enhanced Authentication
 *
 * Basic integration test to verify the enhanced auth system works correctly.
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch as jest.MockedFunction<typeof global.fetch>;

// Mock NileDB hooks
jest.mock("@niledatabase/react", () => ({
  useSignIn: jest.fn(() => ({ signIn: jest.fn() })),
  useSignUp: jest.fn(() => ({ signUp: jest.fn() })),
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

// Simple test component
const TestComponent = () => {
  const { loading, user, isStaff, userTenants } = useAuth();

  return (
    <div>
      <div data-testid="loading">{loading ? "loading" : "loaded"}</div>
      <div data-testid="user">{user?.email || "no-user"}</div>
      <div data-testid="staff">{isStaff ? "staff" : "not-staff"}</div>
      <div data-testid="tenants">{userTenants.length}</div>
    </div>
  );
};

describe("Enhanced Auth Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  it("should initialize and load user data", async () => {
    // Mock API responses
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
      }) // auth test fails (not authenticated)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            profile: {
              id: "user-1",
              email: "test@example.com",
              name: "Test User",
              profile: {
                isPenguinMailsStaff: false,
                role: "user",
              },
            },
          }),
      });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Should start loading
    expect(screen.getByTestId("loading")).toHaveTextContent("loading");

    // Should finish loading
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
    });

    // Should show no user (auth test failed)
    expect(screen.getByTestId("user")).toHaveTextContent("no-user");
    expect(screen.getByTestId("staff")).toHaveTextContent("not-staff");
    expect(screen.getByTestId("tenants")).toHaveTextContent("0");
  });

  it("should handle authenticated user", async () => {
    const mockProfile = {
      id: "user-1",
      email: "test@example.com",
      name: "Test User",
      profile: {
        isPenguinMailsStaff: false,
        role: "user",
      },
    };

    const mockTenants = [
      { id: "tenant-1", name: "Tenant 1", created: "2024-01-01" },
    ];

    // Mock successful authentication flow
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ authenticated: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ profile: mockProfile }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ tenants: mockTenants }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ companies: [] }),
      });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
    });

    expect(screen.getByTestId("user")).toHaveTextContent("test@example.com");
    expect(screen.getByTestId("staff")).toHaveTextContent("not-staff");
    expect(screen.getByTestId("tenants")).toHaveTextContent("1");
  });
});
