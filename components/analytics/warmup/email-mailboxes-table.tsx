"use client";
import React, { useState, useEffect } from "react";
import { Filter, DropDownFilter, SearchInput } from "@/components/ui/custom/Filter";
import { Badge } from "@/components/ui/badge";
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
import { mockMailboxes } from "@/lib/data/analytics.mock";
import { Mail, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useAnalytics } from "@/context/AnalyticsContext";
import {
  MailboxWarmupData,
  MailboxAnalyticsData,
  ProgressiveAnalyticsState
} from "@/types";

function EmailMailboxesTable() {
  const { dateRange } = useAnalytics();
  const [mailboxesLoading, setMailboxesLoading] = useState(true);
  const [mailboxes, setMailboxes] = useState<MailboxWarmupData[]>([]);
  const [mailboxesError, setMailboxesError] = useState<string | null>(null);

  // Progressive analytics state mapping
  const [analyticsState, setAnalyticsState] = useState<ProgressiveAnalyticsState>({});

  // Simulate mailboxes fetch
  useEffect(() => {
    const fetchMailboxes = () => {
      setMailboxesLoading(true);
      setMailboxesError(null);

      setTimeout(() => {
        try {
          // Cast mockMailboxes to match MailboxWarmupData type
          setMailboxes(mockMailboxes as MailboxWarmupData[]);
        } catch {
          setMailboxesError("Failed to load mailboxes");
        } finally {
          setMailboxesLoading(false);
        }
      }, 1500); // Simulate network delay
    };

    fetchMailboxes();
  }, []);

  // Progressive analytics fetch simulation
  useEffect(() => {
    if (mailboxes.length === 0) return;

    const fetchAnalyticsForMailbox = async (mailbox: MailboxWarmupData) => {
      setAnalyticsState((prev: ProgressiveAnalyticsState) => ({
        ...prev,
        [mailbox.id]: { data: null, loading: true, error: null }
      }));

      // Simulate API call delay with random timing to show progressive loading
      const delay = Math.random() * 2000 + 500; // 500ms - 2.5s

      setTimeout(() => {
        try {
          // Simulate analytics calculation based on mock data
          const analytics: MailboxAnalyticsData = {
            mailboxId: mailbox.id,
            warmupProgress: mailbox.warmupProgress,
            totalWarmups: Math.floor(Math.random() * 500) + 200,
            spamFlags: Math.floor(Math.random() * 10) + 1,
            replies: Math.floor(Math.random() * 30) + 5,
            healthScore: mailbox.healthScore,
            lastUpdated: new Date()
          };

          setAnalyticsState((prev: ProgressiveAnalyticsState) => ({
            ...prev,
            [mailbox.id]: { data: analytics, loading: false, error: null }
          }));
        } catch {
          setAnalyticsState((prev: ProgressiveAnalyticsState) => ({
            ...prev,
            [mailbox.id]: {
              data: null,
              loading: false,
              error: "Failed to load analytics"
            }
          }));
        }
      }, delay);
    };

    // Start fetching analytics for each mailbox
    mailboxes.forEach(fetchAnalyticsForMailbox);
  }, [mailboxes, dateRange]);

  const filteredMailboxes = mailboxes;
  // Show loading state while fetching mailboxes
  if (mailboxesLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-gray-900">
                Email Mailboxes
              </h2>
              <Badge className="bg-primary/20 text-primary">
                Loading...
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
              <p className="text-gray-500">
                Loading mailboxes...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (mailboxesError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-gray-900">
                Email Mailboxes
              </h2>
              <Badge className="bg-red-100 text-red-800">
                Error
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">{mailboxesError}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (filteredMailboxes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-gray-900">
                Email Mailboxes
              </h2>
              <Badge className="bg-primary/20 text-primary">
                {filteredMailboxes.length} total
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              No mailboxes found matching your criteria
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">
              Email Mailboxes
            </h2>
            <Badge className="bg-primary/20 text-primary">
              {mailboxesLoading ? "Loading..." : `${filteredMailboxes.length} total`}
            </Badge>
          </div>
        </CardTitle>
        <Filter className="border-none shadow-none">
          <div className="flex-1">
            <SearchInput placeholder="Search Mailboxes" />
          </div>
          <div>
            <DropDownFilter
              placeholder="Select Status"
              options={[
                {
                  label: "All Status",
                  value: "all",
                  default: true,
                },
                {
                  label: "Active",
                  value: "active",
                },
                {
                  label: "Warming",
                  value: "warming",
                },
                {
                  label: "Paused",
                  value: "paused",
                },
              ]}
            />
          </div>
        </Filter>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mailbox</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Total Warmups</TableHead>
              <TableHead>Spam Flags</TableHead>
              <TableHead>Replies</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMailboxes.map((mailbox) => {
              const analytics = analyticsState[mailbox.id];
              return (
                <TableRow
                  key={mailbox.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell>
                    <div>
                      <div className="font-medium">{mailbox.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {mailbox.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={mailbox.status === "active" ? "default" : mailbox.status === "warming" ? "secondary" : "outline"}
                      className="capitalize"
                    >
                      {mailbox.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {analytics?.loading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Loading...</span>
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
                              style={{ width: `${analytics.data.warmupProgress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{analytics.data.warmupProgress}%</span>
                        </div>
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {analytics?.loading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Loading...</span>
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
                        <span className="text-sm text-muted-foreground">Loading...</span>
                      </div>
                    ) : analytics?.error ? (
                      <div className="flex items-center space-x-2 text-red-500">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">Error</span>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-red-600 border-red-300">
                        {analytics?.data?.spamFlags || "N/A"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {analytics?.loading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Loading...</span>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary"
                      asChild
                    >
                      <Link href={`/dashboard/analytics/warmup/${mailbox.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
export default EmailMailboxesTable;
