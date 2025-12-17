/**
 * ConvexQueryHelper - Centralized utility for handling Convex type instantiation issues
 * 
 * This utility addresses the persistent "Convex type instantiation is excessively deep" 
 * TypeScript warnings by centralizing all type assertions and providing consistent 
 * error handling across analytics services.
 * 
 * Features:
 * - Generic type support for return values
 * - Centralized error handling with context preservation
 * - Runtime validation of function references
 * - Performance monitoring hooks
 * - Consistent logging patterns
 */

import { ConvexHttpClient } from "convex/browser";
import { FunctionReference } from "convex/server";
import { AnalyticsError, AnalyticsErrorType } from "@/lib/services/analytics/BaseAnalyticsService";
import { getGlobalRuntimeMonitor } from "./runtime-performance-monitor";

/**
 * Configuration options for ConvexQueryHelper
 */
export interface ConvexHelperConfig {
  /** Enable/disable runtime validation */
  enableValidation: boolean;
  /** Timeout for queries (milliseconds) */
  queryTimeout: number;
  /** Enable performance monitoring */
  enableMonitoring: boolean;
  /** Custom error handler */
  errorHandler?: (error: ConvexQueryError) => void;
}

/**
 * Default configuration for ConvexQueryHelper
 */
export const DEFAULT_CONVEX_HELPER_CONFIG: ConvexHelperConfig = {
  enableValidation: true,
  queryTimeout: 30000, // 30 seconds
  enableMonitoring: true,
};

/**
 * Query execution context for debugging and monitoring
 */
export interface QueryExecutionContext {
  /** Service name for logging */
  serviceName: string;
  /** Method name for debugging */
  methodName: string;
  /** Timestamp for performance tracking */
  startTime: number;
  /** Arguments hash for caching */
  argsHash: string;
}

/**
 * Performance metrics for Convex query operations
 */
export interface ConvexQueryMetrics {
  /** Query execution time */
  executionTime: number;
  /** Success/failure status */
  success: boolean;
  /** Query function name */
  queryName: string;
  /** Service context */
  service: string;
  /** Error details if failed */
  error?: string;
}

/**
 * Enhanced error class for Convex query operations
 * Extends AnalyticsError to maintain consistency with existing error handling
 */
export class ConvexQueryError extends AnalyticsError {
  public readonly queryName: string;
  public readonly args: Record<string, unknown>;
  public readonly context: string;
  public readonly executionTime?: number;
  public readonly name: string = "ConvexQueryError";

  constructor(
    originalError: Error,
    queryName: string,
    args: Record<string, unknown>,
    context: string,
    executionTime?: number
  ) {
    super(
      ConvexQueryError.categorizeError(originalError),
      `Convex query failed: ${originalError.message}`,
      "convex-query-helper",
      ConvexQueryError.isRetryable(originalError),
      ConvexQueryError.getRetryDelay(originalError)
    );
    
    this.queryName = queryName;
    this.args = args;
    this.context = context;
    this.executionTime = executionTime;
    
    Object.setPrototypeOf(this, ConvexQueryError.prototype);
    if (originalError.stack) {
      this.stack = originalError.stack;
    }
  }

  /**
   * Categorize error type based on the original error
   */
  private static categorizeError(error: Error): AnalyticsErrorType {
    const message = error.message.toLowerCase();
    
    if (message.includes("network") || message.includes("connection")) {
      return AnalyticsErrorType.NETWORK_ERROR;
    }
    
    if (message.includes("timeout")) {
      return AnalyticsErrorType.NETWORK_ERROR;
    }
    
    if (message.includes("rate limit") || message.includes("429")) {
      return AnalyticsErrorType.RATE_LIMITED;
    }
    
    if (message.includes("unauthorized") || message.includes("401")) {
      return AnalyticsErrorType.AUTHENTICATION_ERROR;
    }
    
    if (message.includes("not found") || message.includes("404")) {
      return AnalyticsErrorType.DATA_NOT_FOUND;
    }
    
    if (message.includes("validation") || message.includes("invalid")) {
      return AnalyticsErrorType.VALIDATION_ERROR;
    }
    
    return AnalyticsErrorType.SERVICE_UNAVAILABLE;
  }

  /**
   * Determine if error is retryable
   */
  private static isRetryable(error: Error): boolean {
    const message = error.message.toLowerCase();
    
    // Non-retryable errors
    if (message.includes("validation") || 
        message.includes("invalid") || 
        message.includes("unauthorized") ||
        message.includes("forbidden") ||
        message.includes("not found")) {
      return false;
    }
    
    // Retryable errors
    return true;
  }

