import { type NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { PROMOTION_PRODUCTS } from "@/lib/products"
import { requireAuth } from "@/lib/middleware/auth"
import connectDB from "@/lib/database"
import Property from "@/models/Property"

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe()
    const session = await requireAuth()
    if (session instanceof NextResponse) return session

    const { propertyId, duration } = await req.json()

    if (!["basic", "premium", "ultimate"].includes(duration)) {
      return NextResponse.json({ error: "Invalid duration" }, { status: 400 })
    }

    await connectDB()

    const property = await Property.findById(propertyId)
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Check ownership
    if (property.listedBy.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const product = PROMOTION_PRODUCTS.find((p) => p.id === duration)
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

  // Create Stripe checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Featured Listing - ${product.name}`,
              description: product.description,
            },
            unit_amount: product.priceInCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/properties/${propertyId}?promoted=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/properties/${propertyId}?promoted=cancelled`,
      client_reference_id: session.user.id,
      metadata: {
        userId: session.user.id,
        propertyId,
        duration,
        days: product.days.toString(),
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error: any) {
    console.error("Error creating promotion checkout:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}

export const runtime = "nodejs"
