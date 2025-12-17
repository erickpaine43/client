import { ConvexReactClient } from "convex/react";

// Create Convex client
export const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL || "https://mock-convex-url.convex.cloud"
);
