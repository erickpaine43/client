/**
 * Domain Setup Page Tests
 *
 * Tests the domain setup page including async params handling,
 * component rendering, and domainId prop passing.
 */

import { jest } from "@jest/globals";
import { render, within } from "@testing-library/react";
import DomainSetupPage from "../page";

// Mock DomainSetupClient component
jest.mock("@/components/domains/domain-setup-client", () => ({
  __esModule: true,
  default: ({ domainId }: { domainId: string }) => (
    <div data-testid="domain-setup-client">
      Domain Setup Client - Domain ID: {domainId}
    </div>
  ),
}));

describe("DomainSetupPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render DomainSetupClient component", async () => {
      const params = Promise.resolve({ domainId: "1" });
      const component = await DomainSetupPage({ params });
      const { getByTestId } = render(component);

      expect(getByTestId("domain-setup-client")).toBeInTheDocument();
    });

    it("should pass domainId prop to DomainSetupClient", async () => {
      const params = Promise.resolve({ domainId: "123" });
      const component = await DomainSetupPage({ params });
      const { getByTestId } = render(component);

      const client = getByTestId("domain-setup-client");
      expect(client).toHaveTextContent("Domain ID: 123");
    });
  });

  describe("Async Params Handling", () => {
    it("should await params before rendering", async () => {
      let paramsResolved = false;
      const delayedParams = new Promise<{ domainId: string }>((resolve) => {
        setTimeout(() => {
          paramsResolved = true;
          resolve({ domainId: "1" });
        }, 10);
      });

      const component = await DomainSetupPage({ params: delayedParams });
      render(component);

      expect(paramsResolved).toBe(true);
    });

    it("should handle params resolution correctly", async () => {
      const params = Promise.resolve({ domainId: "42" });
      const component = await DomainSetupPage({ params });
      const { getByTestId } = render(component);

      const client = getByTestId("domain-setup-client");
      expect(client).toHaveTextContent("Domain ID: 42");
    });
  });

  describe("Different Domain IDs", () => {
    it("should handle numeric domain IDs as strings", async () => {
      const params = Promise.resolve({ domainId: "999" });
      const component = await DomainSetupPage({ params });
      const { getByTestId } = render(component);

      const client = getByTestId("domain-setup-client");
      expect(client).toHaveTextContent("Domain ID: 999");
    });

    it("should handle single digit domain IDs", async () => {
      const params = Promise.resolve({ domainId: "5" });
      const component = await DomainSetupPage({ params });
      const { getByTestId } = render(component);

      const client = getByTestId("domain-setup-client");
      expect(client).toHaveTextContent("Domain ID: 5");
    });

    it("should handle multi-digit domain IDs", async () => {
      const params = Promise.resolve({ domainId: "12345" });
      const component = await DomainSetupPage({ params });
      const { getByTestId } = render(component);

      const client = getByTestId("domain-setup-client");
      expect(client).toHaveTextContent("Domain ID: 12345");
    });
  });

  describe("Component Structure", () => {
    it("should be a server component (async function)", async () => {
      expect(DomainSetupPage.constructor.name).toBe("AsyncFunction");
    });

    it("should return valid React element", async () => {
      const params = Promise.resolve({ domainId: "1" });
      const component = await DomainSetupPage({ params });

      expect(component).toBeTruthy();
      expect(typeof component).toBe("object");
    });

    it("should render without errors", async () => {
      const params = Promise.resolve({ domainId: "1" });
      const component = await DomainSetupPage({ params });

      expect(() => render(component)).not.toThrow();
    });
  });

  describe("Props Validation", () => {
    it.each([{ domainId: "1" }, { domainId: "100" }, { domainId: "9999" }])(
      "should extract domainId $domainId from params correctly",
      async ({ domainId }) => {
        const params = Promise.resolve({ domainId });
        const component = await DomainSetupPage({ params });
        const { getByTestId } = render(component);

        const client = getByTestId("domain-setup-client");
        expect(client).toHaveTextContent(`Domain ID: ${domainId}`);
      }
    );

    it("should pass domainId as string type", async () => {
      const params = Promise.resolve({ domainId: "123" });
      const component = await DomainSetupPage({ params });
      const { getByTestId } = render(component);

      // Verify the domainId is passed as a string
      const client = getByTestId("domain-setup-client");
      expect(client.textContent).toContain("123");
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero as domain ID", async () => {
      const params = Promise.resolve({ domainId: "0" });
      const component = await DomainSetupPage({ params });
      const { getByTestId } = render(component);

      const client = getByTestId("domain-setup-client");
      expect(client).toHaveTextContent("Domain ID: 0");
    });

    it("should handle very large domain IDs", async () => {
      const params = Promise.resolve({ domainId: "999999999" });
      const component = await DomainSetupPage({ params });
      const { getByTestId } = render(component);

      const client = getByTestId("domain-setup-client");
      expect(client).toHaveTextContent("Domain ID: 999999999");
    });
  });

  describe("Concurrent Rendering", () => {
    it("should handle multiple concurrent renders", async () => {
      const params1 = Promise.resolve({ domainId: "1" });
      const params2 = Promise.resolve({ domainId: "2" });
      const params3 = Promise.resolve({ domainId: "3" });

      const [component1, component2, component3] = await Promise.all([
        DomainSetupPage({ params: params1 }),
        DomainSetupPage({ params: params2 }),
        DomainSetupPage({ params: params3 }),
      ]);

      const { container: container1 } = render(component1);
      const { container: container2 } = render(component2);
      const { container: container3 } = render(component3);

      expect(
        within(container1).getByTestId("domain-setup-client")
      ).toHaveTextContent("Domain ID: 1");
      expect(
        within(container2).getByTestId("domain-setup-client")
      ).toHaveTextContent("Domain ID: 2");
      expect(
        within(container3).getByTestId("domain-setup-client")
      ).toHaveTextContent("Domain ID: 3");
    });
  });

  describe("Performance", () => {
    it("should await params only once", async () => {
      let thenCallCount = 0;
      const originalPromise = Promise.resolve({ domainId: "1" });
      // Wrap the promise to count .then() calls
      const params = Object.create(originalPromise);
      params.then = function (
        onfulfilled?: ((value: { domainId: string }) => unknown) | null,
        onrejected?: ((reason: unknown) => unknown) | null
      ) {
        thenCallCount++;
        // Call the original .then
        return originalPromise.then(onfulfilled, onrejected);
      };

      await DomainSetupPage({ params });
      expect(thenCallCount).toBe(1);
    });
  });

  describe("Type Safety", () => {
    it("should accept valid params structure", async () => {
      const params = Promise.resolve({ domainId: "1" });

      // This should not throw TypeScript errors
      const component = await DomainSetupPage({ params });
      expect(component).toBeTruthy();
    });

    it("should work with Promise.resolve", async () => {
      const params = Promise.resolve({ domainId: "1" });
      const component = await DomainSetupPage({ params });
      const { getByTestId } = render(component);

      expect(getByTestId("domain-setup-client")).toBeInTheDocument();
    });
  });
});
