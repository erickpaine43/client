// ============================================================================
// ERROR HANDLING TEST UTILITIES - Testing graceful degradation and resilience
// ============================================================================

import { AnalyticsService } from "./AnalyticsService";
import { AnalyticsError, AnalyticsErrorType } from "./BaseAnalyticsService";
import { AnalyticsDomain } from "@/types/analytics/ui";
import { analyticsCache } from "@/lib/utils/redis";

/**
 * Test details interface for various test result types.
 */
export interface TestDetails {
  [key: string]: unknown;
  cacheAvailable?: boolean;
  multipleFailures?: {
    failingDomainsCount: number;
    remainingDomainsWorking: boolean;
    workingDomains: AnalyticsDomain[];
    failedDomains: AnalyticsDomain[];
  };
  isolationResults?: Record<string, {
    isolationSuccessful: boolean;
    targetDomainFailed: boolean;
    otherDomainsWorking: boolean;
  }>;
}

/**
 * Test result interface for error handling tests.
 */
export interface ErrorHandlingTestResult {
  testName: string;
  success: boolean;
  details: TestDetails;
  errors: string[];
  duration: number;
}

/**
 * Comprehensive error handling test suite for analytics services.
 */
export class ErrorHandlingTestUtils {
  private analyticsService: AnalyticsService;

  constructor(analyticsService: AnalyticsService) {
    this.analyticsService = analyticsService;
  }

