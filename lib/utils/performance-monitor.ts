/**
 * Performance Monitor - Compilation time measurement and build validation
 * 
 * This utility provides compilation time tracking and build performance validation
 * to ensure the ConvexQueryHelper implementation doesn't negatively impact build times.
 * 
 * Requirements addressed:
 * - 4.3: Compilation time SHALL not increase by more than 10%
 * - 1.2: Build time SHALL complete within 15 seconds
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Build performance metrics
 */
export interface BuildMetrics {
  /** Build start timestamp */
  startTime: number;
  /** Build end timestamp */
  endTime: number;
  /** Total build duration in milliseconds */
  duration: number;
  /** TypeScript compilation duration */
  tscDuration?: number;
  /** ESLint duration */
  eslintDuration?: number;
  /** Test execution duration */
  testDuration?: number;
  /** Build success status */
  success: boolean;
  /** Git commit hash for tracking */
  commitHash?: string;
  /** Build environment */
  environment: 'development' | 'production' | 'test';
  /** Number of TypeScript errors */
  tsErrors: number;
  /** Number of ESLint warnings */
  eslintWarnings: number;
}

/**
 * Performance thresholds and limits
 */
export interface PerformanceThresholds {
  /** Maximum allowed build time in seconds */
  maxBuildTime: number;
  /** Maximum allowed increase in build time (percentage) */
  maxBuildTimeIncrease: number;
  /** Maximum allowed TypeScript errors */
  maxTsErrors: number;
  /** Maximum allowed ESLint warnings */
  maxEslintWarnings: number;
}

/**
 * Default performance thresholds based on requirements
 */
export const DEFAULT_PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  maxBuildTime: 15, // 15 seconds as per requirement 1.2
  maxBuildTimeIncrease: 10, // 10% as per requirement 4.3
  maxTsErrors: 0, // Zero TypeScript errors required
  maxEslintWarnings: 0, // Zero ESLint warnings as per requirement 1.1
};

/**
 * Performance monitoring utility class
 */
export class PerformanceMonitor {
  private metricsFile: string;
  private thresholds: PerformanceThresholds;
  private currentBuild: Partial<BuildMetrics> = {};

  constructor(
    metricsFile: string = '.performance-metrics.json',
    thresholds: PerformanceThresholds = DEFAULT_PERFORMANCE_THRESHOLDS
  ) {
    // Use absolute path if provided, otherwise join with cwd
    this.metricsFile = metricsFile.startsWith('/') ? metricsFile : join(process.cwd(), metricsFile);
    this.thresholds = thresholds;
  }

  /**
   * Start build performance tracking
   */
  startBuild(environment: 'development' | 'production' | 'test' = 'development'): void {
    this.currentBuild = {
      startTime: Date.now(),
      environment,
      success: false,
      tsErrors: 0,
      eslintWarnings: 0,
    };

    console.log(`[PerformanceMonitor] Starting build tracking for ${environment} environment`);
  }

  /**
   * Record TypeScript compilation metrics
   */
  recordTscMetrics(duration: number, errors: number): void {
    this.currentBuild.tscDuration = duration;
    this.currentBuild.tsErrors = errors;
    
    console.log(`[PerformanceMonitor] TypeScript compilation: ${duration}ms, ${errors} errors`);
  }

  /**
   * Record ESLint metrics
   */
  recordEslintMetrics(duration: number, warnings: number): void {
    this.currentBuild.eslintDuration = duration;
    this.currentBuild.eslintWarnings = warnings;
    
    console.log(`[PerformanceMonitor] ESLint: ${duration}ms, ${warnings} warnings`);
  }

  /**
   * Record test execution metrics
   */
  recordTestMetrics(duration: number): void {
    this.currentBuild.testDuration = duration;
    
    console.log(`[PerformanceMonitor] Tests: ${duration}ms`);
  }

  /**
   * Complete build tracking and validate performance
   */
  completeBuild(success: boolean, commitHash?: string): BuildMetrics {
    const endTime = Date.now();
    const duration = endTime - (this.currentBuild.startTime || endTime);

    const metrics: BuildMetrics = {
      startTime: this.currentBuild.startTime || endTime,
      endTime,
      duration,
      tscDuration: this.currentBuild.tscDuration,
      eslintDuration: this.currentBuild.eslintDuration,
      testDuration: this.currentBuild.testDuration,
      success,
      commitHash,
      environment: this.currentBuild.environment || 'development',
      tsErrors: this.currentBuild.tsErrors || 0,
      eslintWarnings: this.currentBuild.eslintWarnings || 0,
    };

    // Save metrics to file
    this.saveMetrics(metrics);

    // Validate performance against thresholds
    const validation = this.validatePerformance(metrics);
    
    console.log(`[PerformanceMonitor] Build completed: ${duration}ms`);
    console.log(`[PerformanceMonitor] Performance validation:`, validation);

    return metrics;
  }

