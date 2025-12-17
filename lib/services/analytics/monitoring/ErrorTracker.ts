// ============================================================================
// ERROR TRACKER - Analytics service failure tracking and analysis
// ============================================================================

import { AnalyticsError, AnalyticsErrorType } from "../BaseAnalyticsService";
import { AnalyticsDomain } from "@/types/analytics/ui";
import { analyticsMonitor } from "./AnalyticsMonitor";

/**
 * Error severity levels.
 */
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

/**
 * Error category for classification.
 */
export enum ErrorCategory {
  NETWORK = "network",
  DATABASE = "database",
  CACHE = "cache",
  VALIDATION = "validation",
  AUTHENTICATION = "authentication",
  RATE_LIMITING = "rate_limiting",
  SERVICE_UNAVAILABLE = "service_unavailable",
  UNKNOWN = "unknown",
}

/**
 * Tracked error entry.
 */
export interface TrackedError {
  id: string;
  timestamp: string;
  domain: AnalyticsDomain | "overview";
  operation: string;
  errorType: AnalyticsErrorType;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  stack?: string;
  retryable: boolean;
  retryAttempts: number;
  resolved: boolean;
  resolvedAt?: string;
  context: {
    entityIds?: string[];
    filters?: Record<string, string | number | boolean | null | undefined>;
    userAgent?: string;
    userId?: string;
    sessionId?: string;
  };
  metadata: Record<string, string | number | boolean | null | undefined>;
}

/**
 * Error pattern for trend analysis.
 */
export interface ErrorPattern {
  pattern: string;
  count: number;
  domains: string[];
  operations: string[];
  firstSeen: string;
  lastSeen: string;
  severity: ErrorSeverity;
  trend: "increasing" | "decreasing" | "stable";
}

/**
 * Error statistics.
 */
export interface ErrorStatistics {
  totalErrors: number;
  errorRate: number;
  errorsByDomain: Record<string, number>;
  errorsByType: Record<AnalyticsErrorType, number>;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  topErrors: Array<{
    message: string;
    count: number;
    domains: string[];
  }>;
  trends: {
    hourly: number[];
    daily: number[];
  };
}

/**
 * Error tracking and analysis system.
 */
export class ErrorTracker {
  private static instance: ErrorTracker | null = null;
  private errors: TrackedError[] = [];
  private errorPatterns: Map<string, ErrorPattern> = new Map();
  private readonly maxErrors = 10000;

  private constructor() {
    this.startPeriodicAnalysis();
    console.log("ErrorTracker initialized");
  }

  /**
   * Get singleton instance.
   */
  static getInstance(): ErrorTracker {
    if (!this.instance) {
      this.instance = new ErrorTracker();
    }
    return this.instance;
  }

