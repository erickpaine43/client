/**
 * Staff Dashboard Component
 *
 * Provides staff-only functionality using the completed admin API routes
 * and monitoring system from Tasks 8 and 9.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useStaffAccess } from "@/hooks/useEnhancedAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Activity,
  Users,
  Building2,
  Database,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  Clock,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

interface SystemMetrics {
  performance: {
    requestsPerMinute: number;
    averageResponseTime: number;
    errorRate: number;
  };
  database: {
    connectionCount: number;
    queryPerformance: number;
    healthStatus: "healthy" | "degraded" | "unhealthy";
  };
  users: {
    activeUsers: number;
    totalUsers: number;
    staffUsers: number;
  };
  tenants: {
    totalTenants: number;
    activeTenants: number;
  };
  companies: {
    totalCompanies: number;
    activeCompanies: number;
  };
}

interface AlertRule {
  id: string;
  name: string;
  severity: "low" | "medium" | "high" | "critical";
  enabled: boolean;
  lastTriggered?: Date;
}

export const StaffDashboard = () => {
  const { isStaff, nileUser } = useAuth();
  const { systemHealth, checkSystemHealth, getMonitoringData } =
    useStaffAccess();

  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchSystemData = useCallback(async () => {
    if (!isStaff) return;

    setLoading(true);
    try {
      await checkSystemHealth();
      const monitoringData = await getMonitoringData();
      if (monitoringData && typeof monitoringData === "object") {
        const data = monitoringData as {
          metrics?: SystemMetrics;
          alerts?: AlertRule[];
        };
        if (data.metrics) setMetrics(data.metrics);
        if (data.alerts) setAlerts(data.alerts);
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to fetch system data:", error);
      toast.error("Failed to fetch system data");
    } finally {
      setLoading(false);
    }
  }, [isStaff, checkSystemHealth, getMonitoringData]);

  const refreshData = () => {
    fetchSystemData();
  };

  useEffect(() => {
    if (isStaff) {
      fetchSystemData();

      // Set up auto-refresh every 30 seconds
      const interval = setInterval(fetchSystemData, 30000);
      return () => clearInterval(interval);
    }
  }, [isStaff, fetchSystemData]);

  if (!isStaff) {
    return (
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Staff access required to view this dashboard.
        </AlertDescription>
      </Alert>
    );
  }

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "unhealthy":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Staff Dashboard</h1>
          <p className="text-muted-foreground">
            System monitoring and administration
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">
            Staff: {nileUser?.name || nileUser?.email}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {getHealthStatusIcon(systemHealth.status)}
              <div>
                <p className="text-sm font-medium">System Health</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {systemHealth.status}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {metrics && (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Requests/Min</p>
                    <p className="text-xs text-muted-foreground">
                      {metrics.performance.requestsPerMinute.toFixed(1)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Avg Response</p>
                    <p className="text-xs text-muted-foreground">
                      {metrics.performance.averageResponseTime.toFixed(0)}ms
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-sm font-medium">Error Rate</p>
                    <p className="text-xs text-muted-foreground">
                      {(metrics.performance.errorRate * 100).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Detailed Metrics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5" />
                    <span>Database</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Status:</span>
                    <div className="flex items-center space-x-1">
                      {getHealthStatusIcon(metrics.database.healthStatus)}
                      <span className="text-sm capitalize">
                        {metrics.database.healthStatus}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Connections:</span>
                    <span className="text-sm">
                      {metrics.database.connectionCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Query Performance:</span>
                    <span className="text-sm">
                      {metrics.database.queryPerformance}ms
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Users</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Users:</span>
                    <span className="text-sm">{metrics.users.totalUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Active Users:</span>
                    <span className="text-sm">{metrics.users.activeUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Staff Users:</span>
                    <span className="text-sm">{metrics.users.staffUsers}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5" />
                    <span>Organizations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Tenants:</span>
                    <span className="text-sm">
                      {metrics.tenants.totalTenants}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Active Tenants:</span>
                    <span className="text-sm">
                      {metrics.tenants.activeTenants}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Companies:</span>
                    <span className="text-sm">
                      {metrics.companies.totalCompanies}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                User management functionality will be implemented here. This
                will use the /api/admin/users endpoints.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tenants">
          <Card>
            <CardHeader>
              <CardTitle>Tenant Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Tenant management functionality will be implemented here. This
                will use the /api/admin/tenants endpoints.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>System Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length > 0 ? (
                <div className="space-y-2">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant={getSeverityColor(alert.severity)}
                        >
                          {alert.severity}
                        </Badge>
                        <span className="font-medium">{alert.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={alert.enabled ? "default" : "secondary"}
                        >
                          {alert.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                        {alert.lastTriggered && (
                          <span className="text-xs text-muted-foreground">
                            Last: {alert.lastTriggered.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No alerts configured.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      {lastUpdate && (
        <div className="text-xs text-muted-foreground text-center">
          Last updated: {lastUpdate.toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
