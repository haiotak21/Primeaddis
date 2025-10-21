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
import Image from "next/image";
import CurrencyAmount from "@/components/common/currency-amount";

interface Agent {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  role: string;
  totalListings: number;
}

interface Metrics {
  [agentId: string]: {
    total: number;
    active: number;
    sold: number;
    rented: number;
    saleCount: number;
    rentCount: number;
    avgPrice: number;
    priceBands: {
      "<1M": number;
      "1M-5M": number;
      "5M-10M": number;
      ">=10M": number;
    };
  };
}

export default function CompareAgentsPage() {
  const [query, setQuery] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchAgents = async () => {
      const res = await axios.get("/api/agents", {
        params: { search: query, limit: 20 },
      });
      if (active) setAgents(res.data.agents || []);
    };
    fetchAgents();
    return () => {
      active = false;
    };
  }, [query]);

  const canCompare = selected.length >= 2;

  const selectedAgents = useMemo(
    () =>
      selected
        .map((id) => agents.find((a) => a._id === id))
        .filter(Boolean) as Agent[],
    [selected, agents]
  );

  const runCompare = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api/agents/compare", {
        agentIds: selected,
      });
      setMetrics(res.data.metrics || {});
    } finally {
      setLoading(false);
    }
  };

  const toggleAgent = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev; // cap to 3 for readability
      return [...prev, id];
    });
  };

  return (
    <div className="min-h-screen bg-muted/40 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Compare Agents</h1>
          <p className="text-muted-foreground">
            Pick up to 3 agents and compare sales and pricing performance.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Agents</CardTitle>
            <CardDescription>
              Search by name or email, then pick up to 3.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
              <Input
                placeholder="Search agents..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="max-w-sm"
              />
              <Button onClick={runCompare} disabled={!canCompare || loading}>
                {loading ? "Comparing..." : "Compare Selected"}
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {agents.map((a) => {
                const picked = selected.includes(a._id);
                return (
                  <button
                    key={a._id}
                    onClick={() => toggleAgent(a._id)}
                    className={`flex items-center gap-3 rounded-md border p-3 text-left transition hover:bg-muted ${
                      picked ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <div className="relative h-10 w-10 overflow-hidden rounded-full bg-muted">
                      {a.profileImage ? (
                        <Image
                          src={a.profileImage}
                          alt={a.name}
                          fill
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{a.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {a.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Listings: {a.totalListings}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {metrics && selectedAgents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Comparison</CardTitle>
              <CardDescription>Side-by-side agent performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-10 bg-background p-4 text-left font-semibold">
                        Metric
                      </th>
                      {selectedAgents.map((a) => (
                        <th key={a._id} className="min-w-[220px] p-4 text-left">
                          <div className="flex items-center gap-3">
                            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-muted">
                              {a.profileImage ? (
                                <Image
                                  src={a.profileImage}
                                  alt={a.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : null}
                            </div>
                            <div className="min-w-0">
                              <div className="truncate font-medium">
                                {a.name}
                              </div>
                              <div className="truncate text-xs text-muted-foreground">
                                {a.email}
                              </div>
                            </div>
                          </div>
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
                    ].map((row) => (
                      <tr key={row.key}>
                        <td className="sticky left-0 z-10 bg-background p-4 font-medium">
                          {row.label}
                        </td>
                        {selectedAgents.map((a) => (
                          <td key={a._id} className="p-4">
                            {row.key === "avgPrice" ? (
                              <CurrencyAmount
                                amountUsd={
                                  (metrics[a._id]?.avgPrice || 0) as number
                                }
                              />
                            ) : (
                              (metrics[a._id]?.[
                                row.key as keyof Metrics[string]
                              ] as number) ?? 0
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <td className="sticky left-0 z-10 bg-background p-4 font-medium">
                        Price Bands
                      </td>
                      {selectedAgents.map((a) => (
                        <td key={a._id} className="p-4">
                          <div className="grid grid-cols-2 gap-1 text-sm text-muted-foreground">
                            <div>
                              &lt;1M: {metrics[a._id]?.priceBands?.["<1M"] ?? 0}
                            </div>
                            <div>
                              1M-5M:{" "}
                              {metrics[a._id]?.priceBands?.["1M-5M"] ?? 0}
                            </div>
                            <div>
                              5M-10M:{" "}
                              {metrics[a._id]?.priceBands?.["5M-10M"] ?? 0}
                            </div>
                            <div>
                              &gt;=10M:{" "}
                              {metrics[a._id]?.priceBands?.[">=10M"] ?? 0}
                            </div>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
