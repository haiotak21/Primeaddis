"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import CurrencyAmount from "@/components/common/currency-amount";
import { useCurrency } from "@/contexts/currency-context";

interface MortgageCalculatorProps {
  price: number;
}

export default function MortgageCalculator({ price }: MortgageCalculatorProps) {
  const { currency, rate } = useCurrency();

  // Initialize amounts in the currently selected currency so inputs match displayed prices.
  const toDisplayAmount = (usd: number) =>
    currency === "ETB" ? Math.round(usd * rate) : usd;

  const [totalAmount, setTotalAmount] = React.useState<number>(
    toDisplayAmount(price)
  );
  const [downPayment, setDownPayment] = React.useState<number>(
    Math.round(toDisplayAmount(price) * 0.2)
  );

  // Keep inputs in sync when price or currency changes (e.g., user toggles currency)
  React.useEffect(() => {
    setTotalAmount(toDisplayAmount(price));
    setDownPayment(Math.round(toDisplayAmount(price) * 0.2));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price, currency, rate]);
  const [rateAnnual, setRateAnnual] = React.useState<number>(6.5);
  const [years, setYears] = React.useState<number>(30);

  const { monthly } = React.useMemo(() => {
    const principal = Math.max(0, totalAmount - downPayment);
    const r = Math.max(0, rateAnnual) / 100 / 12; // monthly rate
    const n = Math.max(1, years) * 12; // months
    const monthly =
      r > 0 ? (principal * r) / (1 - Math.pow(1 + r, -n)) : principal / n;
    return { monthly };
  }, [totalAmount, downPayment, rateAnnual, years]);

  return (
    <Card className="bg-white rounded-xl border border-[#dde8f0] dark:bg-gray-900/30 dark:border-primary/20">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Mortgage Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div>
            <Label
              className="text-sm font-medium text-[#03063b]/80 dark:text-gray-300"
              htmlFor="mc-total-amount"
            >
              Total Amount ($)
            </Label>
            <Input
              id="mc-total-amount"
              className="mt-1 block w-full rounded-lg border-[#dde8f0] bg-[#f4fafe] focus:border-[#0b8bff] focus:ring-[#0b8bff]/50 dark:bg-input/30 dark:text-white dark:placeholder:text-[#a0b3c6] dark:border-primary/20"
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(Number(e.target.value))}
            />
          </div>
          <div>
            <Label
              className="text-sm font-medium text-[#03063b]/80 dark:text-gray-300"
              htmlFor="mc-down-payment"
            >
              Down Payment ($)
            </Label>
            <Input
              id="mc-down-payment"
              className="mt-1 block w-full rounded-lg border-[#dde8f0] bg-[#f4fafe] focus:border-[#0b8bff] focus:ring-[#0b8bff]/50 dark:bg-input/30 dark:text-white dark:placeholder:text-[#a0b3c6] dark:border-primary/20"
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
            />
          </div>
          <div>
            <Label
              className="text-sm font-medium text-[#03063b]/80 dark:text-gray-300"
              htmlFor="mc-interest-rate"
            >
              Interest Rate (%)
            </Label>
            <Input
              id="mc-interest-rate"
              className="mt-1 block w-full rounded-lg border-[#dde8f0] bg-[#f4fafe] focus:border-[#0b8bff] focus:ring-[#0b8bff]/50 dark:bg-input/30 dark:text-white dark:placeholder:text-[#a0b3c6] dark:border-primary/20"
              type="number"
              step={0.1}
              value={rateAnnual}
              onChange={(e) => setRateAnnual(Number(e.target.value))}
            />
          </div>
          <div>
            <Label
              className="text-sm font-medium text-[#03063b]/80 dark:text-gray-300"
              htmlFor="mc-loan-term"
            >
              Loan Term (Years)
            </Label>
            <Input
              id="mc-loan-term"
              className="mt-1 block w-full rounded-lg border-[#dde8f0] bg-[#f4fafe] focus:border-[#0b8bff] focus:ring-[#0b8bff]/50 dark:bg-input/30 dark:text-white dark:placeholder:text-[#a0b3c6] dark:border-primary/20"
              type="number"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#dde8f0] dark:border-primary/20 text-center">
          <p className="text-[#03063b]/70 dark:text-gray-300 text-sm">
            Estimated Monthly Payment
          </p>
          <p className="text-3xl font-black text-[#0b8bff]">
            {/* CurrencyAmount expects a USD amount; convert back to USD if we computed in ETB */}
            {currency === "ETB" ? (
              <CurrencyAmount amountUsd={monthly / rate} />
            ) : (
              <CurrencyAmount amountUsd={monthly} />
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
