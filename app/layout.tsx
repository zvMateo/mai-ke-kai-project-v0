import type React from "react";
import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Providers } from "./providers";
import { PageTransitionProvider } from "@/components/providers/page-transition-provider";
import { WhatsAppFloatingButton } from "@/components/ui/whatsapp-floating";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { TabTravelScript } from "@/components/booking/tab-travel-script";
import "./globals.css";

// Phase 1 — Cinematic Surf Magazine typography:
// Fraunces (variable serif w/ optical-size axis) for editorial display,
// Inter (variable sans) for body and UI. Both load via next/font with
// subset=latin and display=swap to keep CWV happy on slow connections.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  // Variable font: omit `weight` so the wght axis is included by default,
  // then opt into the optical-size and softness axes for editorial polish.
  axes: ["opsz", "SOFT"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Mai Ke Kai Surf House | Costa Rica",
    template: "%s | Mai Ke Kai",
  },
  description:
    "Surf hotel in Costa Rica. Book your surf experience with lessons, tours, and comfortable accommodation for 18 guests.",
  keywords: [
    "surf hotel",
    "Costa Rica",
    "surf lessons",
    "Surf hotel",
    "surf house",
  ],
  authors: [{ name: "Mai Ke Kai Surf House" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mai Ke Kai",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Mai Ke Kai Surf House",
    description: "Your surf paradise in Costa Rica",
    type: "website",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  themeColor: "#0BA4A4",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${fraunces.variable} ${inter.variable}`}
    >
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Providers>
          <NextIntlClientProvider messages={messages}>
            <PageTransitionProvider>{children}</PageTransitionProvider>
          </NextIntlClientProvider>
        </Providers>
        <Analytics />
        <WhatsAppFloatingButton />
        <ScrollToTop />
        <TabTravelScript />
      </body>
    </html>
  );
}