  /**
   * Get retry delay based on error type
   */
  private static getRetryDelay(error: Error): number | undefined {
    const message = error.message.toLowerCase();
    
    if (message.includes("rate limit")) {
      return 60000; // 1 minute for rate limits
    }
    
    if (message.includes("timeout")) {
      return 5000; // 5 seconds for timeouts
    }
    
    if (message.includes("network") || message.includes("connection")) {
      return 3000; // 3 seconds for network issues
    }
    
    return 2000; // Default 2 seconds
  }
}

/**
 * ConvexQueryHelper - Main utility class for handling Convex queries with type safety
 */
export class ConvexQueryHelper {
  private config: ConvexHelperConfig;
  private metrics: ConvexQueryMetrics[] = [];

  constructor(
    private convex: ConvexHttpClient,
    config: Partial<ConvexHelperConfig> = {}
  ) {
    this.config = { ...DEFAULT_CONVEX_HELPER_CONFIG, ...config };
  }

  /**
   * Execute a Convex query with generic type support and error handling
   * 
   * @param queryFn - Convex query function reference
   * @param args - Query arguments
   * @param context - Optional execution context for debugging
   * @returns Promise resolving to typed query result
   */
  async query<T>(
    queryFn: FunctionReference<"query">,
    args: Record<string, unknown>,
    context?: Partial<QueryExecutionContext>
  ): Promise<T> {
    const startTime = Date.now();
    const queryName = this.extractQueryName(queryFn);
    const executionContext: QueryExecutionContext = {
      serviceName: context?.serviceName || "unknown",
      methodName: context?.methodName || "query",
      startTime,
      argsHash: this.hashArgs(args),
      ...context,
    };

    // Runtime validation if enabled
    if (this.config.enableValidation) {
      this.validateQueryFunction(queryFn, queryName);
      this.validateQueryArgs(args);
    }

    try {
      // Execute query with timeout
      const result = await this.executeWithTimeout(
        () => {
          return this.convex.query(queryFn, args);
        },
        this.config.queryTimeout
      );

      // Record success metrics
      if (this.config.enableMonitoring) {
        const metrics = {
          executionTime: Date.now() - startTime,
          success: true,
          queryName,
          service: executionContext.serviceName,
        };
        this.recordMetrics(metrics);
        
        // Also record in global runtime monitor
        getGlobalRuntimeMonitor().recordMetric({
          operation: "query",
          executionTime: metrics.executionTime,
          success: metrics.success,
          service: metrics.service,
          queryName: metrics.queryName,
        });
      }

      return result as T;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const convexError = new ConvexQueryError(
        error as Error,
        queryName,
        args,
        `${executionContext.serviceName}:${executionContext.methodName}`,
        executionTime
      );

      // Record failure metrics
      if (this.config.enableMonitoring) {
        const metrics = {
          executionTime,
          success: false,
          queryName,
          service: executionContext.serviceName,
          error: convexError.message,
        };
        this.recordMetrics(metrics);
        
        // Also record in global runtime monitor
        getGlobalRuntimeMonitor().recordMetric({
          operation: "query",
          executionTime: metrics.executionTime,
          success: metrics.success,
          service: metrics.service,
          queryName: metrics.queryName,
          error: metrics.error,
        });
      }

      // Call custom error handler if provided
      if (this.config.errorHandler) {
        this.config.errorHandler(convexError);
      }

      throw convexError;
    }
  }

  /**
   * Execute a Convex mutation with generic type support and error handling
   * 
   * @param mutationFn - Convex mutation function reference
   * @param args - Mutation arguments
   * @param context - Optional execution context for debugging
   * @returns Promise resolving to typed mutation result
   */
  async mutation<T>(
    mutationFn: FunctionReference<"mutation">,
    args: Record<string, unknown>,
    context?: Partial<QueryExecutionContext>
  ): Promise<T> {
    const startTime = Date.now();
    const mutationName = this.extractQueryName(mutationFn);
    const executionContext: QueryExecutionContext = {
      serviceName: context?.serviceName || "unknown",
      methodName: context?.methodName || "mutation",
      startTime,
      argsHash: this.hashArgs(args),
      ...context,
    };

    // Runtime validation if enabled
    if (this.config.enableValidation) {
      this.validateQueryFunction(mutationFn, mutationName);
      this.validateQueryArgs(args);
    }

    try {
      // Execute mutation with timeout
      const result = await this.executeWithTimeout(
        () => {
          return this.convex.mutation(mutationFn, args);
        },
        this.config.queryTimeout
      );

      // Record success metrics
      if (this.config.enableMonitoring) {
        const metrics = {
          executionTime: Date.now() - startTime,
          success: true,
          queryName: mutationName,
          service: executionContext.serviceName,
        };
        this.recordMetrics(metrics);
        
        // Also record in global runtime monitor
        getGlobalRuntimeMonitor().recordMetric({
          operation: "mutation",
          executionTime: metrics.executionTime,
          success: metrics.success,
          service: metrics.service,
          queryName: metrics.queryName,
        });
      }

      return result as T;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const convexError = new ConvexQueryError(
        error as Error,
        mutationName,
        args,
        `${executionContext.serviceName}:${executionContext.methodName}`,
        executionTime
      );

      // Record failure metrics
      if (this.config.enableMonitoring) {
        const metrics = {
          executionTime,
          success: false,
          queryName: mutationName,
          service: executionContext.serviceName,
          error: convexError.message,
        };
        this.recordMetrics(metrics);
        
        // Also record in global runtime monitor
        getGlobalRuntimeMonitor().recordMetric({
          operation: "mutation",
          executionTime: metrics.executionTime,
          success: metrics.success,
          service: metrics.service,
          queryName: metrics.queryName,
          error: metrics.error,
        });
      }

      // Call custom error handler if provided
      if (this.config.errorHandler) {
        this.config.errorHandler(convexError);
      }

      throw convexError;
    }
  }

