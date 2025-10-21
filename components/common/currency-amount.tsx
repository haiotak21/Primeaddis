"use client";

import React from "react";
import { useCurrency } from "@/contexts/currency-context";

export default function CurrencyAmount({
  amountUsd,
  className,
}: {
  amountUsd: number;
  className?: string;
}) {
  const { format } = useCurrency();
  return <span className={className}>{format(amountUsd)}</span>;
}
