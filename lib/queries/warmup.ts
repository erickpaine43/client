import { mockMailboxes } from "@/lib/data/analytics.mock";

export interface DailyStats {
  date: string;
  emailsWarmed: number;
  delivered: number;
  spam: number;
  replies: number;
  bounce: number;
  healthScore: number;
}

const mockDailyStats: DailyStats[] = [
  {
    date: "Aug 11",
    emailsWarmed: 80,
    delivered: 76,
    spam: 2,
    replies: 1,
    bounce: 1,
    healthScore: 88,
  },
  {
    date: "Aug 10",
    emailsWarmed: 85,
    delivered: 83,
    spam: 1,
    replies: 1,
    bounce: 0,
    healthScore: 90,
  },
  {
    date: "Aug 09",
    emailsWarmed: 78,
    delivered: 75,
    spam: 2,
    replies: 0,
    bounce: 1,
    healthScore: 86,
  },
  {
    date: "Aug 08",
    emailsWarmed: 82,
    delivered: 79,
    spam: 1,
    replies: 2,
    bounce: 0,
    healthScore: 91,
  },
  {
    date: "Aug 07",
    emailsWarmed: 77,
    delivered: 74,
    spam: 1,
    replies: 1,
    bounce: 1,
    healthScore: 87,
  },
  {
    date: "Aug 06",
    emailsWarmed: 84,
    delivered: 81,
    spam: 2,
    replies: 0,
    bounce: 1,
    healthScore: 89,
  },
  {
    date: "Aug 05",
    emailsWarmed: 79,
    delivered: 76,
    spam: 1,
    replies: 2,
    bounce: 1,
    healthScore: 88,
  },
];

/**
 * Fetch mailbox by ID from database.
 * Currently mocked, future: niledb.query
 */
export const getMailboxById = async (id: string) => {
  // TODO: Replace with actual DB query: niledb.query('MAILBOX_TABLE', { id })
  return mockMailboxes.find((mailbox) => mailbox.id === id);
};

/**
 * Fetch daily warmup stats for a mailbox from database.
 * Currently mocked, future: niledb.query
 */
export const getWarmupStats = async (_id: string): Promise<DailyStats[]> => {
  // TODO: Replace with actual DB query: niledb.query('WARMUP_STATS_TABLE', { mailbox_id: _id })
  // For now, return same mock data for all mailboxes
  return mockDailyStats;
};

/**
 * Save/update warmup stats for a mailbox.
 * Server action for client-side saving.
 * Currently mocked, future: niledb.mutate
 */
export const saveWarmupStats = async (_id: string, stats: DailyStats[]) => {
  // TODO: Implement save with niledb.mutate
  console.log(`Saving stats for mailbox ${_id}:`, stats);
  // Mock save: No-op for now
};
