// ============================================================================
// BASE ANALYTICS SERVICE - Abstract base class for domain services
// ============================================================================

import { 
  AnalyticsFilters, 
  PerformanceMetrics
} from "@/types/analytics/core";
import { analyticsCache, CACHE_TTL } from "@/lib/utils/redis";
import { AnalyticsCalculator } from "@/lib/utils/analytics-calculator";
import { PerformanceMonitor, cacheMonitor, errorTracker } from "./monitoring";

/**
 * Error types for analytics operations.
 */
export enum AnalyticsErrorType {
  NETWORK_ERROR = "NETWORK_ERROR",
  DATA_NOT_FOUND = "DATA_NOT_FOUND", 
  INVALID_FILTERS = "INVALID_FILTERS",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  RATE_LIMITED = "RATE_LIMITED",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  CACHE_ERROR = "CACHE_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
}

/**
 * Analytics service error with retry information.
 */
export class AnalyticsError extends Error {
  constructor(
    public type: AnalyticsErrorType,
    message: string,
    public domain: string,
    public retryable: boolean = false,
    public retryAfter?: number
  ) {
    super(message);
    this.name = "AnalyticsError";
  }
}

/**
 * Retry configuration for analytics operations.
 */
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

/**
 * Default retry configuration.
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
};

/**
 * Abstract base class for all domain-specific analytics services.
 * Provides common functionality like caching, error handling, and retry logic.
 */
export abstract class BaseAnalyticsService {
  protected domain: string;
  protected retryConfig: RetryConfig;

  constructor(domain: string, retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG) {
    this.domain = domain;
    this.retryConfig = retryConfig;
  }

  /**
   * Execute operation with caching, error handling, and retry logic.
   * Includes fallback to cached data when services are unavailable.
   */
  protected async executeWithCache<T>(
    operation: string,
    entityIds: string[] = [],
    filters: AnalyticsFilters,
    executor: () => Promise<T>,
    ttl: number = CACHE_TTL.RECENT,
    useCache: boolean = true
  ): Promise<T> {
    const monitor = PerformanceMonitor.create(operation, this.domain);
    const cacheKey = analyticsCache.generateCacheKey(
      this.domain,
      operation,
      entityIds,
      filters,
      ttl
    );

    // Try cache first if enabled
    let cachedData: T | null = null;
    if (useCache && analyticsCache.isAvailable()) {
      try {
        monitor.startPhase("cacheTime");
        cachedData = await analyticsCache.get<T>(cacheKey);
        const cacheTime = monitor.endPhase("cacheTime");
        
        if (cachedData) {
          monitor.setCacheHit(true);
          cacheMonitor.recordOperation(
            this.domain,
            "get",
            cacheKey,
            cacheTime,
            true
          );
          monitor.complete();
          return cachedData;
        } else {
          cacheMonitor.recordOperation(
            this.domain,
            "get",
            cacheKey,
            cacheTime,
            false
          );
        }
      } catch (error) {
        const cacheTime = monitor.endPhase("cacheTime");
        cacheMonitor.recordError(
          this.domain,
          "get",
          cacheKey,
          error as Error,
          cacheTime
        );
        console.warn(`Cache read error for ${cacheKey}:`, error);
        // Continue to execute operation
      }
    }

    // Execute operation with retry logic and fallback support
    try {
      monitor.startPhase("computationTime");
      const result = await this.executeWithRetry(executor);
      monitor.endPhase("computationTime");

      // Cache the result if caching is enabled
      if (useCache && analyticsCache.isAvailable()) {
        try {
          monitor.startPhase("cacheTime");
          await analyticsCache.set(cacheKey, result, ttl);
          const cacheTime = monitor.endPhase("cacheTime");
          
          cacheMonitor.recordOperation(
            this.domain,
            "set",
            cacheKey,
            cacheTime,
            false
          );
        } catch (error) {
          const cacheTime = monitor.endPhase("cacheTime");
          cacheMonitor.recordError(
            this.domain,
            "set",
            cacheKey,
            error as Error,
            cacheTime
          );
          console.warn(`Cache write error for ${cacheKey}:`, error);
          // Don't fail the operation due to cache errors
        }
      }

      monitor.complete();
      return result;
    } catch (error) {
      const analyticsError = this.normalizeError(error);
      
      // Track the error
      errorTracker.trackError(
        this.domain,
        operation,
        analyticsError,
        { entityIds, filters }
      );
      
      // If service is unavailable and we have cached data, use it as fallback
      if (
        (analyticsError.type === AnalyticsErrorType.SERVICE_UNAVAILABLE || 
         analyticsError.type === AnalyticsErrorType.NETWORK_ERROR) &&
        cachedData !== null
      ) {
        console.warn(
          `Service unavailable for ${this.domain}:${operation}, falling back to cached data`,
          analyticsError.message
        );
        monitor.setCacheHit(true);
        monitor.complete();
        return cachedData;
      }

      // If no cached data available, complete with error and throw
      monitor.completeWithError(analyticsError);
      throw analyticsError;
    }
  }

