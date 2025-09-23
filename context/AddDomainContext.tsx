"use client";
import { createContext, useContext, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { AddDomainFormType } from "@/types/domains";
import { steps, dnsRecords } from "@/lib/data/domains.mock";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Link } from "lucide-react";
import NewDomainHeaderDetails from "@/components/domains/new/NewDomainHeaderDetails";
import NewDomainStepper from "@/components/domains/new/NewDomainStepper";
import NewDomainStep from "@/components/domains/new/NewDomainStep";
import NewDomainNavigation from "@/components/domains/new/NewDomainNavigation";

export const AddDomainContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  steps: typeof steps;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  dnsRecords: typeof dnsRecords;
  currentStepData: (typeof steps)[0];
} | null>(null);

export function AddDomainProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const form = useForm<AddDomainFormType>({
    defaultValues: {
      domain: "",
      dnsRecords: [],
    },
  });
  const currentStepData =
    steps.find((step) => step.number === currentStep) || steps[0];

  return (
    <AddDomainContext.Provider
      value={{
        open,
        setOpen,
        steps,
        currentStep,
        setCurrentStep,
        dnsRecords,
        currentStepData,
      }}
    >
      <Dialog open={open} onOpenChange={setOpen} modal={true}>
        <FormProvider {...form}>
          <DialogContent className="sm:max-w-fit max-h-[90dvh] overflow-y-auto">
            <DialogClose />
            <DialogHeader className="px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <DialogTitle className="text-2xl font-bold">
                      Add New Domain
                    </DialogTitle>
                    <p className="text-muted-foreground">
                      Connect your domain to start creating mailboxes and
                      sending cold emails
                    </p>
                  </div>
                </div>
                <NewDomainHeaderDetails />
              </div>
            </DialogHeader>

            <div>
              <NewDomainStepper />
              <NewDomainStep />
            </div>
            <DialogFooter>
              <NewDomainNavigation />
            </DialogFooter>
          </DialogContent>
        </FormProvider>
      </Dialog>
      {children}
    </AddDomainContext.Provider>
  );
}
export function useAddDomainContext() {
  const context = useContext(AddDomainContext);
  if (!context) {
    throw new Error(
      "useAddDomainContext must be used within AddDomainProvider"
    );
  }
  return context;
}
