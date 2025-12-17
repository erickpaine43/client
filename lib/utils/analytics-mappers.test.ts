// ============================================================================
// ANALYTICS MAPPERS - UNIT TESTS
// ============================================================================

import {
  convertFiltersToLegacy,
  toCorePerformanceMetrics,
  mapLegacySeriesToCore,
  safeExtractCompanyId,
  calculateRatesForCoreMetrics,
  calculateHealthScoreForCoreMetrics,
  mapLegacySeriesArrayToCore,
  validateFiltersBeforeCall
} from "./analytics-mappers";
import { AnalyticsFilters, PerformanceMetrics } from "@/types/analytics/core";

describe("convertFiltersToLegacy", () => {
  test("should convert core AnalyticsFilters to legacy filter format", () => {
    const coreFilters: AnalyticsFilters = {
      dateRange: { start: "2024-01-01", end: "2024-01-31" },
      entityIds: ["mailbox1", "mailbox2"],
      additionalFilters: {
        companyId: "company123",
        customParam: "value",
      },
    };

    const result = convertFiltersToLegacy(coreFilters, ["override1"], "month");

    expect(result).toEqual({
      dateRange: { start: "2024-01-01", end: "2024-01-31" },
      mailboxes: ["override1"], // Uses override if provided
      companyId: "company123",
      granularity: "month",
    });
  });

  test("should handle empty entityIds and missing override", () => {
    const coreFilters: AnalyticsFilters = {
      dateRange: { start: "2024-01-01", end: "2024-01-31" },
      entityIds: [],
      additionalFilters: { companyId: "company456" },
    };

    const result = convertFiltersToLegacy(coreFilters);

    expect(result).toEqual({
      dateRange: { start: "2024-01-01", end: "2024-01-31" },
      mailboxes: [],
      companyId: "company456",
      granularity: undefined,
    });
  });
});

describe("toCorePerformanceMetrics", () => {
  test("should convert flat legacy metrics to core nested metrics", () => {
    const legacyMetrics = {
      sent: 1000,
      delivered: 950,
      opened_tracked: 300,
      clicked_tracked: 60,
      replied: 25,
      bounced: 50,
      unsubscribed: 10,
      spamComplaints: 5,
    };

    const result = toCorePerformanceMetrics(legacyMetrics);

    expect(result).toEqual({
      sent: 1000,
      delivered: 950,
      opened_tracked: 300,
      clicked_tracked: 60,
      replied: 25,
      bounced: 50,
      unsubscribed: 10,
      spamComplaints: 5,
    });
  });

  test("should handle missing fields with default values of 0", () => {
    const incompleteMetrics = { sent: 500 };

    const result = toCorePerformanceMetrics(incompleteMetrics);

    expect(result).toEqual({
      sent: 500,
      delivered: 0,
      opened_tracked: 0,
      clicked_tracked: 0,
      replied: 0,
      bounced: 0,
      unsubscribed: 0,
      spamComplaints: 0,
    });
  });

  test("should handle null/undefined input", () => {
    expect(toCorePerformanceMetrics(null)).toEqual({
      sent: 0,
      delivered: 0,
      opened_tracked: 0,
      clicked_tracked: 0,
      replied: 0,
      bounced: 0,
      unsubscribed: 0,
      spamComplaints: 0,
    });
  });

  test("should handle legacy field name variants", () => {
    const variantMetrics = {
      sent: 1000,
      delivers: 950, // Different field name
      opens: 300,
      clicks: 60,
      bounces: 50,
      spamFlags: 5, // Different field name
      replied: 25,
      unsubscribed: 10,
    };

    const result = toCorePerformanceMetrics(variantMetrics);

    expect(result).toEqual({
      sent: 1000,
      delivered: 0, // Doesn't match any known variant
      opened_tracked: 300, // Uses "opens" variant
      clicked_tracked: 60, // Uses "clicks" variant
      replied: 25,
      bounced: 50, // Uses "bounces" variant
      unsubscribed: 10,
      spamComplaints: 5, // Uses "spamFlags" variant
    });
  });
});

