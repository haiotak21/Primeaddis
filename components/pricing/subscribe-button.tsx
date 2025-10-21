"use client"

import type React from "react"

import { useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"

interface SubscribeButtonProps {
  planType: "pro" | "enterprise"
  children: React.ReactNode
}

export function SubscribeButton({ planType, children }: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const res = await axios.post("/api/payments/create-checkout", { planType })

      if (res.data.url) {
        window.location.href = res.data.url
      }
    } catch (error) {
      console.error("Error creating checkout:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleSubscribe} disabled={loading} className="w-full">
      {loading ? "Processing..." : children}
    </Button>
  )
}
