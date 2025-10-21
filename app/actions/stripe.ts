"use server"

import { stripe } from "@/lib/stripe"
import { SUBSCRIPTION_PRODUCTS, PROMOTION_PRODUCTS } from "@/lib/products"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/database"
import Property from "@/models/Property"

export async function createSubscriptionCheckout(productId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const product = SUBSCRIPTION_PRODUCTS.find((p) => p.id === productId)
  if (!product) {
    throw new Error(`Product with id "${productId}" not found`)
  }

  // Create Checkout Session
  const checkoutSession = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    redirect_on_completion: "never",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `PrimeAddis ${product.name} Plan`,
            description: product.features.join(", "),
          },
          unit_amount: product.priceInCents,
          recurring: {
            interval: product.interval,
          },
        },
        quantity: 1,
      },
    ],
    mode: "subscription",
    client_reference_id: session.user.id,
    metadata: {
      userId: session.user.id,
      planType: productId,
    },
  })

  return checkoutSession.client_secret
}

export async function createPromotionCheckout(propertyId: string, productId: string) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const product = PROMOTION_PRODUCTS.find((p) => p.id === productId)
  if (!product) {
    throw new Error(`Product with id "${productId}" not found`)
  }

  await connectDB()

  const property = await Property.findById(propertyId)
  if (!property) {
    throw new Error("Property not found")
  }

  // Check ownership
  if (property.listedBy.toString() !== session.user.id) {
    throw new Error("Unauthorized")
  }

  // Create Checkout Session
  const checkoutSession = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    redirect_on_completion: "never",
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
    mode: "payment",
    client_reference_id: session.user.id,
    metadata: {
      userId: session.user.id,
      propertyId,
      duration: productId,
      days: product.days.toString(),
    },
  })

  return checkoutSession.client_secret
}

export async function getCheckoutSessionStatus(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  return {
    status: session.status,
    customer_email: session.customer_details?.email,
  }
}