describe("mapLegacySeriesToCore", () => {
  test("should map legacy flattened series point to core nested format", () => {
    const legacyPoint = {
      date: "2024-01-15",
      label: "January 15",
      sent: 1000,
      delivered: 950,
      opened_tracked: 300,
      clicked_tracked: 60,
      replied: 25,
      bounced: 50,
      unsubscribed: 10,
      spamComplaints: 5,
    };

    const result = mapLegacySeriesToCore(legacyPoint);

    expect(result).toEqual({
      date: "2024-01-15",
      label: "January 15",
      metrics: {
        sent: 1000,
        delivered: 950,
        opened_tracked: 300,
        clicked_tracked: 60,
        replied: 25,
        bounced: 50,
        unsubscribed: 10,
        spamComplaints: 5,
      },
    });
  });

  test("should handle series point with metrics object already present", () => {
    const legacyPoint = {
      date: "2024-01-15",
      label: "January 15",
      metrics: {
        sent: 1000,
        delivered: 950,
        opened_tracked: 300,
        clicked_tracked: 60,
        replied: 25,
        bounced: 50,
        unsubscribed: 10,
        spamComplaints: 5,
      },
      extraData: "ignored",
    };

    const result = mapLegacySeriesToCore(legacyPoint);

    expect(result).toEqual({
      date: "2024-01-15",
      label: "January 15",
      metrics: {
        sent: 1000,
        delivered: 950,
        opened_tracked: 300,
        clicked_tracked: 60,
        replied: 25,
        bounced: 50,
        unsubscribed: 10,
        spamComplaints: 5,
      },
    });
  });
});

describe("mapLegacySeriesArrayToCore", () => {
  test("should map array of legacy series points to core format", () => {
    const legacyArray = [
      { date: "2024-01-01", label: "Jan 1", sent: 500, delivered: 450 },
      { date: "2024-01-02", label: "Jan 2", sent: 600, delivered: 550 },
    ];

    const result = mapLegacySeriesArrayToCore(legacyArray);

    expect(result).toEqual([
      {
        date: "2024-01-01",
        label: "Jan 1",
        metrics: {
          sent: 500,
          delivered: 450,
          opened_tracked: 0,
          clicked_tracked: 0,
          replied: 0,
          bounced: 0,
          unsubscribed: 0,
          spamComplaints: 0,
        },
      },
      {
        date: "2024-01-02",
        label: "Jan 2",
        metrics: {
          sent: 600,
          delivered: 550,
          opened_tracked: 0,
          clicked_tracked: 0,
          replied: 0,
          bounced: 0,
          unsubscribed: 0,
          spamComplaints: 0,
        },
      },
    ]);
  });

  test("should handle empty array", () => {
    const result = mapLegacySeriesArrayToCore([]);
    expect(result).toEqual([]);
  });
});

describe("safeExtractCompanyId", () => {
  test("should extract companyId from core AnalyticsFilters", () => {
    const filters: AnalyticsFilters = {
      dateRange: { start: "2024-01-01", end: "2024-01-31" },
      entityIds: [],
      additionalFilters: { companyId: "company123" },
    };

    expect(safeExtractCompanyId(filters)).toBe("company123");
  });

  test("should return fallback for missing companyId", () => {
    const filters: AnalyticsFilters = {
      dateRange: { start: "2024-01-01", end: "2024-01-31" },
      entityIds: [],
      additionalFilters: {},
    };

    expect(safeExtractCompanyId(filters, "defaultId")).toBe("defaultId");
  });

  test("should handle legacy objects with direct companyId", () => {
    const legacyObject = { companyId: "legacy123" };
    expect(safeExtractCompanyId(legacyObject)).toBe("legacy123");
  });

  test("should handle nested additionalFilters structure", () => {
    const nestedObject = {
      additionalFilters: {
        companyId: "nested123",
      },
    };
    expect(safeExtractCompanyId(nestedObject)).toBe("nested123");
  });
});

describe("calculateRatesForCoreMetrics", () => {
  test("should delegate to AnalyticsCalculator.calculateAllRates", () => {
    const coreMetrics: PerformanceMetrics = {
      sent: 1000,
      delivered: 950,
      opened_tracked: 300,
      clicked_tracked: 60,
      replied: 25,
      bounced: 50,
      unsubscribed: 10,
      spamComplaints: 5,
    };

    const result = calculateRatesForCoreMetrics(coreMetrics);

    // Should return the calculated rates - we don't test the exact computation
    // since that's handled by the calculator, just that our delegate works
    expect(result).toHaveProperty("deliveryRate");
    expect(result).toHaveProperty("openRate");
    expect(result).toHaveProperty("clickRate");
    expect(result).toHaveProperty("replyRate");
    expect(result).toHaveProperty("bounceRate");
    expect(result).toHaveProperty("unsubscribeRate");
    expect(result).toHaveProperty("spamRate");
  });
});

