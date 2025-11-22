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
  initialCurrency = "ETB",
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
      // Format the numeric part and append the ETB symbol after the number
      // This ensures values render as "5,750,000 ብር" instead of "ብር 5,750,000"
      const numberFormatted = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
      }).format(Math.round(birr));
      return `${numberFormatted} ብር`;
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
  if (!ctx) {
    // Graceful fallback if provider is missing in a subtree during SSR/refresh
    const fallbackFormat = (amountUsd: number) => {
      const birr = amountUsd * DEFAULT_RATE;
      const numberFormatted = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
      }).format(Math.round(birr));
      return `${numberFormatted} ብር`;
    };
    return {
      currency: "ETB",
      // no-ops to avoid state updates without a provider
      setCurrency: () => {},
      rate: DEFAULT_RATE,
      setRate: () => {},
      format: fallbackFormat,
    };
  }
  return ctx;
}
