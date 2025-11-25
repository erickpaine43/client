/**
 * DomainSetupClient Component Tests
 *
 * Tests the domain setup client component including data loading,
 * DNS verification, clipboard functionality, and progress tracking.
 */

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { jest } from "@jest/globals";
import DomainSetupClient from "@/components/domains/domain-setup-client";
import { toast } from "sonner";

// Mock next/link
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

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock copy text
jest.mock("@/components/domains/copy", () => ({
  copyText: {
    setup: {
      title: "Domain Setup",
      steps: {
        spf: {
          title: "Configure SPF",
          description: "Add SPF record to verify your sending servers",
        },
        dkim: {
          title: "Configure DKIM",
          description: "Add DKIM record for email authentication",
        },
        dmarc: {
          title: "Configure DMARC",
          description: "Add DMARC record for email security policy",
        },
      },
    },
  },
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

// Mock fetch
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe("DomainSetupClient", () => {
  const mockDomainData = {
    id: 1,
    name: "example.com",
    spf: false,
    dkim: false,
    dmarc: false,
    records: {
      spf: "v=spf1 include:_spf.penguinmails.com ~all",
      dkim: "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3...",
      dmarc: "v=DMARC1; p=quarantine; rua=mailto:...",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Initial Loading", () => {
    it("should show loading state initially", () => {
      render(<DomainSetupClient domainId="1" />);

      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("should fetch domain data on mount", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDomainData,
      } as Response);

      render(<DomainSetupClient domainId="1" />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/domains/1");
      });
    });

    it("should display domain data after loading", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDomainData,
      } as Response);

      render(<DomainSetupClient domainId="1" />);

      await waitFor(() => {
        expect(screen.getByText("example.com")).toBeInTheDocument();
      });
    });

    it("should handle fetch error", async () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      render(<DomainSetupClient domainId="1" />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Failed to load domain data");
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });

    it("should handle non-ok response", async () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      } as Response);

      render(<DomainSetupClient domainId="1" />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Failed to load domain data");
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe("DNS Records Display", () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDomainData,
      } as Response);
    });

    it("should display SPF record", async () => {
      render(<DomainSetupClient domainId="1" />);

      await waitFor(() => {
        expect(screen.getByText("Configure SPF")).toBeInTheDocument();
        expect(
          screen.getByText("v=spf1 include:_spf.penguinmails.com ~all")
        ).toBeInTheDocument();
      });
    });

    it("should display DKIM record", async () => {
      render(<DomainSetupClient domainId="1" />);

      await waitFor(() => {
        expect(screen.getByText("Configure DKIM")).toBeInTheDocument();
        expect(
          screen.getByText("v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3...")
        ).toBeInTheDocument();
      });
    });

    it("should display DMARC record", async () => {
      render(<DomainSetupClient domainId="1" />);

      await waitFor(() => {
        expect(screen.getByText("Configure DMARC")).toBeInTheDocument();
        expect(
          screen.getByText("v=DMARC1; p=quarantine; rua=mailto:...")
        ).toBeInTheDocument();
      });
    });

    it("should display all descriptions", async () => {
      render(<DomainSetupClient domainId="1" />);

      await waitFor(() => {
        expect(
          screen.getByText("Add SPF record to verify your sending servers")
        ).toBeInTheDocument();
        expect(
          screen.getByText("Add DKIM record for email authentication")
        ).toBeInTheDocument();
        expect(
          screen.getByText("Add DMARC record for email security policy")
        ).toBeInTheDocument();
      });
    });
  });

  describe("Verification Status", () => {
    it("should show verify buttons for unverified records", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDomainData,
      } as Response);

      render(<DomainSetupClient domainId="1" />);

      await waitFor(() => {
        const verifyButtons = screen.getAllByText("Verify");
        expect(verifyButtons).toHaveLength(3);
      });
    });

    it("should show shield icon for verified SPF", async () => {
      const verifiedDomain = { ...mockDomainData, spf: true };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => verifiedDomain,
      } as Response);

      const { container } = render(<DomainSetupClient domainId="1" />);

      await waitFor(() => {
        const shields = container.querySelectorAll(".text-green-500");
        expect(shields.length).toBeGreaterThan(0);
      });
    });

    it("should show shield icon for verified DKIM", async () => {
      const verifiedDomain = { ...mockDomainData, dkim: true };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => verifiedDomain,
      } as Response);

      const { container } = render(<DomainSetupClient domainId="1" />);

      await waitFor(() => {
        const shields = container.querySelectorAll(".text-green-500");
        expect(shields.length).toBeGreaterThan(0);
      });
    });

    it("should show shield icon for verified DMARC", async () => {
      const verifiedDomain = { ...mockDomainData, dmarc: true };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => verifiedDomain,
      } as Response);

      const { container } = render(<DomainSetupClient domainId="1" />);

      await waitFor(() => {
        const shields = container.querySelectorAll(".text-green-500");
        expect(shields.length).toBeGreaterThan(0);
      });
    });

    it("should show all shields when fully verified", async () => {
      const fullyVerified = {
        ...mockDomainData,
        spf: true,
        dkim: true,
        dmarc: true,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => fullyVerified,
      } as Response);

      const { container } = render(<DomainSetupClient domainId="1" />);

      await waitFor(() => {
        const shields = container.querySelectorAll(".text-green-500");
        expect(shields.length).toBe(3);
      });
    });
  });

  describe("DNS Verification", () => {
    it("should verify SPF record successfully", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockDomainData,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ verified: true }),
        } as Response);

      render(<DomainSetupClient domainId="1" />);

      await waitFor(() => screen.getAllByText("Verify"));

      const verifyButtons = screen.getAllByText("Verify");
      fireEvent.click(verifyButtons[0]); // Click SPF verify button

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          "SPF record verified successfully"
        );
      });
    });

    it("should verify DKIM record successfully", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockDomainData,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ verified: true }),
        } as Response);

      render(<DomainSetupClient domainId="1" />);

      await waitFor(() => screen.getAllByText("Verify"));

      const verifyButtons = screen.getAllByText("Verify");
      fireEvent.click(verifyButtons[1]); // Click DKIM verify button

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          "DKIM record verified successfully"
        );
      });
    });

    it("should verify DMARC record successfully", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockDomainData,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ verified: true }),
        } as Response);

      render(<DomainSetupClient domainId="1" />);

      await waitFor(() => screen.getAllByText("Verify"));

      const verifyButtons = screen.getAllByText("Verify");
      fireEvent.click(verifyButtons[2]); // Click DMARC verify button

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          "DMARC record verified successfully"
        );
      });
    });

    it("should handle verification failure", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockDomainData,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ verified: false }),
        } as Response);

      render(<DomainSetupClient domainId="1" />);

      await waitFor(() => screen.getAllByText("Verify"));

      const verifyButtons = screen.getAllByText("Verify");
      fireEvent.click(verifyButtons[0]);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "SPF record verification failed. Please check your DNS settings."
        );
      });
    });

    it("should handle verification API error", async () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockDomainData,
        } as Response)
        .mockRejectedValueOnce(new Error("Network error"));

      render(<DomainSetupClient domainId="1" />);

      await waitFor(() => screen.getAllByText("Verify"));

      const verifyButtons = screen.getAllByText("Verify");
      fireEvent.click(verifyButtons[0]);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Failed to verify SPF record");
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });

    it("should disable verify button during verification", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockDomainData,
        } as Response)
        .mockImplementation(
          () =>
            new Promise((resolve) => {
              setTimeout(
                () =>
                  resolve({
                    ok: true,
                    json: async () => ({ verified: true }),
                  } as Response),
                100
              );
            })
        );

      render(<DomainSetupClient domainId="1" />);

      await waitFor(() => screen.getAllByText("Verify"));

      const verifyButtons = screen.getAllByText("Verify");
      fireEvent.click(verifyButtons[0]);

      // Button should be disabled during verification
      expect(verifyButtons[0]).toBeDisabled();
    });

    it("should show spinning icon during verification", async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockDomainData,
        } as Response)
        .mockImplementation(
          () =>
            new Promise((resolve) => {
              setTimeout(
                () =>
                  resolve({
                    ok: true,
                    json: async () => ({ verified: true }),
                  } as Response),
                100
              );
            })
        );

      const { container } = render(<DomainSetupClient domainId="1" />);

      await waitFor(() => screen.getAllByText("Verify"));

      const verifyButtons = screen.getAllByText("Verify");
      fireEvent.click(verifyButtons[0]);

      // Check for spinning animation class
      await waitFor(() => {
        const spinningIcon = container.querySelector(".animate-spin");
        expect(spinningIcon).toBeInTheDocument();
      });
    });
  });

  describe("Clipboard Functionality", () => {
    it("should copy SPF record to clipboard", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDomainData,
      } as Response);

      const { container } = render(<DomainSetupClient domainId="1" />);

      await waitFor(() => screen.getByText("Configure SPF"));

      // Find all copy buttons and click the first one (SPF)
      const copyButtons = container.querySelectorAll(
        'button[class*="absolute top-2 right-2"]'
      );
      fireEvent.click(copyButtons[0]);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        mockDomainData.records.spf
      );
      expect(toast.success).toHaveBeenCalledWith("Copied to clipboard");
    });

    it("should copy DKIM record to clipboard", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDomainData,
      } as Response);

      const { container } = render(<DomainSetupClient domainId="1" />);

      await waitFor(() => screen.getByText("Configure DKIM"));

      const copyButtons = container.querySelectorAll(
        'button[class*="absolute top-2 right-2"]'
      );
      fireEvent.click(copyButtons[1]);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        mockDomainData.records.dkim
      );
      expect(toast.success).toHaveBeenCalledWith("Copied to clipboard");
    });

    it("should copy DMARC record to clipboard", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDomainData,
      } as Response);

      const { container } = render(<DomainSetupClient domainId="1" />);

      await waitFor(() => screen.getByText("Configure DMARC"));

      const copyButtons = container.querySelectorAll(
        'button[class*="absolute top-2 right-2"]'
      );
      fireEvent.click(copyButtons[2]);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        mockDomainData.records.dmarc
      );
      expect(toast.success).toHaveBeenCalledWith("Copied to clipboard");
    });
  });

  describe("Setup Progress", () => {
    it("should show 0% progress when nothing is verified", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDomainData,
      } as Response);

      render(<DomainSetupClient domainId="1" />);

      await waitFor(() => {
        expect(screen.getByText("0%")).toBeInTheDocument();
      });
    });

    it("should show 33% progress when one record is verified", async () => {
      const partiallyVerified = { ...mockDomainData, spf: true };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => partiallyVerified,
      } as Response);

      render(<DomainSetupClient domainId="1" />);

      await waitFor(() => {
        expect(screen.getByText("33%")).toBeInTheDocument();
      });
    });

    it("should show 67% progress when two records are verified", async () => {
      const partiallyVerified = { ...mockDomainData, spf: true, dkim: true };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => partiallyVerified,
      } as Response);

      render(<DomainSetupClient domainId="1" />);

      await waitFor(() => {
        expect(screen.getByText("67%")).toBeInTheDocument();
      });
    });

    it("should show 100% progress when all records are verified", async () => {
      const fullyVerified = {
        ...mockDomainData,
        spf: true,
        dkim: true,
        dmarc: true,
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => fullyVerified,
      } as Response);

      render(<DomainSetupClient domainId="1" />);

      await waitFor(() => {
        expect(screen.getByText("100%")).toBeInTheDocument();
      });
    });

    it("should display Setup Progress label", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDomainData,
      } as Response);

      render(<DomainSetupClient domainId="1" />);

      await waitFor(() => {
        expect(screen.getByText("Setup Progress")).toBeInTheDocument();
      });
    });
  });

  describe("Navigation", () => {
    it("should render back to domains link", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDomainData,
      } as Response);

      const { container } = render(<DomainSetupClient domainId="1" />);

      await waitFor(() => {
        const backLink = container.querySelector(
          'a[href="/dashboard/domains"]'
        );
        expect(backLink).toBeInTheDocument();
      });
    });

    it("should render Domain Setup title", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDomainData,
      } as Response);

      render(<DomainSetupClient domainId="1" />);

      await waitFor(() => {
        expect(screen.getByText("Domain Setup")).toBeInTheDocument();
      });
    });
  });

  describe("Different Domain IDs", () => {
    it("should fetch correct domain by ID", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockDomainData, id: 42 }),
      } as Response);

      render(<DomainSetupClient domainId="42" />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/domains/42");
      });
    });

    it("should parse domainId correctly", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockDomainData, id: 123 }),
      } as Response);

      render(<DomainSetupClient domainId="123" />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/domains/123");
      });
    });
  });

  describe("Component Structure", () => {
    it("should render main container", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDomainData,
      } as Response);

      const { container } = render(<DomainSetupClient domainId="1" />);

      await waitFor(() => {
        const mainContainer = container.querySelector(".container");
        expect(mainContainer).toBeInTheDocument();
      });
    });

    it("should render all three DNS record cards", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDomainData,
      } as Response);

      render(<DomainSetupClient domainId="1" />);

      await waitFor(() => {
        expect(screen.getByText("Configure SPF")).toBeInTheDocument();
        expect(screen.getByText("Configure DKIM")).toBeInTheDocument();
        expect(screen.getByText("Configure DMARC")).toBeInTheDocument();
      });
    });
  });
});
