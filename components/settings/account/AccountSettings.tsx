"use client";

import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  SettingsLoadingSkeleton,
  SettingsErrorState,
} from "@/components/settings/common";
import { useServerAction, type ActionResult } from "@/hooks/useServerAction";
import { getUserProfile } from "@/lib/actions/profileActions";
import { mapNileUserToFormData, type NileUser } from "@/lib/utils";
import PasswordSettingsForm from "../profile/PasswordSettingsForm";
import {
  ProfileFormValues,
  ProfileSettingsForm,
} from "../profile/ProfileSettingsForm";

interface AccountSettingsProps extends React.HTMLAttributes<HTMLDivElement> {
  userProfile?: ProfileFormValues & { role: string; avatarUrl?: string };
}

// Wrapper to adapt ProfileActionResponse to ActionResult format expected by useServerAction
const getUserProfileAction = async (): Promise<ActionResult<NileUser | undefined>> => {
  const result = await getUserProfile();

  if (result.success) {
    return { success: true as const, data: result.data };
  } else {
    return { success: false, error: result.error?.message || "Failed to get user profile" };
  }
};

export default function AccountSettings({
  userProfile: initialProfile,
  ...props
}: AccountSettingsProps) {
  // Server action for fetching user profile if not provided
  const profileAction = useServerAction(() => getUserProfileAction(), {
    onError: (error) => {
      console.error("Failed to load user profile:", error);
    },
  });

  // Load profile data on mount if not provided
  useEffect(() => {
    if (!initialProfile) {
      profileAction.execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProfile]);

  // Show loading state
  if (profileAction.loading && !profileAction.data && !initialProfile) {
    return (
      <div className="grid gap-6" {...props}>
        <SettingsLoadingSkeleton variant="profile" showHeader={false} />
        <SettingsLoadingSkeleton
          variant="form"
          showHeader={false}
          itemCount={3}
        />
      </div>
    );
  }

  // Show error state
  if (profileAction.error && !initialProfile) {
    return (
      <div className="grid gap-6" {...props}>
        <SettingsErrorState
          error={profileAction.error}
          errorType="network"
          onRetry={() => profileAction.execute()}
          retryLoading={profileAction.loading}
          canRetry={profileAction.canRetry}
          variant="card"
          showDetails
        />
      </div>
    );
  }

  // Convert NileUser to ProfileFormValues format if needed
  let userProfile: ProfileFormValues | null = null;

  if (initialProfile) {
    userProfile = initialProfile;
  } else if (profileAction.data) {
    // Map NileUser to ProfileFormValues format
    const profileData = mapNileUserToFormData(profileAction.data);
    userProfile = {
      name: profileData.name || profileData.email, // Use email as fallback if name is empty
      email: profileData.email,
      avatarUrl: profileData.avatarUrl || undefined,
      username: undefined, // Not available in NileUser
      role: undefined, // Not available in NileUser
    };
  }

  if (!userProfile) {
    return (
      <div className="grid gap-6" {...props}>
        <SettingsErrorState
          error="No profile information available"
          errorType="generic"
          variant="card"
        />
      </div>
    );
  }

  return (
    <div className="grid gap-6" {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Update your personal information and profile settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileSettingsForm userProfile={userProfile} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Change your password or enable two-factor authentication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordSettingsForm />
        </CardContent>
      </Card>
    </div>
  );
}
