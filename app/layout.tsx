import type React from "react";
import type { Metadata, Viewport } from "next";
import { Poppins, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Providers } from "./providers";
import { WhatsAppFloatingButton } from "@/components/ui/whatsapp-floating";
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
  openGraph: {
    title: "Mai Ke Kai Surf House",
    description: "Your surf paradise in Costa Rica",
    type: "website",
    locale: "en_US",
  },
  generator: "v0.app",
};

export const viewport: Viewport = {
  themeColor: "#2B96CB",
  width: "device-width",
  initialScale: 1,
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
            {children}
          </NextIntlClientProvider>
        </Providers>
        <Analytics />
        <WhatsAppFloatingButton />
        <TabTravelScript />
      </body>
    </html>
  );
}
