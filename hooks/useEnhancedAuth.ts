/**
 * Enhanced Authentication Hooks
 * 
 * Provides enhanced authentication hooks that integrate with the completed
 * NileDB services and API routes from Tasks 4, 5, 6, 8, and 9.
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

// Types for enhanced auth functionality

type ErrorType = 'authentication' | 'validation' | 'network' | 'unknown';
interface TenantAccessResult {
  hasAccess: boolean;
  role?: 'member' | 'admin' | 'owner';
  error?: string;
}

interface CompanyAccessResult {
  hasAccess: boolean;
  role?: 'member' | 'admin' | 'owner';
  permissions?: Record<string, unknown>;
  error?: string;
}

interface SystemHealthResult {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  details?: Record<string, unknown>;
  lastCheck?: Date;
}

/**
 * Hook for tenant access validation and management
 */
export const useTenantAccess = (tenantId?: string) => {
  const { isStaff, userTenants, selectedTenantId } = useAuth();
  const [accessResult, setAccessResult] = useState<TenantAccessResult>({
    hasAccess: false,
  });
  const [loading, setLoading] = useState(false);

  const checkTenantAccess = useCallback(async (targetTenantId?: string) => {
    const checkId = targetTenantId || tenantId || selectedTenantId;
    
    if (!checkId) {
      setAccessResult({ hasAccess: false, error: 'No tenant ID provided' });
      return;
    }

    setLoading(true);
    
    try {
      // Staff users have access to all tenants
      if (isStaff) {
        setAccessResult({ hasAccess: true, role: 'admin' });
        return;
      }

      // Check if user is member of tenant
      const userTenant = userTenants.find(t => t.id === checkId);
      if (userTenant) {
        setAccessResult({ hasAccess: true, role: 'member' });
        return;
      }

      // Test access via API
      const response = await fetch(`/api/test/tenant/${checkId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json() as { role?: 'member' | 'admin' | 'owner' };
        setAccessResult({
          hasAccess: true,
          role: data.role || 'member',
        });
      } else {
        setAccessResult({
          hasAccess: false,
          error: response.status === 403 ? 'Access denied' : 'Tenant not found',
        });
      }
    } catch (error) {
      console.error('Failed to check tenant access:', error);
      setAccessResult({
        hasAccess: false,
        error: 'Failed to verify access',
      });
    } finally {
      setLoading(false);
    }
  }, [tenantId, selectedTenantId, isStaff, userTenants]);

  useEffect(() => {
    if (tenantId || selectedTenantId) {
      checkTenantAccess();
    }
  }, [tenantId, selectedTenantId, checkTenantAccess]);

  return {
    ...accessResult,
    loading,
    checkAccess: checkTenantAccess,
  };
};

/**
 * Hook for company access validation and management
 */
export const useCompanyAccess = (companyId?: string, tenantId?: string) => {
  const { isStaff, userCompanies, selectedCompanyId, selectedTenantId } = useAuth();
  const [accessResult, setAccessResult] = useState<CompanyAccessResult>({
    hasAccess: false,
  });
  const [loading, setLoading] = useState(false);

  const checkCompanyAccess = useCallback(async (
    targetCompanyId?: string,
    targetTenantId?: string
  ) => {
    const checkCompanyId = targetCompanyId || companyId || selectedCompanyId;
    const checkTenantId = targetTenantId || tenantId || selectedTenantId;
    
    if (!checkCompanyId || !checkTenantId) {
      setAccessResult({ 
        hasAccess: false, 
        error: 'Company ID and Tenant ID required' 
      });
      return;
    }

    setLoading(true);
    
    try {
      // Staff users have access to all companies
      if (isStaff) {
        setAccessResult({ hasAccess: true, role: 'admin' });
        return;
      }

      // Check if user has access to company
      const userCompany = userCompanies.find(c => 
        c.id === checkCompanyId && c.tenantId === checkTenantId
      );
      
      if (userCompany) {
        setAccessResult({
          hasAccess: true,
          role: userCompany.role,
          permissions: userCompany.permissions,
        });
        return;
      }

      // Test access via API (company endpoint will validate tenant access)
      const response = await fetch(
        `/api/tenants/${checkTenantId}/companies/${checkCompanyId}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (response.ok) {
        setAccessResult({ hasAccess: true, role: 'member' });
      } else {
        setAccessResult({
          hasAccess: false,
          error: response.status === 403 ? 'Access denied' : 'Company not found',
        });
      }
    } catch (error) {
      console.error('Failed to check company access:', error);
      setAccessResult({
        hasAccess: false,
        error: 'Failed to verify access',
      });
    } finally {
      setLoading(false);
    }
  }, [companyId, tenantId, selectedCompanyId, selectedTenantId, isStaff, userCompanies]);

  useEffect(() => {
    if ((companyId || selectedCompanyId) && (tenantId || selectedTenantId)) {
      checkCompanyAccess();
    }
  }, [companyId, tenantId, selectedCompanyId, selectedTenantId, checkCompanyAccess]);

  return {
    ...accessResult,
    loading,
    checkAccess: checkCompanyAccess,
  };
};

/**
 * Hook for staff-only functionality
 */
export const useStaffAccess = () => {
  const { isStaff, nileUser } = useAuth();
  const [systemHealth, setSystemHealth] = useState<SystemHealthResult>({
    status: 'unknown',
  });
  const [loading, setLoading] = useState(false);

  const checkSystemHealth = useCallback(async () => {
    if (!isStaff) {
      toast.error('Staff access required');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/admin/health', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json() as Record<string, unknown>;
        setSystemHealth({
          status: 'healthy',
          details: data,
          lastCheck: new Date(),
        });
      } else {
        setSystemHealth({
          status: 'degraded',
          lastCheck: new Date(),
        });
      }
    } catch (error) {
      console.error('Failed to check system health:', error);
      setSystemHealth({
        status: 'unhealthy',
        lastCheck: new Date(),
      });
    } finally {
      setLoading(false);
    }
  }, [isStaff]);

  const getMonitoringData = useCallback(async () => {
    if (!isStaff) {
      toast.error('Staff access required');
      return null;
    }

    try {
      const response = await fetch('/api/admin/monitoring', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        return await response.json();
      } else {
        toast.error('Failed to fetch monitoring data');
        return null;
      }
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
      toast.error('Failed to fetch monitoring data');
      return null;
    }
  }, [isStaff]);

  return {
    isStaff,
    staffUser: nileUser?.profile?.isPenguinMailsStaff ? nileUser : null,
    systemHealth,
    loading,
    checkSystemHealth,
    getMonitoringData,
  };
};

