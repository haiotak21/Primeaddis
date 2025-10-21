import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PromotionCheckout } from "@/components/properties/promotion-checkout"
import { PROMOTION_PRODUCTS } from "@/lib/products"
import connectDB from "@/lib/database"
import Property from "@/models/Property"

export default async function PromotePropertyPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { plan?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect(`/auth/signin?callbackUrl=/properties/${params.id}/promote`)
  }

  await connectDB()
  const property = await Property.findById(params.id).lean()

  if (!property) {
    redirect("/properties")
  }

  // Check ownership
  if (property.listedBy.toString() !== session.user.id) {
    redirect(`/properties/${params.id}`)
  }

  const planId = searchParams.plan || "premium"
  const product = PROMOTION_PRODUCTS.find((p) => p.id === planId)

  if (!product) {
    redirect(`/properties/${params.id}`)
  }

  return (
    <div className="min-h-screen bg-muted/40 py-16">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Promote Your Property</h1>
          <p className="mt-2 text-muted-foreground">
            {product.name} Plan - ${(product.priceInCents / 100).toFixed(0)} for {product.days} days
          </p>
        </div>

        <PromotionCheckout propertyId={params.id} productId={planId} />
      </div>
    </div>
  )
}
