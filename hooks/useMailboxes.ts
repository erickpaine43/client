"use client";

import { useState, useEffect } from "react";
import { getMailboxesAction } from "@/lib/actions/mailboxActions";

interface MailboxFilter {
  id: string;
  name: string;
}

export function useMailboxes() {
  const [mailboxes, setMailboxes] = useState<MailboxFilter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMailboxes() {
      try {
        const result = await getMailboxesAction();
        if (!result.success) {
          throw new Error(result.error?.message || 'Failed to fetch mailboxes');
        }
        
        const data = result.data || [];
        const formatted = data.map((mb) => ({
          id: mb.id,
          name: mb.email,
        }));
        // Add "All Mailboxes" if there are any mailboxes
        if (formatted.length > 0) {
          setMailboxes([{ id: "all", name: "All Mailboxes" }, ...formatted]);
        } else {
          setMailboxes([]);
        }
        setError(null);
      } catch (err) {
        console.error("Failed to fetch mailboxes:", err);
        setError("Failed to load mailboxes");
        setMailboxes([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMailboxes();
  }, []);

  return { mailboxes, loading, error };
}
