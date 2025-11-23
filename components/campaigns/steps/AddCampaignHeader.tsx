"use client";
import { Button } from "@/components/ui/button/button";
import { useAddCampaignContext } from "@/context/AddCampaignContext";
import useBack from "@/hooks/use-back";
import { ArrowLeft } from "lucide-react";
function AddCampaignHeader({ children }: { children?: React.ReactNode }) {
  const { currentStep, steps, currentStepData } = useAddCampaignContext();
  const Icon = currentStepData.icon;
  const back = useBack();
  return (
    <>
      <div className="bg-card dark:bg-card border-b border-border px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button size={"icon"} onClick={back} variant="ghost">
              <ArrowLeft />
            </Button>
            <div>
              {children}
              <p className="text-muted-foreground">
                Step {currentStep} of {steps.length}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {currentStepData.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentStepData.subtitle}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${currentStepData.color}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default AddCampaignHeader;
