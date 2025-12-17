/**
 * Compilation Performance Monitor Integration
 * 
 * This utility integrates with the build process to provide comprehensive
 * compilation time measurement and tracking for the ConvexQueryHelper implementation.
 * 
 * Requirements addressed:
 * - Add compilation time measurement and tracking
 * - Monitor runtime performance impact of helper utility
 * - Integrate with ConvexQueryHelper for query performance tracking
 */

import { 
  getGlobalRuntimeMonitor, 
  measureCompilation, 
  getCompilationReport,
  monitorConvexHelperImpact,
} from './runtime-performance-monitor';
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

/**
 * Compilation monitoring configuration
 */
export interface CompilationMonitorConfig {
  /** Enable detailed logging */
  enableLogging: boolean;
  /** Output file for compilation reports */
  reportFile?: string;
  /** Enable automatic performance alerts */
  enableAlerts: boolean;
  /** Performance thresholds for alerts */
  alertThresholds: {
    maxTscTime: number;
    maxEslintTime: number;
    maxBuildTime: number;
    minSuccessRate: number;
  };
}

/**
 * Default compilation monitoring configuration
 */
const DEFAULT_CONFIG: CompilationMonitorConfig = {
  enableLogging: true,
  reportFile: '.compilation-performance.json',
  enableAlerts: true,
  alertThresholds: {
    maxTscTime: 10000, // 10 seconds
    maxEslintTime: 5000, // 5 seconds
    maxBuildTime: 30000, // 30 seconds
    minSuccessRate: 95, // 95%
  },
};

/**
 * Compilation Monitor class
 */
export class CompilationMonitor {
  private config: CompilationMonitorConfig;
  private startTime: number = 0;

