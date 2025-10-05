/**
 * Database Service Unit Tests
 * 
 * Comprehensive unit tests for the DatabaseService class including
 * multi-schema queries, performance tracking, and error handling.
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import type { Server } from '@niledatabase/server';
import type { QueryResult } from '../database';
import { DatabaseService, createDatabaseService, getDatabaseService, resetDatabaseService } from '../database';
import { getNileClient, withTenantContext, withoutTenantContext } from '../client';
import { testQueryPerformance } from '../health';


// Mock the client module
jest.mock('../client', () => ({
  getNileClient: jest.fn(),
  withTenantContext: jest.fn(),
  withoutTenantContext: jest.fn(),
}));

// Mock the health module
jest.mock('../health', () => ({
  testQueryPerformance: jest.fn(),
}));

describe('DatabaseService', () => {
  let mockNileClient: Partial<Server>;
  let databaseService: DatabaseService;

  beforeEach(() => {
    // Reset any existing instance
    resetDatabaseService();

    // Create mock query function with proper typing
    const mockQuery = jest.fn() as jest.Mock<(sql: string, params?: unknown[]) => Promise<QueryResult<Record<string, unknown>>>>;

    // Create mock NileDB client
    mockNileClient = {
      db: {
        query: mockQuery,
      },
    };

    // Mock the client functions
    (getNileClient as jest.Mock).mockReturnValue(mockNileClient as unknown as Server);
    (withTenantContext as jest.Mock).mockImplementation(async (...args: unknown[]) => {
      const callback = args[1] as (client: Server) => Promise<unknown>;
      return await callback(mockNileClient as unknown as Server);
    });
    (withoutTenantContext as jest.Mock).mockImplementation(async (...args: unknown[]) => {
      const callback = args[0] as (client: Server) => Promise<unknown>;
      return await callback(mockNileClient as unknown as Server);
    });

    databaseService = new DatabaseService(mockNileClient as unknown as Server);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor and Initialization', () => {
    it('should create a new DatabaseService instance', () => {
      expect(databaseService).toBeInstanceOf(DatabaseService);
    });

    it('should use provided client', () => {
      const customClient = { db: { query: jest.fn() } } as unknown as Server;
      const service = new DatabaseService(customClient);
      expect(service).toBeInstanceOf(DatabaseService);
    });

    it('should set custom slow query threshold', () => {
      const service = new DatabaseService(mockNileClient as unknown as Server, 500);
      expect(service).toBeInstanceOf(DatabaseService);
    });
  });

  describe('Basic Query Operations', () => {
    it('should execute a basic query successfully', async () => {
      const mockResult: QueryResult = {
        rows: [{ id: 1, name: 'test' }],
        rowCount: 1,
        command: 'SELECT',
      };

      mockNileClient.db.query.mockResolvedValue(mockResult);

      const result = await databaseService.query('SELECT * FROM test');

      expect(mockNileClient.db.query).toHaveBeenCalledWith('SELECT * FROM test', undefined);
      expect(result).toEqual(mockResult);
    });

    it('should execute a query with parameters', async () => {
      const mockResult: QueryResult = {
        rows: [{ id: 1, name: 'test' }],
        rowCount: 1,
        command: 'SELECT',
      };

      mockNileClient.db.query.mockResolvedValue(mockResult);

      const result = await databaseService.query('SELECT * FROM test WHERE id = $1', [1]);

      expect(mockNileClient.db.query).toHaveBeenCalledWith('SELECT * FROM test WHERE id = $1', [1]);
      expect(result).toEqual(mockResult);
    });

    it('should handle query errors gracefully', async () => {
      const mockError = new Error('Database connection failed');
      mockNileClient.db.query.mockRejectedValue(mockError);

      await expect(databaseService.query('SELECT * FROM test')).rejects.toThrow('Database query failed');
    });
  });

  describe('Tenant Context Queries', () => {
    it('should execute query with tenant context', async () => {
      const mockResult: QueryResult = {
        rows: [{ id: 1, name: 'test' }],
        rowCount: 1,
        command: 'SELECT',
      };

      mockNileClient.db.query.mockResolvedValue(mockResult);

      const result = await databaseService.queryWithContext(
        'tenant-123',
        'SELECT * FROM companies',
        []
      );

      expect(result).toEqual(mockResult);
    });

    it('should execute cross-tenant query', async () => {
      const mockResult: QueryResult = {
        rows: [{ id: 1, name: 'test' }],
        rowCount: 1,
        command: 'SELECT',
      };

      mockNileClient.db.query.mockResolvedValue(mockResult);

      const result = await databaseService.queryCrossTenant('SELECT * FROM tenants');

      expect(result).toEqual(mockResult);
    });
  });

  describe('Cross-Schema Queries', () => {
    it('should get user with full context', async () => {
      const mockUser = {
        user_id: 'user-123',
        email: 'test@example.com',
        user_name: 'Test User',
        user_role: 'admin',
        is_penguinmails_staff: false,
        tenant_count: 2,
        tenant_names: ['Tenant 1', 'Tenant 2'],
        tenant_ids: ['tenant-1', 'tenant-2'],
      };

      const mockResult: QueryResult = {
        rows: [mockUser],
        rowCount: 1,
        command: 'SELECT',
      };

      mockNileClient.db.query.mockResolvedValue(mockResult);

      const result = await databaseService.getUserWithFullContext('user-123');

      expect(result).toEqual(mockUser);
      expect(mockNileClient.db.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM users.users u'),
        ['user-123']
      );
    });

    it('should get user-company relationships', async () => {
      const mockRelationships = [
        {
          user_id: 'user-123',
          email: 'test@example.com',
          company_id: 'company-1',
          company_name: 'Test Company',
          company_role: 'admin',
          tenant_id: 'tenant-1',
          tenant_name: 'Test Tenant',
        },
      ];

      const mockResult: QueryResult = {
        rows: mockRelationships,
        rowCount: 1,
        command: 'SELECT',
      };

      mockNileClient.db.query.mockResolvedValue(mockResult);

      const result = await databaseService.getUserCompanyRelationships('user-123');

      expect(result).toEqual(mockRelationships);
      expect(mockNileClient.db.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM users.users u'),
        ['user-123']
      );
    });

    it('should get companies with stats', async () => {
      const mockCompanies = [
        {
          company_id: 'company-1',
          company_name: 'Test Company',
          tenant_id: 'tenant-1',
          tenant_name: 'Test Tenant',
          user_count: 5,
          owner_count: 1,
          admin_count: 2,
          member_count: 2,
        },
      ];

      const mockResult: QueryResult = {
        rows: mockCompanies,
        rowCount: 1,
        command: 'SELECT',
      };

      mockNileClient.db.query.mockResolvedValue(mockResult);

      const result = await databaseService.getCompaniesWithStats('tenant-1');

      expect(result).toEqual(mockCompanies);
      expect(mockNileClient.db.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM public.companies c'),
        ['tenant-1']
      );
    });
  });

  describe('System Statistics', () => {
    it('should get system statistics', async () => {
      const mockStats = {
        total_tenants: '10',
        total_users: '50',
        total_companies: '25',
        total_relationships: '75',
        staff_users: '3',
        active_subscriptions: '8',
      };

      const mockResult: QueryResult = {
        rows: [mockStats],
        rowCount: 1,
        command: 'SELECT',
      };

      mockNileClient.db.query.mockResolvedValue(mockResult);

      const result = await databaseService.getSystemStatistics();

      expect(result).toEqual({
        totalTenants: 10,
        totalUsers: 50,
        totalCompanies: 25,
        totalRelationships: 75,
        staffUsers: 3,
        activeSubscriptions: 8,
      });
    });
  });

  describe('Access Control', () => {
    it('should validate tenant access for staff user', async () => {
      const mockResult1: QueryResult = {
        rows: [{ is_penguinmails_staff: true }],
        rowCount: 1,
        command: 'SELECT',
      };

      mockNileClient.db.query.mockResolvedValueOnce(mockResult1);

      const hasAccess = await databaseService.validateTenantAccess('user-123', 'tenant-1');

      expect(hasAccess).toBe(true);
    });

    it('should validate tenant access for regular user with access', async () => {
      const mockResult1: QueryResult = {
        rows: [],
        rowCount: 0,
        command: 'SELECT',
      };

      const mockResult2: QueryResult = {
        rows: [{ user_id: 'user-123', tenant_id: 'tenant-1' }],
        rowCount: 1,
        command: 'SELECT',
      };

      mockNileClient.db.query.mockResolvedValueOnce(mockResult1).mockResolvedValueOnce(mockResult2);

      const hasAccess = await databaseService.validateTenantAccess('user-123', 'tenant-1');

      expect(hasAccess).toBe(true);
    });

    it('should deny tenant access for user without access', async () => {
      const mockResult1: QueryResult = {
        rows: [],
        rowCount: 0,
        command: 'SELECT',
      };

      const mockResult2: QueryResult = {
        rows: [],
        rowCount: 0,
        command: 'SELECT',
      };

      mockNileClient.db.query.mockResolvedValueOnce(mockResult1).mockResolvedValueOnce(mockResult2);

      const hasAccess = await databaseService.validateTenantAccess('user-123', 'tenant-1');

      expect(hasAccess).toBe(false);
    });

    it('should check if user is staff', async () => {
      const mockResult: QueryResult = {
        rows: [{ is_penguinmails_staff: true, role: 'admin' }],
        rowCount: 1,
        command: 'SELECT',
      };

      mockNileClient.db.query.mockResolvedValue(mockResult);

      const isStaff = await databaseService.isStaffUser('user-123');

      expect(isStaff).toBe(true);
    });
  });

  describe('Performance Tracking', () => {
    it('should track query performance metrics', async () => {
      const mockResult: QueryResult = {
        rows: [],
        rowCount: 0,
        command: 'SELECT',
      };

      mockNileClient.db.query.mockResolvedValue(mockResult);

      // Execute a few queries
      await databaseService.query('SELECT 1');
      await databaseService.query('SELECT 2');
      await databaseService.query('SELECT 3');

      const metrics = databaseService.getPerformanceMetrics();

      expect(metrics.queryCount).toBe(3);
      expect(metrics.totalTime).toBeGreaterThanOrEqual(0);
      expect(metrics.averageTime).toBeGreaterThanOrEqual(0);
    });

    it('should track slow queries', async () => {
      // Create a service with a very low threshold to trigger slow query tracking
      const slowService = new DatabaseService(mockNileClient as unknown as Server, 1);

      (mockNileClient.db.query as jest.Mock).mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              rows: [],
              rowCount: 0,
              command: 'SELECT',
            });
          }, 10); // Ensure it's slower than 1ms threshold
        });
      });

      await slowService.query('SELECT * FROM slow_table');

      const metrics = slowService.getPerformanceMetrics();
      expect(metrics.slowQueries.length).toBeGreaterThan(0);
    });

    it('should reset performance metrics', () => {
      const metrics = databaseService.getPerformanceMetrics();
      metrics.queryCount = 5; // Simulate some queries

      databaseService.resetPerformanceMetrics();

      const resetMetrics = databaseService.getPerformanceMetrics();
      expect(resetMetrics.queryCount).toBe(0);
      expect(resetMetrics.totalTime).toBe(0);
      expect(resetMetrics.averageTime).toBe(0);
      expect(resetMetrics.slowQueries).toEqual([]);
    });
  });

  describe('Connection Validation', () => {
    it('should validate connection successfully', async () => {
      const mockResult: QueryResult = {
        rows: [{ test: 1 }],
        rowCount: 1,
        command: 'SELECT',
      };

      mockNileClient.db.query.mockResolvedValue(mockResult);

      const isValid = await databaseService.validateConnection();

      expect(isValid).toBe(true);
      expect(mockNileClient.db.query).toHaveBeenCalledWith('SELECT 1 as test', undefined);
    });

    it('should handle connection validation failure', async () => {
      mockNileClient.db.query.mockRejectedValue(new Error('Connection failed'));

      const isValid = await databaseService.validateConnection();

      expect(isValid).toBe(false);
    });
  });

  describe('Performance Benchmark', () => {
    it('should run performance benchmark', async () => {
      mockNileClient.db.query.mockResolvedValueOnce({
        rows: [{ test: 1 }],
        rowCount: 1,
        command: 'SELECT',
      });

      const mockTestQueryPerformance = testQueryPerformance as jest.MockedFunction<typeof testQueryPerformance>;
      mockTestQueryPerformance.mockResolvedValue({
        averageResponseTime: 50,
        results: [
          { query: 'SELECT 1', responseTime: 50, success: true },
        ],
      });

      const benchmark = await databaseService.runPerformanceBenchmark();

      expect(benchmark.connectionTest).toBe(true);
      expect(benchmark.queryPerformance).toBeDefined();
      expect(benchmark.crossSchemaQueryTest.success).toBe(true);
      expect(benchmark.crossSchemaQueryTest.time).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Transaction Support', () => {
    it('should execute transaction callback', async () => {
      const mockResult: QueryResult = {
        rows: [{ id: 1 }],
        rowCount: 1,
        command: 'INSERT',
      };

      mockNileClient.db.query.mockResolvedValue(mockResult);

      const result = await databaseService.transaction(async (client) => {
        const insertResult = await client.query('INSERT INTO test (name) VALUES ($1)', ['test']);
        return insertResult.rows[0];
      });

      expect(result).toEqual({ id: 1 });
    });

    it('should execute transaction with tenant context', async () => {
      const mockResult: QueryResult = {
        rows: [{ id: 1 }],
        rowCount: 1,
        command: 'INSERT',
      };

      mockNileClient.db.query.mockResolvedValue(mockResult);

      const result = await databaseService.transaction(async (client) => {
        const insertResult = await client.query('INSERT INTO companies (name) VALUES ($1)', ['test']);
        return insertResult.rows[0];
      }, 'tenant-123');

      expect(result).toEqual({ id: 1 });
    });
  });

  describe('Factory Functions', () => {
    it('should create database service with factory function', () => {
      const service = createDatabaseService(mockNileClient as unknown as Server, 500);
      expect(service).toBeInstanceOf(DatabaseService);
    });

    it('should get singleton database service', () => {
      const service1 = getDatabaseService();
      const service2 = getDatabaseService();
      expect(service1).toBe(service2);
    });

    it('should reset singleton instance', () => {
      const service1 = getDatabaseService();
      resetDatabaseService();
      const service2 = getDatabaseService();
      expect(service1).not.toBe(service2);
    });
  });

  describe('Query Options', () => {
    it('should handle query options for getUserWithFullContext', async () => {
      const mockResult: QueryResult = {
        rows: [{ user_id: 'user-123' }],
        rowCount: 1,
        command: 'SELECT',
      };

      mockNileClient.db.query.mockResolvedValue(mockResult);

      await databaseService.getUserWithFullContext('user-123', {
        includeSoftDeleted: true,
        limit: 10,
        offset: 5,
      });

      expect(mockNileClient.db.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT 10'),
        ['user-123']
      );
    });

    it('should handle query options for getUserCompanyRelationships', async () => {
      mockNileClient.db.query.mockResolvedValue({
        rows: [],
        rowCount: 0,
        command: 'SELECT',
      });

      await databaseService.getUserCompanyRelationships('user-123', 'tenant-1', {
        orderBy: 'c.name ASC',
        limit: 20,
      });

      expect(mockNileClient.db.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY c.name ASC'),
        ['user-123', 'tenant-1']
      );
    });
  });
});
