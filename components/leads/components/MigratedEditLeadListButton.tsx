"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Lead } from "./MigratedLeadsTable";
import { Pencil, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { UnifiedFormField } from "@/components/design-system/components/unified-form-field";

// Mock data type matching Lead
type FormData = {
  name: string;
  description: string;
  tags: string;
  status: string;
  campaign: string;
};

interface MigratedEditLeadListButtonProps {
  lead: Lead;
}

export function MigratedEditLeadListButton({
  lead,
}: MigratedEditLeadListButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      name: lead.name,
      description: `Contact from ${lead.campaign}`, // Mock description
      tags: lead.tags?.join(", "),
      status: lead.status,
      campaign: lead.campaign || "",
    },
  });

  const { control, handleSubmit, reset } = form;

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      console.log("Saving lead:", data);

      // Simulate async operation (API call)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Handle save logic here
      // If successful, close dialog
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to save lead:", error);
      // Handle error (could show toast notification)
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsOpen(false);
  };

  const handleDialogClose = () => {
    setIsOpen(false);
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          title="Edit Contact"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          {/* Built-in Close is fine, but we can have a custom one if needed */}
        </DialogClose>
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
            {/* Name */}
            <UnifiedFormField
              control={control}
              name="name"
              label="Contact Name"
              placeholder="Enter contact name"
              required
            />

            {/* Description (Textarea) - using standard shadcn Field since Unified doesn't support Textarea yet */}
            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
            <UnifiedFormField
              control={control}
              name="tags"
              label="Tags"
              placeholder="Enter tags (comma separated)"
              description="Separate tags with commas"
            />

            <UnifiedFormField
              control={control}
              name="status"
              label="Status"
              type="select"
              placeholder="Select status"
              options={[
                { value: "sent", label: "Sent" },
                { value: "replied", label: "Replied" },
                { value: "bounced", label: "Bounced" },
                { value: "not_used_yet", label: "Not Used Yet" },
              ]}
            />

            <UnifiedFormField
              control={control}
              name="campaign"
              label="Campaign"
              type="select"
              placeholder="Select campaign"
              options={[
                { value: "Q1 SaaS Outreach", label: "Q1 SaaS Outreach" },
                {
                  value: "Enterprise Prospects",
                  label: "Enterprise Prospects",
                },
                { value: "SMB Follow-up", label: "SMB Follow-up" },
              ]}
            />

            <DialogFooter className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
