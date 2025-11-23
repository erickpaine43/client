/**
 * Authentication Demo Component
 *
 * Demonstrates the enhanced authentication system integration with
 * completed NileDB services and API routes.
 */

"use client";

import { useAuth } from "@/context/AuthContext";
import {
  useTenantAccess,
  useCompanyAccess,
  useStaffAccess,
  useErrorRecovery,
} from "@/hooks/useEnhancedAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Building2,
  Users,
  Shield,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import TenantCompanySelector from "./TenantCompanySelector";

export const AuthDemo = () => {
  const {
    user,
    nileUser,
    loading,
    isStaff,
    userTenants,
    userCompanies,
    selectedTenantId,
    selectedCompanyId,
    refreshProfile,
    refreshTenants,
    refreshCompanies,
  } = useAuth();

  const tenantAccess = useTenantAccess(selectedTenantId || undefined);
  const companyAccess = useCompanyAccess(
    selectedCompanyId || undefined,
    selectedTenantId || undefined
  );
  const staffAccess = useStaffAccess();
  const errorRecovery = useErrorRecovery();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading authentication data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <User className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium">Not Authenticated</h3>
              <p className="text-muted-foreground">
                Please sign in to view authentication demo
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>User Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <strong>Email:</strong> {user.email}
            </div>
            <div>
              <strong>Name:</strong> {user.displayName}
            </div>
            <div>
              <strong>Role:</strong>
              <Badge variant="outline" className="ml-2">
                {nileUser?.profile?.role || "user"}
              </Badge>
            </div>
            {isStaff && (
              <div>
                <Badge variant="secondary">
                  <Shield className="h-3 w-3 mr-1" />
                  Staff User
                </Badge>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={refreshProfile}
              className="w-full mt-2"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Refresh Profile
            </Button>
          </CardContent>
        </Card>

        {/* Tenant Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Tenants ({userTenants.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {userTenants.length > 0 ? (
              <>
                {userTenants.slice(0, 3).map((tenant) => (
                  <div
                    key={tenant.id}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{tenant.name}</span>
                    {tenant.id === selectedTenantId && (
                      <Badge variant="default" className="text-xs">
                        Selected
                      </Badge>
                    )}
                  </div>
                ))}
                {userTenants.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{userTenants.length - 3} more
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                No tenants available
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={refreshTenants}
              className="w-full mt-2"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Refresh Tenants
            </Button>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Companies ({userCompanies.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {userCompanies.length > 0 ? (
              <>
                {userCompanies.slice(0, 3).map((company) => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{company.name}</span>
                    <div className="flex items-center space-x-1">
                      <Badge variant="outline" className="text-xs">
                        {company.role}
                      </Badge>
                      {company.id === selectedCompanyId && (
                        <Badge variant="default" className="text-xs">
                          Selected
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
                {userCompanies.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{userCompanies.length - 3} more
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                No companies available
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={refreshCompanies}
              className="w-full mt-2"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Refresh Companies
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Access Control Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Tenant Access Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {selectedTenantId ? (
              <>
                <div className="flex items-center space-x-2">
                  {tenantAccess.hasAccess ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    {tenantAccess.hasAccess
                      ? "Access Granted"
                      : "Access Denied"}
                  </span>
                  {tenantAccess.role && (
                    <Badge variant="outline" className="text-xs">
                      {tenantAccess.role}
                    </Badge>
                  )}
                </div>
                {tenantAccess.error && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{tenantAccess.error}</AlertDescription>
                  </Alert>
                )}
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                No tenant selected
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company Access Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {selectedCompanyId && selectedTenantId ? (
              <>
                <div className="flex items-center space-x-2">
                  {companyAccess.hasAccess ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    {companyAccess.hasAccess
                      ? "Access Granted"
                      : "Access Denied"}
                  </span>
                  {companyAccess.role && (
                    <Badge variant="outline" className="text-xs">
                      {companyAccess.role}
                    </Badge>
                  )}
                </div>
                {companyAccess.error && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{companyAccess.error}</AlertDescription>
                  </Alert>
                )}
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                No company selected
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Staff Dashboard Access */}
      {isStaff && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Staff Access</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Staff privileges enabled</span>
            </div>
            <div className="flex items-center space-x-2">
              {staffAccess.systemHealth.status === "healthy" ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : staffAccess.systemHealth.status === "degraded" ? (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">
                System Health: {staffAccess.systemHealth.status}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={staffAccess.checkSystemHealth}
              disabled={staffAccess.loading}
            >
              <RefreshCw
                className={`h-3 w-3 mr-2 ${staffAccess.loading ? "animate-spin" : ""}`}
              />
              Check System Health
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Error Recovery */}
      {errorRecovery.error && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{errorRecovery.errorMessage}</span>
            {errorRecovery.canRecover && (
              <Button
                variant="outline"
                size="sm"
                onClick={errorRecovery.recoverFromError}
                disabled={errorRecovery.recovering}
              >
                <RefreshCw
                  className={`h-3 w-3 mr-2 ${errorRecovery.recovering ? "animate-spin" : ""}`}
                />
                Retry
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Tenant/Company Selector */}
      <TenantCompanySelector />
    </div>
  );
};

export default AuthDemo;
