"use client";

import { Button } from "@/components/ui/button/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input/input";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { newFolderFormSchema, NewFolderFormValues } from "@/types/forms";

interface NewFolderFormProps {
  onSubmit?: (data: NewFolderFormValues) => void;
  onCancel?: () => void;
  className?: string;
}

function NewFolderForm({ onSubmit, onCancel, className }: NewFolderFormProps) {
  const form = useForm<NewFolderFormValues>({
    resolver: zodResolver(newFolderFormSchema),
    defaultValues: {
      folderName: "",
    },
  });

  const handleSubmit = (data: NewFolderFormValues) => {
    console.log("Creating folder:", data);
    onSubmit?.(data);
    form.reset();
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="folderName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Folder Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter folder name"
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2 pt-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={!form.formState.isValid}>
              Create Folder
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default NewFolderForm;
