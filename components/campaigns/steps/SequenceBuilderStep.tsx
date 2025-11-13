"use client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAddCampaignContext } from "@/context/AddCampaignContext";
import { Clock, Mail, Zap, AlertTriangle } from "lucide-react";
import { useRef } from "react";
import WaitStep from "./components/sequence-wait";
import EmailStep, {
  EmailStep as EmailStepInterface,
} from "./components/seuenece-email";

function SequenceBuilderStep() {
  const { form } = useAddCampaignContext();
  const { setValue, watch } = form;
  const sequence = watch("sequence") || [];
  const focusedTextareaIndex = useRef<number | null>(null);
  const addEmailStep = () => {
    const newStep: EmailStepInterface = {
      id: Date.now().toString(),
      type: "email",
      subject: "",
      content: "",
      condition: sequence.length > 0 ? "no_reply" : "always",
    };
    setValue("sequence", [...sequence, newStep]);
  };

  const addWaitStep = () => {
    const newStep: EmailStepInterface = {
      id: Date.now().toString(),
      type: "wait",
      delay: 2,
      delayUnit: "days",
    };
    setValue("sequence", [...sequence, newStep]);
  };
  const updateStep = (index: number, updates: Partial<EmailStepInterface>) => {
    const updatedSequence = sequence.map((step, i) =>
      i === index ? { ...step, ...updates } : step
    );
    setValue("sequence", updatedSequence);
  };

  const removeStep = (index: number) => {
    const updatedSequence = sequence.filter((_, i) => i !== index);
    setValue("sequence", updatedSequence);
  };

  // Check for sequence flow issues
  const getSequenceIssues = () => {
    const issues = [];
    for (let i = 0; i < sequence.length - 1; i++) {
      if (sequence[i].type === "email" && sequence[i + 1].type === "email") {
        issues.push({
          type: "consecutive_emails",
          stepIndex: i + 1,
          message: `Step ${i + 2}: Two emails in a row without a wait step may cause delivery issues`,
        });
      }
    }
    return issues;
  };

  const sequenceIssues = getSequenceIssues();

  return (
    <>
      <Card className="bg-card dark:bg-card rounded-2xl shadow-sm border border-border p-8">
        <CardHeader className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Build Email Sequence
          </h2>
          <p className="text-muted-foreground">
            Create your email flow with personalized messages and timing
          </p>
        </CardHeader>

        <div className="flex justify-center space-x-4 mb-8">
          <Button
            type="button"
            onClick={addEmailStep}
            className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors flex items-center space-x-2 shadow-sm"
          >
            <Mail className="w-5 h-5" />
            <span>Add Email</span>
          </Button>
          <Button
            type="button"
            onClick={addWaitStep}
            className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors flex items-center space-x-2 shadow-sm"
          >
            <Clock className="w-5 h-5" />
            <span>Add Wait</span>
          </Button>
        </div>
      </Card>

      {/* Sequence Issues Warning */}
      {sequenceIssues.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="font-medium mb-1">Sequence Issues Detected</div>
            {sequenceIssues.map((issue, index) => (
              <div key={index} className="text-sm">
                {issue.message}
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {sequence.map((step, index) => (
          <div key={step.id}>
            {step.type === "email" ? (
              <EmailStep
                step={step}
                index={index}
                updateStep={updateStep}
                removeStep={removeStep}
                focusedTextareaIndex={focusedTextareaIndex}
              />
            ) : (
              <WaitStep
                step={step}
                index={index}
                updateStep={updateStep}
                removeStep={removeStep}
              />
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default SequenceBuilderStep;
