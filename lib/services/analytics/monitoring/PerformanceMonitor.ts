// ============================================================================
// PERFORMANCE MONITOR - Server-side computation performance tracking
// ============================================================================

import { AnalyticsDomain } from "@/types/analytics/ui";
import { analyticsMonitor } from "./AnalyticsMonitor";

/**
 * Performance measurement result.
 */
export interface PerformanceMeasurement {
  operation: string;
  domain: AnalyticsDomain | "overview";
  totalDuration: number;
  phases: {
    queryTime?: number;
    computationTime?: number;
    cacheTime?: number;
    serializationTime?: number;
  };
  dataSize?: number;
  recordCount?: number;
  cacheHit?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Performance thresholds for different operation types.
 */
export interface PerformanceThresholds {
  query: number; // Database query time
  computation: number; // Analytics computation time
  cache: number; // Cache operation time
  total: number; // Total operation time
}

/**
 * Default performance thresholds (in milliseconds).
 */
export const DEFAULT_THRESHOLDS: Record<string, PerformanceThresholds> = {
  campaigns: {
    query: 1000,
    computation: 2000,
    cache: 100,
    total: 5000,
  },
  domains: {
    query: 800,
    computation: 1500,
    cache: 100,
    total: 3000,
  },
  mailboxes: {
    query: 1200,
    computation: 2500,
    cache: 100,
    total: 5000,
  },
  leads: {
    query: 1000,
    computation: 1800,
    cache: 100,
    total: 4000,
  },
  templates: {
    query: 500,
    computation: 1000,
    cache: 100,
    total: 2000,
  },
  billing: {
    query: 600,
    computation: 1200,
    cache: 100,
    total: 2500,
  },
  overview: {
    query: 2000,
    computation: 3000,
    cache: 100,
    total: 8000,
  },
};

/**
 * Performance monitoring class for tracking server-side computations.
 */
export class PerformanceMonitor {
  private measurements: Map<string, number> = new Map();
  private operation: string;
  private domain: AnalyticsDomain | "overview";
  private startTime: number;
  private phases: PerformanceMeasurement["phases"] = {};
  private metadata: Record<string, unknown> = {};
  private dataSize?: number;
  private recordCount?: number;
  private cacheHit?: boolean;

  constructor(operation: string, domain: AnalyticsDomain | "overview") {
    this.operation = operation;
    this.domain = domain;
    this.startTime = performance.now();
  }

  /**
   * Start measuring a specific phase.
   */
  startPhase(phase: keyof PerformanceMeasurement["phases"]): void {
    this.measurements.set(phase, performance.now());
  }

