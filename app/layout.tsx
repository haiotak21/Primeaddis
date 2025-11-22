import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { SessionProvider } from "@/components/providers/session-provider";
import { CompareProvider } from "@/contexts/compare-context";
import { CurrencyProvider } from "@/contexts/currency-context";
import { Navbar } from "@/components/layout/navbar";
import RouteProgress from "@/components/route-progress";
import ClientWidgets from "@/components/client-widgets";
import ClientFooter from "@/components/client-footer";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import messages from "../messages.json";
import { cookies } from "next/headers";
import { ThemeProvider } from "@/components/theme-provider";
import ChunkReloadOnce from "@/components/providers/chunk-reload";

export const metadata: Metadata = {
  title: "PrimeAddis - Find Your Dream Property",
  description:
    "Comprehensive real estate platform for buyers, sellers, and agents",
  generator: "v0.app",
};

type AppLocale = "en" | "am";

function toSupportedLocale(input?: string): AppLocale | undefined {
  if (input === "en" || input === "am") return input;
  return undefined;
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params?: { locale?: string };
}) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value as
    | AppLocale
    | undefined;
  const paramLocale = toSupportedLocale(params?.locale);
  const locale: AppLocale = paramLocale ?? cookieLocale ?? "en";
  const cookieCurrency = cookieStore.get("CURRENCY")?.value as
    | "USD"
    | "ETB"
    | undefined;
  const cookieRate = cookieStore.get("CURRENCY_RATE")?.value;
  const initialCurrency = cookieCurrency ?? "ETB";
  const initialRate = cookieRate ? Number(cookieRate) : undefined;
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          rel="stylesheet"
        />
      </head>
      <body
        className={`font-sans app-theme ${GeistSans.variable} ${GeistMono.variable}`}
      >
        <NextIntlClientProvider
          locale={locale}
          messages={(messages as Record<AppLocale, any>)[locale]}
        >
          <SessionProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <CurrencyProvider
                initialCurrency={initialCurrency}
                initialRate={initialRate}
              >
                <CompareProvider>
                  {/* Exclude header from new theme by resetting to defaults */}
                  <div className="default-theme">
                    <Navbar />
                    <RouteProgress />
                  </div>
                  <ClientWidgets />
                  {/* Main app content stays in the new app theme */}
                  <ChunkReloadOnce />
                  <Suspense fallback={<div>Loading...</div>}>
                    {children}
                  </Suspense>
                  {/* CompareBar and Footer are rendered inside ClientWidgets (client-side) */}
                  {/* Render footer at the bottom so it appears after page content */}
                  <ClientFooter />
                </CompareProvider>
              </CurrencyProvider>
            </ThemeProvider>
          </SessionProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
