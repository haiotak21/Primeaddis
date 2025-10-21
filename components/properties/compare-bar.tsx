"use client";

import React, { useState } from "react";
import { useCompare } from "@/contexts/compare-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CurrencyAmount from "@/components/common/currency-amount";

export function CompareBar() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const [modalOpen, setModalOpen] = useState(false);

  if (compareList.length === 0) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-4 shadow-lg">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 overflow-x-auto">
              <span className="text-sm font-medium">
                Compare ({compareList.length}/4)
              </span>
              {compareList.map((property) => (
                <Card
                  key={property._id as string}
                  className="relative flex items-center gap-2 p-2"
                >
                  <button
                    onClick={() => removeFromCompare(property._id as string)}
                    className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <div className="relative h-12 w-12 overflow-hidden rounded">
                    <Image
                      src={property.images[0] || "/placeholder.svg"}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {property.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <CurrencyAmount amountUsd={property.price} />
                    </p>
                  </div>
                </Card>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={clearCompare}>
                Clear All
              </Button>
              <Button
                size="sm"
                disabled={compareList.length < 2}
                onClick={() => setModalOpen(true)}
              >
                Compare Now
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Comparison Type</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Button asChild size="lg" onClick={() => setModalOpen(false)}>
              <Link href="/compare/properties">
                Compare Property to Property
              </Link>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => {
                try {
                  clearCompare();
                } catch {}
                setModalOpen(false);
                window.location.href = "/compare/realestates";
              }}
            >
              Compare Real Estate
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
