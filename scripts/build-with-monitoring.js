#!/usr/bin/env node

/**
 * Build script with performance monitoring
 * 
 * This script wraps the standard build process with performance monitoring
 * to track compilation times and validate build performance against thresholds.
 * 
 * Requirements addressed:
 * - Add compilation time measurement and tracking
 * - Verify build time remains under 15 seconds
 * - Monitor runtime performance impact of helper utility
 */

import { execSync, spawn } from 'child_process';
// Note: This script uses the legacy performance-monitor for build tracking
// The new runtime-performance-monitor provides enhanced compilation monitoring
import { createPerformanceMonitor } from '../lib/utils/performance-monitor.js';
import { fileURLToPath } from 'url';

/**
 * Execute a command and measure its execution time
 */
async function executeWithTiming(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    console.log(`[BuildMonitor] Executing: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });
    
    child.on('close', (code) => {
      const duration = Date.now() - startTime;
      
      if (code === 0) {
        resolve({ success: true, duration, code });
      } else {
        resolve({ success: false, duration, code });
      }
    });
    
    child.on('error', (error) => {
      const duration = Date.now() - startTime;
      reject({ error, duration });
    });
  });
}

/**
 * Parse TypeScript compiler output to count errors
 */
function parseTscOutput(output) {
  const lines = output.split('\n');
  let errorCount = 0;
  
  for (const line of lines) {
    // Look for error pattern: "Found X errors"
    const errorMatch = line.match(/Found (\d+) errors?/);
    if (errorMatch) {
      errorCount = parseInt(errorMatch[1], 10);
      break;
    }
  }
  
  return errorCount;
}

/**
 * Parse ESLint output to count warnings
 */
function parseEslintOutput(output) {
  const lines = output.split('\n');
  let warningCount = 0;
  
  for (const line of lines) {
    // Look for warning pattern in ESLint output
    if (line.includes('warning')) {
      warningCount++;
    }
  }
  
  // Also look for summary line: "X problems (Y errors, Z warnings)"
  for (const line of lines) {
    const summaryMatch = line.match(/(\d+) problems? \(\d+ errors?, (\d+) warnings?\)/);
    if (summaryMatch) {
      warningCount = parseInt(summaryMatch[2], 10);
      break;
    }
  }
  
  return warningCount;
}

/**
 * Get current git commit hash
 */
function getGitCommitHash() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
  } catch (error) {
    console.warn('[BuildMonitor] Failed to get git commit hash:', error.message);
    return undefined;
  }
}

/**
 * Main build function with monitoring
 */
async function buildWithMonitoring() {
  const monitor = createPerformanceMonitor();
  const environment = process.env.NODE_ENV || 'development';
  const commitHash = getGitCommitHash();
  
  console.log('[BuildMonitor] Starting monitored build process...');
  monitor.startBuild(environment);
  
  let buildSuccess = true;
  let tsErrors = 0;
  let eslintWarnings = 0;
  
  try {
    // Step 1: TypeScript compilation
    console.log('\n[BuildMonitor] Step 1: TypeScript compilation');
    try {
      const tscResult = await executeWithTiming('npx', ['tsc', '--noEmit']);
      monitor.recordTscMetrics(tscResult.duration, 0);
      
      if (!tscResult.success) {
        console.warn('[BuildMonitor] TypeScript compilation failed');
        buildSuccess = false;
        
        // Try to get error count from tsc output
        try {
          const tscOutput = execSync('npx tsc --noEmit', { encoding: 'utf-8', stdio: 'pipe' });
          tsErrors = parseTscOutput(tscOutput);
        } catch (error) {
          console.error('[BuildMonitor] Error parsing tsc output:', error);
          tsErrors = 1; // At least one error if tsc failed
        }
      }
    } catch (error) {
      console.error('[BuildMonitor] TypeScript compilation error:', error);
      monitor.recordTscMetrics(error.duration || 0, 1);
      buildSuccess = false;
      tsErrors = 1;
    }
    
    // Step 2: ESLint check
    console.log('\n[BuildMonitor] Step 2: ESLint check');
    try {
      const eslintResult = await executeWithTiming('npx', ['eslint', '.', '--ext', '.ts,.tsx,.js,.jsx']);
      monitor.recordEslintMetrics(eslintResult.duration, 0);
      
      if (!eslintResult.success) {
        console.warn('[BuildMonitor] ESLint found issues');
        
        // Try to get warning count from eslint output
        try {
          const eslintOutput = execSync('npx eslint . --ext .ts,.tsx,.js,.jsx', { 
            encoding: 'utf-8', 
            stdio: 'pipe' 
          });
          eslintWarnings = parseEslintOutput(eslintOutput);
        } catch (error) {
          // ESLint exits with non-zero code when warnings/errors are found
          if (error.stdout) {
            eslintWarnings = parseEslintOutput(error.stdout);
          } else {
            eslintWarnings = 1; // At least one warning if eslint failed
          }
        }
      }
    } catch (error) {
      console.error('[BuildMonitor] ESLint error:', error);
      monitor.recordEslintMetrics(error.duration || 0, 1);
      eslintWarnings = 1;
    }
    
    // Step 3: Next.js build
    console.log('\n[BuildMonitor] Step 3: Next.js build');
    try {
      const buildResult = await executeWithTiming('npm', ['run', 'build']);
      
      if (!buildResult.success) {
        console.warn('[BuildMonitor] Next.js build failed');
        buildSuccess = false;
      }
    } catch (error) {
      console.error('[BuildMonitor] Next.js build error:', error);
      buildSuccess = false;
    }
    
    // Step 4: Run tests (optional, only if test script exists)
    console.log('\n[BuildMonitor] Step 4: Running tests');
    try {
      const testResult = await executeWithTiming('npm', ['test', '--', '--run', '--passWithNoTests']);
      monitor.recordTestMetrics(testResult.duration);
      
      if (!testResult.success) {
        console.warn('[BuildMonitor] Tests failed');
        buildSuccess = false;
      }
    } catch (error) {
      console.warn('[BuildMonitor] Test execution error (continuing):', error.message);
      // Don't fail the build if tests fail, just record the metrics
      monitor.recordTestMetrics(error.duration || 0);
    }
    
  } catch (error) {
    console.error('[BuildMonitor] Build process error:', error);
    buildSuccess = false;
  }
  
  // Complete monitoring and validate performance
  const metrics = monitor.completeBuild(buildSuccess, commitHash);
  const validation = monitor.validatePerformance(metrics);
  
  // Update metrics with actual error/warning counts
  metrics.tsErrors = tsErrors;
  metrics.eslintWarnings = eslintWarnings;
  
  // Print detailed results
  console.log('\n' + '='.repeat(60));
  console.log('[BuildMonitor] BUILD PERFORMANCE REPORT');
  console.log('='.repeat(60));
  console.log(`Build Status: ${buildSuccess ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Total Build Time: ${(metrics.duration / 1000).toFixed(2)}s`);
  console.log(`TypeScript Compilation: ${metrics.tscDuration ? (metrics.tscDuration / 1000).toFixed(2) + 's' : 'N/A'}`);
  console.log(`ESLint Check: ${metrics.eslintDuration ? (metrics.eslintDuration / 1000).toFixed(2) + 's' : 'N/A'}`);
  console.log(`Test Execution: ${metrics.testDuration ? (metrics.testDuration / 1000).toFixed(2) + 's' : 'N/A'}`);
  console.log(`TypeScript Errors: ${metrics.tsErrors}`);
  console.log(`ESLint Warnings: ${metrics.eslintWarnings}`);
  console.log(`Environment: ${metrics.environment}`);
  if (commitHash) {
    console.log(`Commit: ${commitHash.substring(0, 8)}`);
  }
  
  console.log('\n[BuildMonitor] PERFORMANCE VALIDATION');
  console.log('='.repeat(60));
  console.log(`Overall Valid: ${validation.overallValid ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Build Time Valid: ${validation.buildTimeValid ? '✅' : '❌'} (${validation.metrics.buildTime.toFixed(2)}s / ${validation.metrics.buildTimeThreshold}s)`);
  console.log(`Build Time Increase Valid: ${validation.buildTimeIncreaseValid ? '✅' : '❌'}`);
  if (validation.metrics.buildTimeIncrease !== undefined) {
    console.log(`  - Current vs Previous: ${validation.metrics.buildTimeIncrease.toFixed(2)}% increase`);
  }
  console.log(`TypeScript Errors Valid: ${validation.tsErrorsValid ? '✅' : '❌'} (${validation.metrics.tsErrors} errors)`);
  console.log(`ESLint Warnings Valid: ${validation.eslintWarningsValid ? '✅' : '❌'} (${validation.metrics.eslintWarnings} warnings)`);
  
  if (validation.recommendations.length > 0) {
    console.log('\n[BuildMonitor] RECOMMENDATIONS');
    console.log('='.repeat(60));
    validation.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }
  
  // Get performance summary
  const summary = monitor.getPerformanceSummary();
  if (summary.totalBuilds > 1) {
    console.log('\n[BuildMonitor] PERFORMANCE TRENDS');
    console.log('='.repeat(60));
    console.log(`Total Builds Analyzed: ${summary.totalBuilds}`);
    console.log(`Average Build Time: ${summary.averageBuildTime.toFixed(2)}s`);
    console.log(`Success Rate: ${summary.successRate.toFixed(1)}%`);
    console.log(`Build Time Trend: ${summary.trends.buildTimeImproving ? '📈 Improving' : '📉 Stable/Worsening'}`);
    console.log(`Error Trend: ${summary.trends.errorsTrending === 'improving' ? '📈 Improving' : summary.trends.errorsTrending === 'worsening' ? '📉 Worsening' : '➡️ Stable'}`);
    console.log(`Warning Trend: ${summary.trends.warningsTrending === 'improving' ? '📈 Improving' : summary.trends.warningsTrending === 'worsening' ? '📉 Worsening' : '➡️ Stable'}`);
  }
  
  console.log('\n' + '='.repeat(60));
  
  // Exit with appropriate code
  if (!validation.overallValid) {
    console.error('[BuildMonitor] Build failed performance validation');
    process.exit(1);
  }
  
  if (!buildSuccess) {
    console.error('[BuildMonitor] Build failed');
    process.exit(1);
  }
  
  console.log('[BuildMonitor] Build completed successfully with valid performance metrics');
  process.exit(0);
}

// Run the build if this script is executed directly
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  buildWithMonitoring().catch((error) => {
    console.error('[BuildMonitor] Unexpected error:', error);
    process.exit(1);
  });
}

export { buildWithMonitoring };