  /**
   * Execute operation with exponential backoff retry logic.
   */
  protected async executeWithRetry<T>(
    executor: () => Promise<T>,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await executor();
    } catch (error) {
      const analyticsError = this.normalizeError(error);
      
      if (!analyticsError.retryable || attempt >= this.retryConfig.maxRetries) {
        throw analyticsError;
      }

      const delay = Math.min(
        this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1),
        this.retryConfig.maxDelay
      );

      console.warn(
        `Analytics operation failed (attempt ${attempt}/${this.retryConfig.maxRetries}), retrying in ${delay}ms:`,
        analyticsError.message
      );

      await this.sleep(delay);
      return this.executeWithRetry(executor, attempt + 1);
    }
  }

  /**
   * Normalize various error types into AnalyticsError.
   * Enhanced with better error categorization for graceful degradation.
   */
  protected normalizeError(error: unknown): AnalyticsError {
    if (error instanceof AnalyticsError) {
      return error;
    }

    // Type guard for error objects with common properties
    const isErrorWithCode = (err: unknown): err is { code: string } => {
      return typeof err === 'object' && err !== null && 'code' in err;
    };

    const isErrorWithMessage = (err: unknown): err is { message: string } => {
      return typeof err === 'object' && err !== null && 'message' in err;
    };

    const isErrorWithName = (err: unknown): err is { name: string } => {
      return typeof err === 'object' && err !== null && 'name' in err;
    };

    const isErrorWithStatus = (err: unknown): err is { status: number; retryAfter?: number } => {
      return typeof err === 'object' && err !== null && 'status' in err;
    };

    // Network errors (retryable)
    if (isErrorWithCode(error) && 
        (error.code === "ECONNREFUSED" || 
         error.code === "ENOTFOUND" || 
         error.code === "ETIMEDOUT" ||
         error.code === "ECONNRESET")) {
      return new AnalyticsError(
        AnalyticsErrorType.NETWORK_ERROR,
        `Network connection failed: ${error.code}`,
        this.domain,
        true,
        5000
      );
    }

    // Convex-specific errors
    if ((isErrorWithMessage(error) && error.message.includes("ConvexError")) || 
        (isErrorWithName(error) && error.name === "ConvexError")) {
      const message = isErrorWithMessage(error) ? error.message : "ConvexError";
      return new AnalyticsError(
        AnalyticsErrorType.SERVICE_UNAVAILABLE,
        `Convex service error: ${message}`,
        this.domain,
        true,
        3000
      );
    }

    // Rate limiting (retryable with longer delay)
    if (isErrorWithStatus(error) && error.status === 429) {
      return new AnalyticsError(
        AnalyticsErrorType.RATE_LIMITED,
        "Rate limit exceeded",
        this.domain,
        true,
        error.retryAfter || 60000
      );
    }

    // Service unavailable (retryable)
    if (isErrorWithStatus(error) && error.status >= 500 && error.status < 600) {
      return new AnalyticsError(
        AnalyticsErrorType.SERVICE_UNAVAILABLE,
        `Service temporarily unavailable (${error.status})`,
        this.domain,
        true,
        5000
      );
    }

    // Authentication errors (not retryable)
    if (isErrorWithStatus(error) && (error.status === 401 || error.status === 403)) {
      return new AnalyticsError(
        AnalyticsErrorType.AUTHENTICATION_ERROR,
        "Authentication failed",
        this.domain,
        false
      );
    }

    // Data not found (not retryable)
    if (isErrorWithStatus(error) && error.status === 404) {
      return new AnalyticsError(
        AnalyticsErrorType.DATA_NOT_FOUND,
        "Requested data not found",
        this.domain,
        false
      );
    }

    // Timeout errors (retryable)
    if ((isErrorWithName(error) && error.name === "TimeoutError") || 
        (isErrorWithMessage(error) && error.message.includes("timeout"))) {
      return new AnalyticsError(
        AnalyticsErrorType.NETWORK_ERROR,
        "Request timeout",
        this.domain,
        true,
        3000
      );
    }

    // Cache errors (retryable, but should not block main operation)
    if (isErrorWithMessage(error) && 
        (error.message.includes("Redis") || error.message.includes("cache"))) {
      return new AnalyticsError(
        AnalyticsErrorType.CACHE_ERROR,
        `Cache error: ${error.message}`,
        this.domain,
        true,
        1000
      );
    }

    // Generic error - assume retryable for better resilience
    const message = isErrorWithMessage(error) ? error.message : "Unknown error occurred";
    const isRetryable = !message.includes("validation") && 
                       !message.includes("invalid") &&
                       !message.includes("forbidden");

    return new AnalyticsError(
      AnalyticsErrorType.SERVICE_UNAVAILABLE,
      message,
      this.domain,
      isRetryable,
      isRetryable ? 2000 : undefined
    );
  }

  /**
   * Validate analytics filters.
   */
  protected validateFilters(filters: AnalyticsFilters): void {
    if (!filters.dateRange) {
      throw new AnalyticsError(
        AnalyticsErrorType.INVALID_FILTERS,
        "Date range is required",
        this.domain,
        false
      );
    }

    const start = new Date(filters.dateRange.start);
    const end = new Date(filters.dateRange.end);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new AnalyticsError(
        AnalyticsErrorType.INVALID_FILTERS,
        "Invalid date format in filters",
        this.domain,
        false
      );
    }

    if (start > end) {
      throw new AnalyticsError(
        AnalyticsErrorType.INVALID_FILTERS,
        "Start date must be before end date",
        this.domain,
        false
      );
    }

    // Check for reasonable date range (not more than 2 years)
    const maxRange = 2 * 365 * 24 * 60 * 60 * 1000; // 2 years in milliseconds
    if (end.getTime() - start.getTime() > maxRange) {
      throw new AnalyticsError(
        AnalyticsErrorType.INVALID_FILTERS,
        "Date range too large (maximum 2 years)",
        this.domain,
        false
      );
    }
  }

  /**
   * Validate performance metrics data.
   */
  protected validateMetrics(metrics: PerformanceMetrics): void {
    const validation = AnalyticsCalculator.validateMetrics(metrics);
    if (!validation.isValid) {
      throw new AnalyticsError(
        AnalyticsErrorType.VALIDATION_ERROR,
        `Invalid metrics: ${validation.errors.join(", ")}`,
        this.domain,
        false
      );
    }
  }

  /**
   * Create default filters for analytics queries.
   */
  protected createDefaultFilters(): AnalyticsFilters {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30); // Last 30 days

    return {
      dateRange: {
        start: start.toISOString().split("T")[0],
        end: end.toISOString().split("T")[0],
      },
      entityIds: [],
      additionalFilters: {}
    };
  }

  /**
   * Sleep utility for retry delays.
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Log analytics operation for monitoring.
   */
  protected logOperation(
    operation: string,
    entityIds: string[],
    duration: number,
    success: boolean,
    error?: AnalyticsError
  ): void {
    // This method is now handled by the monitoring system in executeWithCache
    // Keep for backward compatibility but delegate to monitoring system
    if (success) {
      // Already logged by PerformanceMonitor.complete()
    } else if (error) {
      // Already logged by errorTracker.trackError()
    }
  }

  /**
   * Get cache key for this service's operations.
   */
  protected getCacheKey(
    operation: string,
    entityIds: string[] = [],
    filters: Record<string, unknown> = {}
  ): string {
    return analyticsCache.generateCacheKey(
      this.domain,
      operation,
      entityIds,
      filters
    );
  }

  /**
   * Invalidate cache for this service.
   */
  async invalidateCache(entityIds?: string[]): Promise<number> {
    if (entityIds) {
      return await analyticsCache.invalidateEntities(this.domain, entityIds);
    } else {
      return await analyticsCache.invalidateDomain(this.domain);
    }
  }

  /**
   * Check if this service is healthy.
   */
  abstract healthCheck(): Promise<boolean>;
}
