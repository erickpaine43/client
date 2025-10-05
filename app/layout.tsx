import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { Providers } from "@/components/common/providers";
import EnhancedErrorBoundary from "@/components/auth/EnhancedErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Penguin Mails - Email Outreach & Domain Warm-up",
  description:
    "Enter the world of Penguin Mails, where every message is a delightful surprise!",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/img/pengo_32X32.png",
    other: [
      { rel: "icon", url: "/img/pengo_16X16.png", sizes: "16x16" },
      { rel: "icon", url: "/img/pengo_32X32.png", sizes: "32x32" },
      { rel: "icon", url: "/img/pengo_48X48.png", sizes: "48x48" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col",
          `${geistSans.variable} ${geistMono.variable} antialiased`
        )}
      >
        <Providers>
          <EnhancedErrorBoundary enableRecovery={true} showDetails={false}>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </EnhancedErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
