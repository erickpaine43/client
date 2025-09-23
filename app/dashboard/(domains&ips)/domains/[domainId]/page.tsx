import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { EmailsTable } from "@/components/domains/components/emails-table";
import { getDomainById, getTopAccountsForDomain } from "@/lib/actions/domains";
import WeeklyMetricsClient from "./weekly-metrics-client";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Mail,
  Settings,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { Domain } from "@/types";

export default async function DomainPage({
  params,
}: {
  params: Promise<{ domainId: string }>;
}) {
  const { domainId } = await params;
  const domainIdNum = parseInt(domainId);
  const domain = await getDomainById(domainIdNum);
  if (!domain) {
    return <div>Domain not found</div>;
  }

  const topAccounts = await getTopAccountsForDomain(domainIdNum, 10);

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/domains">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">{domain.name}</h1>
            <Button asChild>
              <Link href={`/dashboard/domains/${domain.id}/settings`}>
                <Settings className="mr-2 h-4 w-4" />
                Domain Settings
              </Link>
            </Button>
          </div>
          <p className="text-muted-foreground">{domain.provider}</p>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Reputation Score
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{domain.reputation}%</div>
                  <Progress value={domain.reputation} className="w-16 h-2" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Overall domain performance and authentication status
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Emails (24h)
                </CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(domain as Domain).metrics?.total24h}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((domain as Domain).metrics?.bounceRate ?? 0 * 100).toFixed(1)}% bounce rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {((domain as Domain).metrics?.openRate ?? 0 * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {((domain as Domain).metrics?.replyRate ?? 0 * 100).toFixed(1)}% reply rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Spam Rate</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {((domain as Domain).metrics?.spamRate ?? 0 * 100).toFixed(3)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Last 7 days average
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Status</CardTitle>
                <CardDescription>
                  Email authentication records and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium mb-1">SPF Record</div>
                      <div className="text-sm text-muted-foreground">
                        Validates sending servers
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        domain.spf
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }
                    >
                      {domain.spf ? "Configured" : "Not Configured"}
                    </Badge>
                  </div>
  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium mb-1">DKIM Record</div>
                      <div className="text-sm text-muted-foreground">
                        Signs outgoing emails
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        domain.dkim
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }
                    >
                      {domain.dkim ? "Configured" : "Not Configured"}
                    </Badge>
                  </div>
  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium mb-1">DMARC Record</div>
                      <div className="text-sm text-muted-foreground">
                        Email authentication policy
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        domain.dmarc
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }
                    >
                      {domain.dmarc ? "Configured" : "Not Configured"}
                    </Badge>
                  </div>
                </div>
  
                {(!domain.spf || !domain.dkim || !domain.dmarc) && (
                  <Button className="w-full mt-6" asChild>
                    <Link href={`/dashboard/domains/${domain.id}/setup`}>
                      Complete Setup
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
  
            <Card>
              <CardHeader>
                <CardTitle>Weekly Metrics</CardTitle>
                <CardDescription>
                  Performance trends over the last 7 days
                </CardDescription>
              </CardHeader>
              <WeeklyMetricsClient />
            </Card>
          </div>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top Email Accounts</CardTitle>
                <CardDescription>
                  Best performing email accounts in this domain
                </CardDescription>
              </div>
              <Button variant="outline" asChild>
                <Link href={`/dashboard/domains/${domain.id}/accounts`}>
                  View All Accounts
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <EmailsTable emailAccounts={topAccounts} domainId={domainId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