  /**
   * Validateuild performance against thresholds
   */
  validatePerformance(metrics: BuildMetrics): PerformanceValidation {
    const durationSeconds = metrics.duration / 1000;
    const previousMetrics = this.getPreviousMetrics();
    
    const validation: PerformanceValidation = {
      buildTimeValid: durationSeconds <= this.thresholds.maxBuildTime,
      buildTimeIncreaseValid: true,
      tsErrorsValid: metrics.tsErrors <= this.thresholds.maxTsErrors,
      eslintWarningsValid: metrics.eslintWarnings <= this.thresholds.maxEslintWarnings,
      overallValid: true,
      metrics: {
        buildTime: durationSeconds,
        buildTimeThreshold: this.thresholds.maxBuildTime,
        tsErrors: metrics.tsErrors,
        eslintWarnings: metrics.eslintWarnings,
      },
      recommendations: [],
    };

    // Check build time increase if we have previous metrics
    if (previousMetrics && previousMetrics.length > 0) {
      const avgPreviousDuration = this.calculateAverageBuildTime(previousMetrics);
      const increasePercentage = ((durationSeconds - avgPreviousDuration) / avgPreviousDuration) * 100;
      
      validation.buildTimeIncreaseValid = increasePercentage <= this.thresholds.maxBuildTimeIncrease;
      validation.metrics.buildTimeIncrease = increasePercentage;
      validation.metrics.previousAverageBuildTime = avgPreviousDuration;
    }

    // Overall validation
    validation.overallValid = 
      validation.buildTimeValid &&
      validation.buildTimeIncreaseValid &&
      validation.tsErrorsValid &&
      validation.eslintWarningsValid;

    // Generate recommendations
    if (!validation.buildTimeValid) {
      validation.recommendations.push(
        `Build time (${durationSeconds.toFixed(2)}s) exceeds threshold (${this.thresholds.maxBuildTime}s)`
      );
    }

    if (!validation.buildTimeIncreaseValid && validation.metrics.buildTimeIncrease) {
      validation.recommendations.push(
        `Build time increased by ${validation.metrics.buildTimeIncrease.toFixed(2)}% (threshold: ${this.thresholds.maxBuildTimeIncrease}%)`
      );
    }

    if (!validation.tsErrorsValid) {
      validation.recommendations.push(
        `TypeScript errors (${metrics.tsErrors}) exceed threshold (${this.thresholds.maxTsErrors})`
      );
    }

    if (!validation.eslintWarningsValid) {
      validation.recommendations.push(
        `ESLint warnings (${metrics.eslintWarnings}) exceed threshold (${this.thresholds.maxEslintWarnings})`
      );
    }

    return validation;
  }

  /**
   * Get historical build metrics
   */
  getHistoricalMetrics(): BuildMetrics[] {
    return this.loadMetrics();
  }

  /**
   * Get performance summary for the last N builds
   */
  getPerformanceSummary(lastNBuilds: number = 10): PerformanceSummary {
    const metrics = this.loadMetrics().slice(-lastNBuilds);
    
    if (metrics.length === 0) {
      return {
        totalBuilds: 0,
        averageBuildTime: 0,
        successRate: 0,
        averageTsErrors: 0,
        averageEslintWarnings: 0,
        trends: {
          buildTimeImproving: false,
          errorsTrending: 'stable',
          warningsTrending: 'stable',
        },
      };
    }

    const totalBuilds = metrics.length;
    const successfulBuilds = metrics.filter(m => m.success).length;
    const averageBuildTime = metrics.reduce((sum, m) => sum + m.duration, 0) / totalBuilds / 1000;
    const averageTsErrors = metrics.reduce((sum, m) => sum + m.tsErrors, 0) / totalBuilds;
    const averageEslintWarnings = metrics.reduce((sum, m) => sum + m.eslintWarnings, 0) / totalBuilds;

    // Calculate trends
    const recentMetrics = metrics.slice(-5);
    const olderMetrics = metrics.slice(0, -5);
    
    const recentAvgBuildTime = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length / 1000;
    const olderAvgBuildTime = olderMetrics.length > 0 
      ? olderMetrics.reduce((sum, m) => sum + m.duration, 0) / olderMetrics.length / 1000
      : recentAvgBuildTime;

    const buildTimeImproving = recentAvgBuildTime < olderAvgBuildTime;

    return {
      totalBuilds,
      averageBuildTime,
      successRate: (successfulBuilds / totalBuilds) * 100,
      averageTsErrors,
      averageEslintWarnings,
      trends: {
        buildTimeImproving,
        errorsTrending: this.calculateTrend(metrics.map(m => m.tsErrors)),
        warningsTrending: this.calculateTrend(metrics.map(m => m.eslintWarnings)),
      },
    };
  }

