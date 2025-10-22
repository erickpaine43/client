import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { WarmupSummaryData } from "@/types/campaign";

interface WarmupSummaryProps {
  data: WarmupSummaryData;
}

function WarmupSummary({ data }: WarmupSummaryProps) {
  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200 ">
      <CardHeader>
        <h3 className="font-semibold text-gray-900 mb-4">Warmup Status</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Active Mailboxes</span>
          <span className="font-medium">{data.activeMailboxes}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Warming Up</span>
          <span className="font-medium text-orange-600">{data.warmingUp}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Ready to Send</span>
          <span className="font-medium text-green-600">{data.readyToSend}</span>
        </div>
      </CardContent>
      <CardFooter className="border-t border-gray-200">
        <div className="flex items-center text-sm text-amber-600">
          <AlertTriangle className="w-4 h-4 mr-2" />{data.needsAttention} mailboxes need attention
        </div>
      </CardFooter>
    </Card>
  );
}
export default WarmupSummary;
