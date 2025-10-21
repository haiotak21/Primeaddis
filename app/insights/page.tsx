"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#06b6d4"]; // Tailwind blue, green, amber, red, cyan

const mockMonthly = [
  { month: "Jan", avgPrice: 120000, dom: 42, inventory: 120 },
  { month: "Feb", avgPrice: 125000, dom: 40, inventory: 118 },
  { month: "Mar", avgPrice: 130000, dom: 39, inventory: 122 },
  { month: "Apr", avgPrice: 128000, dom: 38, inventory: 126 },
  { month: "May", avgPrice: 132000, dom: 36, inventory: 130 },
  { month: "Jun", avgPrice: 135000, dom: 35, inventory: 128 },
  { month: "Jul", avgPrice: 138000, dom: 34, inventory: 125 },
  { month: "Aug", avgPrice: 140000, dom: 33, inventory: 127 },
  { month: "Sep", avgPrice: 139000, dom: 32, inventory: 129 },
  { month: "Oct", avgPrice: 141000, dom: 31, inventory: 131 },
  { month: "Nov", avgPrice: 142000, dom: 30, inventory: 133 },
  { month: "Dec", avgPrice: 145000, dom: 29, inventory: 135 },
];

const mockTypeSplit = [
  { name: "House", value: 45 },
  { name: "Apartment", value: 35 },
  { name: "Commercial", value: 10 },
  { name: "Office", value: 6 },
  { name: "Land", value: 4 },
];

export default function InsightsPage() {
  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Neighborhood Insights</h1>
          <p className="mt-2 text-muted-foreground">
            Explore local market trends based on recent listings and activity.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Average Listing Price</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  avgPrice: {
                    label: "Avg Price",
                    color: "hsl(var(--primary))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={mockMonthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="avgPrice"
                      stroke="var(--color-avgPrice)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Days on Market</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{ dom: { label: "Days on Market", color: "#16a34a" } }}
              >
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={mockMonthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="dom"
                      fill="var(--color-dom)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  inventory: { label: "Active Listings", color: "#06b6d4" },
                }}
              >
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={mockMonthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="inventory"
                      stroke="var(--color-inventory)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Listing Type Split</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6">
                <ResponsiveContainer width="50%" height={280}>
                  <PieChart>
                    <Pie
                      data={mockTypeSplit}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={80}
                    >
                      {mockTypeSplit.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1">
                  <ul className="space-y-2">
                    {mockTypeSplit.map((t, i) => (
                      <li key={t.name} className="flex items-center gap-2">
                        <span
                          className="inline-block h-3 w-3 rounded"
                          style={{ background: COLORS[i % COLORS.length] }}
                        />
                        <span className="text-sm text-muted-foreground">
                          {t.name}
                        </span>
                        <span className="ml-auto text-sm font-medium">
                          {t.value}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
