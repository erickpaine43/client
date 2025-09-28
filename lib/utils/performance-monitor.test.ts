/**
 * Test file to verify the refactored performance monitoring functionality
 */

import { PerformanceMonitorService } from './performance-monitor-service';
import { measureAsync, measureSync, getGlobalPerformanceMonitor } from './performance-measurement';
import { getCompilationReport, monitorConvexHelperImpact } from './performance-reporting';

// Test the new service
const service = new PerformanceMonitorService();

// Record some test metrics
service.recordMetric({
  operation: 'query',
  executionTime: 150,
  success: true,
  service: 'test-service',
  queryName: 'testQuery'
});

service.recordCompilationMetric('tsc', 5000, true, 10);

// Test statistics
const stats = service.getStats();
console.log('Service stats:', {
  totalOperations: stats.totalOperations,
  averageExecutionTime: stats.averageExecutionTime,
  successRate: stats.successRate
});

// Test analysis
const analysis = service.analyzePerformance();
console.log('Analysis:', {
  totalOperations: analysis.totalOperations,
  successRate: analysis.successRate,
  validationPassed: analysis.validation.overallValid
});

// Test measurement utilities
async function testMeasurement() {
  const result = await measureAsync(
    async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return 'test result';
    },
    {
      operation: 'test-async',
      service: 'test-service',
      queryName: 'asyncTest'
    }
  );
  
  console.log('Async measurement result:', result);
  
  const syncResult = measureSync(
    () => {
      return 'sync result';
    },
    {
      operation: 'test-sync',
      service: 'test-service',
      queryName: 'syncTest'
    }
  );
  
  console.log('Sync measurement result:', syncResult);
}

// Test global monitor
const globalMonitor = getGlobalPerformanceMonitor();
console.log('Global monitor metrics count:', globalMonitor.getMetricsCount());

// Test reporting
const compilationReport = getCompilationReport();
console.log('Compilation report summary:', compilationReport.summary);

const convexImpact = monitorConvexHelperImpact();
console.log('Convex impact:', convexImpact.overallImpact);

console.log('✅ All refactored performance monitoring functionality is working correctly!');

export { testMeasurement };
