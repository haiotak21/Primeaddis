"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import CurrencyAmount from "@/components/common/currency-amount";

interface MortgageCalculatorProps {
  price: number;
}

export default function MortgageCalculator({ price }: MortgageCalculatorProps) {
  const [downPct, setDownPct] = React.useState<number>(20);
  const [rateAnnual, setRateAnnual] = React.useState<number>(12);
  const [years, setYears] = React.useState<number>(20);

  const { monthly, principal, downPayment, totalInterest, totalPaid } =
    React.useMemo(() => {
      const dp = Math.max(0, Math.min(100, downPct));
      const rA = Math.max(0, rateAnnual);
      const y = Math.max(1, years);
      const principal = Math.max(0, price * (1 - dp / 100));
      const r = rA / 100 / 12; // monthly rate
      const n = y * 12; // months
      const monthly =
        r > 0 ? (principal * r) / (1 - Math.pow(1 + r, -n)) : principal / n;
      const totalPaid = monthly * n + (dp / 100) * price;
      const totalInterest = totalPaid - price;
      return {
        monthly,
        principal,
        downPayment: (dp / 100) * price,
        totalInterest,
        totalPaid,
      };
    }, [price, downPct, rateAnnual, years]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Mortgage Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label htmlFor="downPct">Down %</Label>
            <Input
              id="downPct"
              type="number"
              min={0}
              max={100}
              value={downPct}
              onChange={(e) => setDownPct(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="rateAnnual">Rate % (annual)</Label>
            <Input
              id="rateAnnual"
              type="number"
              min={0}
              step={0.1}
              value={rateAnnual}
              onChange={(e) => setRateAnnual(Number(e.target.value))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="years">Years</Label>
            <Input
              id="years"
              type="number"
              min={1}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="rounded-md border p-2">
            <div className="text-muted-foreground">Monthly</div>
            <div className="font-semibold">
              <CurrencyAmount amountUsd={monthly} />
            </div>
          </div>
          <div className="rounded-md border p-2">
            <div className="text-muted-foreground">Down payment</div>
            <div className="font-semibold">
              <CurrencyAmount amountUsd={downPayment} />
            </div>
          </div>
          <div className="rounded-md border p-2">
            <div className="text-muted-foreground">Loan principal</div>
            <div className="font-semibold">
              <CurrencyAmount amountUsd={principal} />
            </div>
          </div>
          <div className="rounded-md border p-2">
            <div className="text-muted-foreground">Total interest</div>
            <div className="font-semibold">
              <CurrencyAmount amountUsd={totalInterest} />
            </div>
          </div>
        </div>

        <div className="rounded-md border p-2 text-sm">
          <div className="text-muted-foreground">Total paid (incl. down)</div>
          <div className="font-semibold">
            <CurrencyAmount amountUsd={totalPaid} />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Estimates only. Actual terms vary by bank.
        </p>
      </CardContent>
    </Card>
  );
}
