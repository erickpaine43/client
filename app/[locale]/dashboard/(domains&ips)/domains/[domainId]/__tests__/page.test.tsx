/**
 * Domain Page Tests
 *
 * Tests the domain detail page including data loading,
 * metrics display, authentication status, and navigation.
 */

import { getDomainById, getTopAccountsForDomain } from "@/lib/actions/domains";
import { Domain, EmailAccount } from "@/types/domain";
import { jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import React from "react";
import DomainPage from "../page";

// Mock next/navigation
const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
  usePathname: () => "/dashboard/domains/1",
}));

// Mock Link component
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// Mock domain actions
jest.mock("@/lib/actions/domains", () => ({
  getDomainById: jest.fn(),
  getTopAccountsForDomain: jest.fn(),
}));

// Mock WeeklyMetricsClient component
jest.mock("../weekly-metrics-client", () => ({
  __esModule: true,
  default: () => <div data-testid="weekly-metrics-client">Weekly Metrics</div>,
}));

// Mock EmailsTable component
jest.mock("@/components/domains/components/emails-table", () => ({
  EmailsTable: ({ emailAccounts }: { emailAccounts: EmailAccount[] }) => (
    <div data-testid="emails-table">{emailAccounts.length} email accounts</div>
  ),
}));

const mockGetDomainById = getDomainById as jest.MockedFunction<
  typeof getDomainById
>;
const mockGetTopAccountsForDomain =
  getTopAccountsForDomain as jest.MockedFunction<
    typeof getTopAccountsForDomain
  >;