describe("calculateHealthScoreForCoreMetrics", () => {
  test("should delegate to AnalyticsCalculator.calculateHealthScore", () => {
    const coreMetrics: PerformanceMetrics = {
      sent: 1000,
      delivered: 950,
      opened_tracked: 300,
      clicked_tracked: 60,
      replied: 25,
      bounced: 50,
      unsubscribed: 10,
      spamComplaints: 5,
    };

    const result = calculateHealthScoreForCoreMetrics(coreMetrics);

    // Health score should be a number between 0 and 100
    expect(typeof result).toBe("number");
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });
});

describe("validateFiltersBeforeCall", () => {
  test("should pass for valid filters", () => {
    const validFilters: AnalyticsFilters = {
      dateRange: { start: "2024-01-01", end: "2024-01-31" },
      entityIds: ["mailbox1"],
      additionalFilters: {},
    };

    expect(() => validateFiltersBeforeCall(validFilters)).not.toThrow();
  });

  test("should throw for missing dateRange", () => {
    const invalidFilters = {
      entityIds: ["mailbox1"],
      additionalFilters: {},
    } as AnalyticsFilters;

    expect(() => validateFiltersBeforeCall(invalidFilters)).toThrow(
      "DateRange is required in analytics filters"
    );
  });

  test("should throw for invalid date format", () => {
    const invalidFilters: AnalyticsFilters = {
      dateRange: { start: "invalid", end: "2024-01-31" },
      entityIds: ["mailbox1"],
      additionalFilters: {},
    };

    expect(() => validateFiltersBeforeCall(invalidFilters)).toThrow();
  });

  test("should throw for start date after end date", () => {
    const invalidFilters: AnalyticsFilters = {
      dateRange: { start: "2024-01-31", end: "2024-01-01" },
      entityIds: ["mailbox1"],
      additionalFilters: {},
    };

    expect(() => validateFiltersBeforeCall(invalidFilters)).toThrow(
      "Start date must be before or equal to end date"
    );
  });
});

describe("Edge cases and error handling", () => {
  test("should handle undefined input gracefully", () => {
    const result = safeExtractCompanyId(undefined, "fallback");
    expect(result).toBe("fallback");
  });

  test("should handle empty objects", () => {
    const result = toCorePerformanceMetrics({});
    expect(result.sent).toBe(0);
    expect(result.delivered).toBe(0);
  });

  test("should handle objects with only string values", () => {
    const result = toCorePerformanceMetrics({ sent: "500", delivered: "400" });
    expect(result.sent).toBe(500);
    expect(result.delivered).toBe(400);
    expect(result.opened_tracked).toBe(0); // Missing fields default to 0
  });

  test("should handle malformed date strings in series mapping", () => {
    const malformed = {
      date: null,
      label: undefined,
      sent: 100,
    };

    const result = mapLegacySeriesToCore(malformed);
    expect(result.date).toBe("");
    expect(result.label).toBe("");
    expect(result.metrics.sent).toBe(100);
  });
});

describe("Integration with real mailbox data", () => {
  test("should handle realistic mailbox performance data", () => {
    const realMailboxData = {
      mailboxId: "mailbox123",
      sent: 1250,
      delivered: 1187,
      opened_tracked: 425,
      clicked_tracked: 68,
      replied: 31,
      bounced: 63,
      unsubscribed: 1250 * 0.002, // 0.2% unsubscribe rate
      spamComplaints: 12,
    };

    const coreMetrics = toCorePerformanceMetrics(realMailboxData);

    expect(coreMetrics.sent).toBe(1250);
    expect(coreMetrics.delivered).toBe(1187);
    expect(coreMetrics.opened_tracked).toBe(425);
    expect(coreMetrics.clicked_tracked).toBe(68);
    expect(coreMetrics.spamComplaints).toBe(12);

    // Can calculate rates
    const rates = calculateRatesForCoreMetrics(coreMetrics);
    expect(typeof rates.deliveryRate).toBe("number");

    // Can calculate health score
    const healthScore = calculateHealthScoreForCoreMetrics(coreMetrics);
    expect(typeof healthScore).toBe("number");
  });
});
