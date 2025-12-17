/**
 * Unit tests for CompilationMonitor
 * 
 * Tests the compilation time measurement and tracking functionality
 * to ensure proper integration with RuntimePerformanceMonitor.
 */

import {
  CompilationMonitor,
  createCompilationMonitor,
  quickPerformanceCheck,
} from '../compilation-monitor';
import {
  getGlobalRuntimeMonitor,
  resetGlobalMonitor,
  measureCompilation,
  getCompilationReport,
} from '../runtime-performance-monitor';
import * as cp from 'child_process';

// Mock child_process to avoid actual command execution in tests
jest.mock('child_process', () => ({
  execSync: jest.fn(),
  spawn: jest.fn(),
}));

// Mock fs to avoid file system operations in tests
jest.mock('fs', () => ({
  existsSync: jest.fn(() => false),
  writeFileSync: jest.fn(),
}));

describe('CompilationMonitor', () => {
  let monitor: CompilationMonitor;

  beforeEach(() => {
    resetGlobalMonitor();
    monitor = createCompilationMonitor({ enableLogging: false });
  });

  afterEach(() => {
    resetGlobalMonitor();
  });

  describe('constructor', () => {
    it('should initialize with default configuration', () => {
      expect(monitor).toBeDefined();
    });

    it('should accept custom configuration', () => {
      const customMonitor = createCompilationMonitor({
        enableLogging: true,
        enableAlerts: false,
        alertThresholds: {
          maxTscTime: 15000,
          maxEslintTime: 8000,
          maxBuildTime: 45000,
          minSuccessRate: 90,
        },
      });
      
      expect(customMonitor).toBeDefined();
    });
  });

  describe('session management', () => {
    it('should start monitoring session', () => {
      expect(() => monitor.startSession()).not.toThrow();
    });
  });

  describe('compilation monitoring', () => {
    beforeEach(() => {
      monitor.startSession();
    });

    it('should monitor TypeScript compilation success', async () => {
      (cp.execSync as jest.Mock).mockReturnValue('');
  
      const result = await monitor.monitorTypeScriptCompilation();
      
      expect(result.success).toBe(true);
      expect(result.errors).toBe(0);
      expect(typeof result.duration).toBe('number');
    });

    it('should monitor TypeScript compilation failure', async () => {
      (cp.execSync as jest.Mock).mockImplementation(() => {
        const error = new Error('TypeScript compilation failed');
        throw error;
      });
  
      const result = await monitor.monitorTypeScriptCompilation();
      
      expect(result.success).toBe(false);
      expect(result.errors).toBe(3);
      expect(typeof result.duration).toBe('number');
    });

    it('should monitor ESLint execution success', async () => {
      (cp.execSync as jest.Mock).mockReturnValue('');
  
      const result = await monitor.monitorESLint();
      
      expect(result.success).toBe(true);
      expect(result.warnings).toBe(0);
      expect(typeof result.duration).toBe('number');
    });

    it('should monitor ESLint execution with warnings', async () => {
      (cp.execSync as jest.Mock).mockImplementation(() => {
        const error = new Error('ESLint found warnings');
        throw error;
      });
  
      const result = await monitor.monitorESLint();
      
      expect(result.success).toBe(false);
      expect(result.warnings).toBe(5);
      expect(typeof result.duration).toBe('number');
    });

    it('should monitor build process', async () => {
      (cp.execSync as jest.Mock).mockReturnValue('');
  
      const result = await monitor.monitorBuild();
      
      expect(result.success).toBe(true);
      expect(typeof result.duration).toBe('number');
    });
  });

  describe('performance reporting', () => {
    it('should generate comprehensive performance report', () => {
      const report = monitor.generateReport();
      
      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('sessionDuration');
      expect(report).toHaveProperty('compilation');
      expect(report).toHaveProperty('convexHelperImpact');
      expect(report).toHaveProperty('overallPerformance');
      expect(report).toHaveProperty('alerts');
      expect(report).toHaveProperty('recommendations');
    });

    it('should validate performance against requirements', () => {
      const validation = monitor.validatePerformance();
      
      expect(validation).toHaveProperty('valid');
      expect(validation).toHaveProperty('issues');
      expect(Array.isArray(validation.issues)).toBe(true);
    });
  });

  describe('utility functions', () => {
    it('should measure compilation time', async () => {
      const mockOperation = jest.fn().mockResolvedValue('success');
      
      const result = await measureCompilation(mockOperation, 'tsc', 100);
      
      expect(result).toBe('success');
      expect(mockOperation).toHaveBeenCalled();
      
      // Check that metrics were recorded
      const globalMonitor = getGlobalRuntimeMonitor();
      const stats = globalMonitor.getCompilationStats();
      expect(stats.tscStats.count).toBe(1);
    });

    it('should handle compilation errors', async () => {
      const mockOperation = jest.fn().mockRejectedValue(new Error('Compilation failed'));
      
      await expect(measureCompilation(mockOperation, 'tsc', 100)).rejects.toThrow('Compilation failed');
      
      // Check that error metrics were recorded
      const globalMonitor = getGlobalRuntimeMonitor();
      const stats = globalMonitor.getCompilationStats();
      expect(stats.tscStats.count).toBe(1);
      expect(stats.tscStats.successRate).toBe(0);
    });

    it('should generate compilation report', () => {
      // Add some test metrics
      const globalMonitor = getGlobalRuntimeMonitor();
      globalMonitor.recordCompilationMetric('tsc', 5000, true, 50);
      globalMonitor.recordCompilationMetric('eslint', 2000, true, 50);
      globalMonitor.recordCompilationMetric('build', 15000, true);
      
      const report = getCompilationReport();
      
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('details');
      expect(report).toHaveProperty('recommendations');
      expect(typeof report.summary).toBe('string');
      expect(Array.isArray(report.recommendations)).toBe(true);
    });
  });

  describe('quick performance check', () => {
    it('should perform quick performance check', async () => {
      (cp.execSync as jest.Mock).mockReturnValue('');
  
      const result = await quickPerformanceCheck();
      
      expect(result).toHaveProperty('passed');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('details');
      expect(typeof result.passed).toBe('boolean');
      expect(typeof result.summary).toBe('string');
    });
  });

  describe('integration with RuntimePerformanceMonitor', () => {
    it('should integrate with global runtime monitor', () => {
      const globalMonitor = getGlobalRuntimeMonitor();
      
      // Record some compilation metrics
      globalMonitor.recordCompilationMetric('tsc', 8000, true, 100);
      globalMonitor.recordCompilationMetric('eslint', 3000, true, 100);
      
      const stats = globalMonitor.getCompilationStats();
      
      expect(stats.tscStats.avgTime).toBe(8000);
      expect(stats.tscStats.successRate).toBe(100);
      expect(stats.eslintStats.avgTime).toBe(3000);
      expect(stats.eslintStats.successRate).toBe(100);
    });

    it('should track compilation performance over time', () => {
      const globalMonitor = getGlobalRuntimeMonitor();
      
      // Simulate multiple compilation runs
      for (let i = 0; i < 5; i++) {
        globalMonitor.recordCompilationMetric('tsc', 5000 + i * 1000, true, 50);
        globalMonitor.recordCompilationMetric('eslint', 2000 + i * 500, true, 50);
      }
      
      const stats = globalMonitor.getCompilationStats();
      
      expect(stats.tscStats.count).toBe(5);
      expect(stats.eslintStats.count).toBe(5);
      expect(stats.tscStats.avgTime).toBe(7000); // Average of 5000, 6000, 7000, 8000, 9000
      expect(stats.eslintStats.avgTime).toBe(3000); // Average of 2000, 2500, 3000, 3500, 4000
    });
  });

  describe('performance thresholds', () => {
    it('should detect slow TypeScript compilation', () => {
      const globalMonitor = getGlobalRuntimeMonitor();
      globalMonitor.recordCompilationMetric('tsc', 15000, true, 100); // Exceeds 10s threshold
      
      const report = getCompilationReport();
      
      expect(report.recommendations.some(r => r.includes('TypeScript compilation is slow'))).toBe(true);
    });

    it('should detect slow ESLint execution', () => {
      const globalMonitor = getGlobalRuntimeMonitor();
      globalMonitor.recordCompilationMetric('eslint', 8000, true, 100); // Exceeds 5s threshold
      
      const report = getCompilationReport();
      
      expect(report.recommendations.some(r => r.includes('ESLint is slow'))).toBe(true);
    });

    it('should detect slow build process', () => {
      const globalMonitor = getGlobalRuntimeMonitor();
      globalMonitor.recordCompilationMetric('build', 45000, true); // Exceeds 30s threshold
      
      const report = getCompilationReport();
      
      expect(report.recommendations.some(r => r.includes('Build process is slow'))).toBe(true);
    });

    it('should detect low compilation success rate', () => {
      const globalMonitor = getGlobalRuntimeMonitor();
      
      // Add mostly failing compilations
      for (let i = 0; i < 10; i++) {
        globalMonitor.recordCompilationMetric('tsc', 5000, i < 2, 50); // Only 20% success rate
      }
      
      const report = getCompilationReport();
      
      expect(report.recommendations.some(r => r.includes('Compilation success rate is low'))).toBe(true);
    });
  });
});
