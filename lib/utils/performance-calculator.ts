import {
  PerformanceMetrics,
  CalculatedRates,
} from "../../types/analytics/core";
import { AnalyticsCalculator } from "./analytics-calculator";

/**
 * Performance calculation methods with standardized field names and comparative analysis.
 */
export class PerformanceCalculator {
  /**
   * Calculate standardized rates using correct denominators.
   * @param metrics - Performance metrics to calculate rates from
   * @returns Calculated rates with standardized field names
   */
  static calculateStandardizedRates(metrics: PerformanceMetrics): CalculatedRates {
    return AnalyticsCalculator.calculateAllRates(metrics);
  }

  /**
   * Calculate comparative performance between two periods.
   * @param currentMetrics - Current period metrics
   * @param previousMetrics - Previous period metrics
   * @returns Comparative analysis with changes and improvements/declines
   */
  static calculateComparativePerformance(
    currentMetrics: PerformanceMetrics,
    previousMetrics: PerformanceMetrics
  ): {
    current: CalculatedRates;
    previous: CalculatedRates;
    changes: Record<keyof CalculatedRates, number>;
    improvements: string[];
    declines: string[];
  } {
    const current = this.calculateStandardizedRates(currentMetrics);
    const previous = this.calculateStandardizedRates(previousMetrics);

    const changes: Record<keyof CalculatedRates, number> = {
      deliveryRate: current.deliveryRate - previous.deliveryRate,
      openRate: current.openRate - previous.openRate,
      clickRate: current.clickRate - previous.clickRate,
      replyRate: current.replyRate - previous.replyRate,
      bounceRate: current.bounceRate - previous.bounceRate,
      unsubscribeRate: current.unsubscribeRate - previous.unsubscribeRate,
      spamRate: current.spamRate - previous.spamRate,
    };

    const improvements: string[] = [];
    const declines: string[] = [];

    Object.entries(changes).forEach(([metric, change]) => {
      if (Math.abs(change) > 0.001) { // Only consider significant changes
        if (metric === 'bounceRate' || metric === 'unsubscribeRate' || metric === 'spamRate') {
          // For negative metrics, decrease is improvement
          if (change < 0) improvements.push(metric);
          else declines.push(metric);
        } else {
          // For positive metrics, increase is improvement
          if (change > 0) improvements.push(metric);
          else declines.push(metric);
        }
      }
    });

    return {
      current,
      previous,
      changes,
      improvements,
      declines,
    };
  }

  /**
   * Calculate performance benchmarks with scores and grades.
   * @param metrics - Performance metrics to benchmark
   * @returns Performance benchmarks with scores, grade, and recommendations
   */
  static calculatePerformanceBenchmarks(metrics: PerformanceMetrics): {
    rates: CalculatedRates;
    scores: Record<keyof CalculatedRates, number>;
    overallScore: number;
    grade: "A" | "B" | "C" | "D" | "F";
    recommendations: string[];
  } {
    const rates = this.calculateStandardizedRates(metrics);
    
    // Industry benchmark ranges (0-100 scores)
    const benchmarks = {
      deliveryRate: { excellent: 0.98, good: 0.95, average: 0.90, poor: 0.85 },
      openRate: { excellent: 0.25, good: 0.20, average: 0.15, poor: 0.10 },
      clickRate: { excellent: 0.05, good: 0.03, average: 0.02, poor: 0.01 },
      replyRate: { excellent: 0.10, good: 0.05, average: 0.02, poor: 0.01 },
      bounceRate: { excellent: 0.02, good: 0.05, average: 0.10, poor: 0.15 }, // Lower is better
      unsubscribeRate: { excellent: 0.005, good: 0.01, average: 0.02, poor: 0.05 }, // Lower is better
      spamRate: { excellent: 0.001, good: 0.005, average: 0.01, poor: 0.02 }, // Lower is better
    };

    const scores: Record<keyof CalculatedRates, number> = {} as Record<keyof CalculatedRates, number>;
    
    // Calculate scores for each metric
    Object.entries(rates).forEach(([metric, rate]) => {
      const key = metric as keyof CalculatedRates;
      const benchmark = benchmarks[key];
      
      let score: number;
      
      if (key === 'bounceRate' || key === 'unsubscribeRate' || key === 'spamRate') {
        // Lower is better for these metrics
        if (rate <= benchmark.excellent) score = 100;
        else if (rate <= benchmark.good) score = 85;
        else if (rate <= benchmark.average) score = 70;
        else if (rate <= benchmark.poor) score = 50;
        else score = 25;
      } else {
        // Higher is better for these metrics
        if (rate >= benchmark.excellent) score = 100;
        else if (rate >= benchmark.good) score = 85;
        else if (rate >= benchmark.average) score = 70;
        else if (rate >= benchmark.poor) score = 50;
        else score = 25;
      }
      
      scores[key] = score;
    });

    // Calculate overall score (weighted average)
    const weights = {
      deliveryRate: 0.25,
      openRate: 0.20,
      clickRate: 0.15,
      replyRate: 0.15,
      bounceRate: 0.10,
      unsubscribeRate: 0.10,
      spamRate: 0.05,
    };

    const overallScore = Object.entries(scores).reduce((total, [metric, score]) => {
      const weight = weights[metric as keyof typeof weights];
      return total + (score * weight);
    }, 0);

    // Determine grade
    let grade: "A" | "B" | "C" | "D" | "F";
    if (overallScore >= 90) grade = "A";
    else if (overallScore >= 80) grade = "B";
    else if (overallScore >= 70) grade = "C";
    else if (overallScore >= 60) grade = "D";
    else grade = "F";

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (scores.deliveryRate < 70) {
      recommendations.push("Improve email authentication (SPF, DKIM, DMARC) to increase delivery rates");
    }
    if (scores.openRate < 70) {
      recommendations.push("Optimize subject lines and sender reputation to improve open rates");
    }
    if (scores.clickRate < 70) {
      recommendations.push("Enhance email content and call-to-action buttons to increase click rates");
    }
    if (scores.replyRate < 70) {
      recommendations.push("Personalize emails and include clear questions to encourage replies");
    }
    if (scores.bounceRate < 70) {
      recommendations.push("Clean email lists and validate addresses to reduce bounce rates");
    }
    if (scores.unsubscribeRate < 70) {
      recommendations.push("Review email frequency and content relevance to reduce unsubscribes");
    }
    if (scores.spamRate < 70) {
      recommendations.push("Review email content and sending practices to avoid spam complaints");
    }

    return {
      rates,
      scores,
      overallScore: Math.round(overallScore),
      grade,
      recommendations,
    };
  }
}
