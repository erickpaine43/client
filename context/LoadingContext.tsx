"use client";
import { createContext, useContext, useState, useCallback } from "react";
import { AnalyticsLoadingState, AnalyticsDomain } from "@/types/analytics/ui";

interface LoadingContextState {
  // Loading and Error State Management per Domain
  loadingState: AnalyticsLoadingState;
  setDomainLoading: (domain: AnalyticsDomain, loading: boolean) => void;
  setDomainError: (domain: AnalyticsDomain, error: string | null) => void;
  clearAllErrors: () => void;
  setGlobalLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextState | undefined>(
  undefined
);

function LoadingProvider({ children }: { children: React.ReactNode }) {
  // Loading and Error State Management per Domain
  const [loadingState, setLoadingState] = useState<AnalyticsLoadingState>({
    domains: {
      campaigns: false,
      domains: false,
      mailboxes: false,
      crossDomain: false,
      leads: false,
      templates: false,
      billing: false,
    },
    errors: {
      campaigns: null,
      domains: null,
      mailboxes: null,
      crossDomain: null,
      leads: null,
      templates: null,
      billing: null,
    },
    isLoading: false,
    hasErrors: false,
  });

  // Set domain loading state
  const setDomainLoading = useCallback(
    (domain: AnalyticsDomain, loading: boolean) => {
      setLoadingState((prev) => {
        const newDomains = { ...prev.domains, [domain]: loading };
        const isLoading = Object.values(newDomains).some(Boolean);

        return {
          ...prev,
          domains: newDomains,
          isLoading,
        };
      });
    },
    []
  );

  // Set domain error state
  const setDomainError = useCallback(
    (domain: AnalyticsDomain, error: string | null) => {
      setLoadingState((prev) => {
        const newErrors = { ...prev.errors, [domain]: error };
        const hasErrors = Object.values(newErrors).some(Boolean);

        return {
          ...prev,
          errors: newErrors,
          hasErrors,
        };
      });
    },
    []
  );

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    setLoadingState((prev) => ({
      ...prev,
      errors: {
        campaigns: null,
        domains: null,
        mailboxes: null,
        crossDomain: null,
        leads: null,
        templates: null,
        billing: null,
      },
      hasErrors: false,
    }));
  }, []);

  // Set global loading state
  const setGlobalLoading = useCallback((loading: boolean) => {
    setLoadingState((prev) => ({
      ...prev,
      isLoading: loading,
    }));
  }, []);

  return (
    <LoadingContext.Provider
      value={{
        loadingState,
        setDomainLoading,
        setDomainError,
        clearAllErrors,
        setGlobalLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

/**
 * Hook to access the loading context.
 */
function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}

/**
 * Hook for domain-specific loading operations.
 */
function useDomainLoading(domain: AnalyticsDomain) {
  const { loadingState, setDomainLoading, setDomainError } = useLoading();

  const executeWithErrorHandling = useCallback(
    async function <T>(operation: () => Promise<T>): Promise<T | null> {
      try {
        setDomainLoading(domain, true);
        const result = await operation();
        setDomainError(domain, null);
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Operation failed";
        setDomainError(domain, errorMessage);
        console.error(`Domain ${domain} operation failed:`, error);
        return null;
      } finally {
        setDomainLoading(domain, false);
      }
    },
    [domain, setDomainLoading, setDomainError]
  );

  return {
    loading: loadingState.domains[domain],
    error: loadingState.errors[domain],
    executeWithErrorHandling,
  };
}

export { LoadingProvider, useLoading, useDomainLoading };
