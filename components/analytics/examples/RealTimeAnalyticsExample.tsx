"use client";

// ============================================================================
// REAL-TIME ANALYTICS EXAMPLE - Demo component showing real-time features
// ============================================================================

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Activity,
  Wifi,
  WifiOff,
  Settings,
} from "lucide-react";

// Import our real-time hooks
import {
  useCampaignPerformanceMetrics,
  useCampaignTimeSeriesData,
  useCampaignAnalyticsOverview,
  useOptimisticCampaignAnalytics,
} from "@/hooks/useCampaignAnalytics";

// Imporonents
// import { RealTimeCampaignDashboard } from "../components/RealTimeCampaignDashboard";
import {
  ProgressiveAnalyticsLoader,
  RealTimeUpdateSkeleton,
} from "../components/SkeletonLoaders";

interface RealTimeAnalyticsExampleProps {
  companyId: string;
  campaignIds?: string[];
}

/**
 * Comprehensive example component demonstrating real-time analytics features.
 * Shows connection status, simulation controls, and live updates.
 */
export function RealTimeAnalyticsExample({
  companyId,
  campaignIds = ["campaign-1", "campaign-2"],
}: RealTimeAnalyticsExampleProps) {
  // State for demo controls
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(2000); // ms
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "connecting"
  >("disconnected");
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [updateCount, setUpdateCount] = useState(0);

  // Real-time hooks
  const { data: performanceData, isLoading: performanceLoading } =
    useCampaignPerformanceMetrics(campaignIds, undefined, companyId);

  const { isLoading: timeSeriesLoading } = useCampaignTimeSeriesData(
    campaignIds,
    undefined,
    "day",
    companyId
  );

  const { data: overviewData, isLoading: overviewLoading } =
    useCampaignAnalyticsOverview(undefined, companyId);

  const { updateWithOptimisticUI } = useOptimisticCampaignAnalytics(
    campaignIds,
    undefined,
    companyId
  );

  // Check Convex connection status
  useEffect(() => {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (convexUrl) {
      setConnectionStatus("connected");
    } else {
      setConnectionStatus("disconnected");
    }
  }, []);

  // Simulation logic
  const simulateUpdate = useCallback(async () => {
    if (!performanceData || performanceData.length === 0) return;

    const campaign =
      performanceData[Math.floor(Math.random() * performanceData.length)];
    const updates = {
      opened_tracked:
        campaign.opened_tracked + Math.floor(Math.random() * 5) + 1,
      clicked_tracked: campaign.clicked_tracked + Math.floor(Math.random() * 2),
      replied: campaign.replied + (Math.random() > 0.7 ? 1 : 0),
    };

    try {
      await updateWithOptimisticUI(campaign.campaignId, updates);
      setLastUpdateTime(new Date());
      setUpdateCount((prev) => prev + 1);
    } catch (error) {
      console.error("Simulation update failed:", error);
    }
  }, [performanceData, updateWithOptimisticUI]);

  // Auto-simulation effect
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(simulateUpdate, simulationSpeed);
    return () => clearInterval(interval);
  }, [isSimulating, simulationSpeed, simulateUpdate]);

  // Manual update handler
  const handleManualUpdate = async () => {
    await simulateUpdate();
  };

  // Start/stop simulation
  const toggleSimulation = () => {
    setIsSimulating(!isSimulating);
  };

  // Reset demo
  const resetDemo = () => {
    setIsSimulating(false);
    setUpdateCount(0);
    setLastUpdateTime(new Date());
  };

  const isLoading = performanceLoading || timeSeriesLoading || overviewLoading;

  return (
    <div className="space-y-6">
      {/* Header with connection status and controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Real-Time Analytics Demo</h2>
          <p className="text-muted-foreground">
            Interactive demonstration of real-time analytics features
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {connectionStatus === "connected" ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-200"
                >
                  Connected
                </Badge>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <Badge
                  variant="outline"
                  className="text-red-600 border-red-200"
                >
                  Disconnected
                </Badge>
              </>
            )}
          </div>

          {/* Demo Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant={isSimulating ? "destructive" : "default"}
              size="sm"
              onClick={toggleSimulation}
              className="flex items-center space-x-2"
            >
              {isSimulating ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>Stop Simulation</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>Start Simulation</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleManualUpdate}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <Zap className="h-4 w-4" />
              <span>Manual Update</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={resetDemo}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Connection Status Details */}
      {connectionStatus === "disconnected" && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <WifiOff className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">
                  Convex is not configured
                </p>
                <p className="text-sm text-yellow-700">
                  Real-time features are using mock data. Set up Convex to
                  enable live updates.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Demo Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Updates</p>
                <p className="text-2xl font-bold">{updateCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Speed</p>
                <p className="text-2xl font-bold">{simulationSpeed / 1000}s</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${isSimulating ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
              />
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-lg font-semibold">
                  {isSimulating ? "Running" : "Stopped"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm font-medium">Last Update</p>
              <p className="text-lg font-semibold">
                {lastUpdateTime.toLocaleTimeString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demo Controls Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Demo Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium">Simulation Speed:</label>
              <select
                className="px-3 py-1 border rounded-md text-sm"
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(parseInt(e.target.value))}
                disabled={isSimulating}
              >
                <option value="500">Fast (0.5s)</option>
                <option value="1000">Medium (1s)</option>
                <option value="2000">Normal (2s)</option>
                <option value="5000">Slow (5s)</option>
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium">Campaign IDs:</label>
              <div className="flex space-x-2">
                {campaignIds.map((id) => (
                  <Badge key={id} variant="outline">
                    {id}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium">Company ID:</label>
              <Badge variant="outline">{companyId}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-Time Dashboard */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Live Dashboard</TabsTrigger>
          <TabsTrigger value="hooks">Hook Examples</TabsTrigger>
          <TabsTrigger value="loading">Loading States</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="p-4 border rounded-lg">
            <p className="text-muted-foreground">
              RealTimeCampaignDashboard component is not available yet.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="hooks" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics Hook Example */}
            <Card>
              <CardHeader>
                <CardTitle>useCampaignPerformanceMetrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Loading: {performanceLoading ? "true" : "false"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Campaigns: {performanceData?.length || 0}
                  </p>
                  {performanceData && performanceData[0] && (
                    <div className="space-y-1">
                      <p className="text-sm">
                        <strong>{performanceData[0].campaignName}</strong>
                      </p>
                      <p className="text-sm">
                        Open Rate: {performanceData[0].displayOpenRate}
                      </p>
                      <p className="text-sm">
                        Click Rate: {performanceData[0].displayClickRate}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Overview Hook Example */}
            <Card>
              <CardHeader>
                <CardTitle>useCampaignAnalyticsOverview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Loading: {overviewLoading ? "true" : "false"}
                  </p>
                  {overviewData && (
                    <div className="space-y-1">
                      <p className="text-sm">
                        Total Campaigns: {overviewData.overview.totalCampaigns}
                      </p>
                      <p className="text-sm">
                        Active: {overviewData.overview.activeCampaigns}
                      </p>
                      <p className="text-sm">
                        Overall Open Rate:{" "}
                        {overviewData.overview.displayOpenRate}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="loading" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Progressive Loading</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressiveAnalyticsLoader
                  stage="computing"
                  message="Computing real-time analytics..."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Real-Time Update Indicator</CardTitle>
              </CardHeader>
              <CardContent>
                <RealTimeUpdateSkeleton />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
