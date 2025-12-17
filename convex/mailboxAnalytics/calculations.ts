import { ConvexError } from "convex/values";
import type { PerformanceMetrics, DataGranularity } from "../../types/analytics/core";
import { validateMetrics } from "./validation";

/**
 * Calculate health score from performance metrics.
 * 
 * Computes a comprehensive health score (0-100) based on key performance indicators
 * including delivery rate, engagement metrics, and negative indicators. The score
 * uses weighted factors to provide a balanced assessment of mailbox health.
 * 
 * @param metrics - Performance metrics to calculate health score from
 * @returns Health score between 0 and 100 (higher is better)
 */
export function calculateHealthScore(metrics: PerformanceMetrics): number {
  // Input validation to prevent division by zero and invalid metrics
  validateMetrics(metrics);
  
  // Return perfect score for inactive mailboxes (no emails sent)
  if (metrics.sent === 0) return 100;
  
  // Prevent division by zero with additional safety checks
  const safeDivision = (numerator: number, denominator: number): number => {
    if (denominator === 0 || !Number.isFinite(denominator)) return 0;
    const result = numerator / denominator;
    return Number.isFinite(result) ? result : 0;
  };

  const deliveryRate = safeDivision(metrics.delivered, metrics.sent);
  const openRate = safeDivision(metrics.opened_tracked, metrics.delivered);
  const replyRate = safeDivision(metrics.replied, metrics.delivered);
  const bounceRate = safeDivision(metrics.bounced, metrics.sent);
  const spamRate = safeDivision(metrics.spamComplaints, metrics.delivered);

  // Weighted scoring with proper bounds checking
  let score = 0;
  score += Math.min(deliveryRate / 0.95, 1) * 30; // 30% weight
  score += Math.min(openRate / 0.25, 1) * 25;     // 25% weight
  score += Math.min(replyRate / 0.1, 1) * 20;     // 20% weight
  score += Math.max(0, 1 - bounceRate / 0.05) * 15; // 15% weight (reverse)
  score += Math.max(0, 1 - spamRate / 0.005) * 10;  // 10% weight (reverse)

  // Ensure result is within valid bounds and finite
  const finalScore = Math.max(0, Math.min(100, score));
  return Number.isFinite(finalScore) ? Math.round(finalScore) : 0;
}

/**
 * Calculate deliverability score from performance metrics.
 * 
 * Computes a focused deliverability score (0-100) based on delivery success
 * and negative indicators. This score specifically measures how well emails
 * reach the inbox without being bounced or marked as spam.
 * 
 * @param metrics - Performance metrics to calculate deliverability score from
 * @returns Deliverability score between 0 and 100 (higher is better)
 */
export function calculateDeliverabilityScore(metrics: PerformanceMetrics): number {
  // Input validation to prevent division by zero and invalid metrics
  validateMetrics(metrics);
  
  // Return perfect score for inactive mailboxes (no emails sent)
  if (metrics.sent === 0) return 100;

  // Prevent division by zero with additional safety checks
  const safeDivision = (numerator: number, denominator: number): number => {
    if (denominator === 0 || !Number.isFinite(denominator)) return 0;
    const result = numerator / denominator;
    return Number.isFinite(result) ? result : 0;
  };

  const deliveryRate = safeDivision(metrics.delivered, metrics.sent);
  const bounceRate = safeDivision(metrics.bounced, metrics.sent);
  const spamRate = safeDivision(metrics.spamComplaints, metrics.delivered);

  // Weighted scoring with proper bounds checking
  let score = 0;
  score += Math.min(deliveryRate / 0.98, 1) * 50;
  score += Math.max(0, 1 - bounceRate / 0.05) * 30;
  score += Math.max(0, 1 - spamRate / 0.005) * 20;

  // Ensure result is within valid bounds and finite
  const finalScore = Math.max(0, Math.min(100, score));
  return Number.isFinite(finalScore) ? Math.round(finalScore) : 0;
}

/**
 * Calculate comprehensive health score with reputation factors.
 * 
 * @param _metrics - Performance metrics (unused in current implementation)
 * @param reputationFactors - Pre-calculated reputation factors
 * @returns Comprehensive health score between 0 and 100 (higher is better)
 */
