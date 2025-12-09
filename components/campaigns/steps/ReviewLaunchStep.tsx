"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAddCampaignContext } from "@/context/AddCampaignContext";
import { Check } from "lucide-react";

function ReviewLaunchStep() {
  const { form } = useAddCampaignContext();
  const campaignData = form.watch();

  return (
    <Card className="max-w-3xl mx-auto space-y-8">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Review & Launch
        </h2>
        <p className="text-muted-foreground">
          Final review of your campaign before launching
        </p>
      </CardHeader>

      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-muted/50 dark:bg-muted/30 rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">
            Campaign Overview
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium text-foreground">
                {campaignData.name || "Untitled Campaign"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lead List:</span>
              <span className="font-medium text-foreground">
                {campaignData.leadsList?.name || "None selected"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Contacts:</span>
              <span className="font-medium text-foreground">
                {campaignData.leadsList?.contacts?.toLocaleString() || "0"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mailboxes:</span>
              <span className="font-medium text-foreground">
                {campaignData.selectedMailboxes?.length || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 dark:bg-muted/30 rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">
            Sequence & Schedule
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sequence Steps:</span>
              <span className="font-medium text-foreground">
                {campaignData.sequence?.length || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Daily Limit:</span>
              <span className="font-medium text-foreground">
                {campaignData.schedule?.dailyLimit || 0} emails/day
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sending Hours:</span>
              <span className="font-medium text-foreground">
                {campaignData.schedule?.startTime || "N/A"} -{" "}
                {campaignData.schedule?.endTime || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Timezone:</span>
              <span className="font-medium text-foreground">
                {campaignData.schedule?.timezone || "Not set"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
export default ReviewLaunchStep;
