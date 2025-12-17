"use client";

import AddStorageTrigger from "@/components/settings/billing/add-storge-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getUsageWithCalculations,
  getStorageOptions,
} from "@/lib/actions/billing";
import { cn } from "@/lib/utils";
import { Globe, HardDrive, Mail, Plus, Server, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface UsageData {
  usage: {
    emailsSent: number;
    emailsLimit: number;
    contactsReached: number;
    contactsLimit: number;
    campaignsActive: number;
    campaignsLimit: number;
    storageUsed: number;
    storageLimit: number;
    emailAccountsActive: number;
    emailAccountsLimit: number;
    resetDate: string;
  };
  percentages: {
    emailsSentPercentage: number;
    contactsReachedPercentage: number;
    campaignsActivePercentage: number;
    storageUsedPercentage: number;
    emailAccountsPercentage: number;
  };
  daysUntilReset: number;
}

const getColorClasses = (color: string, warning?: boolean) => {
  if (warning) {
    return {
      bg: "bg-red-50",
      icon: "text-red-600",
      border: "border-red-200",
    };
  }

  const colors = {
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
      border: "border-blue-200",
    },
    green: {
      bg: "bg-green-50",
      icon: "text-green-600",
      border: "border-green-200",
    },
    purple: {
      bg: "bg-purple-50",
      icon: "text-purple-600",
      border: "border-purple-200",
    },
    orange: {
      bg: "bg-orange-50",
      icon: "text-orange-600",
      border: "border-orange-200",
    },
    red: { bg: "bg-red-50", icon: "text-red-600", border: "border-red-200" },
  };
  return colors[color as keyof typeof colors];
};

function UsageTab() {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storageOptions, setStorageOptions] = useState<
    { gb: number; price: number }[] | null
  >(null);
  const [loadingStorage, setLoadingStorage] = useState(true);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getUsageWithCalculations();

      if (result.success && result.data) {
        setUsageData(result.data);
      } else {
        setError(result.error?.message ?? "Failed to load usage data");
        toast.error("Failed to load usage data", {
          description: result.error?.message ?? "An error occurred",
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      toast.error("Failed to load usage data", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStorageOptions = async () => {
    try {
      setLoadingStorage(true);
      const result = await getStorageOptions();
      if (result.success && result.data) {
        setStorageOptions(result.data);
      } else {
        toast.error("Failed to load storage options", {
          description: result.error?.message ?? "An error occurred",
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error("Failed to load storage options", {
        description: errorMessage,
      });
    } finally {
      setLoadingStorage(false);
    }
  };

  useEffect(() => {
    fetchUsageData();
  }, []);

 useEffect(() => {
   fetchStorageOptions();
 }, []);

  if (loading) {
    return <UsageTabSkeleton />;
  }

  if (error || !usageData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <div className="text-muted-foreground mb-4">
              Failed to load usage data
            </div>
            <Button onClick={fetchUsageData} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { usage, percentages, daysUntilReset } = usageData;

  // Format reset date
  const resetDate = new Date(usage.resetDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Create usage cards from server data
  const usageCards = [
    {
      title: "Emails Sent",
      value: usage.emailsSent.toLocaleString(),
      limit:
        usage.emailsLimit === 0
          ? "Unlimited"
          : usage.emailsLimit.toLocaleString(),
      icon: Mail,
      color: "blue",
      showProgress: usage.emailsLimit > 0,
      percentage: percentages.emailsSentPercentage,
    },
    {
      title: "Contacts Reached",
      value: usage.contactsReached.toLocaleString(),
      limit:
        usage.contactsLimit === 0
          ? "Unlimited"
          : usage.contactsLimit.toLocaleString(),
      icon: Users,
      color: "green",
      showProgress: usage.contactsLimit > 0,
      percentage: percentages.contactsReachedPercentage,
    },
    {
      title: "Active Campaigns",
      value: usage.campaignsActive.toString(),
      limit:
        usage.campaignsLimit === 0
          ? "Unlimited"
          : usage.campaignsLimit.toString(),
      icon: Server,
      color: "purple",
      showProgress: usage.campaignsLimit > 0,
      percentage: percentages.campaignsActivePercentage,
    },
    {
      title: "Email Accounts",
      value: usage.emailAccountsActive.toString(),
      limit:
        usage.emailAccountsLimit === 0
          ? "Unlimited"
          : usage.emailAccountsLimit.toString(),
      icon: Globe,
      color: "orange",
      showProgress: usage.emailAccountsLimit > 0,
      percentage: percentages.emailAccountsPercentage,
    },
    {
      title: "Storage Used",
      value: `${usage.storageUsed} GB`,
      limit: `${usage.storageLimit} GB`,
      icon: HardDrive,
      color: "red",
      showProgress: true,
      percentage: percentages.storageUsedPercentage,
      warning: percentages.storageUsedPercentage > 80,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex justify-between items-center p-6">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">
              Usage Statistics
            </CardTitle>
            <p className="text-muted-foreground">
              Your usage limits will reset on
              <strong> {resetDate}</strong>
            </p>
          </div>
          <Badge variant="secondary" className="bg-primary/20 text-primary">
            {daysUntilReset} days remaining
          </Badge>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {usageCards.map((card) => {
          const Icon = card.icon;
          const colors = getColorClasses(card.color, card.warning);

          return (
            <Card
              key={card.title}
              className={cn(
                "relative transition-all duration-200 hover:shadow-md",
                colors.border
              )}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={cn("p-2 rounded-lg", colors.bg)}>
                    <Icon className={cn("h-5 w-5", colors.icon)} />
                  </div>
                  {card.warning && (
                    <Badge variant="destructive" className="text-xs">
                      Low Storage
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </h3>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-foreground">
                      {card.value}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {" "}
                      / {card.limit}
                    </span>
                  </div>
                </div>

                {card.showProgress && card.percentage !== undefined && (
                  <div className="space-y-2">
                    <Progress
                      value={card.percentage}
                      className={cn(
                        "h-2",
                        card.warning && "[&>div]:bg-destructive"
                      )}
                    />
                    <p className="text-xs text-muted-foreground">
                      {Math.round(card.percentage)}% used
                    </p>
                  </div>
                )}

                {card.title === "Storage Used" && card.warning && (
                  <AddStorageTrigger onStorageAdded={fetchUsageData}>
                    <Button variant="destructive" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Storage
                    </Button>
                  </AddStorageTrigger>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex-center-between">
          <div>
            <CardTitle className="text-xl font-semibold">Add Storage</CardTitle>
            <CardDescription className="text-gray-600">
              Purchase additional storage at $3 per GB
            </CardDescription>
          </div>

          <AddStorageTrigger onStorageAdded={fetchUsageData}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Storage
            </Button>
          </AddStorageTrigger>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loadingStorage ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))
          ) : (
            storageOptions &&
            storageOptions.map((option) => (
              <Card
                key={option.gb}
                className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
              >
                <CardContent>
                  <div className="text-lg font-semibold text-gray-900">
                    {option.gb} GB
                  </div>
                  <div className="text-sm text-gray-600">
                    ${option.price}/month
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function UsageTabSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex justify-between items-center p-6">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-6 w-24" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <div className="flex items-baseline space-x-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default UsageTab;
