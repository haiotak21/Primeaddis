import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { SubscriptionCheckout } from "@/components/pricing/subscription-checkout"
import { SUBSCRIPTION_PRODUCTS } from "@/lib/products"

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { plan?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin?callbackUrl=/pricing/checkout")
  }

  const planId = searchParams.plan || "pro"
  const product = SUBSCRIPTION_PRODUCTS.find((p) => p.id === planId)

  if (!product) {
    redirect("/pricing")
  }

  return (
    <div className="min-h-screen bg-muted/40 py-16">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Complete Your Subscription</h1>
          <p className="mt-2 text-muted-foreground">
            Subscribe to {product.name} - ${(product.priceInCents / 100).toFixed(0)}/month
          </p>
        </div>

        <SubscriptionCheckout productId={planId} />
      </div>
    </div>
  )
}
