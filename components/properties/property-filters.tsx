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
import { SaveSearchButton } from "./save-search-button";

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
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Property Type</Label>
          <Select
            value={filters.type}
            onValueChange={(value) => handleFilterChange("type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="allTypes">All types</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="land">Land</SelectItem>
              <SelectItem value="office">Office</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Financing</Label>
          <Input
            placeholder="e.g. Bank of Abyssinia, CBE"
            value={filters.financing}
            onChange={(e) => handleFilterChange("financing", e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Comma-separated bank/financing names to filter listings that offer
            them.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Listing Type</Label>
          <Select
            value={filters.listingType}
            onValueChange={(value) => handleFilterChange("listingType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All listings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="allListings">All listings</SelectItem>
              <SelectItem value="sale">For Sale</SelectItem>
              <SelectItem value="rent">For Rent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>City</Label>
          <Input
            placeholder="Enter city"
            value={filters.city}
            onChange={(e) => handleFilterChange("city", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Price Range</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Bedrooms</Label>
          <Select
            value={filters.bedrooms}
            onValueChange={(value) => handleFilterChange("bedrooms", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
              <SelectItem value="5">5+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button onClick={applyFilters} className="flex-1">
            Apply Filters
          </Button>
          <Button onClick={clearFilters} variant="outline">
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
