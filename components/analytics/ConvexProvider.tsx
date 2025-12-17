"use client";

// ============================================================================
// CONVEX PROVIDER - Real-time data provider for analytics
// ============================================================================

import { ConvexProvider as BaseConvexProvider } from "convex/react";
import { ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";

interface ConvexProviderProps {
  children: ReactNode;
}

/**
 * Convex provider component that initializes the Convex client
 * and provides real-time capabilities to the analytics system.
 */
export function ConvexProvider({ children }: ConvexProviderProps) {
  // Initialize Convex client with environment URL
  const convex = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;

    if (!url) {
      console.warn(
        "NEXT_PUBLIC_CONVEX_URL not found. Real-time features will be disabled."
      );
      // Return a mock client that doesn't connect
      return null;
    }

    return new ConvexReactClient(url);
  }, []);

  // If no Convex URL is provided, render children without provider
  if (!convex) {
    return <>{children}</>;
  }

  return <BaseConvexProvider client={convex}>{children}</BaseConvexProvider>;
}

/**
 * Hook to check if Convex is available and connected.
 */
export function useConvexStatus() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;

  return {
    isAvailable: Boolean(url),
    isConnected: Boolean(url), // In a real app, you'd check connection status
    url,
  };
}
