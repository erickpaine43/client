"use client";

import dynamic from "next/dynamic";

// Dynamically import the real provider with SSR disabled
const AnalyticsProvider = dynamic(
  () => import("@/context/AnalyticsContext").then(mod => ({ default: mod.AnalyticsProvider })),
  {
    ssr: false,
    loading: () => null
  }
);

interface ClientAnalyticsProviderProps {
  children: React.ReactNode;
}

export function ClientAnalyticsProvider({ children }: ClientAnalyticsProviderProps) {
  return <AnalyticsProvider>{children}</AnalyticsProvider>;
}

export default ClientAnalyticsProvider;
