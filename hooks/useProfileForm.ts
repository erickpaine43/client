"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import {
  getUserProfile,
  updateUserProfile,
  type ProfileError,
} from "@/lib/actions/profileActions";
import { getUserSettings, updateUserSettings } from "@/lib/actions/settings";
import {
  mapNileUserToFormData,
  type ProfileFormData,
  allTimezones,
} from "@/lib/utils";
import {
  setStorageItem,
  getStorageItem,
  StorageKeys,
  type SidebarView,
  type Language,
} from "@/lib/utils/clientStorage";

// Profile form schema
const profileSchema = z.object({
  name: z.string().min(1, "Display name is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  avatarUrl: z.string().optional(),
  timezone: z.string().min(1, "Timezone is required"),
  language: z.string().min(1, "Language is required"),
  sidebarView: z.enum(["collapsed", "expanded"]),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

// Interface for server action results with error property
interface ActionResultWithError {
  success: boolean;
  error?: {
    message?: string;
    field?: string;
    type?: string;
  };
  [key: string]: unknown;
}

export function useProfileForm() {
  const router = useRouter();
  const { user: authUser, loading: authLoading, updateUser } = useAuth();
  const { isOnline, wasOffline } = useOnlineStatus();
  const [isPending] = useTransition();
  const [profileLoading, setProfileLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [profileError, setProfileError] = useState<ProfileError | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isRetryingProfile, setIsRetryingProfile] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");

  const MAX_RETRIES = 3;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      firstName: "",
      lastName: "",
      email: "",
      avatarUrl: "",
      timezone:
        getStorageItem(StorageKeys.TIMEZONE) ||
        allTimezones[0]?.value ||
        "America/New_York",
      language: getStorageItem(StorageKeys.LANGUAGE) || "en",
      sidebarView: (getStorageItem(StorageKeys.SIDEBAR_VIEW) === "collapsed"
        ? "collapsed"
        : "expanded") as "expanded" | "collapsed",
    },
  });

  const { refreshUserData } = useAuth();

  // Enhanced retry function with exponential backoff and timeout
  const retryFetchProfile = useCallback(async () => {
    if (retryCount >= MAX_RETRIES) {
      toast.error("Unable to load profile", {
        description: "Please check your connection and refresh the page.",
      });
      return;
    }

    setIsRetryingProfile(true);
    const currentRetry = retryCount;
    setRetryCount((prev) => prev + 1);

    // Add timeout to the request with progressive delays
    const timeoutDuration = Math.min(5000 + currentRetry * 1000, 15000); // 5s, 6s, 7s... up to 15s
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

    try {
      // Create a timeout wrapper for the profile fetch
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), timeoutDuration)
      );

      const profilePromise = getUserProfile();
      const result = (await Promise.race([
        profilePromise,
        timeoutPromise,
      ])) as Awaited<ReturnType<typeof getUserProfile>>;

      // Clear timeout since request completed
      clearTimeout(timeoutId);

      if (result.success && result.data) {
        const nileFormData = mapNileUserToFormData(result.data);
        form.reset({
          ...form.getValues(),
          name: nileFormData.name,
          firstName: nileFormData.firstName,
          lastName: nileFormData.lastName,
          email: nileFormData.email,
          avatarUrl: nileFormData.avatarUrl,
        });
        setProfileError(null);
        setRetryCount(0); // Reset retry count on success
        toast.success("Profile loaded successfully", {
          description: "Your profile information has been updated.",
        });
      } else if (result.error) {
        setProfileError(result.error);

        if (result.error.type === "auth") {
          toast.error("Authentication required", {
            description: "Redirecting to login page...",
          });
          setTimeout(() => {
            router.push("/");
          }, 2000);
        } else if (result.error.type === "network") {
          // Network error - will be handled in the error component
          if (currentRetry >= MAX_RETRIES - 1) {
            toast.error("Network error", {
              description:
                "Unable to connect. Please check your internet connection.",
              duration: 5000,
            });
          }
        } else {
          toast.error("Failed to load profile", {
            description: result.error.message,
          });
        }
      }
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      console.error("Error fetching user profile:", error);

      const errorObj = error as Error;
      let errorMessage = "Failed to load profile data. Please try again.";
      const errorType: ProfileError["type"] = "network";

      if (
        errorObj.message?.includes("timeout") ||
        errorObj.name === "AbortError"
      ) {
        errorMessage =
          currentRetry === 0
            ? "Request timed out. Retrying..."
            : `Request timed out (${currentRetry}/${MAX_RETRIES} retry attempts). Please check your connection.`;
      } else if (errorObj.message?.includes("fetch")) {
        errorMessage =
          currentRetry === 0
            ? "Network connection failed. Retrying..."
            : `Network connection failed (${currentRetry}/${MAX_RETRIES} retry attempts). Please check your connection.`;
      } else if (errorObj.message?.includes("aborted")) {
        errorMessage = "Request was cancelled. Please try again.";
      } else if (currentRetry > 0) {
        errorMessage = `Failed to load profile data (${currentRetry}/${MAX_RETRIES} retry attempts). Please check your connection.`;
      }

      const networkError: ProfileError = {
        type: errorType,
        message: errorMessage,
      };
      setProfileError(networkError);

      // Show additional guidance on final retry
      if (currentRetry >= MAX_RETRIES - 1) {
        setTimeout(() => {
          toast.error("Connection Failed", {
            description:
              "Please check your internet connection or try refreshing the page.",
            duration: 6000,
          });
        }, 1000);
      }
    } finally {
      setIsRetryingProfile(false);
      setProfileLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount, MAX_RETRIES]);

  // Fetch user settings from server action
  const fetchUserSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const result = await getUserSettings();

      if (result.success && result.data) {
        // Update form with settings data
        form.setValue("timezone", result.data.timezone);
        form.setValue("language", getStorageItem(StorageKeys.LANGUAGE) || "en");
        form.setValue("sidebarView", result.data.sidebarView);

        // Store preferences in localStorage for immediate access
        setStorageItem(StorageKeys.TIMEZONE, result.data.timezone);
        // Language is stored in localStorage, not in server settings
        setStorageItem(
          StorageKeys.SIDEBAR_VIEW,
          result.data.sidebarView as SidebarView
        );

        return true;
      } else {
        // Handle error
        if (!result.success && result.error?.type === "auth") {
          toast.error("Authentication required", {
            description: "Please log in to access settings.",
          });
          router.push("/");
        } else {
          toast.error("Failed to load settings", {
            description:
              (result as ActionResultWithError).error?.message ||
              "Unable to retrieve your settings.",
          });
        }
        return false;
      }
    } catch (error) {
      console.error("Error fetching user settings:", error);
      toast.error("Error loading settings", {
        description: "An unexpected error occurred.",
      });
      return false;
    } finally {
      setSettingsLoading(false);
    }
  }, [form, router]);

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      // First, try to use AuthContext user data as fallback
      if (authUser?.profile && !authLoading) {
        const fallbackFormData: Partial<ProfileFormData> = {
          name: authUser.displayName || "",
          firstName: authUser.profile.firstName || "",
          lastName: authUser.profile.lastName || "",
          email: authUser.email || "",
          avatarUrl: "",
        };
        form.reset({
          ...form.getValues(),
          ...fallbackFormData,
        });
      }

      // Fetch settings from server action
      await fetchUserSettings();

      // Then try to fetch from NileDB server action
      await retryFetchProfile();
    };

    // Only fetch if we have auth context loaded
    if (!authLoading) {
      fetchProfileData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, authLoading]);

  // Auto-retry when coming back online
  useEffect(() => {
    if (wasOffline && isOnline && profileError?.type === "network") {
      toast.success("Connection restored", {
        description: "Retrying to load your profile...",
      });
      // Auto-retry once when coming back online
      const timer = setTimeout(() => {
        retryFetchProfile();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline, profileError, retryFetchProfile]);

  // Show offline notification
  useEffect(() => {
    if (!isOnline) {
      toast.error("You're offline", {
        description:
          "Some features may not work properly. Please check your connection.",
        duration: 5000,
      });
    }
  }, [isOnline]);

  const onSubmit = async (data: ProfileFormValues) => {
    setSubmitLoading(true);

    // Clear any existing form errors
    form.clearErrors();

    // Check for online status before submitting
    if (!isOnline) {
      toast.error("You're offline", {
        description: "Please check your internet connection and try again.",
      });
      setSubmitLoading(false);
      return;
    }

    // Store UI preferences immediately in localStorage for optimistic update
    setStorageItem(StorageKeys.TIMEZONE, data.timezone);
    setStorageItem(StorageKeys.LANGUAGE, data.language as Language);
    setStorageItem(StorageKeys.SIDEBAR_VIEW, data.sidebarView as SidebarView);

    // Add timeout to the update request
    const timeoutDuration = 10000; // 10 seconds for updates
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

    try {
      // Update settings in parallel with profile
      const settingsUpdatePromise = (async () => {
        // Update timezone and sidebar view in server settings
        const settingsUpdate = await updateUserSettings({
          timezone: data.timezone,
          sidebarView: data.sidebarView,
        });

        if (!settingsUpdate.success) {
          console.warn(
            "Failed to update settings:",
            (settingsUpdate as ActionResultWithError).error?.message ||
              "Unknown error"
          );
          // Don't fail the whole operation if settings update fails
          // User preferences are already saved in localStorage
        }

        return settingsUpdate;
      })();

      // Extract the profile fields for NileDB update
      const profileData: Partial<ProfileFormData> = {
        name: data.name,
        firstName: data.firstName,
        lastName: data.lastName,
        avatarUrl: data.avatarUrl,
        timezone: data.timezone,
        language: data.language,
      };

      // Create a timeout wrapper for the profile update
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Update timeout")), timeoutDuration)
      );

      const updatePromise = updateUserProfile(profileData);
      const [profileResult] = await Promise.all([
        Promise.race([updatePromise, timeoutPromise]) as Promise<
          Awaited<ReturnType<typeof updateUserProfile>>
        >,
        settingsUpdatePromise,
      ]);

      if (profileResult.success && profileResult.data) {
        const updatedFormData = mapNileUserToFormData(profileResult.data);
        form.setValue("name", updatedFormData.name);
        form.setValue("firstName", updatedFormData.firstName);
        form.setValue("lastName", updatedFormData.lastName);
        form.setValue("avatarUrl", updatedFormData.avatarUrl);

        // Refresh AuthContext with fresh data from NileDB server
        try {
          await refreshUserData();
        } catch (refreshError) {
          console.warn(
            "Failed to refresh user data in AuthContext:",
            refreshError
          );
          // Fallback: update with the response data if refresh fails
          updateUser({
            displayName: updatedFormData.name,
            photoURL: updatedFormData.avatarUrl,
            profile: {
              firstName: updatedFormData.firstName,
              lastName: updatedFormData.lastName,
              avatar: updatedFormData.avatarUrl,
              timezone: data.timezone || 'UTC',
              language: 'en',
            },
          });
        }

        toast.success("Profile updated successfully", {
          description:
            "Your profile information and preferences have been saved.",
        });
      } else if ((profileResult as ActionResultWithError).error) {
        const result = profileResult as ActionResultWithError;
        // Handle field-specific errors by setting form errors
        if (result.error?.field) {
          form.setError(result.error.field as keyof ProfileFormValues, {
            message: result.error.message,
          });
        } else {
          // Handle general errors with toast
          const errorMessage =
            result.error?.message ||
            "Failed to update profile. Please try again.";

          if (result.error?.type === "auth") {
            toast.error("Authentication expired", {
              description: "Redirecting to login page...",
            });
            setTimeout(() => {
              router.push("/");
            }, 2000);
          } else if (result.error?.type === "network") {
            toast.error("Network error", {
              description: "Please check your connection and try again.",
              action: {
                label: "Retry",
                onClick: () => onSubmit(data),
              },
            });
          } else if (result.error?.type === "validation") {
            toast.error("Validation error", {
              description: errorMessage,
            });
          } else {
            toast.error("Update failed", {
              description: errorMessage,
            });
          }
        }
      } else {
        toast.error("Update failed", {
          description: "Failed to update profile. Please try again.",
        });
      }
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      console.error("Error updating profile:", error);

      const errorObj = error as Error;
      let errorMessage =
        "An unexpected error occurred while updating your profile.";
      let actionOptions:
        | { action: { label: string; onClick: () => void } }
        | undefined;

      if (errorObj instanceof Error) {
        if (
          errorObj.message?.includes("timeout") ||
          errorObj.name === "AbortError"
        ) {
          errorMessage =
            "Update timed out. Please check your connection and try again.";
          actionOptions = {
            action: {
              label: "Retry",
              onClick: () => onSubmit(data),
            },
          };
        } else if (
          errorObj.message?.includes("fetch") ||
          errorObj.message?.includes("network")
        ) {
          errorMessage =
            "Network error. Please check your internet connection.";
          actionOptions = {
            action: {
              label: "Retry",
              onClick: () => onSubmit(data),
            },
          };
        } else if (errorObj.message?.includes("aborted")) {
          errorMessage = "Update was cancelled. Please try again.";
        } else {
          actionOptions = {
            action: {
              label: "Retry",
              onClick: () => onSubmit(data),
            },
          };
        }
      }

      toast.error("Update failed", {
        description: errorMessage,
        ...actionOptions,
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return {
    form,
    profileLoading,
    settingsLoading,
    profileError,
    submitLoading,
    isRetryingProfile,
    retryCount,
    customAvatarUrl,
    setCustomAvatarUrl,
    isPending,
    isOnline,
    MAX_RETRIES,
    onSubmit,
    retryFetchProfile,
  };
}