/**
 * Hook for error recovery and user-friendly error handling
 */
export const useErrorRecovery = () => {
  const { error: authError, clearError, refreshUserData } = useAuth();
  const [localError, setLocalError] = useState<Error | null>(null);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);
  const [recovering, setRecovering] = useState(false);

  const currentError = localError || authError;

  const recoverFromError = useCallback(async () => {
    if (!currentError) return;

    setRecovering(true);
    
    try {
      // Clear the error first
      clearError();
      
      // Try to refresh user data
      await refreshUserData();
      
      toast.success('Connection restored');
    } catch (recoveryError) {
      console.error('Failed to recover from error:', recoveryError);
      toast.error('Failed to restore connection. Please refresh the page.');
    } finally {
      setRecovering(false);
    }
  }, [currentError, clearError, refreshUserData]);

  const classifyError = useCallback((err: Error, type: ErrorType): ErrorType => {
    // Override with provided type, or classify based on message
    if (type) return type;
    if (err.message.includes('auth') || err.message.includes('login')) return 'authentication';
    if (err.message.includes('valid') || err.message.includes('required')) return 'validation';
    if (err.message.includes('network') || err.message.includes('connect')) return 'network';
    return 'unknown';
  }, []);

  const reportError = useCallback((err: Error, type: ErrorType = 'unknown') => {
    setLocalError(err);
    setErrorType(classifyError(err, type));
    toast.error(`Error: ${err.message}`);
  }, [classifyError]);

  const clearErrorHandler = useCallback(() => {
    setLocalError(null);
    setErrorType(null);
    clearError();
  }, [clearError]);

  const getErrorMessage = useCallback((err: Error | null): string => {
    if (!err) return '';

    const message = err.message;

    // Handle specific error types with user-friendly messages
    if (message.includes('Authentication required')) {
      return 'Please sign in to continue';
    }
    
    if (message.includes('Session expired')) {
      return 'Your session has expired. Please sign in again.';
    }
    
    if (message.includes('Access denied')) {
      return 'You do not have permission to access this resource';
    }
    
    if (message.includes('Network')) {
      return 'Network connection issue. Please check your internet connection.';
    }
    
    return message || 'An unexpected error occurred';
  }, []);

  return {
    error: currentError,
    errorType,
    errorMessage: getErrorMessage(currentError),
    recovering,
    canRecover: !!currentError,
    recoverFromError,
    clearError: clearErrorHandler,
    reportError,
  };
};

/**
 * Hook for performance monitoring and optimization
 */
export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<{
    requestCount: number;
    averageResponseTime: number;
    errorRate: number;
  }>({
    requestCount: 0,
    averageResponseTime: 0,
    errorRate: 0,
  });

  const trackRequest = useCallback((responseTime: number, success: boolean) => {
    setMetrics(prev => ({
      requestCount: prev.requestCount + 1,
      averageResponseTime: (prev.averageResponseTime * (prev.requestCount - 1) + responseTime) / prev.requestCount,
      errorRate: success 
        ? (prev.errorRate * (prev.requestCount - 1)) / prev.requestCount
        : (prev.errorRate * (prev.requestCount - 1) + 1) / prev.requestCount,
    }));
  }, []);

  return {
    metrics,
    trackRequest,
  };
};
