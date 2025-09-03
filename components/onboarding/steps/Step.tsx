"use client";

import { ActionButtons } from "../navigation/ActionButtons";
import { PromotionAlert } from "../components/PromotionAlert";
import { OnboardingStep } from "@/context/onboarding-context";
import { VideoTutorial } from "../components/VideoTutorial";

interface StepProps {
  step: OnboardingStep;
}

export function Step({ step }: StepProps) {
  return (
    <div className="space-y-8">
      <p className="text-lg leading-relaxed text-muted-foreground">
        {step.explanation}
      </p>
      <VideoTutorial stepTitle={step.title} />
      <ActionButtons step={step} />
      {step.promotion && <PromotionAlert promotion={step.promotion} />}
    </div>
  );
}
