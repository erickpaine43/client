"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getStatusColor } from "@/lib/utils/domains";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Mail,
  Pause,
  Settings,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { DomainWithMailboxesData } from "@/lib/actions/domainsActions";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function WarmupTab({ domainsData, loading, error }: { domainsData: DomainWithMailboxesData[], loading: boolean, error: string | null }) {
  return (
    <div className="space-y-8">
      <WarmupMailboxesTable domainsData={domainsData} loading={loading} error={error} />
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <div className={cn("p-2 rounded-lg", "bg-blue-100")}>
              <AlertTriangle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-2">Warmup Best Practices</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  • Start with 5-10 emails per day and gradually increase volume
                </li>
                <li>
                  • Maintain consistent sending patterns to build reputation
                </li>
                <li>• Engage with warmup replies to improve deliverability</li>
                <li>• Monitor spam folder placement and adjust if needed</li>
                <li>
                  • Complete warmup process takes 2-4 weeks for optimal results
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default WarmupTab;

function WarmupMailboxesTable({ domainsData, loading, error }: { domainsData: DomainWithMailboxesData[], loading: boolean, error: string | null }) {

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "WARMED":
        return <CheckCircle className="w-3 h-3 text-green-600" />;
      case "WARMING":
        return <Clock className="w-3 h-3 text-blue-600" />;
      case "PAUSED":
        return <Pause className="w-3 h-3 text-yellow-600" />;
      case "NOT_STARTED":
      default:
        return <Clock className="w-3 h-3 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Warmup Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Loading domain data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Warmup Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <AlertTriangle className="w-8 h-8 text-red-500 mr-2" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (domainsData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Warmup Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Mail className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <span>No domains found</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Warmup Status</CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
          <Link href="/dashboard/analytics/mailboxes">
            <Button variant="ghost" size="icon">
              <BarChart3 className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead>Status Summary</TableHead>
                <TableHead>Mailboxes</TableHead>
                <TableHead>Daily Count</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domainsData.map((domainData) => {
                const { domain, aggregated } = domainData;
                const mainStatus = aggregated.statusSummary.NOT_STARTED > 0 ? 'NOT_STARTED'
                  : aggregated.statusSummary.WARMING > 0 ? 'WARMING'
                    : aggregated.statusSummary.PAUSED > 0 ? 'PAUSED'
                      : aggregated.statusSummary.WARMED > 0 ? 'WARMED' : 'NOT_STARTED';

                return (
                  <TableRow
                    key={domain.id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <TableCell className="px-8 py-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors text-lg">
                          {domain.domain}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Status: {domain.status}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          DNS: {domain.records?.spf === 'verified' ? '✅' : '❌'} SPF, {domain.records?.dkim === 'verified' ? '✅' : '❌'} DKIM, {domain.records?.dmarc === 'verified' ? '✅' : '❌'} DMARC
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-6">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(
                            mainStatus,
                          )}`}
                        >
                          {getStatusIcon(mainStatus)}
                          <span className="capitalize">
                            {mainStatus === "WARMED"
                              ? "Ready"
                              : mainStatus === "WARMING"
                                ? "Warming"
                                : mainStatus === "PAUSED"
                                  ? "Paused"
                                  : mainStatus === "NOT_STARTED"
                                    ? "Not Started"
                                    : mainStatus}
                          </span>
                        </span>
                        <div className="text-xs text-gray-500">
                          {aggregated.statusSummary.WARMED} Ready, {aggregated.statusSummary.WARMING} Warming, {aggregated.statusSummary.PAUSED} Paused
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-6">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 underline decoration-dotted">
                              {aggregated.totalMailboxes}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <div className="space-y-1 bg-gray-90">
                              <div className="font-medium">Mailboxes in {domain.domain}:</div>
                              {domainData.mailboxes.length > 0 ? (
                                domainData.mailboxes.map((mailbox) => (
                                  <div key={mailbox.id} className="text-xs">
                                    <span className="font-medium">{mailbox.email}</span>
                                    <span> - {mailbox.warmupStatus}</span>
                                  </div>
                                ))
                              ) : (
                                <div className="text-xs text-muted-foreground">No mailboxes configured</div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {aggregated.activeMailboxes} active
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-6">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {aggregated.totalWarmups}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Average daily: {aggregated.avgDailyLimit}
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            {aggregated.totalSent}
                          </span>
                          <span className="text-xs text-gray-500">
                            total sent
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-green-600">
                            {aggregated.avgWarmupProgress}%
                          </span>
                          <span className="text-xs text-gray-500">
                            avg progress
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link href={`/dashboard/domains/${domain.id}`}>
                          <Button variant="ghost" size="icon">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/analytics/mailboxes?domain=${domain.domain}`}>
                          <Button variant="ghost" size="icon">
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
