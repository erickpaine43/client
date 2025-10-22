"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { addStorage, getStorageOptions } from "@/lib/actions/billing";
import { cn } from "@/lib/utils";
import { HardDrive, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface AddStorageTriggerProps {
  children: React.ReactNode;
  onStorageAdded?: () => void;
}

function AddStorageTrigger({
  children,
  onStorageAdded,
}: AddStorageTriggerProps) {
  const [open, setOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [storageOptions, setStorageOptions] = useState<
    { gb: number; price: number }[] | null
  >(null);
  const [loadingStorage, setLoadingStorage] = useState(true);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const result = await addStorage(selectedAmount);

      if (result.success) {
        toast.success("Storage added successfully!", {
          description: `${selectedAmount} GB has been added to your account for $${result.data?.monthlyCost || 0}/month.`,
        });

        setOpen(false);

        // Call the callback to refresh usage data
        if (onStorageAdded) {
          onStorageAdded();
        }
      } else {
        toast.error("Failed to add storage", {
          description:
            typeof result.error === "string"
              ? result.error
              : result.error?.message || "Unknown error",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error("Failed to add storage", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStorageOptions = async () => {
    try {
      setLoadingStorage(true);
      const result = await getStorageOptions();
      if (result.success) {
        setStorageOptions(result.data || []);
        // Set default selectedAmount to the first option
        if (result.data && result.data.length > 0) {
          setSelectedAmount(result.data[0].gb);
        }
      } else {
        toast.error("Failed to load storage options", {
          description:
            typeof result.error === "string"
              ? result.error
              : result.error?.message || "Unknown error",
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error("Failed to load storage options", {
        description: errorMessage,
      });
    } finally {
      setLoadingStorage(false);
    }
  };

  useEffect(() => {
    fetchStorageOptions();
  }, []);

  const selectedOption = storageOptions?.find(
    (option) => option.gb === selectedAmount
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Storage</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <HardDrive className="h-6 w-6 text-blue-600" />
                <div>
                  <CardTitle className="text-base text-blue-900">
                    Additional Storage
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    $3 per GB per month • Cancel anytime
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Select storage amount</Label>
            <div className="grid grid-cols-2 gap-3">
              {loadingStorage
                ? Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))
                : storageOptions &&
                  storageOptions.map((option) => (
                    <Button
                      key={option.gb}
                      variant="outline"
                      onClick={() => setSelectedAmount(option.gb)}
                      className={cn(
                        "h-auto p-4 flex-col space-y-1 transition-all",
                        selectedAmount === option.gb
                          ? "border-primary bg-primary/5 text-primary"
                          : "hover:border-muted-foreground/50"
                      )}
                    >
                      <div className="text-lg font-semibold">
                        {option.gb} GB
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ${option.price}/month
                      </div>
                    </Button>
                  ))}
            </div>
          </div>

          <Card className="bg-muted/50">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  Additional Storage ({selectedAmount} GB)
                </span>
                <span className="font-semibold text-foreground">
                  ${selectedOption?.price || selectedAmount * 3}/month
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Billing starts immediately and continues monthly
              </p>
            </CardContent>
          </Card>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Purchase ${selectedAmount} GB`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddStorageTrigger;
