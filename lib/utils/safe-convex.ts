// lib/utils/safe-convex.ts
// Centralized workaround for Convex deep type instantiation at call-sites.
// Returns unknown; callers must narrow via type guards or local casts.

import { ConvexHttpClient } from "convex/browser";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";
const sharedClient = new ConvexHttpClient(convexUrl);

export async function safeQuery(fn: unknown, args: unknown): Promise<unknown> {
  return (sharedClient as unknown as { query: (f: unknown, a: unknown) => Promise<unknown> }).query(
    fn,
    args
  );
}

export async function safeMutation(fn: unknown, args: unknown): Promise<unknown> {
  return (sharedClient as unknown as { mutation: (f: unknown, a: unknown) => Promise<unknown> }).mutation(
    fn,
    args
  );
}
