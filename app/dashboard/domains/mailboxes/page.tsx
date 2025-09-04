"use client";

import { useEffect, useState } from "react";
import MailboxesTab from "@/components/domains/mailboxes/mailboxes-tab";
import { getMailboxesAction, getMultipleMailboxAnalyticsAction } from "@/lib/actions/mailboxActions";
import { MailboxWarmupData, ProgressiveAnalyticsState } from "@/types";

function Page() {
  const [mailboxesLoading, setMailboxesLoading] = useState(true);
  const [mailboxes, setMailboxes] = useState<MailboxWarmupData[]>([]);
  const [mailboxesError, setMailboxesError] = useState<string | null>(null);
  const [analyticsState, setAnalyticsState] = useState<ProgressiveAnalyticsState>({});

  // Fetch mailboxes on component mount
  useEffect(() => {
    const fetchMailboxesData = async () => {
      setMailboxesLoading(true);
      setMailboxesError(null);
      try {
        const mailboxesData = await getMailboxesAction();
        setMailboxes(mailboxesData);
      } catch (error) {
        console.error("Failed to fetch mailboxes:", error);
        setMailboxesError("Failed to load mailboxes");
      } finally {
        setMailboxesLoading(false);
      }
    };

    fetchMailboxesData();
  }, []);

  // Fetch analytics for mailboxes progressively when mailboxes load
  useEffect(() => {
    if (mailboxes.length === 0 || mailboxesLoading) return;

    const fetchAllAnalytics = async () => {
      try {
        // Initialize loading state for all mailboxes
        const initialState: ProgressiveAnalyticsState = {};
        mailboxes.forEach((mailbox) => {
          initialState[mailbox.id] = { data: null, loading: true, error: null };
        });
        setAnalyticsState(initialState);

        // Fetch analytics for all mailboxes
        const mailboxIds = mailboxes.map((mailbox) => mailbox.id);
        const analyticsResults = await getMultipleMailboxAnalyticsAction(
          mailboxIds
        );

        // Update state with results
        const newState: ProgressiveAnalyticsState = {};
        mailboxes.forEach((mailbox) => {
          const analytics = analyticsResults[mailbox.id];
          if (analytics) {
            newState[mailbox.id] = { data: analytics, loading: false, error: null };
          } else {
            newState[mailbox.id] = {
              data: null,
              loading: false,
              error: "Failed to load analytics",
            };
          }
        });
        setAnalyticsState(newState);
      } catch (error) {
        console.error("Failed to fetch mailbox analytics:", error);
        // Set error state for all mailboxes
        const errorState: ProgressiveAnalyticsState = {};
        mailboxes.forEach((mailbox) => {
          errorState[mailbox.id] = {
            data: null,
            loading: false,
            error: "Failed to load analytics",
          };
        });
        setAnalyticsState(errorState);
      }
    };

    fetchAllAnalytics();
  }, [mailboxes, mailboxesLoading]);

  return (
    <MailboxesTab
      mailboxes={mailboxes}
      analyticsState={analyticsState}
      loading={mailboxesLoading}
      error={mailboxesError}
    />
  );
}

export default Page;