  /**
   * Track an error.
   */
  trackError(
    domain: AnalyticsDomain | "overview",
    operation: string,
    error: AnalyticsError | Error,
    context: TrackedError["context"] = {},
    metadata: Record<string, string | number | boolean | null | undefined> = {}
  ): string {
    const analyticsError = error instanceof AnalyticsError 
      ? error 
      : new AnalyticsError(
          AnalyticsErrorType.SERVICE_UNAVAILABLE,
          error.message,
          domain.toString(),
          false
        );

    const errorId = `${domain}_${operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const trackedError: TrackedError = {
      id: errorId,
      timestamp: new Date().toISOString(),
      domain,
      operation,
      errorType: analyticsError.type,
      category: this.categorizeError(analyticsError),
      severity: this.determineSeverity(analyticsError, domain),
      message: analyticsError.message,
      stack: analyticsError.stack,
      retryable: analyticsError.retryable,
      retryAttempts: 0,
      resolved: false,
      context,
      metadata,
    };

    this.errors.push(trackedError);
    this.trimErrors();

    // Update error patterns
    this.updateErrorPatterns(trackedError);

    // Log to analytics monitor
    analyticsMonitor.logError(domain, operation, analyticsError, undefined, {
      metadata: {
        ...metadata,
        errorId,
        category: trackedError.category,
        severity: trackedError.severity,
      },
    });

    // Check for critical errors that need immediate attention
    if (trackedError.severity === ErrorSeverity.CRITICAL) {
      this.handleCriticalError(trackedError);
    }

    return errorId;
  }

  /**
   * Track a retry attempt.
   */
  trackRetry(errorId: string): boolean {
    const error = this.errors.find(e => e.id === errorId);
    if (error) {
      error.retryAttempts++;
      return true;
    }
    return false;
  }

  /**
   * Mark an error as resolved.
   */
  resolveError(errorId: string): boolean {
    const error = this.errors.find(e => e.id === errorId);
    if (error && !error.resolved) {
      error.resolved = true;
      error.resolvedAt = new Date().toISOString();
 return true;
    }
    return false;
  }

  /**
   * Get error statistics for a time window.
   */
  getErrorStatistics(
    timeWindow: number = 3600000, // 1 hour
    domain?: AnalyticsDomain | "overview"
  ): ErrorStatistics {
    const cutoff = Date.now() - timeWindow;
    let relevantErrors = this.errors.filter(
      error => new Date(error.timestamp).getTime() > cutoff
    );

    if (domain) {
      relevantErrors = relevantErrors.filter(error => error.domain === domain);
    }

    const totalErrors = relevantErrors.length;
    
    // Calculate error rate (errors per minute)
    const timeWindowMinutes = timeWindow / (60 * 1000);
    const errorRate = totalErrors / timeWindowMinutes;

    // Group by domain
    const errorsByDomain: Record<string, number> = {};
    relevantErrors.forEach(error => {
      const domainKey = error.domain.toString();
      errorsByDomain[domainKey] = (errorsByDomain[domainKey] || 0) + 1;
    });

    // Group by type
    const errorsByType: Record<AnalyticsErrorType, number> = {} as Record<AnalyticsErrorType, number>;
    Object.values(AnalyticsErrorType).forEach(type => {
      errorsByType[type] = 0;
    });
    relevantErrors.forEach(error => {
      errorsByType[error.errorType]++;
    });

    // Group by category
    const errorsByCategory: Record<ErrorCategory, number> = {} as Record<ErrorCategory, number>;
    Object.values(ErrorCategory).forEach(category => {
      errorsByCategory[category] = 0;
    });
    relevantErrors.forEach(error => {
      errorsByCategory[error.category]++;
    });

    // Group by severity
    const errorsBySeverity: Record<ErrorSeverity, number> = {} as Record<ErrorSeverity, number>;
    Object.values(ErrorSeverity).forEach(severity => {
      errorsBySeverity[severity] = 0;
    });
    relevantErrors.forEach(error => {
      errorsBySeverity[error.severity]++;
    });

    // Top errors
    const errorCounts = new Map<string, { count: number; domains: Set<string> }>();
    relevantErrors.forEach(error => {
      const key = error.message;
      if (!errorCounts.has(key)) {
        errorCounts.set(key, { count: 0, domains: new Set() });
      }
      const data = errorCounts.get(key)!;
      data.count++;
      data.domains.add(error.domain.toString());
    });

    const topErrors = Array.from(errorCounts.entries())
      .map(([message, data]) => ({
        message,
        count: data.count,
        domains: Array.from(data.domains),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Trends (simplified - would need more sophisticated time series analysis)
    const hourly = this.calculateHourlyTrend(relevantErrors);
    const daily = this.calculateDailyTrend();

    return {
      totalErrors,
      errorRate,
      errorsByDomain,
      errorsByType,
      errorsByCategory,
      errorsBySeverity,
      topErrors,
      trends: {
        hourly,
        daily,
      },
    };
  }

  /**
   * Get error patterns.
   */
  getErrorPatterns(): ErrorPattern[] {
    return Array.from(this.errorPatterns.values())
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Get unresolved errors.
   */
  getUnresolvedErrors(
    domain?: AnalyticsDomain | "overview",
    severity?: ErrorSeverity
  ): TrackedError[] {
    let unresolved = this.errors.filter(error => !error.resolved);

    if (domain) {
      unresolved = unresolved.filter(error => error.domain === domain);
    }

    if (severity) {
      unresolved = unresolved.filter(error => error.severity === severity);
    }

    return unresolved.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Get error details by ID.
   */
  getErrorDetails(errorId: string): TrackedError | null {
    return this.errors.find(error => error.id === errorId) || null;
  }

  /**
   * Get error tracking dashboard data.
   */
  getDashboardData(): {
    statistics: ErrorStatistics;
    patterns: ErrorPattern[];
    criticalErrors: TrackedError[];
    recentErrors: TrackedError[];
    unresolvedCount: number;
    healthScore: number;
  } {
    const statistics = this.getErrorStatistics();
    const patterns = this.getErrorPatterns().slice(0, 10);
    const criticalErrors = this.getUnresolvedErrors(undefined, ErrorSeverity.CRITICAL);
    const recentErrors = this.errors
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);
    const unresolvedCount = this.getUnresolvedErrors().length;
    
    // Calculate health score (0-100) based on error rates and severity
    const healthScore = this.calculateHealthScore(statistics);

    return {
      statistics,
      patterns,
      criticalErrors,
      recentErrors,
      unresolvedCount,
      healthScore,
    };
  }

  /**
   * Clear old errors.
   */
  clearOldErrors(olderThanHours: number = 168): number { // 7 days default
    const cutoff = Date.now() - (olderThanHours * 60 * 60 * 1000);
    const initialCount = this.errors.length;
    
    // Keep unresolved errors and recent resolved errors
    this.errors = this.errors.filter(error => 
      !error.resolved || new Date(error.timestamp).getTime() > cutoff
    );

    return initialCount - this.errors.length;
  }

  /**
   * Categorize error based on type and message.
   */
  private categorizeError(error: AnalyticsError): ErrorCategory {
    switch (error.type) {
      case AnalyticsErrorType.NETWORK_ERROR:
        return ErrorCategory.NETWORK;
      case AnalyticsErrorType.CACHE_ERROR:
        return ErrorCategory.CACHE;
      case AnalyticsErrorType.AUTHENTICATION_ERROR:
        return ErrorCategory.AUTHENTICATION;
      case AnalyticsErrorType.RATE_LIMITED:
        return ErrorCategory.RATE_LIMITING;
      case AnalyticsErrorType.SERVICE_UNAVAILABLE:
        return ErrorCategory.SERVICE_UNAVAILABLE;
      case AnalyticsErrorType.VALIDATION_ERROR:
      case AnalyticsErrorType.INVALID_FILTERS:
        return ErrorCategory.VALIDATION;
      case AnalyticsErrorType.DATA_NOT_FOUND:
        if (error.message.toLowerCase().includes("database") || 
            error.message.toLowerCase().includes("query")) {
          return ErrorCategory.DATABASE;
        }
        return ErrorCategory.UNKNOWN;
      default:
        return ErrorCategory.UNKNOWN;
    }
  }

  /**
   * Determine error severity.
   */
  private determineSeverity(
    error: AnalyticsError,
    domain: AnalyticsDomain | "overview"
  ): ErrorSeverity {
    // Critical errors
    if (error.type === AnalyticsErrorType.SERVICE_UNAVAILABLE && domain === "overview") {
      return ErrorSeverity.CRITICAL;
    }

    if (error.type === AnalyticsErrorType.AUTHENTICATION_ERROR) {
      return ErrorSeverity.CRITICAL;
    }

    // High severity errors
    if (error.type === AnalyticsErrorType.SERVICE_UNAVAILABLE) {
      return ErrorSeverity.HIGH;
    }

    if (error.type === AnalyticsErrorType.NETWORK_ERROR && !error.retryable) {
      return ErrorSeverity.HIGH;
    }

    // Medium severity errors
    if (error.type === AnalyticsErrorType.RATE_LIMITED) {
      return ErrorSeverity.MEDIUM;
    }

    if (error.type === AnalyticsErrorType.CACHE_ERROR) {
      return ErrorSeverity.MEDIUM;
    }

    // Low severity errors
    if (error.type === AnalyticsErrorType.DATA_NOT_FOUND) {
      return ErrorSeverity.LOW;
    }

    if (error.type === AnalyticsErrorType.VALIDATION_ERROR || 
        error.type === AnalyticsErrorType.INVALID_FILTERS) {
      return ErrorSeverity.LOW;
    }

    return ErrorSeverity.MEDIUM;
  }

  /**
   * Update error patterns for trend analysis.
   */
  private updateErrorPatterns(error: TrackedError): void {
    // Create pattern key based on error type and domain
    const patternKey = `${error.errorType}:${error.domain}`;
    
    if (!this.errorPatterns.has(patternKey)) {
      this.errorPatterns.set(patternKey, {
        pattern: patternKey,
        count: 0,
        domains: [],
        operations: [],
        firstSeen: error.timestamp,
        lastSeen: error.timestamp,
        severity: error.severity,
        trend: "stable",
      });
    }

    const pattern = this.errorPatterns.get(patternKey)!;
    pattern.count++;
    pattern.lastSeen = error.timestamp;
    
    if (!pattern.domains.includes(error.domain.toString())) {
      pattern.domains.push(error.domain.toString());
    }
    
    if (!pattern.operations.includes(error.operation)) {
      pattern.operations.push(error.operation);
    }

    // Update severity to highest seen
    if (this.severityLevel(error.severity) > this.severityLevel(pattern.severity)) {
      pattern.severity = error.severity;
    }

    // Simple trend calculation (would need more sophisticated analysis)
    pattern.trend = this.calculateTrend(patternKey);
  }

  /**
   * Handle critical errors.
   */
  private handleCriticalError(error: TrackedError): void {
    console.error(
      `CRITICAL ERROR in ${error.domain}:${error.operation}:`,
      {
        errorId: error.id,
        message: error.message,
        context: error.context,
        metadata: error.metadata,
      }
    );

    // In a production system, this would trigger immediate alerts
    // such as PagerDuty, Slack notifications, etc.
  }

  /**
   * Calculate hourly trend.
   */
  private calculateHourlyTrend(errors: TrackedError[]): number[] {
    const hours = new Array(24).fill(0);
    const now = new Date();
    
    errors.forEach(error => {
      const errorTime = new Date(error.timestamp);
      const hoursAgo = Math.floor((now.getTime() - errorTime.getTime()) / (60 * 60 * 1000));
      if (hoursAgo < 24) {
        hours[23 - hoursAgo]++;
      }
    });

    return hours;
  }

  /**
   * Calculate daily trend.
   */
  private calculateDailyTrend(): number[] {
    const days = new Array(7).fill(0);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    
    const weekErrors = this.errors.filter(
      error => new Date(error.timestamp) >= weekAgo
    );

    weekErrors.forEach(error => {
      const errorTime = new Date(error.timestamp);
      const daysAgo = Math.floor((now.getTime() - errorTime.getTime()) / (24 * 60 * 60 * 1000));
      if (daysAgo < 7) {
        days[6 - daysAgo]++;
      }
    });

    return days;
  }

  /**
   * Calculate health score based on error statistics.
   */
  private calculateHealthScore(statistics: ErrorStatistics): number {
    let score = 100;

    // Deduct points for error rate
    score -= Math.min(statistics.errorRate * 2, 30); // Max 30 points for error rate

    // Deduct points for critical errors
    score -= statistics.errorsBySeverity[ErrorSeverity.CRITICAL] * 10; // 10 points per critical error

    // Deduct points for high severity errors
    score -= statistics.errorsBySeverity[ErrorSeverity.HIGH] * 5; // 5 points per high error

    // Deduct points for medium severity errors
    score -= statistics.errorsBySeverity[ErrorSeverity.MEDIUM] * 2; // 2 points per medium error

    // Deduct points for low severity errors
    score -= statistics.errorsBySeverity[ErrorSeverity.LOW] * 0.5; // 0.5 points per low error

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get severity level as number for comparison.
   */
  private severityLevel(severity: ErrorSeverity): number {
    switch (severity) {
      case ErrorSeverity.LOW: return 1;
      case ErrorSeverity.MEDIUM: return 2;
      case ErrorSeverity.HIGH: return 3;
      case ErrorSeverity.CRITICAL: return 4;
      default: return 0;
    }
  }

  /**
   * Calculate trend for a pattern.
   */
  private calculateTrend(patternKey: string): "increasing" | "decreasing" | "stable" {
    // Simple trend calculation - in production would use more sophisticated analysis
    const pattern = this.errorPatterns.get(patternKey);
    if (!pattern) return "stable";

    const recentErrors = this.errors.filter(
      error => `${error.errorType}:${error.domain}` === patternKey &&
               new Date(error.timestamp).getTime() > Date.now() - (60 * 60 * 1000) // Last hour
    ).length;

    const olderErrors = this.errors.filter(
      error => `${error.errorType}:${error.domain}` === patternKey &&
               new Date(error.timestamp).getTime() > Date.now() - (2 * 60 * 60 * 1000) && // 2 hours ago
               new Date(error.timestamp).getTime() <= Date.now() - (60 * 60 * 1000) // 1 hour ago
    ).length;

    if (recentErrors > olderErrors * 1.5) return "increasing";
    if (recentErrors < olderErrors * 0.5) return "decreasing";
    return "stable";
  }

  /**
   * Trim errors to prevent memory issues.
   */
  private trimErrors(): void {
    if (this.errors.length > this.maxErrors) {
      // Keep unresolved errors and most recent resolved errors
      const unresolved = this.errors.filter(error => !error.resolved);
      const resolved = this.errors
        .filter(error => error.resolved)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, this.maxErrors - unresolved.length);
      
      this.errors = [...unresolved, ...resolved];
    }
  }

  /**
   * Start periodic analysis.
   */
  private startPeriodicAnalysis(): void {
    // Analyze error patterns every 15 minutes
    setInterval(() => {
      this.analyzeErrorPatterns();
    }, 15 * 60 * 1000); // 15 minutes

    // Clean up old errors every 6 hours
    setInterval(() => {
      const cleared = this.clearOldErrors(168); // Keep 7 days
      if (cleared > 0) {
        console.log(`Error tracker: cleared ${cleared} old errors`);
      }
    }, 6 * 60 * 60 * 1000); // 6 hours
  }

  /**
   * Analyze error patterns for insights.
   */
  private analyzeErrorPatterns(): void {
    const patterns = this.getErrorPatterns();
    const increasingPatterns = patterns.filter(p => p.trend === "increasing");

    if (increasingPatterns.length > 0) {
      console.warn(
        `Detected ${increasingPatterns.length} increasing error patterns:`,
        increasingPatterns.map(p => p.pattern)
      );
    }
  }
}

// Export singleton instance
export const errorTracker = ErrorTracker.getInstance();
