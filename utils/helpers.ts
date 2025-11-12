export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(price)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date))
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

// Determine an absolute base URL for server-side fetches in App Router.
// Priority: headers (runtime) -> env public base -> localhost fallback.
export async function getAbsoluteBaseUrl(): Promise<string> {
  // Dynamic import to avoid hard dependency for client bundles
  try {
    // headers() is only available server-side; wrap in try for edge cases.
    const mod = await import("next/headers");
    // Some Next versions export headers() synchronously; treat return as any.
    const h: any = mod.headers();
    const awaited = typeof h.then === "function" ? await h : h; // handle promise or value
    const proto = awaited.get("x-forwarded-proto") || "http";
    const host = awaited.get("x-forwarded-host") || awaited.get("host");
    if (host) return `${proto}://${host}`;
  } catch {
    // ignore – fall back to env/localhost
  }
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

export function calculateMortgage(principal: number, annualRate: number, years: number): number {
  const monthlyRate = annualRate / 100 / 12
  const numberOfPayments = years * 12

  if (monthlyRate === 0) return principal / numberOfPayments

  const monthlyPayment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

  return monthlyPayment
}

export function getPropertyTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    house: "House",
    apartment: "Apartment",
    land: "Land",
    office: "Office",
    commercial: "Commercial",
  }
  return labels[type] || type
}