  constructor(config: Partial<CompilationMonitorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start monitoring a compilation session
   */
  startSession(): void {
    this.startTime = Date.now();
    if (this.config.enableLogging) {
      console.log('[CompilationMonitor] Starting compilation monitoring session');
    }
  }

  /**
   * Monitor TypeScript compilation
   */
  async monitorTypeScriptCompilation(): Promise<{ success: boolean; duration: number; errors: number }> {
    if (this.config.enableLogging) {
      console.log('[CompilationMonitor] Monitoring TypeScript compilation...');
    }

    try {
      await measureCompilation(async () => {
        // Run TypeScript compilation
        const output = execSync('npx tsc --noEmit', {
          encoding: 'utf-8',
          stdio: 'pipe'
        });
        return output;
      }, 'tsc');

      return { success: true, duration: Date.now() - this.startTime, errors: 0 };
    } catch (error: unknown) {
      // Parse TypeScript errors
      let errorOutput = '';
      if (error && typeof error === 'object' && 'stdout' in error) {
        errorOutput = (error as { stdout?: string }).stdout || '';
      } else if (error instanceof Error) {
        errorOutput = error.message || '';
      } else if (typeof error === 'string') {
        errorOutput = error;
      }
      const errorCount = this.parseTypeScriptErrors(errorOutput);

      return {
        success: false,
        duration: Date.now() - this.startTime,
        errors: errorCount
      };
    }
  }

  /**
   * Monitor ESLint execution
   */
  async monitorESLint(): Promise<{ success: boolean; duration: number; warnings: number }> {
    if (this.config.enableLogging) {
      console.log('[CompilationMonitor] Monitoring ESLint execution...');
    }

    try {
      await measureCompilation(async () => {
        const output = execSync('npx eslint . --ext .ts,.tsx,.js,.jsx', {
          encoding: 'utf-8',
          stdio: 'pipe'
        });
        return output;
      }, 'eslint');

      return { success: true, duration: Date.now() - this.startTime, warnings: 0 };
    } catch (error: unknown) {
      // Parse ESLint warnings
      let errorOutput = '';
      if (error && typeof error === 'object' && 'stdout' in error) {
        errorOutput = (error as { stdout?: string }).stdout || '';
      } else if (error instanceof Error) {
        errorOutput = error.message || '';
      } else if (typeof error === 'string') {
        errorOutput = error;
      }
      const warningCount = this.parseESLintWarnings(errorOutput);

      return {
        success: warningCount === 0,
        duration: Date.now() - this.startTime,
        warnings: warningCount
      };
    }
  }

  /**
   * Monitor build process
   */
  async monitorBuild(): Promise<{ success: boolean; duration: number }> {
    if (this.config.enableLogging) {
      console.log('[CompilationMonitor] Monitoring build process...');
    }

    try {
      await measureCompilation(async () => {
        execSync('npm run build', {
          encoding: 'utf-8',
          stdio: 'inherit'
        });
      }, 'build');

      return { success: true, duration: Date.now() - this.startTime };
    } catch (error: unknown) {
      console.error('Build process failed:', error);
      return { success: false, duration: Date.now() - this.startTime };
    }
  }

  /**
   * Generate comprehensive performance report
   */
  generateReport(): CompilationPerformanceReport {
    const compilationReport = getCompilationReport();
    const convexHelperImpact = monitorConvexHelperImpact();
    const monitor = getGlobalRuntimeMonitor();
    const overallStats = monitor.getStats();

    const report: CompilationPerformanceReport = {
      timestamp: Date.now(),
      sessionDuration: Date.now() - this.startTime,
      compilation: compilationReport,
      convexHelperImpact,
      overallPerformance: {
        totalOperations: overallStats.totalOperations,
        successRate: overallStats.successRate,
        averageExecutionTime: overallStats.averageExecutionTime,
        p95ExecutionTime: overallStats.p95ExecutionTime,
      },
      alerts: this.generateAlerts(compilationReport.details),
      recommendations: [
        ...compilationReport.recommendations,
        ...this.generateConvexHelperRecommendations(convexHelperImpact),
      ],
    };

    // Save report to file if configured
    if (this.config.reportFile) {
      this.saveReport(report);
    }

    return report;
  }

  /**
   * Check if performance meets requirements
   */
  validatePerformance(): { valid: boolean; issues: string[] } {
    const report = this.generateReport();
    const issues: string[] = [];

    // Check compilation time requirements (Requirement 1.2: Build time under 15 seconds)
    const totalCompilationTime = report.compilation.details.totalCompilationTime;
    if (totalCompilationTime > 15000) {
      issues.push(`Total compilation time (${totalCompilationTime}ms) exceeds 15 second requirement`);
    }

    // Check TypeScript compilation time
    if (report.compilation.details.tscStats.avgTime > this.config.alertThresholds.maxTscTime) {
      issues.push(`TypeScript compilation time (${report.compilation.details.tscStats.avgTime}ms) exceeds threshold`);
    }

    // Check ESLint time
    if (report.compilation.details.eslintStats.avgTime > this.config.alertThresholds.maxEslintTime) {
      issues.push(`ESLint execution time (${report.compilation.details.eslintStats.avgTime}ms) exceeds threshold`);
    }

    // Check success rate
    if (report.compilation.details.compilationSuccessRate < this.config.alertThresholds.minSuccessRate) {
      issues.push(`Compilation success rate (${report.compilation.details.compilationSuccessRate}%) below threshold`);
    }

    // Check ConvexQueryHelper impact (Requirement 4.3: No significant performance degradation)
    if (report.convexHelperImpact.overallImpact === 'high') {
      issues.push('ConvexQueryHelper has high performance impact on query execution');
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Parse TypeScript compilation errors
   */
  private parseTypeScriptErrors(output: string): number {
    const errorMatch = output.match(/Found (\d+) errors?/);
    return errorMatch ? parseInt(errorMatch[1], 10) : 1;
  }

  /**
   * Parse ESLint warnings
   */
  private parseESLintWarnings(output: string): number {
    const lines = output.split('\n');
    let warningCount = 0;

    // Count individual warning lines
    for (const line of lines) {
      if (line.includes('warning')) {
        warningCount++;
      }
    }

    // Also check for summary line
    for (const line of lines) {
      const summaryMatch = line.match(/(\d+) problems? \(\d+ errors?, (\d+) warnings?\)/);
      if (summaryMatch) {
        return parseInt(summaryMatch[2], 10);
      }
    }

    return warningCount;
  }

  /**
   * Generate performance alerts
   */
  private generateAlerts(stats: ReturnType<typeof getCompilationReport>['details']): string[] {
    const alerts: string[] = [];

    if (stats.tscStats.avgTime > this.config.alertThresholds.maxTscTime) {
      alerts.push(`⚠️ TypeScript compilation is slow: ${stats.tscStats.avgTime}ms`);
    }

    if (stats.eslintStats.avgTime > this.config.alertThresholds.maxEslintTime) {
      alerts.push(`⚠️ ESLint execution is slow: ${stats.eslintStats.avgTime}ms`);
    }

    if (stats.buildStats.avgTime > this.config.alertThresholds.maxBuildTime) {
      alerts.push(`⚠️ Build process is slow: ${stats.buildStats.avgTime}ms`);
    }

    if (stats.compilationSuccessRate < this.config.alertThresholds.minSuccessRate) {
      alerts.push(`⚠️ Low compilation success rate: ${stats.compilationSuccessRate}%`);
    }

    return alerts;
  }

  /**
   * Generate ConvexQueryHelper specific recommendations
   */
  private generateConvexHelperRecommendations(impact: ReturnType<typeof monitorConvexHelperImpact>): string[] {
    const recommendations: string[] = [];

    if (impact.overallImpact === 'high') {
      recommendations.push('Consider optimizing ConvexQueryHelper implementation to reduce query execution time');
    }

    if (impact.queryPerformance.successRate < 95) {
      recommendations.push('Review ConvexQueryHelper error handling - query success rate is below 95%');
    }

    if (impact.mutationPerformance.successRate < 95) {
      recommendations.push('Review ConvexQueryHelper error handling - mutation success rate is below 95%');
    }

    if (impact.queryPerformance.avgTime > 500) {
      recommendations.push('ConvexQueryHelper query execution time is above 500ms - consider performance optimization');
    }

    return recommendations;
  }

  /**
   * Save performance report to file
   */
  private saveReport(report: CompilationPerformanceReport): void {
    try {
      const reportPath = this.config.reportFile!;
      writeFileSync(reportPath, JSON.stringify(report, null, 2));
      
      if (this.config.enableLogging) {
        console.log(`[CompilationMonitor] Performance report saved to ${reportPath}`);
      }
    } catch (error) {
      console.warn('[CompilationMonitor] Failed to save performance report:', error);
    }
  }
}

/**
 * Compilation performance report structure
 */
export interface CompilationPerformanceReport {
  timestamp: number;
  sessionDuration: number;
  compilation: ReturnType<typeof getCompilationReport>;
  convexHelperImpact: ReturnType<typeof monitorConvexHelperImpact>;
  overallPerformance: {
    totalOperations: number;
    successRate: number;
    averageExecutionTime: number;
    p95ExecutionTime: number;
  };
  alerts: string[];
  recommendations: string[];
}

/**
 * Create a compilation monitor instance
 */
export function createCompilationMonitor(config?: Partial<CompilationMonitorConfig>): CompilationMonitor {
  return new CompilationMonitor(config);
}

/**
 * Quick performance check utility
 */
export async function quickPerformanceCheck(): Promise<{
  passed: boolean;
  summary: string;
  details: CompilationPerformanceReport;
}> {
  const monitor = createCompilationMonitor({ enableLogging: false });
  monitor.startSession();

  // Run quick checks
  const tscResult = await monitor.monitorTypeScriptCompilation();
  const eslintResult = await monitor.monitorESLint();

  const report = monitor.generateReport();
  const validation = monitor.validatePerformance();

  const summary = `Performance Check Results:
- TypeScript: ${tscResult.success ? '✅' : '❌'} (${tscResult.duration}ms, ${tscResult.errors} errors)
- ESLint: ${eslintResult.success ? '✅' : '❌'} (${eslintResult.duration}ms, ${eslintResult.warnings} warnings)
- Overall: ${validation.valid ? '✅ PASSED' : '❌ FAILED'}
${validation.issues.length > 0 ? '\nIssues:\n' + validation.issues.map(i => `- ${i}`).join('\n') : ''}`;

  return {
    passed: validation.valid,
    summary,
    details: report,
  };
}
