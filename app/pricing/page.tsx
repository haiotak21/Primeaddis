import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SUBSCRIPTION_PRODUCTS, PROMOTION_PRODUCTS } from "@/lib/products"

export default function PricingPage() {
  const proProduct = SUBSCRIPTION_PRODUCTS.find((p) => p.id === "pro")!
  const enterpriseProduct = SUBSCRIPTION_PRODUCTS.find((p) => p.id === "enterprise")!

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Choose Your Plan</h1>
          <p className="mt-4 text-lg text-muted-foreground">Select the perfect plan for your real estate business</p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {/* Free Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>1 property listing</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Basic search features</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Standard support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/auth/signup" className="w-full">
                <Button variant="outline" className="w-full bg-transparent">
                  Get Started
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{proProduct.name}</CardTitle>
                <Badge>Popular</Badge>
              </div>
              <CardDescription>{proProduct.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">${(proProduct.priceInCents / 100).toFixed(0)}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {proProduct.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={index < 2 ? "font-medium" : ""}>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Link href={`/pricing/checkout?plan=${proProduct.id}`} className="w-full">
                <Button className="w-full">Subscribe Now</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Enterprise Plan */}
          <Card>
            <CardHeader>
              <CardTitle>{enterpriseProduct.name}</CardTitle>
              <CardDescription>{enterpriseProduct.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">${(enterpriseProduct.priceInCents / 100).toFixed(0)}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {enterpriseProduct.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={index < 2 ? "font-medium" : ""}>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Link href={`/pricing/checkout?plan=${enterpriseProduct.id}`} className="w-full">
                <Button className="w-full">Subscribe Now</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* Featured Listing Pricing */}
        <div className="mt-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Promote Your Listings</h2>
            <p className="mt-4 text-lg text-muted-foreground">Get more visibility with featured placement</p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {PROMOTION_PRODUCTS.map((product, index) => (
              <Card key={product.id} className={index === 1 ? "border-primary" : ""}>
                <CardHeader>
                  {index === 1 ? (
                    <div className="flex items-center justify-between">
                      <CardTitle>{product.name}</CardTitle>
                      <Badge>Best Value</Badge>
                    </div>
                  ) : (
                    <CardTitle>{product.name}</CardTitle>
                  )}
                  <CardDescription>{product.days} days featured</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">${(product.priceInCents / 100).toFixed(0)}</span>
                    <span className="text-muted-foreground">/listing</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Featured badge</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Priority in search</span>
                    </li>
                    {index >= 1 && (
                      <li className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Homepage placement</span>
                      </li>
                    )}
                    {index === 2 && (
                      <li className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Social media promotion</span>
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