describe("DomainPage", () => {
  const mockDomain: Domain = {
    id: 1,
    domain: "example.com",
    name: "example.com",
    provider: "Google Workspace",
    status: "active",
    daysActive: 30,
    reputation: 85,
    emailAccounts: 5,
    spf: true,
    dkim: true,
    dmarc: true,
    metrics: {
      total24h: 1500,
      bounceRate: 2.5,
      spamRate: 0.1,
      openRate: 45.2,
      replyRate: 12.8,
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
    companyId: 1,
    createdById: "user-123",
  };

  const mockEmailAccounts: EmailAccount[] = [
    {
      id: 1,
      email: "sales@example.com",
      provider: "Gmail",
      status: "ACTIVE",
      reputation: 90,
      warmupStatus: "WARMED",
      dayLimit: 50,
      sent24h: 45,
      lastSync: "2024-01-15T10:00:00Z",
      spf: true,
      dkim: true,
      dmarc: true,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
      companyId: 1,
      createdById: "user-123",
    },
    {
      id: 2,
      email: "support@example.com",
      provider: "Gmail",
      status: "ACTIVE",
      reputation: 88,
      warmupStatus: "WARMING",
      dayLimit: 40,
      sent24h: 30,
      lastSync: "2024-01-15T09:30:00Z",
      spf: true,
      dkim: true,
      dmarc: false,
      createdAt: "2024-01-02T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
      companyId: 1,
      createdById: "user-123",
    },
  ];

  const mockParams = Promise.resolve({ domainId: "1" });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Data Loading", () => {
    it("should load and display domain data successfully", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(component);

      expect(mockGetDomainById).toHaveBeenCalledWith(1);
      expect(mockGetTopAccountsForDomain).toHaveBeenCalledWith(1, 10);
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "example.com"
      );
    });

    it("should parse domainId correctly", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      await DomainPage({ params: mockParams });

      expect(mockGetDomainById).toHaveBeenCalledWith(1);
    });

    it("should handle domain not found", async () => {
      mockGetDomainById.mockResolvedValue(null);
      mockGetTopAccountsForDomain.mockResolvedValue([]);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(component);

      expect(container.textContent).toContain("Domain not found");
    });

    it("should load top accounts with correct limit", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      await DomainPage({ params: mockParams });

      expect(mockGetTopAccountsForDomain).toHaveBeenCalledWith(1, 10);
    });

    it("should handle empty email accounts", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue([]);

      const component = await DomainPage({ params: mockParams });
      const { getByTestId } = render(component);

      const emailsTable = getByTestId("emails-table");
      expect(emailsTable).toHaveTextContent("0 email accounts");
    });
  });

  describe("Domain Information Display", () => {
    it("should display domain name and provider", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(component);

      expect(container.querySelector("h1")).toHaveTextContent("example.com");
      expect(container.textContent).toContain("Google Workspace");
    });

    it("should display reputation score", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(component);

      expect(container.textContent).toContain("85%");
      expect(container.textContent).toContain("Reputation Score");
    });

    it("should display 24h email metrics", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(component);

      expect(container.textContent).toContain("1500");
      expect(container.textContent).toContain("Emails (24h)");
    });

    it("should display bounce rate", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(component);

      expect(container.textContent).toContain("2.5%");
      expect(container.textContent).toContain("bounce rate");
    });

    it("should display open rate", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(component);

      expect(container.textContent).toContain("45.2%");
      expect(container.textContent).toContain("Open Rate");
    });

    it("should display reply rate", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(component);

      expect(container.textContent).toContain("12.8%");
      expect(container.textContent).toContain("reply rate");
    });

    it("should display spam rate", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(component);

      expect(container.textContent).toContain("0.100%");
      expect(container.textContent).toContain("Spam Rate");
    });
  });

  describe("Authentication Status", () => {
    it("should show SPF configured status", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(component);

      expect(container.textContent).toContain("SPF Record");
      expect(container.textContent).toContain("Configured");
    });

    it("should show DKIM configured status", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(component);

      expect(container.textContent).toContain("DKIM Record");
      expect(container.textContent).toContain("Configured");
    });

    it("should show DMARC configured status", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(component);

      expect(container.textContent).toContain("DMARC Record");
      expect(container.textContent).toContain("Configured");
    });

    it("should show not configured for missing SPF", async () => {
      const domainWithoutSPF = { ...mockDomain, spf: false };
      mockGetDomainById.mockResolvedValue(domainWithoutSPF);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(component);

      expect(container.textContent).toContain("Not Configured");
    });

    it("should show Complete Setup button when authentication incomplete", async () => {
      const domainWithoutAuth = { ...mockDomain, spf: false, dkim: false };
      mockGetDomainById.mockResolvedValue(domainWithoutAuth);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(component);

      expect(container.textContent).toContain("Complete Setup");
    });

    it("should not show Complete Setup button when fully configured", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(component);

      const setupButtons = Array.from(container.querySelectorAll("a")).filter(
        (a) => a.textContent === "Complete Setup"
      );
      expect(setupButtons.length).toBe(0);
    });
  });

  describe("Navigation Links", () => {
    it("should have back to domains link", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(component);

      const backLink = container.querySelector('a[href="/dashboard/domains"]');
      expect(backLink).toBeInTheDocument();
    });

    it("should have domain settings link", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(component);

      const settingsLink = container.querySelector(
        'a[href="/dashboard/domains/1/settings"]'
      );
      expect(settingsLink).toBeInTheDocument();
      expect(settingsLink?.textContent).toContain("Domain Settings");
    });

    it("should have view all accounts link", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(component);

      const accountsLink = container.querySelector(
        'a[href="/dashboard/domains/1/accounts"]'
      );
      expect(accountsLink).toBeInTheDocument();
      expect(accountsLink?.textContent).toContain("View All Accounts");
    });

    it("should have setup link when authentication incomplete", async () => {
      const domainWithoutAuth = { ...mockDomain, dmarc: false };
      mockGetDomainById.mockResolvedValue(domainWithoutAuth);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(component);

      const setupLink = container.querySelector(
        'a[href="/dashboard/domains/1/setup"]'
      );
      expect(setupLink).toBeInTheDocument();
    });
  });

  describe("Components Rendering", () => {
    it("should render WeeklyMetricsClient component", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { getByTestId } = render(component);

      expect(getByTestId("weekly-metrics-client")).toBeInTheDocument();
    });

    it("should render EmailsTable with correct data", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { getByTestId } = render(component);

      const emailsTable = getByTestId("emails-table");
      expect(emailsTable).toBeInTheDocument();
      expect(emailsTable.textContent).toContain("2 email accounts");
    });

    it("should display all metric cards", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(component);

      expect(container.textContent).toContain("Reputation Score");
      expect(container.textContent).toContain("Emails (24h)");
      expect(container.textContent).toContain("Open Rate");
      expect(container.textContent).toContain("Spam Rate");
    });

    it("should display authentication status card", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(component);

      expect(container.textContent).toContain("Authentication Status");
      expect(container.textContent).toContain(
        "Email authentication records and their status"
      );
    });

    it("should display weekly metrics card", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(component);

      expect(container.textContent).toContain("Weekly Metrics");
      expect(container.textContent).toContain(
        "Performance trends over the last 7 days"
      );
    });

    it("should display top email accounts card", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(component);

      expect(container.textContent).toContain("Top Email Accounts");
      expect(container.textContent).toContain(
        "Best performing email accounts in this domain"
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle domain with missing metrics", async () => {
      const domainWithoutMetrics = { ...mockDomain, metrics: undefined };
      mockGetDomainById.mockResolvedValue(domainWithoutMetrics);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(component);

      // Verify all metric fallback values are displayed correctly
      expect(container.textContent).toContain("0"); // Emails (24h) count
      expect(container.textContent).toContain("0.0%"); // Open Rate
      expect(container.textContent).toContain("0.0% bounce rate");
      expect(container.textContent).toContain("0.0% reply rate");
      expect(container.textContent).toContain("Spam Rate0.000%");
    });

    it("should handle domain with zero metrics", async () => {
      const domainWithZeroMetrics = {
        ...mockDomain,
        metrics: {
          total24h: 0,
          bounceRate: 0,
          spamRate: 0,
          openRate: 0,
          replyRate: 0,
        },
      };
      mockGetDomainById.mockResolvedValue(domainWithZeroMetrics);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(component);

      expect(container.textContent).toContain("0.0%");
    });

    it("should handle different domain IDs", async () => {
      const params2 = Promise.resolve({ domainId: "42" });
      mockGetDomainById.mockResolvedValue({ ...mockDomain, id: 42 });
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      await DomainPage({ params: params2 });

      expect(mockGetDomainById).toHaveBeenCalledWith(42);
      expect(mockGetTopAccountsForDomain).toHaveBeenCalledWith(42, 10);
    });

    it("should handle domain with no authentication", async () => {
      const domainNoAuth = {
        ...mockDomain,
        spf: false,
        dkim: false,
        dmarc: false,
      };
      mockGetDomainById.mockResolvedValue(domainNoAuth);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(component);

      const notConfigured = Array.from(container.querySelectorAll("*")).filter(
        (el) => el.textContent === "Not Configured"
      );
      expect(notConfigured.length).toBeGreaterThan(0);
    });

    it("should handle very high reputation score", async () => {
      const domainHighRep = { ...mockDomain, reputation: 100 };
      mockGetDomainById.mockResolvedValue(domainHighRep);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(component);

      expect(container.textContent).toContain("100%");
    });

    it("should handle very low reputation score", async () => {
      const domainLowRep = { ...mockDomain, reputation: 10 };
      mockGetDomainById.mockResolvedValue(domainLowRep);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(component);

      expect(container.textContent).toContain("10%");
    });
  });

  describe("Async Params Handling", () => {
    it("should await params before fetching data", async () => {
      let paramsResolved = false;
      const delayedParams = new Promise<{ domainId: string }>((resolve) => {
        setTimeout(() => {
          paramsResolved = true;
          resolve({ domainId: "1" });
        }, 10);
      });

      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      await DomainPage({ params: delayedParams });

      expect(paramsResolved).toBe(true);
      expect(mockGetDomainById).toHaveBeenCalled();
    });
  });

  describe("Layout and Structure", () => {
    it("should render main container", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(component);

      const mainContainer = container.querySelector(".container");
      expect(mainContainer).toBeInTheDocument();
    });

    it("should render metric cards in grid layout", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(component);

      const gridLayouts = container.querySelectorAll(".grid");
      expect(gridLayouts.length).toBeGreaterThan(0);
    });
  });
});
