import { type NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import connectDB from "@/lib/database"
import User from "@/models/User"
import Property from "@/models/Property"
import Payment from "@/models/Payment"

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET || "")
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  await connectDB()

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object
        const userId = session.metadata?.userId
        const planType = session.metadata?.planType
        const propertyId = session.metadata?.propertyId
        const days = session.metadata?.days

        if (planType) {
          // Handle subscription payment
          const expiresAt = new Date()
          expiresAt.setMonth(expiresAt.getMonth() + 1)

          await User.findByIdAndUpdate(userId, {
            subscription: {
              planType,
              status: "active",
              expiresAt,
            },
          })

          await Payment.create({
            userId,
            type: "subscription",
            planType,
            amount: session.amount_total! / 100,
            currency: session.currency,
            stripePaymentId: session.payment_intent as string,
            status: "completed",
            expiresAt,
          })
        } else if (propertyId && days) {
          // Handle featured listing payment
          const featuredUntil = new Date()
          featuredUntil.setDate(featuredUntil.getDate() + Number.parseInt(days))

          await Property.findByIdAndUpdate(propertyId, {
            featured: true,
            featuredUntil,
          })

          await Payment.create({
            userId,
            type: "featured_listing",
            amount: session.amount_total! / 100,
            currency: session.currency,
            stripePaymentId: session.payment_intent as string,
            status: "completed",
            propertyId,
            expiresAt: featuredUntil,
          })
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object
        const userId = subscription.metadata?.userId

        if (userId) {
          await User.findByIdAndUpdate(userId, {
            "subscription.status": "cancelled",
          })
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object
        const userId = invoice.metadata?.userId

        if (userId) {
          await User.findByIdAndUpdate(userId, {
            "subscription.status": "inactive",
          })
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

export const runtime = "nodejs"
