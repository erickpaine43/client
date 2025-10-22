"use client";

import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileFormValues {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  timezone: string;
  language: string;
  sidebarView: "collapsed" | "expanded";
}

interface ProfileBasicsFormProps {
  control: Control<ProfileFormValues>;
  profileLoading: boolean;
  submitLoading: boolean;
}

export default function ProfileBasicsForm({
  control,
  profileLoading,
  submitLoading,
}: ProfileBasicsFormProps) {
  if (profileLoading) {
    return (
      <div className="space-y-4">
        {/* Display Name Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-48" />
        </div>

        {/* First Name and Last Name Skeletons */}
        <div className="grid grid-cols-2 gap-4">
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
        </div>

        {/* Email Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Display Name */}
      <FormField
        control={control}
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

      {/* First Name and Last Name */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
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
          control={control}
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
      </div>

      {/* Email */}
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email *</FormLabel>
            <FormControl>
              <Input type="email" {...field} disabled />
            </FormControl>
            <FormMessage />
            <p className="text-sm text-muted-foreground">
              Your email address cannot be modified and is used for
              authentication.
            </p>
          </FormItem>
        )}
      />
    </div>
  );
}
