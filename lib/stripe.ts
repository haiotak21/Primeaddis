import "server-only"
import Stripe from "stripe"

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    // Throw lazily so it surfaces as a request error instead of crashing module init
    throw new Error("STRIPE_SECRET_KEY is not defined. Set it in .env and restart the server.")
  }
  if (!stripeInstance) {
    stripeInstance = new Stripe(key, {
      apiVersion: "2025-09-30.clover",
      typescript: true,
    })
  }
  return stripeInstance
}
