import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { Providers } from "@/components/common/providers";
import EnhancedErrorBoundary from "@/components/auth/EnhancedErrorBoundary";
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';

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

// Generate static params for each locale
export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}>) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  return (
    <html lang={locale} suppressHydrationWarning={true}>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col",
          `${geistSans.variable} ${geistMono.variable} antialiased`
        )}
      >
        <NextIntlClientProvider>
          <Providers>
            <EnhancedErrorBoundary enableRecovery={true} showDetails={false}>
              <AuthProvider>
                {children}
                <Toaster />
              </AuthProvider>
            </EnhancedErrorBoundary>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
