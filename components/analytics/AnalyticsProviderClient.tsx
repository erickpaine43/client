"use client";

import { AnalyticsProvider } from "@/context/AnalyticsContext";

interface AnalyticsProviderClientProps {
  children: React.ReactNode;
}

function AnalyticsProviderClient({ children }: AnalyticsProviderClientProps) {
  return <AnalyticsProvider>{children}</AnalyticsProvider>;
}

export default AnalyticsProviderClient;