  /**
   * End measuring a specific phase.
   */
  endPhase(phase: keyof PerformanceMeasurement["phases"]): number {
    const startTime = this.measurements.get(phase);
    if (!startTime) {
      console.warn(`Phase '${phase}' was not started for operation '${this.operation}'`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.phases[phase] = duration;
    this.measurements.delete(phase);
    return duration;
  }

  /**
   * Set data size for the operation.
   */
  setDataSize(bytes: number): void {
    this.dataSize = bytes;
  }

  /**
   * Set record count for the operation.
   */
  setRecordCount(count: number): void {
    this.recordCount = count;
  }

  /**
   * Set cache hit status.
   */
  setCacheHit(hit: boolean): void {
    this.cacheHit = hit;
  }

  /**
   * Add metadata to the measurement.
   */
  addMetadata(key: string, value: unknown): void {
    this.metadata[key] = value;
  }

  /**
   * Complete the measurement and log results.
   */
  complete(): PerformanceMeasurement {
    const totalDuration = performance.now() - this.startTime;

    const measurement: PerformanceMeasurement = {
      operation: this.operation,
      domain: this.domain,
      totalDuration,
      phases: { ...this.phases },
      dataSize: this.dataSize,
      recordCount: this.recordCount,
      cacheHit: this.cacheHit,
      metadata: { ...this.metadata },
    };

    // Log to analytics monitor
    analyticsMonitor.logSuccess(
      this.domain,
      this.operation,
      totalDuration,
      {
        cacheHit: this.cacheHit,
        performance: {
          queryTime: this.phases.queryTime,
          cacheTime: this.phases.cacheTime,
          computationTime: this.phases.computationTime,
          dataSize: this.dataSize,
        },
        metadata: this.metadata,
      }
    );

    // Check performance thresholds
    this.checkThresholds(measurement);

    return measurement;
  }

  /**
   * Complete with error.
   */
  completeWithError(error: Error): PerformanceMeasurement {
    const totalDuration = performance.now() - this.startTime;

    const measurement: PerformanceMeasurement = {
      operation: this.operation,
      domain: this.domain,
      totalDuration,
      phases: { ...this.phases },
      dataSize: this.dataSize,
      recordCount: this.recordCount,
      cacheHit: this.cacheHit,
      metadata: { ...this.metadata },
    };

    // Log error to analytics monitor
    analyticsMonitor.logError(
      this.domain,
      this.operation,
      error,
      totalDuration,
      {
        metadata: {
          ...this.metadata,
          performance: {
            queryTime: this.phases.queryTime,
            cacheTime: this.phases.cacheTime,
            computationTime: this.phases.computationTime,
            dataSize: this.dataSize,
          },
        },
      }
    );

    return measurement;
  }

  /**
   * Check performance against thresholds and log warnings.
   */
  private checkThresholds(measurement: PerformanceMeasurement): void {
    const thresholds = DEFAULT_THRESHOLDS[this.domain] || DEFAULT_THRESHOLDS.overview;

    const warnings: string[] = [];

    if (measurement.totalDuration > thresholds.total) {
      warnings.push(`Total duration (${measurement.totalDuration.toFixed(0)}ms) exceeds threshold (${thresholds.total}ms)`);
    }

    if (measurement.phases.queryTime && measurement.phases.queryTime > thresholds.query) {
      warnings.push(`Query time (${measurement.phases.queryTime.toFixed(0)}ms) exceeds threshold (${thresholds.query}ms)`);
    }

    if (measurement.phases.computationTime && measurement.phases.computationTime > thresholds.computation) {
      warnings.push(`Computation time (${measurement.phases.computationTime.toFixed(0)}ms) exceeds threshold (${thresholds.computation}ms)`);
    }

    if (measurement.phases.cacheTime && measurement.phases.cacheTime > thresholds.cache) {
      warnings.push(`Cache time (${measurement.phases.cacheTime.toFixed(0)}ms) exceeds threshold (${thresholds.cache}ms)`);
    }

    if (warnings.length > 0) {
      console.warn(
        `Performance threshold exceeded for ${this.domain}:${this.operation}:`,
        warnings.join(", "),
        measurement
      );
    }
  }

  /**
   * Create a performance monitor for an operation.
   */
  static create(operation: string, domain: AnalyticsDomain | "overview"): PerformanceMonitor {
    return new PerformanceMonitor(operation, domain);
  }

  /**
   * Measure an async operation with automatic completion.
   */
  static async measure<T>(
    operation: string,
    domain: AnalyticsDomain | "overview",
    executor: (monitor: PerformanceMonitor) => Promise<T>
  ): Promise<T> {
    const monitor = new PerformanceMonitor(operation, domain);
    
    try {
      const result = await executor(monitor);
      monitor.complete();
      return result;
    } catch (error) {
      monitor.completeWithError(error as Error);
      throw error;
    }
  }

  /**
   * Measure a synchronous operation with automatic completion.
   */
  static measureSync<T>(
    operation: string,
    domain: AnalyticsDomain | "overview",
    executor: (monitor: PerformanceMonitor) => T
  ): T {
    const monitor = new PerformanceMonitor(operation, domain);
    
    try {
      const result = executor(monitor);
      monitor.complete();
      return result;
    } catch (error) {
      monitor.completeWithError(error as Error);
      throw error;
    }
  }

  /**
   * Get performance statistics for a domain.
   */
  static getPerformanceStats(
    domain: AnalyticsDomain | "overview",
    timeWindow: number = 3600000 // 1 hour
  ): {
    averageDuration: number;
    p95Duration: number;
    p99Duration: number;
    slowestOperations: Array<{
      operation: string;
      duration: number;
      timestamp: string;
    }>;
    phaseBreakdown: {
      queryTime: number;
      computationTime: number;
      cacheTime: number;
      serializationTime: number;
    };
  } {
    const metrics = analyticsMonitor.getPerformanceMetrics(domain, timeWindow);
    
    // Calculate phase breakdown from recent logs
    const recentLogs = analyticsMonitor.getRecentLogs(1000, domain);
    const logsWithPerformance = recentLogs.filter(log => log.performance);
    
    const phaseBreakdown = {
      queryTime: 0,
      computationTime: 0,
      cacheTime: 0,
      serializationTime: 0,
    };

    if (logsWithPerformance.length > 0) {
      const totals = logsWithPerformance.reduce((acc, log) => {
        const perf = log.performance!;
        return {
          queryTime: acc.queryTime + (perf.queryTime || 0),
          computationTime: acc.computationTime + (perf.computationTime || 0),
          cacheTime: acc.cacheTime + (perf.cacheTime || 0),
          serializationTime: acc.serializationTime + 0, // Not tracked yet
        };
      }, phaseBreakdown);

      const count = logsWithPerformance.length;
      phaseBreakdown.queryTime = totals.queryTime / count;
      phaseBreakdown.computationTime = totals.computationTime / count;
      phaseBreakdown.cacheTime = totals.cacheTime / count;
      phaseBreakdown.serializationTime = totals.serializationTime / count;
    }

    return {
      averageDuration: metrics.averageDuration,
      p95Duration: metrics.p95Duration,
      p99Duration: metrics.p99Duration,
      slowestOperations: metrics.slowestOperations,
      phaseBreakdown,
    };
  }
}

/**
  * Decorator for automatic performance monitoring.
  */
export function MonitorPerformance(
  operation: string,
  domain: AnalyticsDomain | "overview"
) {
  return function (
    target: unknown,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      return PerformanceMonitor.measure(
        `${operation}:${propertyName}`,
        domain,
        async (_monitor) => {
          return method.apply(this, args);
        }
      );
    };

    return descriptor;
  };
}

/**
  * Utility functions for performance monitoring.
  */
export class PerformanceUtils {
  /**
    * Calculate data size in bytes for common data types.
    */
  static calculateDataSize(data: unknown): number {
    if (data === null || data === undefined) return 0;
    
    if (typeof data === "string") {
      return new Blob([data]).size;
    }
    
    if (typeof data === "object") {
      return new Blob([JSON.stringify(data)]).size;
    }
    
    return 0;
  }

  /**
   * Format duration for display.
   */
  static formatDuration(milliseconds: number): string {
    if (milliseconds < 1000) {
      return `${milliseconds.toFixed(0)}ms`;
    } else if (milliseconds < 60000) {
      return `${(milliseconds / 1000).toFixed(1)}s`;
    } else {
      return `${(milliseconds / 60000).toFixed(1)}m`;
    }
  }

  /**
   * Format data size for display.
   */
  static formatDataSize(bytes: number): string {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)}${units[unitIndex]}`;
  }

  /**
   * Get performance grade based on duration and thresholds.
   */
  static getPerformanceGrade(
    duration: number,
    thresholds: PerformanceThresholds
  ): "excellent" | "good" | "fair" | "poor" {
    if (duration <= thresholds.total * 0.5) return "excellent";
    if (duration <= thresholds.total * 0.75) return "good";
    if (duration <= thresholds.total) return "fair";
    return "poor";
  }
}
