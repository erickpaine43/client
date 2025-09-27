"use client";

import { Skeleton } from "@/components/ui/skeleton";
import AvatarSelector from "@/components/settings/profile/AvatarSelector";

interface AvatarFormProps {
  currentAvatarUrl?: string;
  onAvatarChange: (url: string) => void;
  profileLoading: boolean;
  submitLoading: boolean;
  customAvatarUrl: string;
  onCustomUrlChange: (url: string) => void;
  onCustomUrlApply: () => void;
}

export default function AvatarForm({
  currentAvatarUrl,
  onAvatarChange,
  profileLoading,
  submitLoading,
  customAvatarUrl,
  onCustomUrlChange,
  onCustomUrlApply,
}: AvatarFormProps) {
  return (
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
          currentAvatarUrl={currentAvatarUrl}
          onAvatarChange={onAvatarChange}
          disabled={profileLoading || submitLoading}
          customUrl={customAvatarUrl}
          onCustomUrlChange={onCustomUrlChange}
          onCustomUrlApply={onCustomUrlApply}
        />
      )}
    </div>
  );
}
