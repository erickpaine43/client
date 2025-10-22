// ============================================================================
// MONITORING DASHBOARD - Analytics monitoring and alerting dashboard
// ============================================================================

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Database,
  Minus,
  RefreshCw,
} from "lucide-react";

interface ApiResponse {
  success: boolean;
  data?: MonitoringData;
  error?: string;
}

interface MonitoringData {
  analytics: {
    overview: {
      totalOperations: number;
      successRate: number;
      averageDuration: number;
      activeAlerts: number;
    };
    domains: Record<string, {
      operationCount: number;
      successRate: number;
      averageDuration: number;
      errorRate: number;
      cacheHitRate: number;
    }>;
  };
  cache: {
    health: {
      isAvailable: boolean;
      hitRate: number;
      averageHitTime: number;
      totalRequests: number;
    };
    alerts: Array<{
      type: string;
      message: string;
      severity: "warning" | "error";
    }>;
  };
  errors: {
    statistics: {
      totalErrors: number;
      errorRate: number;
      errorsByDomain: Record<string, number>;
    };
    criticalErrors: Array<{
      id: string;
      message: string;
      domain: string;
      timestamp: string;
    }>;
    healthScore: number;
  };
  summary: {
    overallHealth: "healthy" | "degraded" | "unhealthy";
    totalAlerts: number;
    criticalIssues: number;
    systemStatus: Record<string, boolean>;
  };
}

export function MonitoringDashboard() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/analytics/monitoring?action=dashboard");
      const result: ApiResponse = await response.json();

      if (result.success && result.data) {
        setData(result.data);
        setError(null);
        setLastUpdated(new Date());
      } else {
        setError(result.error || "Failed to fetch monitoring data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMonitoringData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getHealthIcon = (health: string) => {
    switch (health) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "unhealthy":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case "healthy":
        return "text-green-600 bg-green-50 border-green-200";
      case "degraded":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "unhealthy":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading monitoring data...
      </div>
    );
  }

  if (error && !data) {
    return (
      <Alert className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <div className="p-4">
        <p>No monitoring data available</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Monitoring</h1>
          <p className="text-muted-foreground">
            System health and performance monitoring
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {lastUpdated && (
            <span className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button onClick={fetchMonitoringData} disabled={loading} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Health Status */}
      <Card className={`border-2 ${getHealthColor(data.summary.overallHealth)}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getHealthIcon(data.summary.overallHealth)}
              <CardTitle className="capitalize">
                System {data.summary.overallHealth}
              </CardTitle>
            </div>
            <Badge variant={data.summary.criticalIssues > 0 ? "destructive" : "secondary"}>
              {data.summary.criticalIssues} Critical Issues
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{data.analytics.overview.totalOperations}</div>
              <div className="text-sm text-muted-foreground">Total Operations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatPercentage(data.analytics.overview.successRate)}</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatDuration(data.analytics.overview.averageDuration)}</div>
              <div className="text-sm text-muted-foreground">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{formatPercentage(data.cache.health.hitRate)}</div>
              <div className="text-sm text-muted-foreground">Cache Hit Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {(data.summary.totalAlerts > 0 || data.errors.criticalErrors.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
              Active Alerts ({data.summary.totalAlerts})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.errors.criticalErrors.map((error) => (
              <Alert key={error.id} className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-500" />
                <AlertTitle>Critical Error in {error.domain}</AlertTitle>
                <AlertDescription>
                  {error.message}
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(error.timestamp).toLocaleString()}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
            
            {data.cache.alerts.map((alert, index) => (
              <Alert key={index} className={alert.severity === "error" ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"}>
                {alert.severity === "error" ? 
                  <XCircle className="h-4 w-4 text-red-500" /> : 
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                }
                <AlertTitle>{alert.type}</AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Detailed Metrics */}
      <Tabs defaultValue="domains" className="space-y-4">
        <TabsList>
          <TabsTrigger value="domains">Domain Performance</TabsTrigger>
          <TabsTrigger value="cache">Cache Metrics</TabsTrigger>
          <TabsTrigger value="errors">Error Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="domains" className="space-y-4">
          <div className="grid gap-4">
            {Object.entries(data.analytics.domains).map(([domain, metrics]) => (
              <Card key={domain}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="capitalize">{domain}</span>
                    <Badge variant={metrics.successRate > 95 ? "default" : "secondary"}>
                      {formatPercentage(metrics.successRate)} Success
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Operations</div>
                      <div className="text-lg font-semibold">{metrics.operationCount}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Avg Duration</div>
                      <div className="text-lg font-semibold">{formatDuration(metrics.averageDuration)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Error Rate</div>
                      <div className="text-lg font-semibold">{formatPercentage(metrics.errorRate)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Cache Hit Rate</div>
                      <div className="text-lg font-semibold">{formatPercentage(metrics.cacheHitRate)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Cache Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="flex items-center">
                    {data.cache.health.isAvailable ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    {data.cache.health.isAvailable ? "Available" : "Unavailable"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Hit Rate</div>
                  <div className="text-lg font-semibold">{formatPercentage(data.cache.health.hitRate)}</div>
                  <Progress value={data.cache.health.hitRate} className="mt-1" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Avg Hit Time</div>
                  <div className="text-lg font-semibold">{formatDuration(data.cache.health.averageHitTime)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Requests</div>
                  <div className="text-lg font-semibold">{data.cache.health.totalRequests}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Error Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Errors</span>
                    <span className="font-semibold">{data.errors.statistics.totalErrors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Error Rate</span>
                    <span className="font-semibold">{formatPercentage(data.errors.statistics.errorRate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Health Score</span>
                    <span className="font-semibold">{data.errors.healthScore}/100</span>
                  </div>
                  <Progress value={data.errors.healthScore} className="mt-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Errors by Domain</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(data.errors.statistics.errorsByDomain).map(([domain, count]) => (
                    <div key={domain} className="flex justify-between">
                      <span className="capitalize">{domain}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
