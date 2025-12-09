import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { WarmupSummaryData } from "@/types/campaign";
import { statusColors } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

interface WarmupSummaryProps {
  data: WarmupSummaryData;
}

function WarmupSummary({ data }: WarmupSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Warmup Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Active Mailboxes
          </span>
          <span className="font-medium">{data.activeMailboxes}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Warming Up</span>
          <span className={cn("font-medium", statusColors.warning)}>
            {data.warmingUp}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Ready to Send</span>
          <span className={cn("font-medium", statusColors.success)}>
            {data.readyToSend}
          </span>
        </div>
      </CardContent>
      <CardFooter className="border-t">
        <div className={cn("flex items-center text-sm", statusColors.alert)}>
          <AlertTriangle className="w-4 h-4 mr-2" />
          {data.needsAttention} mailboxes need attention
        </div>
      </CardFooter>
    </Card>
  );
}
export default WarmupSummary;
