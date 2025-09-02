"use client";

import { useState, useEffect } from "react";
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
  const { user: authUser, loading: authLoading } = useAuth();
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<ProfileError | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");

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
        } else if (result.error) {
          setProfileError(result.error);
          // If it's an auth error, the user will be redirected by the server action
          if (result.error.type === 'auth') {
            // Server action handles redirect
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setProfileError({
          type: 'network',
          message: 'Failed to load profile data. Please refresh the page.'
        });
      } finally {
        setProfileLoading(false);
      }
    };

    // Only fetch if we have auth context loaded
    if (!authLoading) {
      fetchProfileData();
    }
  }, [authUser, authLoading, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    setSubmitLoading(true);
    setMessage({ type: "", text: "" });

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
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else if (result.error) {
        setMessage({
          type: "error",
          text: result.error.message,
        });
      } else {
        setMessage({
          type: "error",
          text: "Failed to update profile. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text: "An unexpected error occurred while updating your profile."
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Loading State */}
      {profileLoading && (
        <div className="mb-4 p-4 border border-blue-200 rounded-md bg-blue-50">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span>Loading your profile...</span>
          </div>
        </div>
      )}

      {/* Profile Error State */}
      {profileError && (
        <div className="mb-4 p-4 border border-red-200 rounded-md bg-red-50">
          <div className="text-red-800">
            <strong>Error:</strong> {profileError.message}
          </div>
          {profileError.type === 'network' && (
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Success/Error Messages */}
      {message.text && (
        <div
          className={`mb-4 p-3 rounded ${message.type === "success"
            ? "bg-green-50 text-green-800"
            : "bg-red-50 text-red-800"
            }`}
        >
          {message.text}
        </div>
      )}

      <Form {...form}>
        {/* Profile Information Section */}
        <div className="space-y-4">
          {/* Display Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input {...field} disabled={profileLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={profileLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={profileLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} disabled />
                </FormControl>
                <p className="text-sm text-gray-500">Your email address cannot be changed.</p>
              </FormItem>
            )}
          />

          {/* Avatar Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Avatar</label>
            {profileLoading ? (
              <div className="flex items-center py-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                <span className="text-gray-600">Loading avatar selector...</span>
              </div>
            ) : (
              <AvatarSelector
                currentAvatarUrl={form.watch('avatarUrl')}
                onAvatarChange={(url) => form.setValue('avatarUrl', url)}
                disabled={profileLoading}
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

          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timezone</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={profileLoading}
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

          <FormField
            control={form.control}
            name="sidebarView"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sidebar View on Click</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={profileLoading}
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
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={submitLoading || profileLoading}
            onClick={form.handleSubmit(onSubmit)}
          >
            {submitLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default ProfileForm;
