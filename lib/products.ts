export interface SubscriptionProduct {
  id: string
  name: string
  description: string
  priceInCents: number
  features: string[]
  interval: "month"
}

export interface PromotionProduct {
  id: string
  name: string
  description: string
  priceInCents: number
  days: number
}

// Source of truth for subscription plans
export const SUBSCRIPTION_PRODUCTS: SubscriptionProduct[] = [
  {
    id: "pro",
    name: "Pro",
    description: "Perfect for professional agents",
    priceInCents: 2900, // $29.00
    features: ["Unlimited property listings", "Featured placement", "Priority support", "Advanced analytics"],
    interval: "month",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large agencies",
    priceInCents: 9900, // $99.00
    features: [
      "All Pro features",
      "API access",
      "White-label options",
      "Dedicated account manager",
      "Custom integrations",
    ],
    interval: "month",
  },
]

// Source of truth for property promotion pricing
export const PROMOTION_PRODUCTS: PromotionProduct[] = [
  {
    id: "basic",
    name: "Basic",
    description: "Featured placement for 7 days",
    priceInCents: 1000, // $10.00
    days: 7,
  },
  {
    id: "premium",
    name: "Premium",
    description: "Featured placement for 14 days",
    priceInCents: 2500, // $25.00
    days: 14,
  },
  {
    id: "ultimate",
    name: "Ultimate",
    description: "Featured placement for 30 days",
    priceInCents: 5000, // $50.00
    days: 30,
  },
]
