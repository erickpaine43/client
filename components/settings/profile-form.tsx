"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "@/context/AuthContext";
import {
  getUserProfile,
  updateUserProfile,
  type ProfileError
} from "@/lib/actions/profileActions";
import {
  mapNileUserToFormData,
  type ProfileFormData,
  allTimezones
} from "@/lib/utils";
import AvatarSelector from "@/components/settings/AvatarSelector";

// Remove company and keep timezone for preferences section
const profileSchema = z.object({
  name: z.string().min(1, "Display name is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  avatarUrl: z.string().optional(),
  timezone: z.string().min(1, "Timezone is required"),
  sidebarView: z.enum(["collapsed", "expanded"]),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function ProfileForm() {
  const router = useRouter();
  const { user: authUser, loading: authLoading, updateUser } = useAuth();
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<ProfileError | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isRetryingProfile, setIsRetryingProfile] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");

  const MAX_RETRIES = 3;

  // Enhanced retry function with exponential backoff
  const retryFetchProfile = async () => {
    if (retryCount >= MAX_RETRIES) {
      toast.error("Unable to load profile", {
        description: "Please check your connection and refresh the page.",
      });
      return;
    }

    setIsRetryingProfile(true);
    setRetryCount(prev => prev + 1);

    try {
      const result = await getUserProfile();

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
        toast.success("Profile loaded successfully");
      } else if (result.error) {
        setProfileError(result.error);

        if (result.error.type === 'auth') {
          toast.error("Authentication required", {
            description: "Redirecting to login page...",
          });
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        } else if (result.error.type === 'network') {
          // Network error - will be handled in the error component
        } else {
          toast.error("Failed to load profile", {
            description: result.error.message,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      const networkError: ProfileError = {
        type: 'network',
        message: retryCount === 0
          ? 'Failed to load profile data. Please try again.'
          : `Failed to load profile data (${retryCount}/${MAX_RETRIES} retry attempts). Please check your connection.`,
      };
      setProfileError(networkError);
    } finally {
      setIsRetryingProfile(false);
      setProfileLoading(false);
    }
  };

  // Helper function to get error variants
  const getErrorVariant = (type: string) => {
    switch (type) {
      case 'auth': return 'destructive';
      case 'validation': return 'default';
      case 'network': return 'default';
      case 'server': return 'destructive';
      default: return 'default';
    }
  };

  // Helper function to get error icons
  const getErrorIcon = (type: string) => {
    switch (type) {
      case 'auth': return <AlertTriangle className="h-4 w-4" />;
      case 'validation': return <AlertCircle className="h-4 w-4" />;
      case 'network': return <RefreshCw className="h-4 w-4" />;
      case 'server': return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      firstName: "",
      lastName: "",
      email: "",
      avatarUrl: "",
      timezone: allTimezones[0]?.value || "America/New_York",
      sidebarView: "expanded",
    },
  });

  const { refreshUserData } = useAuth();

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
          timezone: form.getValues().timezone, // Keep current timezone setting
        });
      }

      // Then try to fetch from NileDB server action
      await retryFetchProfile();
    };

    // Only fetch if we have auth context loaded
    if (!authLoading) {
      fetchProfileData();
    }
  }, [authUser, authLoading, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    setSubmitLoading(true);
    setMessage({ type: "", text: "" });

    // Clear any existing form errors
    form.clearErrors();

    try {
      // Extract the profile fields for NileDB update
      const profileData: Partial<ProfileFormData> = {
        name: data.name,
        firstName: data.firstName,
        lastName: data.lastName,
        avatarUrl: data.avatarUrl,
      };

      const result = await updateUserProfile(profileData);

      if (result.success && result.data) {
        const updatedFormData = mapNileUserToFormData(result.data);
        form.setValue('name', updatedFormData.name);
        form.setValue('firstName', updatedFormData.firstName);
        form.setValue('lastName', updatedFormData.lastName);
        form.setValue('avatarUrl', updatedFormData.avatarUrl);

        // Refresh AuthContext with fresh data from NileDB server
        try {
          await refreshUserData();
        } catch (refreshError) {
          console.warn("Failed to refresh user data in AuthContext:", refreshError);
          // Fallback: update with the response data if refresh fails
          updateUser({
            displayName: updatedFormData.name,
            photoURL: updatedFormData.avatarUrl,
            profile: {
              firstName: updatedFormData.firstName,
              lastName: updatedFormData.lastName,
              avatar: updatedFormData.avatarUrl,
            }
          });
        }

        toast.success("Profile updated successfully", {
          description: "Your profile information has been saved.",
        });
      } else if (result.error) {
        // Handle field-specific errors by setting form errors
        if (result.error.field) {
          form.setError(result.error.field as keyof ProfileFormValues, {
            message: result.error.message,
          });
        } else {
          // Handle general errors with toast
          const errorMessage = result.error.message || "Failed to update profile. Please try again.";

          if (result.error.type === 'auth') {
            toast.error("Authentication expired", {
              description: "Redirecting to login page...",
            });
            setTimeout(() => {
              router.push('/login');
            }, 2000);
          } else if (result.error.type === 'network') {
            toast.error("Network error", {
              description: "Please check your connection and try again.",
              action: {
                label: "Retry",
                onClick: () => onSubmit(data),
              },
            });
          } else if (result.error.type === 'validation') {
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
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Unexpected error", {
        description: "An unexpected error occurred while updating your profile. Please try again.",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Loading State */}
      {profileLoading && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            {isRetryingProfile
              ? `Loading your profile... (attempt ${retryCount}/${MAX_RETRIES})`
              : "Loading your profile..."
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Error State */}
      {profileError && !profileLoading && (
        <Alert variant={getErrorVariant(profileError.type)}>
          {getErrorIcon(profileError.type)}
          <AlertDescription className="flex items-center justify-between">
            <span>{profileError.message}</span>
            {profileError.type === 'network' && retryCount < MAX_RETRIES && (
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retryFetchProfile}
                  disabled={isRetryingProfile}
                  className="h-7 px-2"
                >
                  {isRetryingProfile ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <RefreshCw className="h-3 w-3 mr-1" />
                  )}
                  Retry
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Field-specific validation errors are shown in the form fields via FormMessage */}

      <Form {...form}>
        {/* Profile Information Section */}
        <div className="space-y-4">
          {/* Display Name */}
          {profileLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-48" />
            </div>
          ) : (
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name *</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={profileLoading || submitLoading} />
                  </FormControl>
                  <FormMessage />
                  <p className="text-sm text-muted-foreground">
                    This name will be shown across the platform and in communications.
                  </p>
                </FormItem>
              )}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            {profileLoading ? (
              <>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-18" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={profileLoading || submitLoading} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground">
                        Your first name helps personalize your experience.
                      </p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={profileLoading || submitLoading} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground">
                        Your last name helps personalize your experience.
                      </p>
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>

          {profileLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-64" />
            </div>
          ) : (
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                  <p className="text-sm text-muted-foreground">
                    Your email address cannot be modified and is used for authentication.
                  </p>
                </FormItem>
              )}
            />
          )}

          {/* Avatar Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Avatar</label>
            {profileLoading ? (
              <div className="border rounded-lg p-6">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-6 gap-2">
                  <Skeleton className="aspect-square rounded-md" />
                  <Skeleton className="aspect-square rounded-md" />
                  <Skeleton className="aspect-square rounded-md" />
                  <Skeleton className="aspect-square rounded-md" />
                  <Skeleton className="aspect-square rounded-md" />
                  <Skeleton className="aspect-square rounded-md" />
                </div>
                <div className="mt-4">
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ) : (
              <AvatarSelector
                currentAvatarUrl={form.watch('avatarUrl')}
                onAvatarChange={(url) => form.setValue('avatarUrl', url)}
                disabled={profileLoading || submitLoading}
                customUrl={customAvatarUrl}
                onCustomUrlChange={setCustomAvatarUrl}
                onCustomUrlApply={() => setCustomAvatarUrl("")}
              />
            )}
          </div>
        </div>

        <Separator />

        {/* Preferences Section */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Preferences</h3>
            <p className="text-sm text-muted-foreground">
              Customize your application experience and interface settings.
            </p>
          </div>

          {profileLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={profileLoading || submitLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {allTimezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {profileLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <FormField
              control={form.control}
              name="sidebarView"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sidebar View on Click</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={profileLoading || submitLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select sidebar behavior" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="collapsed">
                        Collapsed - Keep sidebar minimized
                      </SelectItem>
                      <SelectItem value="expanded">
                        Expanded - Keep sidebar fully visible
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={profileLoading || submitLoading || !!profileError}
            className="w-fit"
            onClick={form.handleSubmit(onSubmit)}
          >
            {submitLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Profile...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </Form>

      {/* Submit Loading State */}
      {submitLoading && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-lg border">
            <div className="flex items-center space-x-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <div>
                <h3 className="font-medium">Updating Profile</h3>
                <p className="text-sm text-muted-foreground">Saving your changes...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
            // className="w-full sm:w-auto"
            // disabled={submitLoading || profileLoading}


export default ProfileForm;
