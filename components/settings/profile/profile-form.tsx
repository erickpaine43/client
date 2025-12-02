"use client";

import { Button } from "@/components/ui/button/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { useProfileForm } from "@/hooks/useProfileForm";
import ProfileBasicsForm from "@/components/settings/profile/ProfileBasicsForm";
import AvatarForm from "@/components/settings/profile/AvatarForm";
import PreferencesForm from "@/components/settings/profile/PreferencesForm";
import ProfileErrorHandler from "@/components/settings/profile/ProfileErrorHandler";
import ProfileLoadingStates from "@/components/settings/profile/ProfileLoadingStates";

function ProfileForm() {
  const {
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
  } = useProfileForm();

  return (
    <div className="space-y-6">
      {/* Loading States and Connectivity Indicators */}
      <ProfileLoadingStates
        isOnline={isOnline}
        profileLoading={profileLoading}
        settingsLoading={settingsLoading}
        isRetryingProfile={isRetryingProfile}
        retryCount={retryCount}
        maxRetries={MAX_RETRIES}
        submitLoading={submitLoading}
      />

      {/* Error Handler */}
      <ProfileErrorHandler
        profileError={profileError}
        profileLoading={profileLoading}
        isRetryingProfile={isRetryingProfile}
        retryCount={retryCount}
        maxRetries={MAX_RETRIES}
        onRetry={retryFetchProfile}
      />

      <Form {...form}>
        {/* Profile Information Section */}
        <ProfileBasicsForm
          control={form.control}
          profileLoading={profileLoading}
          submitLoading={submitLoading}
        />

        {/* Avatar Section */}
        <AvatarForm
          currentAvatarUrl={form.watch("avatarUrl")}
          onAvatarChange={(url) => form.setValue("avatarUrl", url)}
          profileLoading={profileLoading}
          submitLoading={submitLoading}
          customAvatarUrl={customAvatarUrl}
          onCustomUrlChange={setCustomAvatarUrl}
          onCustomUrlApply={() => setCustomAvatarUrl("")}
        />

        <Separator />

        {/* Preferences Section */}
        <PreferencesForm
          control={form.control}
          profileLoading={profileLoading}
          submitLoading={submitLoading}
        />

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={
              profileLoading ||
              settingsLoading ||
              submitLoading ||
              isPending ||
              !!profileError
            }
            className="w-fit"
            onClick={form.handleSubmit(onSubmit)}
          >
            {submitLoading || isPending ? (
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
    </div>
  );
}
// className="w-full sm:w-auto"
// disabled={submitLoading || profileLoading}

export default ProfileForm;
