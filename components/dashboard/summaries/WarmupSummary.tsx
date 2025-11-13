import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { WarmupSummaryData } from "@/types/campaign";

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
          <span className="font-medium text-orange-600 dark:text-orange-400">
            {data.warmingUp}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Ready to Send</span>
          <span className="font-medium text-green-600 dark:text-green-400">
            {data.readyToSend}
          </span>
        </div>
      </CardContent>
      <CardFooter className="border-t">
        <div className="flex items-center text-sm text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-4 h-4 mr-2" />
          {data.needsAttention} mailboxes need attention
        </div>
      </CardFooter>
    </Card>
  );
}
export default WarmupSummary;
