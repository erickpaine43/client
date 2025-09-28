/**
 * System Metrics Utilities
 * 
 * Utilities for gathering system performance metrics (memory, CPU)
 */

/**
 * Get current memory usage in MB
 */
export function getMemoryUsage(): number {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    // Node.js environment
    const usage = process.memoryUsage();
    return Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100;
  } else if (typeof performance !== 'undefined' && 'memory' in performance) {
    // Browser environment with performance.memory API
    const memory = (performance as { memory: { usedJSHeapSize: number } }).memory;
    return Math.round(memory.usedJSHeapSize / 1024 / 1024 * 100) / 100;
  }
  
  return 0; // Unable to determine memory usage
}

/**
 * Get current CPU usage percentage (approximation)
 */
export function getCpuUsage(): number {
  if (typeof process !== 'undefined' && process.cpuUsage) {
    // Node.js environment - get CPU usage
    try {
      const usage = process.cpuUsage();
      const totalUsage = usage.user + usage.system;
      // Convert microseconds to percentage (rough approximation)
      // This is a simplified calculation and may not be perfectly accurate
      return Math.min(100, Math.round((totalUsage / 1000000) * 100) / 100);
    } catch {
      return 0;
    }
  }
  
  return 0; // Unable to determine CPU usage
}
