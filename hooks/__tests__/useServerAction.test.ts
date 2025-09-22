import { renderHook, act } from '@testing-library/react';
import { useServerAction, useServerActionWithParams } from '../useServerAction';
import type { ActionResult, ActionError } from '@/lib/actions/core/types';

// Mock console methods to avoid noise in tests
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('useServerAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('Basic functionality', () => {
    it('should initialize with default state', () => {
      const mockAction = jest.fn();
      const { result } = renderHook(() => useServerAction(mockAction));

      expect(result.current.data).toBeUndefined();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toContain('Test error');
    });

    it('should handle successful action execution', async () => {
      const mockData = { id: 1, name: 'Test' };
      const mockAction = jest.fn().mockResolvedValue({
        success: true,
        data: mockData,
      } as ActionResult<typeof mockData>);

      const { result } = renderHook(() => useServerAction(mockAction));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeUndefined();
      expect(mockAction).toHaveBeenCalledTimes(1);
    });

    it('should handle action failure with error result', async () => {
      const error: ActionError = {
        type: 'server',
        message: 'Something went wrong',
        code: 'TEST_ERROR',
      };
      const mockAction = jest.fn().mockResolvedValue({
        success: false,
        error,
        field: 'testField',
      } as ActionResult<unknown>);

      const { result } = renderHook(() => useServerAction(mockAction));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toBe('Something went wrong');
      expect(result.current.error?.code).toBe('TEST_ERROR');
      expect(result.current.error?.field).toBe('testField');
    });

    it('should handle action rejection with exception', async () => {
      const error: ActionError = {
        type: 'server',
        message: 'Test error',
      };
      const mockAction = jest.fn().mockRejectedValue(new Error(error.message));

      const { result } = renderHook(() => useServerAction(mockAction));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Network error');
    });

    it('should handle non-Error exceptions', async () => {
      const mockAction = jest.fn().mockRejectedValue('String error');

      const { result } = renderHook(() => useServerAction(mockAction));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.error).toBe('An unexpected error occurred');
    });

    it('should set loading state during execution', async () => {
      let resolveAction: (value: ActionResult<unknown>) => void;
      const mockAction = jest.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          resolveAction = resolve;
        });
      });

      const { result } = renderHook(() => useServerAction(mockAction));

      act(() => {
        result.current.execute();
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolveAction({ success: true, data: {} });
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('Callback options', () => {
    it('should call onSuccess callback on successful execution', async () => {
      const onSuccess = jest.fn();
      const mockAction = jest.fn<Promise<ActionResult<Record<string, never>>>, []>().mockResolvedValue({
        success: true,
        data: {},
      } as const);

      const { result } = renderHook(() => 
        useServerAction(mockAction, { onSuccess })
      );

      await act(async () => {
        await result.current.execute();
      });

      expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it('should call onError callback on failed execution', async () => {
      const onError = jest.fn();
      const mockAction = jest.fn<Promise<ActionResult<unknown>>, []>().mockResolvedValue({
        success: false,
        error: 'Test error',
      } as const);

      const { result } = renderHook(() => 
        useServerAction(mockAction, { onError })
      );

      await act(async () => {
        await result.current.execute();
      });

      expect(onError).toHaveBeenCalledWith('Test error');
    });

    it('should call onError callback on exception', async () => {
      const onError = jest.fn();
      const mockAction = jest.fn<Promise<ActionResult<unknown>>, []>().mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => 
        useServerAction(mockAction, { onError })
      );

      await act(async () => {
        await result.current.execute();
      });

      expect(onError).toHaveBeenCalledWith('Network error');
    });
  });

  describe('Retry functionality', () => {
    it('should retry failed actions', async () => {
      const mockAction = jest.fn()
        .mockResolvedValueOnce({
          success: false,
          error: 'First failure',
        })
        .mockResolvedValueOnce({
          success: true,
          data: { success: true },
        });

      const { result } = renderHook(() => 
        useServerAction(mockAction, { retryDelay: 0 })
      );

      // First execution fails
      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.error).toBe('First failure');
      expect(result.current.canRetry).toBe(true);

      // Retry succeeds
      await act(async () => {
        await result.current.retry();
      });

      expect(result.current.data).toEqual({ success: true });
      expect(result.current.error).toBeNull();
      expect(mockAction).toHaveBeenCalledTimes(2);
    });

    it('should respect maxRetries limit', async () => {
      const mockAction = jest.fn().mockResolvedValue({
        success: false,
        error: 'Always fails',
      });

      const { result } = renderHook(() => 
        useServerAction(mockAction, { maxRetries: 2, retryDelay: 0 })
      );

      // Initial execution
      await act(async () => {
        await result.current.execute();
      });

      // First retry
      await act(async () => {
        await result.current.retry();
      });

      expect(result.current.canRetry).toBe(true);

      // Second retry
      await act(async () => {
        await result.current.retry();
      });

      expect(result.current.canRetry).toBe(false);

      // Third retry should not execute
      await act(async () => {
        await result.current.retry();
      });

      expect(mockAction).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should reset retry count on successful execution', async () => {
      const mockAction = jest.fn()
        .mockResolvedValueOnce({
          success: false,
          error: 'First failure',
        })
        .mockResolvedValueOnce({
          success: true,
          data: { success: true },
        });

      const { result } = renderHook(() => 
        useServerAction(mockAction, { retryDelay: 0 })
      );

      // First execution fails
      await act(async () => {
        await result.current.execute();
      });

      // Retry succeeds
      await act(async () => {
        await result.current.retry();
      });

      // Should be able to retry again after success
      expect(result.current.canRetry).toBe(true);
    });

    it('should handle retry delay', async () => {
      const mockAction = jest.fn().mockResolvedValue({
        success: false,
        error: 'Always fails',
      });

      const { result } = renderHook(() => 
        useServerAction(mockAction, { retryDelay: 100 })
      );

      await act(async () => {
        await result.current.execute();
      });

      const startTime = Date.now();
      
      await act(async () => {
        await result.current.retry();
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeGreaterThanOrEqual(90); // Allow some tolerance
    });
  });

  describe('Reset functionality', () => {
    it('should reset state to initial values', async () => {
      const error: ActionError = {
        type: 'server',
        message: 'Test error',
      };
      const errorWithCode: ActionError = {
        ...error,
        code: 'TEST_CODE',
      };
      const mockAction = jest.fn().mockResolvedValue({
        success: false,
        error: errorWithCode,
      });

      const { result } = renderHook(() => useServerAction(mockAction));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.code).toBeUndefined();
      expect(result.current.canRetry).toBe(true);
    });
  });
});

describe('useServerActionWithParams', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should execute action with parameters', async () => {
      const mockData = { id: 1, name: 'Test' };
      const mockAction = jest.fn().mockResolvedValue({
        success: true,
        data: mockData,
      });

      const { result } = renderHook(() => useServerActionWithParams(mockAction));

      const params = { userId: '123' };

      await act(async () => {
        await result.current.execute(params);
      });

      expect(result.current.data).toEqual(mockData);
      expect(mockAction).toHaveBeenCalledWith(params);
    });

    it('should retry with last used parameters', async () => {
      const mockAction = jest.fn()
        .mockResolvedValueOnce({
          success: false,
          error: 'First failure',
        })
        .mockResolvedValueOnce({
          success: true,
          data: { success: true },
        });

      const { result } = renderHook(() => 
        useServerActionWithParams(mockAction, { retryDelay: 0 })
      );

      const params = { userId: '123' };

      // First execution fails
      await act(async () => {
        await result.current.execute(params);
      });

      expect(result.current.canRetry).toBe(true);

      // Retry with same parameters
      await act(async () => {
        await result.current.retry();
      });

      expect(mockAction).toHaveBeenCalledTimes(2);
      expect(mockAction).toHaveBeenNthCalledWith(1, params);
      expect(mockAction).toHaveBeenNthCalledWith(2, params);
    });

    it('should not allow retry without previous execution', () => {
      const mockAction = jest.fn();
      const { result } = renderHook(() => useServerActionWithParams(mockAction));

      expect(result.current.canRetry).toBe(false);
    });

    it('should reset last parameters on reset', async () => {
      const mockAction = jest.fn().mockResolvedValue({
        success: true,
        data: {},
      });

      const { result } = renderHook(() => useServerActionWithParams(mockAction));

      await act(async () => {
        await result.current.execute({ userId: '123' });
      });

      expect(result.current.canRetry).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.canRetry).toBe(false);
    });
  });

  describe('Parameter handling', () => {
    it('should handle different parameter types', async () => {
      const mockAction = jest.fn().mockResolvedValue({
        success: true,
        data: {},
      });

      const { result } = renderHook(() => useServerActionWithParams(mockAction));

      const complexParams = {
        userId: '123',
        filters: { status: 'active' },
        options: { limit: 10, offset: 0 },
      };

      await act(async () => {
        await result.current.execute(complexParams);
      });

      expect(mockAction).toHaveBeenCalledWith(complexParams);
    });

    it('should update parameters on subsequent executions', async () => {
      const mockAction = jest.fn().mockResolvedValue({
        success: true,
        data: {},
      });

      const { result } = renderHook(() => useServerActionWithParams(mockAction));

      const firstParams = { userId: '123' };
      const secondParams = { userId: '456' };

      await act(async () => {
        await result.current.execute(firstParams);
      });

      await act(async () => {
        await result.current.execute(secondParams);
      });

      expect(mockAction).toHaveBeenCalledTimes(2);
      expect(mockAction).toHaveBeenNthCalledWith(1, firstParams);
      expect(mockAction).toHaveBeenNthCalledWith(2, secondParams);
    });
  });
});