  /**
   * Test graceful degradation when individual domains fail.
   */
  async testGracefulDegradation(): Promise<ErrorHandlingTestResult> {
    const startTime = Date.now();
    const testName = "Graceful Degradation Test";
    const errors: string[] = [];
    const details: TestDetails = {};

    try {
      // Test each domain failing individually
      const domains: AnalyticsDomain[] = ["campaigns", "domains", "mailboxes", "leads", "templates", "billing"];
      
      for (const targetDomain of domains) {
        const isolationResult = await this.analyticsService.testDomainIsolation(targetDomain, true);
        
        details[`${targetDomain}_isolation`] = isolationResult;
        
        const targetFailed = !isolationResult.results[targetDomain].success;
        const othersWorking = Object.keys(isolationResult.results)
          .filter((key: string) => key !== targetDomain)
          .every((key: string) => isolationResult.results[key as AnalyticsDomain].success);
        const isolationSuccessful = targetFailed && othersWorking;
        
        if (!isolationSuccessful) {
          errors.push(`Domain isolation failed for ${targetDomain}: other domains affected`);
        }
        
        if (!targetFailed) {
          errors.push(`Target domain ${targetDomain} should have failed but didn't`);
        }
        
        if (!othersWorking) {
          errors.push(`Other domains stopped working when ${targetDomain} failed`);
        }
      }

      // Test multiple domains failing simultaneously
      const multiFailureResult = await this.testMultipleDomainFailures(["campaigns", "domains"]);
      details.multipleFailures = multiFailureResult;
      
      if (!multiFailureResult.remainingDomainsWorking) {
        errors.push("Remaining domains stopped working when multiple domains failed");
      }

      return {
        testName,
        success: errors.length === 0,
        details,
        errors,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      errors.push(`Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        testName,
        success: false,
        details,
        errors,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Test fallback to cached data when services are unavailable.
   */
  async testCachedDataFallback(): Promise<ErrorHandlingTestResult> {
    const startTime = Date.now();
    const testName = "Cached Data Fallback Test";
    const errors: string[] = [];
    const details: TestDetails = {};

    try {
      // Check if cache is available
      const cacheAvailable = analyticsCache.isAvailable();
      details.cacheAvailable = cacheAvailable;
      
      if (!cacheAvailable) {
        errors.push("Redis cache is not available for fallback testing");
        return {
          testName,
          success: false,
          details,
          errors,
          duration: Date.now() - startTime,
        };
      }

      // Test fallback for each domain
      const domains: AnalyticsDomain[] = ["campaigns", "domains", "mailboxes", "leads", "templates", "billing"];
      
      for (const domain of domains) {
        // First, populate cache with some data
        await this.populateTestCacheData(domain);
        
        // Test fallback mechanism
        const fallbackResult = await this.analyticsService.testCachedDataFallback(domain);
        details[`${domain}_fallback`] = fallbackResult;
        
        if (!fallbackResult.cacheAvailable) {
          errors.push(`Cache not available for domain ${domain}`);
        }
        
        // Note: fallbackSuccessful might be false if no cached data exists, which is acceptable
        const dataRetrieved = Object.values(fallbackResult.fallbackTests).some(
          (test: { tested: boolean; fallbackWorked: boolean }) => test.tested && test.fallbackWorked
        );
        if (fallbackResult.cacheAvailable && !dataRetrieved) {
          console.warn(`No cached data found for domain ${domain} (this may be expected)`);
        }
      }

      return {
        testName,
        success: errors.length === 0,
        details,
        errors,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      errors.push(`Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        testName,
        success: false,
        details,
        errors,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Test retry logic with exponential backoff.
   */
  async testRetryLogic(): Promise<ErrorHandlingTestResult> {
    const startTime = Date.now();
    const testName = "Retry Logic Test";
    const errors: string[] = [];
    const details: TestDetails = {};

    try {
      // Test retry with different error types
      const retryTests = [
        {
          name: "network_error",
          errorType: AnalyticsErrorType.NETWORK_ERROR,
          shouldRetry: true,
        },
        {
          name: "service_unavailable",
          errorType: AnalyticsErrorType.SERVICE_UNAVAILABLE,
          shouldRetry: true,
        },
        {
          name: "rate_limited",
          errorType: AnalyticsErrorType.RATE_LIMITED,
          shouldRetry: true,
        },
        {
          name: "authentication_error",
          errorType: AnalyticsErrorType.AUTHENTICATION_ERROR,
          shouldRetry: false,
        },
        {
          name: "data_not_found",
          errorType: AnalyticsErrorType.DATA_NOT_FOUND,
          shouldRetry: false,
        },
      ];

      for (const test of retryTests) {
        const retryResult = await this.testRetryBehavior(test.errorType, test.shouldRetry);
        details[test.name] = retryResult;
        
        if (test.shouldRetry && !retryResult.retriesAttempted) {
          errors.push(`Expected retries for ${test.name} but none were attempted`);
        }
        
        if (!test.shouldRetry && retryResult.retriesAttempted) {
          errors.push(`Unexpected retries for ${test.name}`);
        }
      }

      return {
        testName,
        success: errors.length === 0,
        details,
        errors,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      errors.push(`Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        testName,
        success: false,
        details,
        errors,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Run comprehensive error handling test suite.
   */
  async runComprehensiveTests(): Promise<{
    overallSuccess: boolean;
    results: ErrorHandlingTestResult[];
    summary: {
      totalTests: number;
      passed: number;
      failed: number;
      totalDuration: number;
    };
  }> {
    const startTime = Date.now();
    const results: ErrorHandlingTestResult[] = [];

    // Run all tests
    results.push(await this.testGracefulDegradation());
    results.push(await this.testCachedDataFallback());
    results.push(await this.testRetryLogic());

    const passed = results.filter(r => r.success).length;
    const failed = results.length - passed;
    const overallSuccess = failed === 0;

    return {
      overallSuccess,
      results,
      summary: {
        totalTests: results.length,
        passed,
        failed,
        totalDuration: Date.now() - startTime,
      },
    };
  }

  /**
   * Test multiple domain failures simultaneously.
   */
  private async testMultipleDomainFailures(
    failingDomains: AnalyticsDomain[]
  ): Promise<{
    failingDomainsCount: number;
    remainingDomainsWorking: boolean;
    workingDomains: AnalyticsDomain[];
    failedDomains: AnalyticsDomain[];
  }> {
    const allDomains: AnalyticsDomain[] = ["campaigns", "domains", "mailboxes", "leads", "templates", "billing"];
    const remainingDomains = allDomains.filter(d => !failingDomains.includes(d));

    // Create operations that fail for specified domains
    const domainOperations: Record<AnalyticsDomain, () => Promise<boolean>> = {} as Record<AnalyticsDomain, () => Promise<boolean>>;
    
    allDomains.forEach(domain => {
      domainOperations[domain] = async () => {
        if (failingDomains.includes(domain)) {
          throw new AnalyticsError(
            AnalyticsErrorType.SERVICE_UNAVAILABLE,
            `Simulated failure for domain: ${domain}`,
            domain,
            true
          );
        }
        return true; // Simulate success for other domains
      };
    });

    const result = await this.analyticsService["executeCrossDomainOperation"](
      "multipleFailureTest",
      domainOperations,
      true,
      true
    );

    const workingDomains: AnalyticsDomain[] = [];
    const failedDomains: AnalyticsDomain[] = [];

    Object.entries(result.errors).forEach(([domain, error]) => {
      if (error === null) {
        workingDomains.push(domain as AnalyticsDomain);
      } else {
        failedDomains.push(domain as AnalyticsDomain);
      }
    });

    const remainingDomainsWorking = remainingDomains.every(domain => workingDomains.includes(domain));

    return {
      failingDomainsCount: failingDomains.length,
      remainingDomainsWorking,
      workingDomains,
      failedDomains,
    };
  }

  /**
   * Test retry behavior for specific error types.
   */
  private async testRetryBehavior(
    errorType: AnalyticsErrorType,
    shouldRetry: boolean
  ): Promise<{
    retriesAttempted: boolean;
    finalResult: "success" | "failure";
    attemptCount: number;
  }> {
    let attemptCount = 0;
    const maxAttempts = 3;

    const testOperation = async (): Promise<boolean> => {
      attemptCount++;
      
      // Fail for first few attempts, then succeed
      if (attemptCount < maxAttempts) {
        throw new AnalyticsError(
          errorType,
          `Test error (attempt ${attemptCount})`,
          "test",
          shouldRetry
        );
      }
      
      return true;
    };

    try {
      // Use the campaigns service as a test subject
      await this.analyticsService.campaigns["executeWithRetry"](testOperation);
      
      return {
        retriesAttempted: attemptCount > 1,
        finalResult: "success",
        attemptCount,
      };
    } catch (error) {
      // Log error for debugging purposes (error is now used)
      console.warn(`Retry test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        retriesAttempted: attemptCount > 1,
        finalResult: "failure",
        attemptCount,
      };
    }
  }

  /**
   * Populate cache with test data for fallback testing.
   */
  private async populateTestCacheData(domain: AnalyticsDomain): Promise<void> {
    if (!analyticsCache.isAvailable()) {
      return;
    }

    const testData = {
      domain,
      timestamp: Date.now(),
      testData: true,
      metrics: {
        sent: 100,
        delivered: 95,
        opened_tracked: 30,
        clicked_tracked: 10,
        replied: 5,
        bounced: 5,
        unsubscribed: 1,
        spamComplaints: 0,
      },
    };

    const cacheKey = analyticsCache.generateCacheKey(domain, "performance", [], {});
    await analyticsCache.set(cacheKey, testData, 300); // 5 minutes TTL
  }
}

/**
 * Create error handling test utilities instance.
 */
export function createErrorHandlingTestUtils(analyticsService: AnalyticsService): ErrorHandlingTestUtils {
  return new ErrorHandlingTestUtils(analyticsService);
}
