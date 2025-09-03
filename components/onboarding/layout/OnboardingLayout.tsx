"use client";
import { Card, CardContent } from "@/components/ui/card";
import { useOnboarding } from "@/context/onboarding-context";
import { HelpSection } from "../HelpSection";
import { StepCard } from "../steps/StepCard";
import { Stepper, Step } from "@/components/ui/Stepper";
import { createContext } from "react";

interface OnboardingStepperContext {
  steps: Step[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

export function OnboardingLayout() {
  const { currentStepData, currentStep, steps, setCurrentStep } = useOnboarding();

  if (!currentStepData) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              No onboarding steps available
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Convert onboarding steps to generic Step interface
  const stepperSteps: Step[] = steps.map((step) => ({
    number: step.id,
    title: step.title,
    icon: step.icon,
    color: step.color,
  }));

  const StepperContext = createContext<OnboardingStepperContext | null>({
    steps: stepperSteps,
    currentStep,
    setCurrentStep,
  });

  const stepData = {
    number: currentStepData.id,
    title: currentStepData.title,
    description: currentStepData.explanation,
    IconComponent: currentStepData.icon,
  };

  return (
    <div className="space-y-6">
      <StepperContext.Provider value={{ steps: stepperSteps, currentStep, setCurrentStep }}>
        <Stepper context={StepperContext} />
      </StepperContext.Provider>
      <StepCard {...stepData} />
      <HelpSection />
    </div>
  );
}
