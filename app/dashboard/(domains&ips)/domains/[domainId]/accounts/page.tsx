import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmailsTable } from "@/components/domains/components/emails-table";
import { ArrowLeft, PlusCircle } from "lucide-react";
import Link from "next/link";
import { getDomainWithAccounts } from "@/lib/actions/domains";
import { notFound } from "next/navigation";

export default async function DomainAccountsPage({
  params,
}: {
  params: Promise<{ domainId: string }>;
}) {
  const { domainId } = await params;
  const domainData = await getDomainWithAccounts(parseInt(domainId));

  if (!domainData) {
    notFound();
  }

  const { domain, emailAccounts } = domainData;

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/domains/${domain.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Email Accounts</h1>
            <Button asChild>
              <Link href={`/dashboard/domains/${domain.id}/accounts/new`}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Account
              </Link>
            </Button>
          </div>
          <p className="text-muted-foreground">{domain.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Accounts</CardTitle>
          <CardDescription>
            Manage email accounts associated with this domain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmailsTable emailAccounts={emailAccounts} domainId={domainId} />
        </CardContent>
      </Card>
    </div>
  );
}
