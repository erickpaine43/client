import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function WarmupSummarySkeleton() {
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
          <Skeleton className="h-4 w-12 bg-muted dark:bg-muted/60 animate-pulse" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Warming Up</span>
          <Skeleton className="h-4 w-12 bg-muted dark:bg-muted/60 animate-pulse" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Ready to Send</span>
          <Skeleton className="h-4 w-12 bg-muted dark:bg-muted/60 animate-pulse" />
        </div>
      </CardContent>
      <CardFooter className="border-t border-border">
        <Skeleton className="h-4 bg-muted dark:bg-muted/60 animate-pulse " />
      </CardFooter>
    </Card>
  );
}
export default WarmupSummarySkeleton;
