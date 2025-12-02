"use client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAddCampaignContext } from "@/context/AddCampaignContext";
import { leadLists } from "@/lib/data/leads";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

function LeadsSelectionStep() {
  const { form, editingMode } = useAddCampaignContext();
  const { setValue, watch } = form;
  const selectedLeadsList = watch("leadsList");
  const handleLeadsListChange = (listId: string) => {
    const selectedList = leadLists.find((list) => list.id === listId);
    if (selectedList) {
      setValue("leadsList", selectedList);
    }
  };

  return (
    <>
      <Card className="max-w-2xl mx-auto p-6">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Select Lead List
          </h2>
          <p className="text-muted-foreground">
            Choose which leads you want to target with this campaign
          </p>
          {editingMode ? (
            <Alert className="mt-4 bg-blue-100 dark:bg-blue-500/20">
              <AlertDescription className="text-blue-800 dark:text-blue-400 text-sm font-medium">
                Lead list cannot be changed after launch
              </AlertDescription>
            </Alert>
          ) : null}
        </CardHeader>

        <CardContent className="grid gap-4">
          <RadioGroup
            value={selectedLeadsList?.id.toString()}
            onValueChange={handleLeadsListChange}
            disabled={editingMode}
          >
            {leadLists.map((list) => (
              <Label
                key={list.id}
                className={cn(
                  "flex items-center p-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md has-[[aria-checked=true]]:border-purple-500 has-[[aria-checked=true]]:bg-purple-50 dark:has-[[aria-checked=true]]:bg-purple-500/20 border-border hover:border-border/80 bg-muted/50 dark:bg-muted/30 disabled:opacity-50 disabled:cursor-not-allowed",
                  {
                    "border-purple-500 bg-purple-50 dark:bg-purple-500/20":
                      selectedLeadsList?.id === list.id,
                    "bg-muted dark:bg-muted/40 cursor-not-allowed": editingMode,
                  }
                )}
              >
                <RadioGroupItem
                  value={list.id}
                  className="w-5 h-5 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-border disabled:opacity-50"
                />
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-foreground">
                      {list.name}
                    </h4>
                    <span className="px-3 py-1 bg-muted dark:bg-muted/60 text-foreground rounded-full text-sm font-medium">
                      {list.contacts.toLocaleString()} contacts
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1">
                    {list.description}
                  </p>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
    </>
  );
}
export default LeadsSelectionStep;
