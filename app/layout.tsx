import type React from "react";
import type { Metadata, Viewport } from "next";
import { Poppins, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Providers } from "./providers";
import { PageTransitionProvider } from "@/components/providers/page-transition-provider";
import { WhatsAppFloatingButton } from "@/components/ui/whatsapp-floating";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import "./globals.css";

// <CHANGE> Using Poppins for headings and Inter for body text - tropical/modern feel
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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

import { TabTravelScript } from "@/components/booking/tab-travel-script";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${poppins.variable} ${inter.variable}`}>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Providers>
          <NextIntlClientProvider messages={messages}>
            <PageTransitionProvider>
              {children}
            </PageTransitionProvider>
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
