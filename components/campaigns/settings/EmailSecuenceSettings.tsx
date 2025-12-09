"use client";

import React from "react";
import { Button } from "@/components/ui/button/button";
import { copyText as t } from "../data/copy";
import { EmailSecuenceSettingsProps } from "@/types/campaigns";
import { FileText } from "lucide-react";
import { SequenceStep } from "../steps/compositions/SequenceStep";

// README: Migration note - EmailSecuenceSettings hasn't required analytics shape
// changes, but we remove noisy debugging and ensure `steps` is treated as a
// stable array. We also avoid any explicit `any` casts when checking stepErrors.

export function EmailSecuenceSettings({
  steps,
  templates,
  emailBodyRef,
  currentEditingStep,
  actions,
  stepErrors,
}: EmailSecuenceSettingsProps) {
  const { handleAddEmailStep, ...restStepActions } = actions;

  return (
    <>
      <div className="space-y-8">
        {(steps || []).map((step, index) => (
          <SequenceStep
            key={step.id ?? index} // Prefer stable id when available
            step={step}
            index={index}
            totalSteps={(steps || []).length}
            currentEditingStep={currentEditingStep}
            emailBodyRef={emailBodyRef}
            templates={templates}
            actions={restStepActions}
          />
        ))}
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleAddEmailStep(steps.length - 1)}
          >
            <FileText className="w-4 h-4 mr-2" />
            {t.addEmail}
          </Button>
        </div>
      </div>
      {Boolean((stepErrors as unknown as Record<string, unknown>)?.message) && (
        <p className="text-sm font-medium text-destructive mt-2">
          {String((stepErrors as unknown as Record<string, unknown>)?.message)}
        </p>
      )}
      {Boolean((stepErrors as unknown as Record<string, unknown>)?.root) && (
        <p className="text-sm font-medium text-destructive mt-2">
          {String(
            (
              (stepErrors as unknown as Record<string, unknown>)
                ?.root as Record<string, unknown>
            )?.message ?? ""
          )}
        </p>
      )}
    </>
  );
}
