/**
 * Tenant and Company Selection Component
 *
 * Provides UI for selecting tenant and company context using the enhanced
 * AuthContext and completed NileDB services.
 */

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTenantAccess, useCompanyAccess } from "@/hooks/useEnhancedAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Building2, Users, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface TenantCompanySelectorProps {
  showCompanySelector?: boolean;
  onTenantChange?: (tenantId: string | null) => void;
  onCompanyChange?: (companyId: string | null) => void;
  className?: string;
}

export const TenantCompanySelector = ({
  showCompanySelector = true,
  onTenantChange,
  onCompanyChange,
  className,
}: TenantCompanySelectorProps) => {
  const {
    userTenants,
    userCompanies,
    selectedTenantId,
    selectedCompanyId,
    setSelectedTenant,
    setSelectedCompany,
    refreshTenants,
    refreshCompanies,
    isStaff,
    loading,
  } = useAuth();

  const [refreshing, setRefreshing] = useState(false);

  const tenantAccess = useTenantAccess(selectedTenantId || undefined);
  const companyAccess = useCompanyAccess(
    selectedCompanyId || undefined,
    selectedTenantId || undefined
  );

  // Filter companies for selected tenant
  const tenantCompanies = userCompanies.filter(
    (company) => company.tenantId === selectedTenantId
  );

  const handleTenantChange = (tenantId: string) => {
    setSelectedTenant(tenantId);
    onTenantChange?.(tenantId);

    // Clear company selection when tenant changes
    setSelectedCompany(null);
    onCompanyChange?.(null);
  };

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompany(companyId);
    onCompanyChange?.(companyId);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshTenants(), refreshCompanies()]);
      toast.success("Context refreshed");
    } catch (error) {
      console.error("Failed to refresh context:", error);
      toast.error("Failed to refresh context");
    } finally {
      setRefreshing(false);
    }
  };

  // Auto-select first tenant if none selected
  useEffect(() => {
    if (!selectedTenantId && userTenants.length > 0) {
      setSelectedTenant(userTenants[0].id);
    }
  }, [userTenants, selectedTenantId, setSelectedTenant]);

  // Auto-select first company if none selected and tenant is selected
  useEffect(() => {
    if (selectedTenantId && !selectedCompanyId && tenantCompanies.length > 0) {
      setSelectedCompany(tenantCompanies[0].id);
    }
  }, [
    selectedTenantId,
    selectedCompanyId,
    tenantCompanies,
    setSelectedCompany,
  ]);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">
              Loading context...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Context Selection
          </CardTitle>
          <div className="flex items-center space-x-2">
            {isStaff && (
              <Badge variant="secondary" className="text-xs">
                Staff
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tenant Selection */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <label className="text-sm font-medium">Tenant</label>
          </div>

          {userTenants.length > 0 ? (
            <Select
              value={selectedTenantId || ""}
              onValueChange={handleTenantChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a tenant" />
              </SelectTrigger>
              <SelectContent>
                {userTenants.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{tenant.name}</span>
                      {tenant.id === selectedTenantId && tenantAccess.role && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {tenantAccess.role}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>No tenants available</span>
            </div>
          )}

          {tenantAccess.error && (
            <div className="flex items-center space-x-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{tenantAccess.error}</span>
            </div>
          )}
        </div>

        {/* Company Selection */}
        {showCompanySelector && selectedTenantId && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium">Company</label>
              </div>

              {tenantCompanies.length > 0 ? (
                <Select
                  value={selectedCompanyId || ""}
                  onValueChange={handleCompanyChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenantCompanies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{company.name}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {company.role}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>No companies available in this tenant</span>
                </div>
              )}

              {companyAccess.error && (
                <div className="flex items-center space-x-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>{companyAccess.error}</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Context Summary */}
        {selectedTenantId && (
          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground space-y-1">
              <div>
                Tenant:{" "}
                {userTenants.find((t) => t.id === selectedTenantId)?.name}
                {tenantAccess.role && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {tenantAccess.role}
                  </Badge>
                )}
              </div>
              {selectedCompanyId && (
                <div>
                  Company:{" "}
                  {
                    tenantCompanies.find((c) => c.id === selectedCompanyId)
                      ?.name
                  }
                  {companyAccess.role && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {companyAccess.role}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TenantCompanySelector;
