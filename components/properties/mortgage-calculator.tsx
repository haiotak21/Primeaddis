"use client";
import React, { useMemo, useState } from "react";
import CurrencyAmount from "@/components/common/currency-amount";

export default function MortgageCalculator({
  initialAmount,
}: {
  initialAmount?: number | null;
}) {
  const [total, setTotal] = useState<number>(initialAmount || 0);
  const [downPayment, setDownPayment] = useState<number>(
    Math.round((initialAmount || 0) * 0.2)
  );
  const [interest, setInterest] = useState<number>(6.5);
  const [years, setYears] = useState<number>(30);

  // monthly payment calculation
  const monthlyPayment = useMemo(() => {
    const P = Math.max(0, total - (downPayment || 0));
    const r = Math.max(0, interest) / 100 / 12; // monthly rate
    const n = Math.max(1, years) * 12;
    if (r === 0) {
      return P / n;
    }
    const payment = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    if (!isFinite(payment)) return 0;
    return payment;
  }, [total, downPayment, interest, years]);

  return (
    <div className="rounded-2xl border border-primary/20 bg-card dark:bg-gray-900/30 p-6 shadow-sm">
      <h3 className="text-lg font-bold mb-3">Mortgage Calculator</h3>

      <label className="text-sm text-muted-foreground">Total Amount ($)</label>
      <input
        type="number"
        value={total ?? 0}
        onChange={(e) => setTotal(Number(e.target.value || 0))}
        className="mt-1 mb-3 w-full rounded-md border px-3 py-2"
      />

      <label className="text-sm text-muted-foreground">Down Payment ($)</label>
      <input
        type="number"
        value={downPayment ?? 0}
        onChange={(e) => setDownPayment(Number(e.target.value || 0))}
        className="mt-1 mb-3 w-full rounded-md border px-3 py-2"
      />

      <label className="text-sm text-muted-foreground">Interest Rate (%)</label>
      <input
        type="number"
        step="0.01"
        value={interest}
        onChange={(e) => setInterest(Number(e.target.value || 0))}
        className="mt-1 mb-3 w-full rounded-md border px-3 py-2"
      />

      <label className="text-sm text-muted-foreground">Loan Term (Years)</label>
      <input
        type="number"
        value={years}
        onChange={(e) => setYears(Number(e.target.value || 0))}
        className="mt-1 mb-4 w-full rounded-md border px-3 py-2"
      />

      <div className="border-t pt-4">
        <div className="text-sm text-muted-foreground">
          Estimated Monthly Payment
        </div>
        <div className="mt-2 text-2xl font-extrabold text-primary">
          <CurrencyAmount amountUsd={Math.round(monthlyPayment)} />
        </div>
      </div>
    </div>
  );
}
