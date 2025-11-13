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
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Plus, AlertCircle } from "lucide-react";
import Link from "next/link";
import { MailboxWarmupData } from "@/types";
import { mapRawToLegacyMailboxData } from "@/lib/utils/analytics-mappers";
// Migration note: Using local alias for mailbox analytics state, all mailbox analytics set via mapper.
import MailboxesFilter from "./MailboxesFilter";

type LocalProgressiveAnalyticsState = Record<
  string,
  {
    data: ReturnType<typeof mapRawToLegacyMailboxData> | null;
    loading: boolean;
    error: string | null;
  }
>;

interface MailboxesTabProps {
  mailboxes: MailboxWarmupData[];
  analyticsState: LocalProgressiveAnalyticsState;
  loading: boolean;
  error: string | null;
}

function MailboxesTab({
  mailboxes,
  analyticsState,
  loading,
  error,
}: MailboxesTabProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">
                All Mailboxes
              </h2>
              <Badge className="bg-primary/20 text-primary">Loading...</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Loading mailboxes...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">
                All Mailboxes
              </h2>
              <Badge className="bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400">
                Error
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              All Mailboxes
            </h2>
            <Badge className="bg-primary/20 text-primary">
              {mailboxes.length} total
            </Badge>
          </div>
        </CardTitle>
        <div className="flex justify-end">
          <Button asChild>
            <Link
              href="/dashboard/domains/mailboxes/new"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4 " />
              Add Mailbox
            </Link>
          </Button>
        </div>
      </CardHeader>
      <MailboxesFilter />
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-100 dark:bg-muted">
              <TableRow>
                <TableHead>Mailbox</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Daily Limit</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Total Warmups</TableHead>
                <TableHead>Spam Flags</TableHead>
                <TableHead>Replies</TableHead>
                <TableHead>Health Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mailboxes.map((mailbox) => {
                const analytics = analyticsState[mailbox.id];
                return (
                  <TableRow
                    key={mailbox.id}
                    className="hover:bg-gray-50 dark:hover:bg-muted/30 transition-colors group"
                  >
                    <TableCell className="px-8 py-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-foreground cursor-pointer hover:text-blue-600 transition-colors text-lg">
                          {mailbox.email}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Date Created :{" "}
                          {Intl.DateTimeFormat("en-US").format(
                            new Date(mailbox.createdAt || "")
                          )}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Domain:{" "}
                          {mailbox.domain || mailbox.email.split("@")[1]}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-6">
                      <Badge
                        variant={
                          mailbox.status === "active"
                            ? "default"
                            : mailbox.status === "warming"
                              ? "secondary"
                              : "outline"
                        }
                        className="capitalize"
                      >
                        {mailbox.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-6">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-foreground">
                          {mailbox.dailyVolume}/day
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Daily sending limit
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-foreground">
                            {(
                              analytics?.data?.totalWarmups || 0
                            ).toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-500">
                            total sent
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-6 text-sm text-gray-500">
                      {analytics?.data?.lastUpdated
                        ? analytics.data.lastUpdated.toLocaleString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {analytics?.loading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">
                            Loading...
                          </span>
                        </div>
                      ) : analytics?.error ? (
                        <div className="flex items-center space-x-2 text-red-500">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">Error</span>
                        </div>
                      ) : analytics?.data ? (
                        <>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${analytics.data.warmupProgress}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              {analytics.data.warmupProgress}%
                            </span>
                          </div>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          N/A
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {analytics?.loading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">
                            Loading...
                          </span>
                        </div>
                      ) : analytics?.error ? (
                        <div className="flex items-center space-x-2 text-red-500">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">Error</span>
                        </div>
                      ) : (
                        <span className="text-sm font-medium">
                          {analytics?.data?.totalWarmups || "N/A"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {analytics?.loading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">
                            Loading...
                          </span>
                        </div>
                      ) : analytics?.error ? (
                        <div className="flex items-center space-x-2 text-red-500">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">Error</span>
                        </div>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-red-600 border-red-300"
                        >
                          {analytics?.data?.spamFlags || "N/A"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {analytics?.loading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">
                            Loading...
                          </span>
                        </div>
                      ) : analytics?.error ? (
                        <div className="flex items-center space-x-2 text-red-500">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">Error</span>
                        </div>
                      ) : (
                        <span className="text-sm font-medium">
                          {analytics?.data?.replies || "N/A"}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {analytics?.loading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">
                            Loading...
                          </span>
                        </div>
                      ) : analytics?.error ? (
                        <div className="flex items-center space-x-2 text-red-500">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">Error</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {analytics?.data?.healthScore || "N/A"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            %
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-6 text-right">
                      {/* <MailboxActions mailbox={mailbox} /> */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary"
                      >
                        View Details
                      </Button>
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
export default MailboxesTab;
