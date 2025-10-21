import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { SUBSCRIPTION_PRODUCTS } from "@/lib/products"
import { requireAuth } from "@/lib/middleware/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth()
    if (session instanceof NextResponse) return session

    const { planType } = await req.json()

    if (!["pro", "enterprise"].includes(planType)) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 })
    }

    const plan = SUBSCRIPTION_PRODUCTS.find((p) => p.id === planType)
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `RealEstatePro ${plan.name} Plan`,
              description: plan.features.join(", "),
            },
            unit_amount: plan.priceInCents,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?payment=cancelled`,
      client_reference_id: session.user.id,
      metadata: {
        userId: session.user.id,
        planType,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error: any) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
