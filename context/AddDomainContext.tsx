"use client";
import { createContext, useContext, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { AddDomainFormType } from "@/types/domains";
import { steps, dnsRecords } from "@/lib/data/domains.mock";

export const AddDomainContext = createContext<{
  steps: typeof steps;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  dnsRecords: typeof dnsRecords;
  currentStepData: (typeof steps)[0];
} | null>(null);

export function AddDomainProvider({ children }: { children: React.ReactNode }) {
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
        steps,
        currentStep,
        setCurrentStep,
        dnsRecords,
        currentStepData,
      }}
    >
      <FormProvider {...form}>{children}</FormProvider>
    </AddDomainContext.Provider>
  );
}
export function useAddDomainContext() {
  const context = useContext(AddDomainContext);
  if (!context) {
    throw new Error(
      "useAddDomainContext must be used within AddDomainProvider",
    );
  }
  return context;
}
