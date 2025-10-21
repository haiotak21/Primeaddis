"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { PROMOTION_PRODUCTS } from "@/lib/products"
import Link from "next/link"

interface PromotePropertyButtonProps {
  propertyId: string
}

export function PromotePropertyButton({ propertyId }: PromotePropertyButtonProps) {
  const [open, setOpen] = useState(false)
  const [duration, setDuration] = useState("premium")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Promote Listing</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Promote Your Property</DialogTitle>
          <DialogDescription>Choose a promotion duration to feature your listing</DialogDescription>
        </DialogHeader>

        <RadioGroup value={duration} onValueChange={setDuration} className="space-y-4">
          {PROMOTION_PRODUCTS.map((product) => (
            <div
              key={product.id}
              className={`flex items-center space-x-2 rounded-lg border p-4 ${
                product.id === "premium" ? "border-primary" : ""
              }`}
            >
              <RadioGroupItem value={product.id} id={product.id} />
              <Label htmlFor={product.id} className="flex-1 cursor-pointer">
                <div className="font-semibold">
                  {product.name} - ${(product.priceInCents / 100).toFixed(0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {product.days} days featured{product.id === "premium" ? " (Best Value)" : ""}
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>

        <Link href={`/properties/${propertyId}/promote?plan=${duration}`}>
          <Button className="w-full">Continue to Payment</Button>
        </Link>
      </DialogContent>
    </Dialog>
  )
}
