"use client";

import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { allTimezones } from "@/lib/utils";

interface ProfileFormValues {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  timezone: string;
  sidebarView: "collapsed" | "expanded";
}

interface PreferencesFormProps {
  control: Control<ProfileFormValues>;
  profileLoading: boolean;
  submitLoading: boolean;
}

export default function PreferencesForm({
  control,
  profileLoading,
  submitLoading,
}: PreferencesFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Customize your application experience and interface settings.
        </p>
      </div>

      {/* Timezone */}
      {profileLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <FormField
          control={control}
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

      {/* Sidebar View */}
      {profileLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <FormField
          control={control}
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
  );
}
