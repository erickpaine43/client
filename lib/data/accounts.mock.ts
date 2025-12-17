import { AccountDetails, AccountStatsDataPoint } from "@/types/accounts";

/**
 * Mock data for account statistics - used for charts and testing
 */
export const mockStatsData: AccountStatsDataPoint[] = [
  { name: "May 01", volume: 10, inbox: 8, spam: 1, reputation: 70 },
  { name: "May 02", volume: 12, inbox: 10, spam: 1, reputation: 75 },
  { name: "May 03", volume: 15, inbox: 13, spam: 0, reputation: 80 },
  { name: "May 04", volume: 18, inbox: 17, spam: 1, reputation: 85 },
  { name: "May 05", volume: 20, inbox: 19, spam: 0, reputation: 90 },
  { name: "May 06", volume: 22, inbox: 20, spam: 1, reputation: 92 },
  { name: "May 07", volume: 25, inbox: 24, spam: 0, reputation: 95 },
];

/**
 * Mock account data for testing API endpoints
 */
export const mockAccountData: AccountDetails = {
  id: "mockAccountId",
  email: "test@example.com",
  status: "Active",
  sentToday: 25,
  dailyLimit: 100,
  inboxRate: 95,
  spamRate: 2,
  reputation: 98,
  daysActive: 30,
  parentDomain: "example.com",
  stats: mockStatsData,
};
