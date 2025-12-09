"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { AlertTriangle, Loader2, RefreshCw, CheckCircle } from "lucide-react";
import {
  getSimpleNotificationPreferences,
  updateSimpleNotificationPreferences,
} from "@/lib/actions/settings";
import type { SimpleNotificationPreferences } from "@/lib/actions/settings.types";

const notificationSchema = z.object({
  newReplies: z.boolean(),
  campaignUpdates: z.boolean(),
  weeklyReports: z.boolean(),
  domainAlerts: z.boolean(),
  warmupCompletion: z.boolean(),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

interface NotificationItem {
  id: keyof NotificationFormValues;
  label: string;
  description?: string;
  defaultValue: boolean;
}

const notificationItems: NotificationItem[] = [
  {
    id: "newReplies",
    label: "New replies to campaigns",
    description: "Get notified when prospects reply to your campaigns",
    defaultValue: true,
  },
  {
    id: "campaignUpdates",
    label: "Campaign status updates",
    description: "Updates on campaign start, pause, and completion",
    defaultValue: true,
  },
  {
    id: "weeklyReports",
    label: "Weekly performance reports",
    description: "Summary of your campaign performance every week",
    defaultValue: true,
  },
  {
    id: "domainAlerts",
    label: "Domain verification alerts",
    description: "Important alerts about domain authentication status",
    defaultValue: true,
  },
  {
    id: "warmupCompletion",
    label: "Mailbox warmup completion",
    description: "Notifications when mailbox warmup process completes",
    defaultValue: false,
  },
];

function NotificationsSettings() {
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [preferences, setPreferences] =
    useState<SimpleNotificationPreferences | null>(null);
  const MAX_RETRIES = 3;

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: notificationItems.reduce((values, item) => {
      values[item.id] = item.defaultValue;
      return values;
    }, {} as NotificationFormValues),
  });

  // Fetch notification preferences
  const fetchPreferences = async (isRetry = false) => {
    if (!isRetry) {
      setLoading(true);
    }
    setError(null);

    try {
      const result = await getSimpleNotificationPreferences();

      if (result.success && result.data) {
        setPreferences(result.data);

        // Update form with server data
        form.reset({
          newReplies: result.data.newReplies,
          campaignUpdates: result.data.campaignUpdates,
          weeklyReports: result.data.weeklyReports,
          domainAlerts: result.data.domainAlerts,
          warmupCompletion: result.data.warmupCompletion,
        });

        setRetryCount(0); // Reset retry count on success
      } else {
        // Handle different error types
        if (result.error?.code === "AUTH_REQUIRED") {
          setError("Please log in to view notification preferences.");
        } else if (result.error?.code === "NETWORK_ERROR") {
          setError("Network error. Please check your connection.");
        } else {
          setError(
            result.error?.message || "Failed to load notification preferences."
          );
        }
      }
    } catch (err) {
      console.error("Error fetching notification preferences:", err);
      setError("An unexpected error occurred while loading preferences.");
    } finally {
      setLoading(false);
    }
  };

  // Retry mechanism
  const retryFetch = async () => {
    if (retryCount >= MAX_RETRIES) {
      toast.error("Maximum retries exceeded", {
        description: "Please refresh the page to try again.",
      });
      return;
    }

    setRetryCount((prev) => prev + 1);
    await fetchPreferences(true);
  };

  // Load preferences on mount
  useEffect(() => {
    fetchPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (data: NotificationFormValues) => {
    startTransition(async () => {
      try {
        const result = await updateSimpleNotificationPreferences(data);

        if (result.success && result.data) {
          setPreferences(result.data);

          // Show success message
          toast.success("Notification preferences updated", {
            description:
              "Your notification settings have been saved successfully.",
            icon: <CheckCircle className="h-4 w-4" />,
          });
        } else {
          // Handle specific error cases
          if (result.error?.code === "AUTH_REQUIRED") {
            toast.error("Authentication required", {
              description: "Please log in to update your preferences.",
            });
          } else if (result.error?.code === "NETWORK_ERROR") {
            toast.error("Network error", {
              description: "Please check your connection and try again.",
              action: {
                label: "Retry",
                onClick: () => onSubmit(data),
              },
            });
          } else if (
            result.error?.code === "VALIDATION_FAILED" &&
            result.error?.field
          ) {
            // Set field-specific error
            form.setError(result.error.field as keyof NotificationFormValues, {
              message: result.error.message,
            });
            toast.error("Invalid input", {
              description: result.error.message,
            });
          } else {
            toast.error("Update failed", {
              description:
                result.error?.message ||
                "Failed to update notification preferences.",
              action: {
                label: "Retry",
                onClick: () => onSubmit(data),
              },
            });
          }
        }
      } catch (err) {
        console.error("Error updating notification preferences:", err);
        toast.error("Update failed", {
          description: "An unexpected error occurred while saving preferences.",
          action: {
            label: "Retry",
            onClick: () => onSubmit(data),
          },
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            {retryCount > 0
              ? `Loading notification preferences... (attempt ${retryCount}/${MAX_RETRIES})`
              : "Loading notification preferences..."}
          </AlertDescription>
        </Alert>
      )}

      {/* Error State */}
      {error && !loading && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            {retryCount < MAX_RETRIES && (
              <Button
                variant="outline"
                size="sm"
                onClick={retryFetch}
                className="h-7 px-2 ml-4"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {notificationItems.map((item) =>
              loading ? (
                <div
                  key={item.id}
                  className="flex flex-row items-start space-x-3 space-y-0"
                >
                  <Skeleton className="h-4 w-4 mt-0.5" />
                  <div className="space-y-1 leading-none flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                </div>
              ) : (
                <FormField
                  key={item.id}
                  control={form.control}
                  name={item.id}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isPending || loading}
                          className={cn(
                            "mt-0.5",
                            field.value &&
                              "data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          )}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel
                          className={cn(
                            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                            field.value
                              ? "text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {item.label}
                        </FormLabel>
                        {item.description && (
                          <p className="text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
            )}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button
              type="submit"
              disabled={loading || isPending || !!error}
              className="w-full sm:w-auto"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Notification Settings"
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Success indicator */}
      {preferences && (
        <div className="text-xs text-muted-foreground text-right">
          Last updated: {new Date(preferences.updatedAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}

export default NotificationsSettings;
