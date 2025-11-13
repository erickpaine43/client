"use client";
import { Card, CardContent } from "@/components/ui/card";
import { useAddCampaignContext } from "@/context/AddCampaignContext";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

function AddCampaignSteps() {
  const { currentStep, setCurrentStep, steps } = useAddCampaignContext();
  return (
    <Card className="p-0 overflow-hidden">
      <CardContent className="bg-muted/30 dark:bg-muted/20 px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;
            const isAccessible = currentStep >= step.number;

            return (
              <div key={step.number} className="flex items-center">
                <button
                  onClick={() => isAccessible && setCurrentStep(step.number)}
                  disabled={!isAccessible}
                  className={cn(
                    "flex flex-col items-center space-y-2 p-4 rounded-xl transition-all",
                    isActive
                      ? "bg-card dark:bg-card shadow-lg scale-105"
                      : isCompleted
                        ? "bg-card dark:bg-card shadow-sm hover:shadow-md"
                        : "bg-muted dark:bg-muted/60 opacity-50 cursor-not-allowed",
                    ""
                  )}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      isActive
                        ? step.color
                        : isCompleted
                          ? "bg-green-500 dark:bg-green-500/80"
                          : "bg-muted-foreground/30 dark:bg-muted-foreground/20"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6 text-white" />
                    ) : (
                      <StepIcon className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="text-center">
                    <p
                      className={cn(
                        "text-sm font-medium ",
                        isActive
                          ? "text-foreground"
                          : isCompleted
                            ? "text-foreground"
                            : "text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </p>
                    <p
                      className={cn(
                        "text-xs",
                        isActive
                          ? "text-muted-foreground"
                          : "text-muted-foreground/60"
                      )}
                    >
                      {step.subtitle}
                    </p>
                  </div>
                </button>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-16 h-1 mx-4 rounded-full",
                      isCompleted
                        ? "bg-green-500 dark:bg-green-500/80"
                        : "bg-border"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
export default AddCampaignSteps;
