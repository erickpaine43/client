import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Trash2 } from "lucide-react";
import { EmailStep } from "./seuenece-email";

interface WaitStepProps {
  step: EmailStep;
  index: number;
  updateStep: (index: number, updates: Partial<EmailStep>) => void;
  removeStep: (index: number) => void;
}

function WaitStep({ step, index, updateStep, removeStep }: WaitStepProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100">
            <Clock className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Wait Step</h3>
            <p className="text-sm text-gray-500">Step {index + 1}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => removeStep(index)}
          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Wait Duration
          </Label>
          <Input
            type="number"
            value={step.delay || 2}
            onChange={(e) =>
              updateStep(index, {
                delay: parseInt(e.target.value) || 0,
              })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          />
        </div>
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">
            Unit
          </Label>
          <Select
            value={step.delayUnit || "days"}
            onValueChange={(value) =>
              updateStep(index, {
                delayUnit: value as "hours" | "days",
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hours">Hours</SelectItem>
              <SelectItem value="days">Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
export default WaitStep;