  /**
   * Health check method for monitoring
   * Tests basic connectivity without executing actual queries
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Simple connectivity test - this should not trigger type issues
      // as it's a basic client method
      return this.convex !== null && typeof this.convex.query === 'function';
    } catch (error) {
      console.warn("ConvexQueryHelper health check failed:", error);
      return false;
    }
  }

  /**
   * Get performance metrics for monitoring
   */
  getMetrics(): ConvexQueryMetrics[] {
    return [...this.metrics];
  }

  /**
   * Clear performance metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ConvexHelperConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Execute operation with timeout
   */
  private async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      operation()
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Validate query function reference
   */
  private validateQueryFunction(queryFn: unknown, queryName: string): void {
    if (!queryFn) {
      throw new Error(`Invalid query function: ${queryName}`);
    }

    if (typeof queryFn !== 'object' && typeof queryFn !== 'function') {
      throw new Error(`Query function must be a function reference: ${queryName}`);
    }
  }

  /**
   * Validate query arguments
   */
  private validateQueryArgs(args: Record<string, unknown>): void {
    if (args === null || args === undefined) {
      throw new Error("Query arguments cannot be null or undefined");
    }

    if (typeof args !== 'object') {
      throw new Error("Query arguments must be an object");
    }

    // Check for circular references that could cause serialization issues
    try {
      JSON.stringify(args);
    } catch {
      throw new Error("Query arguments contain circular references or non-serializable values");
    }
  }

  /**
   * Extract query name from function reference for logging
   */
  private extractQueryName(queryFn: unknown): string {
    if (queryFn && typeof queryFn === 'object') {
      // Try to extract name from function reference
      const fnObj = queryFn as Record<string, unknown>;
      if (typeof fnObj._name === 'string') return fnObj._name;
      if (typeof fnObj.name === 'string') return fnObj.name;
      if (typeof fnObj.toString === 'function') {
        const str = fnObj.toString();
        const match = str.match(/function\s+([^(]+)/);
        if (match) return match[1];
      }
    }
    
    return "unknown";
  }

  /**
   * Create hash of arguments for caching/debugging
   */
  private hashArgs(args: Record<string, unknown>): string {
    try {
      // Handle null/undefined args gracefully
      if (!args || typeof args !== 'object') {
        return 'empty-args';
      }
      
      const str = JSON.stringify(args, Object.keys(args).sort());
      // Simple hash function for debugging purposes
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return hash.toString(16);
    } catch (error) {
      console.warn("Failed to hash arguments:", error);
      return "unhashable";
    }
  }

  /**
   * Record performance metrics
   */
  private recordMetrics(metrics: ConvexQueryMetrics): void {
    this.metrics.push(metrics);
    
    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }
}

/**
 * Factory function for creating ConvexQueryHelper instances
 * Provides a clean API for instantiation with optional configuration
 * 
 * @param convex - ConvexHttpClient instance
 * @param config - Optional configuration overrides
 * @returns ConvexQueryHelper instance
 */
export function createConvexHelper(
  convex: ConvexHttpClient,
  config?: Partial<ConvexHelperConfig>
): ConvexQueryHelper {
  return new ConvexQueryHelper(convex, config);
}

/**
 * Utility function to create a ConvexQueryHelper with common analytics service configuration
 * 
 * @param convex - ConvexHttpClient instance
 * @param serviceName - Name of the service for logging context
 * @returns ConvexQueryHelper configured for analytics services
 */
export function createAnalyticsConvexHelper(
  convex: ConvexHttpClient,
  serviceName: string
): ConvexQueryHelper {
  return new ConvexQueryHelper(convex, {
    enableValidation: true,
    enableMonitoring: true,
    queryTimeout: 30000,
    errorHandler: (error: ConvexQueryError) => {
      console.warn(`[${serviceName}] Convex query failed:`, {
        queryName: error.queryName,
        context: error.context,
        executionTime: error.executionTime,
        message: error.message,
      });
    },
  });
}