export function calculateComprehensiveHealthScore(
  _metrics: PerformanceMetrics,
  reputationFactors: {
    deliverabilityScore: number;
    spamScore: number;
    bounceScore: number;
    engagementScore: number;
    warmupScore: number;
  }
): number {
  // Input validation for reputation factors
  const validateFactor = (value: number, name: string): number => {
    if (!Number.isFinite(value) || value < 0) {
      throw new ConvexError({
        code: "ANALYTICS_INVALID_METRICS",
        message: `${name} must be a finite, non-negative number`,
      });
    }
    return value;
  };

  // Validate all reputation factors
  const deliverabilityScore = validateFactor(reputationFactors.deliverabilityScore, "deliverabilityScore");
  const spamScore = validateFactor(reputationFactors.spamScore, "spamScore");
  const bounceScore = validateFactor(reputationFactors.bounceScore, "bounceScore");
  const engagementScore = validateFactor(reputationFactors.engagementScore, "engagementScore");
  const warmupScore = validateFactor(reputationFactors.warmupScore, "warmupScore");

  // Weighted scoring with proper bounds checking
  let score = 0;
  score += Math.min(deliverabilityScore / 100, 1) * 30;
  score += Math.min(engagementScore, 1) * 25;
  score += Math.min(warmupScore, 1) * 20;
  score += Math.max(0, 1 - Math.min(spamScore * 100, 1)) * 15;
  score += Math.max(0, 1 - Math.min(bounceScore * 10, 1)) * 10;

  // Ensure result is within valid bounds and finite
  const finalScore = Math.max(0, Math.min(100, score));
  return Number.isFinite(finalScore) ? Math.round(finalScore) : 0;
}

/**
 * Get time key for grouping based on granularity.
 * 
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param granularity - Time grouping granularity
 * @returns Time period key for grouping
 */
export function getTimeKey(dateStr: string, granularity: DataGranularity): string {
  // Validate input format
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  if (!iso.test(dateStr)) {
    return dateStr; // Graceful fallback for invalid format
  }

  try {
    switch (granularity) {
      case "day":
        return dateStr; // Already in YYYY-MM-DD format

      case "week": {
        const date = new Date(`${dateStr}T00:00:00.000Z`);
        if (Number.isNaN(date.getTime())) {
          return dateStr; // Graceful fallback for invalid date
        }
        
        // Get Sunday of the week (week start)
        const dayOfWeek = date.getUTCDay();
        const weekStart = new Date(date);
        weekStart.setUTCDate(date.getUTCDate() - dayOfWeek);
        
        return weekStart.toISOString().split("T")[0];
      }

      case "month": {
        const date = new Date(`${dateStr}T00:00:00.000Z`);
        if (Number.isNaN(date.getTime())) {
          return dateStr; // Graceful fallback for invalid date
        }
        
        // Return YYYY-MM format
        return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
      }

      default:
        // TypeScript exhaustiveness check - should never reach here
        return dateStr;
    }
  } catch (error) {
    console.error("Error in getTimeKey:", error);
    // Graceful fallback for any unexpected errors
    return dateStr;
  }
}

/**
 * Format time label for display purposes.
 * 
 * @param timeKey - Time period key from getTimeKey function
 * @param granularity - Time grouping granularity
 * @returns Human-readable time period label
 */
export function formatTimeLabel(timeKey: string, granularity: DataGranularity): string {
  try {
    switch (granularity) {
      case "day": {
        // Validate day format (YYYY-MM-DD)
        const dayPattern = /^\d{4}-\d{2}-\d{2}$/;
        if (!dayPattern.test(timeKey)) {
          return timeKey; // Graceful fallback
        }
        
        const date = new Date(`${timeKey}T00:00:00.000Z`);
        if (Number.isNaN(date.getTime())) {
          return timeKey; // Graceful fallback for invalid date
        }
        
        return date.toLocaleDateString("en-US", { 
          month: "short", 
          day: "numeric",
          timeZone: "UTC" // Ensure consistent formatting
        });
      }
      
      case "week": {
        // Validate week format (YYYY-MM-DD for week start)
        const weekPattern = /^\d{4}-\d{2}-\d{2}$/;
        if (!weekPattern.test(timeKey)) {
          return timeKey; // Graceful fallback
        }
        
        const weekStart = new Date(`${timeKey}T00:00:00.000Z`);
        if (Number.isNaN(weekStart.getTime())) {
          return timeKey; // Graceful fallback for invalid date
        }
        
        const weekEnd = new Date(weekStart);
        weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
        
        const startLabel = weekStart.toLocaleDateString("en-US", { 
          month: "short", 
          day: "numeric",
          timeZone: "UTC"
        });
        const endLabel = weekEnd.toLocaleDateString("en-US", { 
          month: "short", 
          day: "numeric",
          timeZone: "UTC"
        });
        
        return `${startLabel} - ${endLabel}`;
      }
      
      case "month": {
        // Validate month format (YYYY-MM)
        const monthPattern = /^\d{4}-\d{2}$/;
        if (!monthPattern.test(timeKey)) {
          return timeKey; // Graceful fallback
        }
        
        // Parse month key (YYYY-MM format)
        const [year, month] = timeKey.split("-");
        const date = new Date(`${year}-${month}-01T00:00:00.000Z`);
        
        if (Number.isNaN(date.getTime())) {
          return timeKey; // Graceful fallback for invalid date
        }
        
        return date.toLocaleDateString("en-US", { 
          year: "numeric", 
          month: "long",
          timeZone: "UTC"
        });
      }
      
      default:
        // TypeScript exhaustiveness check - should never reach here
        return timeKey;
    }
  } catch (error) {
    console.error("Error in formatTimeLabel:", error);
    // Graceful fallback for any unexpected errors
    return timeKey;
  }
}
