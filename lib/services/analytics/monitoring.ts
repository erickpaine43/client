// ============================================================================
// ANALYTICS MONITORING - Performance and error tracking
// ============================================================================

/**
 * Performance monitor for tracking analytics operations.
 */
export class PerformanceMonitor {
  private startTime: number;
  private phases: Record<string, number> = {};
  private cacheHit = false;

  constructor(
    private operation: string,
    private domain: string
  ) {
    this.startTime = Date.now();
  }

  static create(operation: string, domain: string): PerformanceMonitor {
    return new PerformanceMonitor(operation, domain);
  }

  startPhase(phase: string): void {
    this.phases[phase] = Date.now();
  }

  endPhase(phase: string): number {
    const startTime = this.phases[phase];
    if (!startTime) return 0;
    
    const duration = Date.now() - startTime;
    delete this.phases[phase];
    return duration;
  }

  setCacheHit(hit: boolean): void {
    this.cacheHit = hit;
  }

  complete(): void {
    const totalTime = Date.now() - this.startTime;
    console.debug(`Analytics operation completed: ${this.domain}:${this.operation} (${totalTime}ms, cache: ${this.cacheHit})`);
  }

  completeWithError(error: Error): void {
    const totalTime = Date.now() - this.startTime;
    console.error(`Analytics operation failed: ${this.domain}:${this.operation} (${totalTime}ms)`, error);
  }
}

/**
 * Cache monitor for tracking cache operations.
 */
export const cacheMonitor = {
  recordOperation(
    domain: string,
    operation: string,
    key: string,
    duration: number,
    hit: boolean
  ): void {
    console.debug(`Cache ${operation}: ${domain} (${duration}ms, hit: ${hit})`);
  },

  recordError(
    domain: string,
    operation: string,
    key: string,
    error: Error,
    duration: number
  ): void {
    console.warn(`Cache ${operation} error: ${domain} (${duration}ms)`, error);
  }
};

/**
 * Error tracker for analytics operations.
 */
export const errorTracker = {
  trackError(
    domain: string,
    operation: string,
    error: Error,
    context: Record<string, unknown>
  ): void {
    console.error(`Analytics error: ${domain}:${operation}`, {
      error: error.message,
      context
    });
  }
};
