"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PropertyFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    type: searchParams.get("type") || "allTypes",
    listingType: searchParams.get("listingType") || "allListings",
    city: searchParams.get("city") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    bedrooms: searchParams.get("bedrooms") || "any",
    financing: searchParams.get("financing") || "",
  });

  // UI-only checkbox to match design (does not alter backend behavior)
  const [financingChecked, setFinancingChecked] = useState<boolean>(
    Boolean(filters.financing)
  );

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const applyFilters = () => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    router.push(`/properties?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      type: "allTypes",
      listingType: "allListings",
      city: "",
      minPrice: "",
      maxPrice: "",
      bedrooms: "any",
      financing: "",
    });
    router.push("/properties");
  };

  return (
    <Card className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <CardHeader className="p-0">
        <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">
          Filter Properties
        </CardTitle>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Refine your search
        </p>
      </CardHeader>
      <CardContent className="space-y-6 mt-6 p-0">
        <div>
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Property Type
          </Label>
          <Select
            value={filters.type}
            onValueChange={(value) => handleFilterChange("type", value)}
          >
            <SelectTrigger className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:border-primary focus:ring-primary">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="allTypes">All Types</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              {/* UI label matches design, maps to apartment value to preserve backend */}
              <SelectItem value="apartment">Condo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Listing Type
          </Label>
          <Select
            value={filters.listingType}
            onValueChange={(value) => handleFilterChange("listingType", value)}
          >
            <SelectTrigger className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:border-primary focus:ring-primary">
              <SelectValue placeholder="For Sale" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sale">For Sale</SelectItem>
              <SelectItem value="rent">For Rent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bedrooms
          </Label>
          <Select
            value={filters.bedrooms}
            onValueChange={(value) => handleFilterChange("bedrooms", value)}
          >
            <SelectTrigger className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:border-primary focus:ring-primary">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            City
          </Label>
          <Input
            className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:border-primary focus:ring-primary"
            placeholder="Enter a city"
            value={filters.city}
            onChange={(e) => handleFilterChange("city", e.target.value)}
          />
        </div>

        <div className="flex items-center">
          <input
            id="financing"
            name="financing"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            checked={financingChecked}
            onChange={(e) => setFinancingChecked(e.target.checked)}
          />
          <label
            htmlFor="financing"
            className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
          >
            Acceptable for financing
          </label>
        </div>

        <div>
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Price Range
          </Label>
          <div className="relative pt-1">
            <input
              type="range"
              min={100000}
              max={2000000}
              step={10000}
              className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
              value={Number(filters.maxPrice) || 750000}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span>$100k</span>
            <span>$2M+</span>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={applyFilters}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            Apply Filters
          </Button>
          <Button
            onClick={clearFilters}
            variant="ghost"
            className="w-full text-gray-600 dark:text-gray-300 py-3 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
