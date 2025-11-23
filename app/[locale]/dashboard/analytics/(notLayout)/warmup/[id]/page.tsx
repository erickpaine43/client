import WarmUpTable from "@/components/analytics/warmup/warmup-[id]-table";
import WarmupStatsOverview from "@/components/analytics/warmup/warmup-stats-overview";
import { Button } from "@/components/ui/button/button";
import { Separator } from "@/components/ui/separator";
import { getMailboxById } from "@/lib/queries/warmup";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

async function page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) {
    return notFound();
  }

  const [mailbox] = await Promise.all([getMailboxById(id)]);

  if (!mailbox) {
    return notFound();
  }
  return (
    <div className=" space-y-4">
      <div className="flex">
        <div className="flex items-center space-x-4">
          <Button
            className="text-foreground dark:text-muted-foreground"
            variant="ghost"
            asChild
          >
            <Link href="/dashboard/analytics/warmup">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Mailboxes</span>
            </Link>
          </Button>
          <Separator orientation="vertical" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {mailbox.name}
            </h1>
            <p className="text-muted-foreground">{mailbox.email}</p>
          </div>
        </div>
      </div>
      <WarmupStatsOverview mailbox={mailbox} />
      <WarmUpTable mailboxId={id} />
    </div>
  );
}
export default page;
