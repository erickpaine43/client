/**
 * Simple Template Analytics Service Tests
 * 
 * Basic tests to verify the service structure and key functionality
 * without complex mocking setup.
 */

import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";
import { 
  PerformanceMetrics,
  AnalyticsFilters
} from "@/types/analytics/core";
import {
  TemplateAnalytics
} from "@/types/analytics/domain-specific";

describe("Template Analytics Service Structure", () => {
  const mockPerformanceMetrics: PerformanceMetrics = {
    sent: 100,
    delivered: 95,
    opened_tracked: 30,
    clicked_tracked: 8,
    replied: 5,
    bounced: 5,
    unsubscribed: 2,
    spamComplaints: 1,
  };

  const mockTemplateAnalytics: TemplateAnalytics = {
    templateId: "template-1",
    templateName: "Cold Outreach Template",
    category: "OUTREACH",
    usage: 25,
    performance: mockPerformanceMetrics,
    id: "template-1",
    name: "Cold Outreach Template",
    updatedAt: Date.now(),
    // BaseAnalytics fields
    sent: 100,
    delivered: 95,
    opened_tracked: 30,
    clicked_tracked: 8,
    replied: 5,
    bounced: 5,
    unsubscribed: 2,
    spamComplaints: 1,
  };

  describe("AnalyticsCalculator integration", () => {
    it("should calculate rates correctly for template analytics", () => {
      const rates = AnalyticsCalculator.calculateAllRates(mockTemplateAnalytics.performance);

      expect(rates.deliveryRate).toBeCloseTo(0.95); // 95/100
      expect(rates.openRate).toBeCloseTo(0.316); // 30/95
      expect(rates.clickRate).toBeCloseTo(0.084); // 8/95
      expect(rates.replyRate).toBeCloseTo(0.053); // 5/95
      expect(rates.bounceRate).toBeCloseTo(0.05); // 5/100
      expect(rates.unsubscribeRate).toBeCloseTo(0.021); // 2/95
      expect(rates.spamRate).toBeCloseTo(0.011); // 1/95
    });

    it("should format rates as percentages", () => {
      const rates = AnalyticsCalculator.calculateAllRates(mockTemplateAnalytics.performance);

      expect(AnalyticsCalculator.formatRateAsPercentage(rates.openRate)).toBe("31.6%");
      expect(AnalyticsCalculator.formatRateAsPercentage(rates.replyRate)).toBe("5.3%");
      expect(AnalyticsCalculator.formatRateAsPercentage(rates.clickRate)).toBe("8.4%");
    });

    it("should calculate health score", () => {
      const healthScore = AnalyticsCalculator.calculateHealthScore(mockTemplateAnalytics.performance);

      expect(healthScore).toBeGreaterThan(0);
      expect(healthScore).toBeLessThanOrEqual(100);
      expect(typeof healthScore).toBe("number");
    });

    it("should validate metrics", () => {
      const validation = AnalyticsCalculator.validateMetrics(mockTemplateAnalytics.performance);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("should detect invalid metrics", () => {
      const invalidMetrics: PerformanceMetrics = {
        ...mockTemplateAnalytics.performance,
        sent: -10, // Invalid negative value
      };

      const validation = AnalyticsCalculator.validateMetrics(invalidMetrics);

      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe("Template Analytics data structure", () => {
    it("should have correct template analytics structure", () => {
      expect(mockTemplateAnalytics).toHaveProperty("templateId");
      expect(mockTemplateAnalytics).toHaveProperty("templateName");
      expect(mockTemplateAnalytics).toHaveProperty("category");
      expect(mockTemplateAnalytics).toHaveProperty("usage");
      expect(mockTemplateAnalytics).toHaveProperty("performance");
      
      // BaseAnalytics properties
      expect(mockTemplateAnalytics).toHaveProperty("id");
      expect(mockTemplateAnalytics).toHaveProperty("name");
      expect(mockTemplateAnalytics).toHaveProperty("updatedAt");
      
      // PerformanceMetrics properties
      expect(mockTemplateAnalytics).toHaveProperty("sent");
      expect(mockTemplateAnalytics).toHaveProperty("delivered");
      expect(mockTemplateAnalytics).toHaveProperty("opened_tracked");
      expect(mockTemplateAnalytics).toHaveProperty("clicked_tracked");
      expect(mockTemplateAnalytics).toHaveProperty("replied");
      expect(mockTemplateAnalytics).toHaveProperty("bounced");
      expect(mockTemplateAnalytics).toHaveProperty("unsubscribed");
      expect(mockTemplateAnalytics).toHaveProperty("spamComplaints");
    });

    it("should have correct performance metrics structure", () => {
      expect(mockTemplateAnalytics.performance).toHaveProperty("sent");
      expect(mockTemplateAnalytics.performance).toHaveProperty("delivered");
      expect(mockTemplateAnalytics.performance).toHaveProperty("opened_tracked");
      expect(mockTemplateAnalytics.performance).toHaveProperty("clicked_tracked");
      expect(mockTemplateAnalytics.performance).toHaveProperty("replied");
      expect(mockTemplateAnalytics.performance).toHaveProperty("bounced");
      expect(mockTemplateAnalytics.performance).toHaveProperty("unsubscribed");
      expect(mockTemplateAnalytics.performance).toHaveProperty("spamComplaints");
    });

    it("should use standardized field names", () => {
      // Verify we're using opened_tracked and clicked_tracked (not opens/clicks)
      expect(mockTemplateAnalytics.performance).toHaveProperty("opened_tracked");
      expect(mockTemplateAnalytics.performance).toHaveProperty("clicked_tracked");
      expect(mockTemplateAnalytics.performance).not.toHaveProperty("opens");
      expect(mockTemplateAnalytics.performance).not.toHaveProperty("clicks");
    });
  });

  describe("Analytics filters", () => {
    it("should have correct filter structure", () => {
      const filters: AnalyticsFilters = {
        dateRange: {
          start: "2024-11-01",
          end: "2024-12-01",
        },
        entityIds: ["template-1", "template-2"],
      };

      expect(filters).toHaveProperty("dateRange");
      expect(filters.dateRange).toHaveProperty("start");
      expect(filters.dateRange).toHaveProperty("end");
      expect(filters).toHaveProperty("entityIds");
      expect(Array.isArray(filters.entityIds)).toBe(true);
    });

    it("should validate date range format", () => {
      const filters: AnalyticsFilters = {
        dateRange: {
          start: "2024-11-01",
          end: "2024-12-01",
        },
      };

      const startDate = new Date(filters.dateRange?.start || '');
      const endDate = new Date(filters.dateRange?.end || '');

      expect(startDate.getTime()).toBeLessThan(endDate.getTime());
      expect(isNaN(startDate.getTime())).toBe(false);
      expect(isNaN(endDate.getTime())).toBe(false);
    });
  });

  describe("Template categories", () => {
    it("should support standard template categories", () => {
      const categories = [
        "OUTREACH",
        "INTRODUCTION", 
        "FOLLOW_UP",
        "MEETING",
        "VALUE",
        "SAAS",
        "AGENCY",
        "CONSULTING",
        "ECOMMERCE",
        "REAL_ESTATE",
        "HR",
        "FINANCE",
        "HEALTHCARE"
      ];

      categories.forEach(category => {
        const templateWithCategory: TemplateAnalytics = {
          ...mockTemplateAnalytics,
          category: category,
        };

        expect(templateWithCategory.category).toBe(category);
      });
    });
  });

  describe("Rate calculations", () => {
    it("should handle zero values gracefully", () => {
      const zeroMetrics: PerformanceMetrics = {
        sent: 0,
        delivered: 0,
        opened_tracked: 0,
        clicked_tracked: 0,
        replied: 0,
        bounced: 0,
        unsubscribed: 0,
        spamComplaints: 0,
      };

      const rates = AnalyticsCalculator.calculateAllRates(zeroMetrics);

      expect(rates.deliveryRate).toBe(0);
      expect(rates.openRate).toBe(0);
      expect(rates.clickRate).toBe(0);
      expect(rates.replyRate).toBe(0);
      expect(rates.bounceRate).toBe(0);
      expect(rates.unsubscribeRate).toBe(0);
      expect(rates.spamRate).toBe(0);
    });

    it("should handle edge cases correctly", () => {
      const edgeCaseMetrics: PerformanceMetrics = {
        sent: 1,
        delivered: 1,
        opened_tracked: 1,
        clicked_tracked: 1,
        replied: 1,
        bounced: 0,
        unsubscribed: 0,
        spamComplaints: 0,
      };

      const rates = AnalyticsCalculator.calculateAllRates(edgeCaseMetrics);

      expect(rates.deliveryRate).toBe(1); // 1/1
      expect(rates.openRate).toBe(1); // 1/1
      expect(rates.clickRate).toBe(1); // 1/1
      expect(rates.replyRate).toBe(1); // 1/1
      expect(rates.bounceRate).toBe(0); // 0/1
      expect(rates.unsubscribeRate).toBe(0); // 0/1
      expect(rates.spamRate).toBe(0); // 0/1
    });
  });

  describe("Aggregation", () => {
    it("should aggregate multiple template metrics correctly", () => {
      const template1Metrics: PerformanceMetrics = {
        sent: 100,
        delivered: 95,
        opened_tracked: 30,
        clicked_tracked: 8,
        replied: 5,
        bounced: 5,
        unsubscribed: 2,
        spamComplaints: 1,
      };

      const template2Metrics: PerformanceMetrics = {
        sent: 50,
        delivered: 48,
        opened_tracked: 15,
        clicked_tracked: 4,
        replied: 3,
        bounced: 2,
        unsubscribed: 1,
        spamComplaints: 0,
      };

      const aggregated = AnalyticsCalculator.aggregateMetrics([template1Metrics, template2Metrics]);

      expect(aggregated.sent).toBe(150);
      expect(aggregated.delivered).toBe(143);
      expect(aggregated.opened_tracked).toBe(45);
      expect(aggregated.clicked_tracked).toBe(12);
      expect(aggregated.replied).toBe(8);
      expect(aggregated.bounced).toBe(7);
      expect(aggregated.unsubscribed).toBe(3);
      expect(aggregated.spamComplaints).toBe(1);
    });

    it("should handle empty array aggregation", () => {
      const aggregated = AnalyticsCalculator.aggregateMetrics([]);

      expect(aggregated.sent).toBe(0);
      expect(aggregated.delivered).toBe(0);
      expect(aggregated.opened_tracked).toBe(0);
      expect(aggregated.clicked_tracked).toBe(0);
      expect(aggregated.replied).toBe(0);
      expect(aggregated.bounced).toBe(0);
      expect(aggregated.unsubscribed).toBe(0);
      expect(aggregated.spamComplaints).toBe(0);
    });
  });
});
