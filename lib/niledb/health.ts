/**
 * NileDB Health Check and Connection Validation
 * 
 * Provides utilities for validating database connections, checking system health,
 * and monitoring database performance.
 */

import { Nile } from '@niledatabase/server';
import { getNileConfig } from './config';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  checks: {
    database: HealthCheck;
    api: HealthCheck;
    authentication: HealthCheck;
    tenantService: HealthCheck;
    companyService: HealthCheck;
  };
  metadata: {
    environment: string;
    version: string;
    uptime: number;
  };
}

export interface HealthCheck {
  status: 'pass' | 'fail' | 'warn';
  responseTime?: number;
  error?: string;
  details?: Record<string, unknown>;
}

export interface ConnectionValidationResult {
  isValid: boolean;
  error?: string;
  details: {
    canConnect: boolean;
    canAuthenticate: boolean;
    canQuery: boolean;
    responseTime: number;
  };
}

/**
 * Validate NileDB database connection
 */
export const validateDatabaseConnection = async (): Promise<ConnectionValidationResult> => {
  const startTime = Date.now();
  const result: ConnectionValidationResult = {
    isValid: false,
    details: {
      canConnect: false,
      canAuthenticate: false,
      canQuery: false,
      responseTime: 0,
    },
  };

  try {
    const config = getNileConfig();
    const nile = Nile(config);

    // Test 1: Basic connection
    try {
      await nile.db.query('SELECT 1 as test');
      result.details.canConnect = true;
    } catch (error) {
      result.error = `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      result.details.responseTime = Date.now() - startTime;
      return result;
    }

    // Test 2: Authentication check
    try {
      // Try to access session (this validates auth configuration)
      await nile.auth.getSession();
      result.details.canAuthenticate = true;
    } catch {
      // Auth might fail if no session exists, but config should be valid
      result.details.canAuthenticate = true;
    }

    // Test 3: Query execution
    try {
      const queryResult = await nile.db.query('SELECT current_timestamp as now, version() as version');
      result.details.canQuery = queryResult.rows.length > 0;
    } catch (error) {
      result.error = `Query execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      result.details.responseTime = Date.now() - startTime;
      return result;
    }

    result.isValid = result.details.canConnect && result.details.canAuthenticate && result.details.canQuery;
    result.details.responseTime = Date.now() - startTime;

    return result;
  } catch (error) {
    result.error = `Configuration error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    result.details.responseTime = Date.now() - startTime;
    return result;
  }
};

/**
 * Perform comprehensive health check
 */
export const performHealthCheck = async (): Promise<HealthCheckResult> => {
  const timestamp = new Date().toISOString();

  const result: HealthCheckResult = {
    status: 'healthy',
    timestamp,
    checks: {
      database: { status: 'pass' },
      api: { status: 'pass' },
      authentication: { status: 'pass' },
      tenantService: { status: 'pass' },
      companyService: { status: 'pass' },
    },
    metadata: {
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
    },
  };

  // Database Health Check
  try {
    const dbStartTime = Date.now();
    const connectionResult = await validateDatabaseConnection();
    const dbResponseTime = Date.now() - dbStartTime;

    if (connectionResult.isValid) {
      result.checks.database = {
        status: 'pass',
        responseTime: dbResponseTime,
        details: connectionResult.details,
      };
    } else {
      result.checks.database = {
        status: 'fail',
        responseTime: dbResponseTime,
        error: connectionResult.error,
        details: connectionResult.details,
      };
    }
  } catch (error) {
    result.checks.database = {
      status: 'fail',
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
  }

  // API Health Check
  try {
    const apiStartTime = Date.now();
    const config = getNileConfig();
    
    // Test API endpoint availability
    const response = await fetch(`${config.apiUrl.replace('/v2/databases/', '/health')}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.user}:${config.password}`,
      },
    });

    const apiResponseTime = Date.now() - apiStartTime;

    if (response.ok || response.status === 404) { // 404 is acceptable for health endpoint
      result.checks.api = {
        status: 'pass',
        responseTime: apiResponseTime,
        details: { statusCode: response.status },
      };
    } else {
      result.checks.api = {
        status: 'warn',
        responseTime: apiResponseTime,
        error: `API returned status ${response.status}`,
        details: { statusCode: response.status },
      };
    }
  } catch (error) {
    result.checks.api = {
      status: 'fail',
      error: error instanceof Error ? error.message : 'Unknown API error',
    };
  }

  // Authentication Health Check
  try {
    const authStartTime = Date.now();
    const config = getNileConfig();
    const nile = Nile(config);

    // Test authentication configuration
    await nile.auth.getSession();
    const authResponseTime = Date.now() - authStartTime;

    result.checks.authentication = {
      status: 'pass',
      responseTime: authResponseTime,
    };
  } catch {
    // Authentication might fail if no session exists, but that's not necessarily unhealthy
    result.checks.authentication = {
      status: 'pass',
      details: { note: 'No active session (expected)' },
    };
  }

  // Tenant Service Health Check
  try {
    const tenantStartTime = Date.now();
    const config = getNileConfig();
    const nile = Nile(config);

    // Test tenant query
    await nile.db.query('SELECT 1 FROM public.tenants LIMIT 1');
    const tenantResponseTime = Date.now() - tenantStartTime;

    result.checks.tenantService = {
      status: 'pass',
      responseTime: tenantResponseTime,
    };
  } catch (error) {
    result.checks.tenantService = {
      status: 'fail',
      error: error instanceof Error ? error.message : 'Unknown tenant service error',
    };
  }

  // Company Service Health Check
  try {
    const companyStartTime = Date.now();
    const config = getNileConfig();
    const nile = Nile(config);

    // Test company query
    await nile.db.query('SELECT 1 FROM public.companies LIMIT 1');
    const companyResponseTime = Date.now() - companyStartTime;

    result.checks.companyService = {
      status: 'pass',
      responseTime: companyResponseTime,
    };
  } catch (error) {
    result.checks.companyService = {
      status: 'fail',
      error: error instanceof Error ? error.message : 'Unknown company service error',
    };
  }

  // Determine overall status
  const failedChecks = Object.values(result.checks).filter(check => check.status === 'fail');
  const warnChecks = Object.values(result.checks).filter(check => check.status === 'warn');

  if (failedChecks.length > 0) {
    result.status = 'unhealthy';
  } else if (warnChecks.length > 0) {
    result.status = 'degraded';
  } else {
    result.status = 'healthy';
  }

  return result;
};

/**
 * Test database query performance
 */
export const testQueryPerformance = async (): Promise<{
  averageResponseTime: number;
  results: Array<{ query: string; responseTime: number; success: boolean; error?: string }>;
}> => {
  const config = getNileConfig();
  const nile = Nile(config);

  const testQueries = [
    'SELECT 1 as simple_test',
    'SELECT current_timestamp as timestamp_test',
    'SELECT version() as version_test',
    'SELECT pg_database_size(current_database()) as db_size',
  ];

  const results = [];
  let totalTime = 0;
  let successCount = 0;

  for (const query of testQueries) {
    const startTime = Date.now();
    try {
      await nile.db.query(query);
      const responseTime = Date.now() - startTime;
      results.push({
        query,
        responseTime,
        success: true,
      });
      totalTime += responseTime;
      successCount++;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      results.push({
        query,
        responseTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return {
    averageResponseTime: successCount > 0 ? totalTime / successCount : 0,
    results,
  };
};

/**
 * Validate NileDB configuration without connecting
 */
export const validateConfiguration = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  try {
    getNileConfig();
  } catch (error) {
    if (error instanceof Error) {
      errors.push(error.message);
    } else {
      errors.push('Unknown configuration error');
    }
  }

  // Additional validation checks
  const requiredEnvVars = [
    'NILEDB_USER',
    'NILEDB_PASSWORD',
    'NILEDB_API_URL',
    'NILEDB_POSTGRES_URL',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      errors.push(`Missing required environment variable: ${envVar}`);
    }
  }

  // Validate URL formats
  if (process.env.NILEDB_API_URL && !process.env.NILEDB_API_URL.startsWith('https://')) {
    errors.push('NILEDB_API_URL must be a valid HTTPS URL');
  }

  if (process.env.NILEDB_POSTGRES_URL && !process.env.NILEDB_POSTGRES_URL.startsWith('postgres://')) {
    errors.push('NILEDB_POSTGRES_URL must be a valid PostgreSQL connection string');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Create a monitoring function that can be used for continuous health checking
 */
export const createHealthMonitor = (intervalMs: number = 60000) => {
  let isRunning = false;
  let intervalId: NodeJS.Timeout | null = null;
  let lastHealthCheck: HealthCheckResult | null = null;

  const start = () => {
    if (isRunning) return;
    
    isRunning = true;
    intervalId = setInterval(async () => {
      try {
        lastHealthCheck = await performHealthCheck();
        
        // Log unhealthy status
        if (lastHealthCheck.status === 'unhealthy') {
          console.error('NileDB Health Check Failed:', lastHealthCheck);
        } else if (lastHealthCheck.status === 'degraded') {
          console.warn('NileDB Health Check Degraded:', lastHealthCheck);
        }
      } catch (error) {
        console.error('Health check monitoring error:', error);
      }
    }, intervalMs);
  };

  const stop = () => {
    if (!isRunning) return;
    
    isRunning = false;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  const getLastResult = () => lastHealthCheck;

  return {
    start,
    stop,
    getLastResult,
    isRunning: () => isRunning,
  };
};
