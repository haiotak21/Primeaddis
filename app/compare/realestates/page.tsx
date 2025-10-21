"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useCompare } from "@/contexts/compare-context";
import CurrencyAmount from "@/components/common/currency-amount";

interface RealEstate {
  _id: string;
  name: string;
  logo?: string;
  website?: string;
  description?: string;
  totalListings: number;
}

interface Metrics {
  [id: string]: {
    total: number;
    active: number;
    sold: number;
    rented: number;
    saleCount: number;
    rentCount: number;
    avgPrice: number;
    minPrice?: number;
    maxPrice?: number;
  };
}

export default function CompareRealEstatesPage() {
  const { clearCompare } = useCompare();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<RealEstate[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [compareError, setCompareError] = useState("");

  useEffect(() => {
    let active = true;
    const fetchRealEstates = async () => {
      try {
        setLoadError("");
        const res = await axios.get("/api/realestates", {
          params: { search: query, limit: 20 },
        });
        const list: Array<any> = res.data.realEstates || [];
        // Fetch totals per real estate in one go
        const ids = list.map((x) => x._id);
        let totals: Record<string, number> = {};
        if (ids.length) {
          const resp = await axios.post("/api/realestates/compare", {
            realEstateIds: ids,
          });
          const m: Metrics = resp.data.metrics || {};
          totals = Object.fromEntries(
            Object.entries(m).map(([id, v]: any) => [id, v.total || 0])
          );
        }
        const withTotals: RealEstate[] = list.map((x: any) => ({
          _id: x._id,
          name: x.name,
          logo: x.logo,
          website: x.website,
          description: x.description,
          totalListings: totals[x._id] || 0,
        }));
        if (active) setItems(withTotals);
      } catch (err: any) {
        if (active) {
          setLoadError(err?.response?.data?.error || "Failed to load agencies");
          setItems([]);
        }
      }
    };
    fetchRealEstates();
    return () => {
      active = false;
    };
  }, [query]);

  const canCompare = selected.length >= 2;

  const selectedItems = useMemo(
    () =>
      selected
        .map((id) => items.find((a) => a._id === id))
        .filter(Boolean) as RealEstate[],
    [selected, items]
  );

  const runCompare = async () => {
    setLoading(true);
    try {
      setCompareError("");
      const res = await axios.post("/api/realestates/compare", {
        realEstateIds: selected,
      });
      setMetrics(res.data.metrics || {});
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev; // cap to 3
      return [...prev, id];
    });
  };

  return (
    <div className="min-h-screen bg-muted/40 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Compare Real Estate Agencies</h1>
          <p className="text-muted-foreground">
            Pick up to 3 companies and compare number of listings and pricing.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Agencies</CardTitle>
            <CardDescription>
              Search by name, then pick up to 3.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
              <Input
                placeholder="Search real estate..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="max-w-sm"
              />
              <Button
                onClick={() => setModalOpen(true)}
                disabled={!canCompare || loading}
              >
                Compare Selected
              </Button>
            </div>

            {loadError && (
              <Alert variant="destructive" className="mb-3">
                <AlertDescription>{loadError}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {items.map((x) => {
                const picked = selected.includes(x._id);
                return (
                  <button
                    key={x._id}
                    onClick={() => toggle(x._id)}
                    className={`rounded-md border p-3 text-left transition hover:bg-muted ${
                      picked ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="truncate font-medium">{x.name}</div>
                        {x.website ? (
                          <div className="truncate text-xs text-muted-foreground">
                            {x.website}
                          </div>
                        ) : null}
                        {x.description ? (
                          <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {x.description}
                          </div>
                        ) : null}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Listings: {x.totalListings}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {compareError && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{compareError}</AlertDescription>
          </Alert>
        )}

        {metrics && selectedItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Comparison</CardTitle>
              <CardDescription>
                Side-by-side company performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-10 bg-background p-4 text-left font-semibold">
                        Metric
                      </th>
                      {selectedItems.map((x) => (
                        <th key={x._id} className="min-w-[220px] p-4 text-left">
                          <div className="truncate font-medium">{x.name}</div>
                          {x.website ? (
                            <div className="truncate text-xs text-muted-foreground">
                              {x.website}
                            </div>
                          ) : null}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: "total", label: "Total Listings" },
                      { key: "active", label: "Active" },
                      { key: "sold", label: "Sold" },
                      { key: "rented", label: "Rented" },
                      { key: "saleCount", label: "For Sale" },
                      { key: "rentCount", label: "For Rent" },
                      { key: "avgPrice", label: "Average Price" },
                      { key: "priceRange", label: "Price Range" },
                    ].map((row) => (
                      <tr key={row.key}>
                        <td className="sticky left-0 z-10 bg-background p-4 font-medium">
                          {row.label}
                        </td>
                        {selectedItems.map((x) => {
                          const m = metrics?.[x._id];
                          const unavailable = !m;
                          return (
                            <td key={x._id} className="p-4">
                              {unavailable ? (
                                <span className="text-sm text-muted-foreground">
                                  Data unavailable for {x.name}
                                </span>
                              ) : row.key === "avgPrice" ? (
                                <CurrencyAmount
                                  amountUsd={(m.avgPrice || 0) as number}
                                />
                              ) : row.key === "priceRange" ? (
                                m.minPrice != null && m.maxPrice != null ? (
                                  <span>
                                    <CurrencyAmount
                                      amountUsd={m.minPrice as number}
                                    />{" "}
                                    -{" "}
                                    <CurrencyAmount
                                      amountUsd={m.maxPrice as number}
                                    />
                                  </span>
                                ) : (
                                  <span className="text-sm text-muted-foreground">
                                    No price data
                                  </span>
                                )
                              ) : (
                                (m[
                                  row.key as keyof Metrics[string]
                                ] as number) ?? 0
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Choice modal to align with acceptance criteria */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Comparison Type</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Button asChild size="lg" onClick={() => setModalOpen(false)}>
              <Link href="/compare/properties">Compare Property</Link>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={async () => {
                // Auto-close property comparison bar by clearing selected properties
                try {
                  clearCompare();
                } catch {}
                setModalOpen(false);
                try {
                  await runCompare();
                } catch (e: any) {
                  setCompareError(
                    e?.response?.data?.error || "Failed to compare agencies"
                  );
                }
              }}
              disabled={loading}
            >
              {loading ? "Comparing..." : "Compare Real Estate"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
