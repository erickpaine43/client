"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { ClientPreferencesProvider } from "@/context/ClientPreferencesContext";
import { ConvexProvider } from "@/components/analytics/ConvexProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some decent defaults here
            staleTime: 60 * 1000, // 1 minute
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ConvexProvider>
          <ClientPreferencesProvider>{children}</ClientPreferencesProvider>
        </ConvexProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
