import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { PropertyCard } from "@/components/properties/property-card";
import { getHomeProperties } from "@/lib/home-properties";

export default async function HomePage() {
  const properties = await getHomeProperties(7);
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8 flex justify-center">
              <Image
                src="/logo.png"
                alt="PrimeAddis"
                width={300}
                height={80}
                className="h-16 w-auto"
                priority
              />
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">
              Find Your Dream Property
            </h1>
            <p className="mt-6 text-pretty text-lg text-muted-foreground">
              Discover the perfect home, office, or investment property with
              PrimeAddis
            </p>

            <div className="mt-10 flex justify-center">
              <div className="flex w-full max-w-2xl gap-2">
                <Input
                  placeholder="Search by location, property type..."
                  className="flex-1"
                />
                <Button size="lg">Search</Button>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/properties?listingType=sale">
                <Button variant="outline">Buy</Button>
              </Link>
              <Link href="/properties?listingType=rent">
                <Button variant="outline">Rent</Button>
              </Link>
              <Link href="/properties/new">
                <Button variant="outline">List Property</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Preview Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Latest Properties</h2>
            <Link href="/properties">
              <Button variant="outline">See more</Button>
            </Link>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {properties && properties.length > 0 ? (
              properties.map((property: any) => (
                <PropertyCard key={property._id} property={property} />
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground">
                No properties found.
              </div>
            )}
          </div>
        </div>
      </section>

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
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
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

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
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

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
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
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary">
                Sign Up Free
              </Button>
            </Link>
            <Link href="/properties">
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
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
