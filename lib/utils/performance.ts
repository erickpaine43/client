/**
 * Performance monitoring utilities
 */

export function withTiming<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  return fn().finally(() => {
    const duration = Date.now() - start;
    console.log(`[PERF] ${operation}: ${duration}ms`);
  });
}
