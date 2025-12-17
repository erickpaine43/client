/**
 * Unit tests for PerformanceMonitor
 * 
 * Tests the compilation time measurement and build validation functionality
 * to ensure performance monitoring works correctly.
 */

import {
  PerformanceMonitor,
  createPerformanceMonitor,
  DEFAULT_PERFORMANCE_THRESHOLDS,
  BuildMetrics,
  PerformanceThresholds,
  PerformanceValidation,
  PerformanceSummary
} from '../performance-monitor';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;
  let testMetricsFile: string;

  beforeEach(() => {
    testMetricsFile = join(process.cwd(), '.test-performance-metrics.json');
    monitor = new PerformanceMonitor(testMetricsFile);
    
    // Clean up any existing test file
    if (existsSync(testMetricsFile)) {
      unlinkSync(testMetricsFile);
    }
  });

  afterEach(() => {
    // Clean up test file
    if (existsSync(testMetricsFile)) {
      unlinkSync(testMetricsFile);
    }
  });

  describe('constructor', () => {
    it('should initialize with default thresholds', () => {
      const defaultMonitor = new PerformanceMonitor();
      expect(defaultMonitor).toBeDefined();
    });

    it('should accept custom thresholds', () => {
      const customThresholds: PerformanceThresholds = {
        maxBuildTime: 20,
        maxBuildTimeIncrease: 15,
        maxTsErrors: 1,
        maxEslintWarnings: 5,
      };
      
      const customMonitor = new PerformanceMonitor('.test-metrics.json', customThresholds);
      expect(customMonitor).toBeDefined();
    });
  });

  describe('build tracking', () => {
    it('should start and complete build tracking', () => {
      monitor.startBuild('test');
      
      // Simulate some work
      const startTime = Date.now();
      while (Date.now() - startTime < 10) {
        // Wait 10ms
      }
      
      const metrics = monitor.completeBuild(true, 'test-commit');
      
      expect(metrics.success).toBe(true);
      expect(metrics.environment).toBe('test');
      expect(metrics.commitHash).toBe('test-commit');
      expect(metrics.duration).toBeGreaterThan(0);
      expect(metrics.startTime).toBeDefined();
      expect(metrics.endTime).toBeDefined();
    });

    it('should record TypeScript compilation metrics', () => {
      monitor.startBuild('development');
      monitor.recordTscMetrics(1500, 0);
      
      const metrics = monitor.completeBuild(true);
      
      expect(metrics.tscDuration).toBe(1500);
      expect(metrics.tsErrors).toBe(0);
    });

    it('should record ESLint metrics', () => {
      monitor.startBuild('development');
      monitor.recordEslintMetrics(800, 2);
      
      const metrics = monitor.completeBuild(true);
      
      expect(metrics.eslintDuration).toBe(800);
      expect(metrics.eslintWarnings).toBe(2);
    });

    it('should record test metrics', () => {
      monitor.startBuild('development');
      monitor.recordTestMetrics(3000);
      
      const metrics = monitor.completeBuild(true);
      
      expect(metrics.testDuration).toBe(3000);
    });
  });

  describe('performance validation', () => {
    it('should validate successful build within thresholds', () => {
      const metrics: BuildMetrics = {
        startTime: Date.now() - 10000,
        endTime: Date.now(),
        duration: 10000, // 10 seconds
        success: true,
        environment: 'test',
        tsErrors: 0,
        eslintWarnings: 0,
      };
      
      const validation: PerformanceValidation = monitor.validatePerformance(metrics);
      
      expect(validation.overallValid).toBe(true);
      expect(validation.buildTimeValid).toBe(true);
      expect(validation.tsErrorsValid).toBe(true);
      expect(validation.eslintWarningsValid).toBe(true);
      expect(validation.recommendations).toHaveLength(0);
    });

    it('should detect build time threshold violations', () => {
      const metrics: BuildMetrics = {
        startTime: Date.now() - 20000,
        endTime: Date.now(),
        duration: 20000, // 20 seconds (exceeds 15s threshold)
        success: true,
        environment: 'test',
        tsErrors: 0,
        eslintWarnings: 0,
      };
      
      const validation: PerformanceValidation = monitor.validatePerformance(metrics);
      
      expect(validation.overallValid).toBe(false);
      expect(validation.buildTimeValid).toBe(false);
      expect(validation.recommendations.some(r => r.includes('Build time (20.00s) exceeds threshold (15s)'))).toBe(true);
    });

    it('should detect TypeScript error violations', () => {
      const metrics: BuildMetrics = {
        startTime: Date.now() - 10000,
        endTime: Date.now(),
        duration: 10000,
        success: false,
        environment: 'test',
        tsErrors: 3,
        eslintWarnings: 0,
      };
      
      const validation: PerformanceValidation = monitor.validatePerformance(metrics);
      
      expect(validation.overallValid).toBe(false);
      expect(validation.tsErrorsValid).toBe(false);
      expect(validation.recommendations.some(r => r.includes('TypeScript errors (3) exceed threshold (0)'))).toBe(true);
    });

    it('should detect ESLint warning violations', () => {
      const metrics: BuildMetrics = {
        startTime: Date.now() - 10000,
        endTime: Date.now(),
        duration: 10000,
        success: true,
        environment: 'test',
        tsErrors: 0,
        eslintWarnings: 5,
      };
      
      const validation: PerformanceValidation = monitor.validatePerformance(metrics);
      
      expect(validation.overallValid).toBe(false);
      expect(validation.eslintWarningsValid).toBe(false);
      expect(validation.recommendations.some(r => r.includes('ESLint warnings (5) exceed threshold (0)'))).toBe(true);
    });
  });

  describe('historical data management', () => {
    it('should save and load metrics', () => {
      monitor.startBuild('test');
      monitor.completeBuild(true, 'commit1');
      
      monitor.startBuild('test');
      monitor.completeBuild(true, 'commit2');
      
      const historical = monitor.getHistoricalMetrics();
      
      expect(historical).toHaveLength(2);
      expect(historical[0].commitHash).toBe('commit1');
      expect(historical[1].commitHash).toBe('commit2');
    });

    it('should calculate performance summary', () => {
      // Add some test metrics
      const testMetrics: BuildMetrics[] = [
        {
          startTime: Date.now() - 15000,
          endTime: Date.now() - 5000,
          duration: 10000,
          success: true,
          environment: 'test',
          tsErrors: 0,
          eslintWarnings: 0,
        },
        {
          startTime: Date.now() - 25000,
          endTime: Date.now() - 15000,
          duration: 12000,
          success: true,
          environment: 'test',
          tsErrors: 1,
          eslintWarnings: 2,
        },
        {
          startTime: Date.now() - 35000,
          endTime: Date.now() - 25000,
          duration: 8000,
          success: false,
          environment: 'test',
          tsErrors: 0,
          eslintWarnings: 0,
        },
      ];
      
      // Save test metrics
      writeFileSync(testMetricsFile, JSON.stringify(testMetrics, null, 2));
      
      const summary: PerformanceSummary = monitor.getPerformanceSummary();
      
      expect(summary.totalBuilds).toBe(3);
      expect(summary.averageBuildTime).toBeCloseTo(10); // (10+12+8)/3 = 10 seconds
      expect(summary.successRate).toBeCloseTo(66.67); // 2/3 * 100
      expect(summary.averageTsErrors).toBeCloseTo(0.33); // (0+1+0)/3
      expect(summary.averageEslintWarnings).toBeCloseTo(0.67); // (0+2+0)/3
    });

    it('should handle empty metrics gracefully', () => {
      const summary: PerformanceSummary = monitor.getPerformanceSummary();
      
      expect(summary.totalBuilds).toBe(0);
      expect(summary.averageBuildTime).toBe(0);
      expect(summary.successRate).toBe(0);
      expect(summary.trends.buildTimeImproving).toBe(false);
    });
  });

  describe('build time increase validation', () => {
    it('should validate build time increase within threshold', () => {
      // Create historical data with average build time of 10 seconds
      const historicalMetrics: BuildMetrics[] = [
        { startTime: 0, endTime: 10000, duration: 10000, success: true, environment: 'test', tsErrors: 0, eslintWarnings: 0 },
        { startTime: 0, endTime: 10000, duration: 10000, success: true, environment: 'test', tsErrors: 0, eslintWarnings: 0 },
        { startTime: 0, endTime: 10000, duration: 10000, success: true, environment: 'test', tsErrors: 0, eslintWarnings: 0 },
      ];
      
      writeFileSync(testMetricsFile, JSON.stringify(historicalMetrics, null, 2));
      
      // Current build time: 11 seconds (10% increase, exactly at threshold)
      const currentMetrics: BuildMetrics = {
        startTime: Date.now() - 11000,
        endTime: Date.now(),
        duration: 11000,
        success: true,
        environment: 'test',
        tsErrors: 0,
        eslintWarnings: 0,
      };
      
      const validation: PerformanceValidation = monitor.validatePerformance(currentMetrics);
      
      expect(validation.buildTimeIncreaseValid).toBe(true);
      expect(validation.metrics.buildTimeIncrease).toBeCloseTo(10);
    });

    it('should detect build time increase exceeding threshold', () => {
      // Create historical data with average build time of 10 seconds
      const historicalMetrics: BuildMetrics[] = [
        { startTime: 0, endTime: 10000, duration: 10000, success: true, environment: 'test', tsErrors: 0, eslintWarnings: 0 },
        { startTime: 0, endTime: 10000, duration: 10000, success: true, environment: 'test', tsErrors: 0, eslintWarnings: 0 },
      ];
      
      writeFileSync(testMetricsFile, JSON.stringify(historicalMetrics, null, 2));
      
      // Current build time: 12 seconds (20% increase, exceeds 10% threshold)
      const currentMetrics: BuildMetrics = {
        startTime: Date.now() - 12000,
        endTime: Date.now(),
        duration: 12000,
        success: true,
        environment: 'test',
        tsErrors: 0,
        eslintWarnings: 0,
      };
      
      const validation: PerformanceValidation = monitor.validatePerformance(currentMetrics);
      
      expect(validation.buildTimeIncreaseValid).toBe(false);
      expect(validation.metrics.buildTimeIncrease).toBeCloseTo(20);
      expect(validation.recommendations.some(r => r.includes('Build time increased by 20.00% (threshold: 10%)'))).toBe(true);
    });
  });

  describe('factory function', () => {
    it('should create monitor with default configuration', () => {
      const defaultMonitor = createPerformanceMonitor();
      expect(defaultMonitor).toBeInstanceOf(PerformanceMonitor);
    });

    it('should create monitor with custom configuration', () => {
      const customMonitor = createPerformanceMonitor('.custom-metrics.json', {
        maxBuildTime: 20,
        maxBuildTimeIncrease: 15,
      });
      expect(customMonitor).toBeInstanceOf(PerformanceMonitor);
    });
  });

  describe('default thresholds', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_PERFORMANCE_THRESHOLDS.maxBuildTime).toBe(15);
      expect(DEFAULT_PERFORMANCE_THRESHOLDS.maxBuildTimeIncrease).toBe(10);
      expect(DEFAULT_PERFORMANCE_THRESHOLDS.maxTsErrors).toBe(0);
      expect(DEFAULT_PERFORMANCE_THRESHOLDS.maxEslintWarnings).toBe(0);
    });
  });
});