  /**
   * Save metrics to file
   */
  private saveMetrics(metrics: BuildMetrics): void {
    try {
      const existingMetrics = this.loadMetrics();
      existingMetrics.push(metrics);
      
      // Keep only last 50 builds to prevent file from growing too large
      const metricsToSave = existingMetrics.slice(-50);
      
      writeFileSync(this.metricsFile, JSON.stringify(metricsToSave, null, 2));
    } catch (error) {
      console.warn('[PerformanceMonitor] Failed to save metrics:', error);
    }
  }

  /**
   * Load metrics from file
   */
  private loadMetrics(): BuildMetrics[] {
    try {
      if (!existsSync(this.metricsFile)) {
        return [];
      }
      
      const data = readFileSync(this.metricsFile, 'utf-8');
      return JSON.parse(data) as BuildMetrics[];
    } catch (error) {
      console.warn('[PerformanceMonitor] Failed to load metrics:', error);
      return [];
    }
  }

  /**
   * Get previous metrics for comparison
   */
  private getPreviousMetrics(): BuildMetrics[] {
    const allMetrics = this.loadMetrics();
    return allMetrics.slice(0, -1); // All except the current build
  }

  /**
   * Calculate average build time from metrics
   */
  private calculateAverageBuildTime(metrics: BuildMetrics[]): number {
    if (metrics.length === 0) return 0;
    
    const totalDuration = metrics.reduce((sum, m) => sum + m.duration, 0);
    return totalDuration / metrics.length / 1000; // Convert to seconds
  }

  /**
   * Calculate trend for a series of values
   */
  private calculateTrend(values: number[]): 'improving' | 'worsening' | 'stable' {
    if (values.length < 2) return 'stable';
    
    const recent = values.slice(-3);
    const older = values.slice(0, -3);
    
    if (older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, v) => sum + v, 0) / recent.length;
    const olderAvg = older.reduce((sum, v) => sum + v, 0) / older.length;
    
    const threshold = 0.1; // 10% threshold for trend detection
    const changePercentage = Math.abs((recentAvg - olderAvg) / olderAvg);
    
    if (changePercentage < threshold) return 'stable';
    
    return recentAvg < olderAvg ? 'improving' : 'worsening';
  }
}

/**
 * Performance validation result
 */
export interface PerformanceValidation {
  /** Build time is within acceptable limits */
  buildTimeValid: boolean;
  /** Build time increase is within acceptable limits */
  buildTimeIncreaseValid: boolean;
  /** TypeScript errors are within acceptable limits */
  tsErrorsValid: boolean;
  /** ESLint warnings are within acceptable limits */
  eslintWarningsValid: boolean;
  /** Overall validation status */
  overallValid: boolean;
  /** Detailed metrics */
  metrics: {
    buildTime: number;
    buildTimeThreshold: number;
    buildTimeIncrease?: number;
    previousAverageBuildTime?: number;
    tsErrors: number;
    eslintWarnings: number;
  };
  /** Performance recommendations */
  recommendations: string[];
}

/**
 * Performance summary for historical analysis
 */
export interface PerformanceSummary {
  /** Total number of builds analyzed */
  totalBuilds: number;
  /** Average build time in seconds */
  averageBuildTime: number;
  /** Success rate percentage */
  successRate: number;
  /** Average TypeScript errors */
  averageTsErrors: number;
  /** Average ESLint warnings */
  averageEslintWarnings: number;
  /** Performance trends */
  trends: {
    buildTimeImproving: boolean;
    errorsTrending: 'improving' | 'worsening' | 'stable';
    warningsTrending: 'improving' | 'worsening' | 'stable';
  };
}

/**
 * Create a performance monitor instance with default configuration
 */
export function createPerformanceMonitor(
  metricsFile?: string,
  thresholds?: Partial<PerformanceThresholds>
): PerformanceMonitor {
  const finalThresholds = { ...DEFAULT_PERFORMANCE_THRESHOLDS, ...thresholds };
  return new PerformanceMonitor(metricsFile, finalThresholds);
}

/**
 * Utility function to measure execution time of a function
 */
export async function measureExecutionTime<T>(
  operation: () => Promise<T> | T,
  label?: string
): Promise<{ result: T; duration: number }> {
  const startTime = Date.now();
  
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    
    if (label) {
      console.log(`[PerformanceMonitor] ${label}: ${duration}ms`);
    }
    
    return { result, duration };
  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (label) {
      console.log(`[PerformanceMonitor] ${label} (failed): ${duration}ms`);
    }
    
    throw error;
  }
}
