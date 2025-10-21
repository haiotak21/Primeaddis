"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Currency = "USD" | "ETB";

type CurrencyContextValue = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  rate: number; // ETB per 1 USD
  setRate: (r: number) => void;
  format: (amountUsd: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | undefined>(
  undefined
);

// Default conversion rate; can be adjusted or fetched later
const DEFAULT_RATE = 115; // 1 USD = 115 ETB (example)

export function CurrencyProvider({
  children,
  initialCurrency = "USD",
  initialRate = DEFAULT_RATE,
}: {
  children: React.ReactNode;
  initialCurrency?: Currency;
  initialRate?: number;
}) {
  const [currency, setCurrencyState] = useState<Currency>(initialCurrency);
  const [rate, setRateState] = useState<number>(initialRate);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    document.cookie = `CURRENCY=${c}; path=/; max-age=31536000`;
  };

  const setRate = (r: number) => {
    setRateState(r);
    document.cookie = `CURRENCY_RATE=${r}; path=/; max-age=86400`;
  };

  const format = useMemo(() => {
    return (amountUsd: number) => {
      if (currency === "USD") {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 0,
        }).format(amountUsd);
      }
      const birr = amountUsd * rate;
      return new Intl.NumberFormat("am-ET", {
        style: "currency",
        currency: "ETB",
        minimumFractionDigits: 0,
      }).format(birr);
    };
  }, [currency, rate]);

  const value = useMemo(
    () => ({ currency, setCurrency, rate, setRate, format }),
    [currency, rate]
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
