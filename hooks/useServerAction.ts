import { useState, useCallback } from "react";

export type ActionResult<T> = 
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
      code?: string;
      field?: string;
    };

export interface ServerActionState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  code?: string;
  field?: string;
}

export interface UseServerActionOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  retryDelay?: number;
  maxRetries?: number;
}

export function useServerAction<T>(
  action: () => Promise<ActionResult<T>>,
  options: UseServerActionOptions = {}
) {
  const [state, setState] = useState<ServerActionState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const [retryCount, setRetryCount] = useState(0);

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await action();

      if (result.success) {
        setState({
          data: result.data,
          loading: false,
          error: null,
        });
        setRetryCount(0);
        options.onSuccess?.();
      } else {
        setState({
          data: null,
          loading: false,
          error: result.error,
          code: result.code,
          field: result.field,
        });
        options.onError?.(result.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
      options.onError?.(errorMessage);
    }
  }, [action, options]);

  const retry = useCallback(async () => {
    const maxRetries = options.maxRetries || 3;
    const retryDelay = options.retryDelay || 1000;

    if (retryCount >= maxRetries) {
      return;
    }

    setRetryCount(prev => prev + 1);
    
    if (retryDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
    
    await execute();
  }, [execute, retryCount, options.maxRetries, options.retryDelay]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
    setRetryCount(0);
  }, []);

  return {
    ...state,
    execute,
    retry,
    reset,
    canRetry: retryCount < (options.maxRetries || 3),
  };
}

export function useServerActionWithParams<T, P>(
  action: (params: P) => Promise<ActionResult<T>>,
  options: UseServerActionOptions = {}
) {
  const [state, setState] = useState<ServerActionState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const [retryCount, setRetryCount] = useState(0);
  const [lastParams, setLastParams] = useState<P | null>(null);

  const execute = useCallback(async (params: P) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    setLastParams(params);

    try {
      const result = await action(params);

      if (result.success) {
        setState({
          data: result.data,
          loading: false,
          error: null,
        });
        setRetryCount(0);
        options.onSuccess?.();
      } else {
        setState({
          data: null,
          loading: false,
          error: result.error,
          code: result.code,
          field: result.field,
        });
        options.onError?.(result.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
      options.onError?.(errorMessage);
    }
  }, [action, options]);

  const retry = useCallback(async () => {
    if (!lastParams) return;

    const maxRetries = options.maxRetries || 3;
    const retryDelay = options.retryDelay || 1000;

    if (retryCount >= maxRetries) {
      return;
    }

    setRetryCount(prev => prev + 1);
    
    if (retryDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
    
    await execute(lastParams);
  }, [execute, lastParams, retryCount, options.maxRetries, options.retryDelay]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
    setRetryCount(0);
    setLastParams(null);
  }, []);

  return {
    ...state,
    execute,
    retry,
    reset,
    canRetry: retryCount < (options.maxRetries || 3) && lastParams !== null,
  };
}
