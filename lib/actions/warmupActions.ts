"use server";

import { DailyStats } from "@/lib/queries/warmup";

/**
 * Server action to save/update warmup stats for a mailbox.
 * Currently mocked, future: niledb.mutate
 */
export async function saveWarmupStats(formData: FormData) {
  const id = formData.get("id") as string;
  // Parse stats from formData or JSON
  const stats: DailyStats[] = []; // Placeholder: parse from formData

  // TODO: Implement save with niledb.mutate
  console.log(`Saving stats for mailbox ${id}:`, stats);
  // Mock save: No-op for now
  // Future: return { success: true } or errors
}
