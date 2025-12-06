export const metadata = {
  title:
    "Addis Bet - አዲስ ቤት | Houses & Apartments for Sale/Rent in Addis Ababa",
  description:
    "Find your dream home in Addis Ababa. Latest Addis Bet properties in Bole, Sarbet, CMC, Kazanchis and more. Updated daily.",
  openGraph: {
    title: "Prime Addis Et - አዲስ ቤት Real Estate",
    description: "Best houses and apartments for sale and rent in Addis Ababa",
    images: ["/og-homepage.jpg"],
  },
  alternates: { canonical: "https://primeaddiset.com" },
};

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HomeLatest } from "@/components/properties/home-latest";
import { getFeaturedHomeProperties } from "@/lib/home-properties";
import HeroServer from "@/components/home/hero-server";
import { TestimonialsSection } from "@/components/testimonials/testimonials";

export default async function HomePage() {
  const properties = await getFeaturedHomeProperties(12);
  return (
    <div className="min-h-screen home-theme bg-background text-foreground">
      {/* Hero Section (full-screen) */}
      <HeroServer />

      {/* Properties Preview Section */}
      <section className="pt-6 pb-6 sm:py-20 md:py-16 lg:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Featured Properties
            </h2>
            <Link
              href="/properties"
              className="hidden sm:inline-flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white transition-colors"
            >
              See more
              <span className="ml-1">→</span>
            </Link>
          </div>
          <HomeLatest properties={properties as any} />
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Features Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Why Choose PrimeAddis</h2>
            <p className="mt-4 text-muted-foreground">
              Everything you need to find or list properties
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-primary/20 dark:bg-gray-900/30">
              <CardContent className="pt-6 text-center sm:text-left">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mx-auto sm:mx-0">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Advanced Search</h3>
                <p className="mt-2 text-muted-foreground">
                  Find properties with powerful filters and location-based
                  search
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 dark:bg-gray-900/30">
              <CardContent className="pt-6 text-center sm:text-left">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mx-auto sm:mx-0">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Secure Platform</h3>
                <p className="mt-2 text-muted-foreground">
                  Your data is protected with enterprise-grade security
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 dark:bg-gray-900/30">
              <CardContent className="pt-6 text-center sm:text-left">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mx-auto sm:mx-0">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Expert Agents</h3>
                <p className="mt-2 text-muted-foreground">
                  Connect with verified real estate professionals
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
          <p className="mt-4 text-lg opacity-90">
            Join thousands of users finding their perfect properties
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
            <Link href="/auth/signup" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto"
              >
                Sign Up Free
              </Button>
            </Link>
            <Link href="/properties" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              >
                Browse Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
