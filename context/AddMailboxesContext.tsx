"use client";
import AddMailboxesNavigation from "@/components/domains/mailboxes/new/AddMailboxesNavigation";
import AddMailboxesStep from "@/components/domains/mailboxes/new/AddMailboxesStep";
import AddMailboxesStepper from "@/components/domains/mailboxes/new/AddMailboxesStepper";
import NewMailboxHeaderDetails from "@/components/domains/mailboxes/new/NewMailboxHeaderDetails";
import { Button } from "@/components/ui/button/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, CheckCircle, Mail, Settings } from "lucide-react";
import Link from "next/link";
import { createContext, useContext, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

const steps = [
  {
    number: 1,
    title: "Mailbox Details",
    subtitle: "Set up basic mailbox information",
    icon: Mail,
    color: "bg-blue-500",
  },
  {
    number: 2,
    title: "Mailbox Settings",
    subtitle: "Configure sending and warmup limits",
    icon: Settings,
    color: "bg-purple-500",
  },
  {
    number: 3,
    title: "Success",
    subtitle: "Mailbox created successfully",
    icon: CheckCircle,
    color: "bg-green-500 text-white",
  },
];

export const AddMailboxesContext = createContext<{
  steps: typeof steps;
  currentStep: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  setCurrentStep: (step: number) => void;
  currentStepData: (typeof steps)[0];
} | null>(null);

export const addMailboxesFormSchema = z.object({
  name: z.string().min(2).max(100),
  domain: z.string().min(2).max(100),
  password: z.string().min(6).max(100),
  confirmPassword: z.string().min(6).max(100),
  dailyLimit: z.number().min(1),
  enableWarmup: z.boolean().optional(),
  enableWarmupLimits: z.boolean().optional(),
});

type AddMailboxesFormType = z.infer<typeof addMailboxesFormSchema>;
export function AddMailboxesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const form = useForm<AddMailboxesFormType>({
    defaultValues: {
      name: "",
      domain: "",
      password: "",
      confirmPassword: "",
      dailyLimit: 30,
      enableWarmup: false,
      enableWarmupLimits: false,
    },
  });
  const currentStepData =
    steps.find((step) => step.number === currentStep) || steps[0];

  return (
    <AddMailboxesContext.Provider
      value={{
        open,
        setOpen,
        steps,
        currentStep,
        setCurrentStep,
        currentStepData,
      }}
    >
      <Dialog open={open} onOpenChange={setOpen} modal={true}>
        <FormProvider {...form}>
          <DialogContent className="sm:max-w-fit max-h-[90dvh] overflow-y-auto">
            <DialogClose />
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/domains">
                      <ArrowLeft className="w-6 h-6" />
                    </Link>
                  </Button>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-foreground">
                      Create New Mailbox
                    </DialogTitle>
                    <p className="text-gray-600 dark:text-muted-foreground">
                      Set up a mailbox to start sending cold emails
                    </p>
                  </div>
                </div>
                <NewMailboxHeaderDetails />
              </div>
            </DialogHeader>
            <div>
              <AddMailboxesStepper />
              <AddMailboxesStep />
            </div>
            <DialogFooter>
              <AddMailboxesNavigation />
            </DialogFooter>
          </DialogContent>
        </FormProvider>
      </Dialog>
      {children}
    </AddMailboxesContext.Provider>
  );
}
export function useAddMailboxesContext() {
  const context = useContext(AddMailboxesContext);
  if (!context) {
    throw new Error(
      "useAddMailboxesContext must be used within AddDomainProvider"
    );
  }
  return context;
}
