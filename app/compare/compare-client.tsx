"use client"

import { useCompare } from "@/contexts/compare-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { formatPrice } from "@/utils/helpers"
import { ArrowLeft } from "lucide-react"

export function CompareClient() {
  const { compareList, clearCompare } = useCompare()

  if (compareList.length === 0) {
    return (
      <div className="min-h-screen bg-muted/40 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="mb-4 text-lg text-muted-foreground">No properties to compare</p>
              <Button asChild>
                <Link href="/properties">Browse Properties</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const comparisonFields = [
    { label: "Price", key: "price", format: (val: number) => formatPrice(val) },
    { label: "Type", key: "type", format: (val: string) => val.charAt(0).toUpperCase() + val.slice(1) },
    { label: "Listing Type", key: "listingType", format: (val: string) => (val === "sale" ? "For Sale" : "For Rent") },
    { label: "Bedrooms", key: "specifications.bedrooms", format: (val: number) => val || "N/A" },
    { label: "Bathrooms", key: "specifications.bathrooms", format: (val: number) => val || "N/A" },
    { label: "Area (sq ft)", key: "specifications.area", format: (val: number) => val.toLocaleString() },
    { label: "Year Built", key: "specifications.yearBuilt", format: (val: number) => val || "N/A" },
    { label: "City", key: "location.city" },
    { label: "Region", key: "location.region" },
    { label: "Status", key: "status", format: (val: string) => val.charAt(0).toUpperCase() + val.slice(1) },
    { label: "Featured", key: "featured", format: (val: boolean) => (val ? "Yes" : "No") },
    { label: "VR Tour", key: "vrTourUrl", format: (val: string) => (val ? "Available" : "Not Available") },
  ]

  const getNestedValue = (obj: any, path: string) => {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj)
  }

  return (
    <div className="min-h-screen bg-muted/40 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Compare Properties</h1>
            <p className="text-muted-foreground">Side-by-side comparison of {compareList.length} properties</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearCompare}>
              Clear All
            </Button>
            <Button variant="outline" asChild>
              <Link href="/properties">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-background p-4 text-left font-semibold">Feature</th>
                {compareList.map((property) => (
                  <th key={property._id as string} className="min-w-[250px] p-4">
                    <Card>
                      <div className="relative h-40 w-full">
                        <Image
                          src={property.images[0] || "/placeholder.svg"}
                          alt={property.title}
                          fill
                          className="rounded-t-lg object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="mb-2 font-semibold">{property.title}</h3>
                        <Button size="sm" className="w-full" asChild>
                          <Link href={`/properties/${property._id}`}>View Details</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonFields.map((field, index) => (
                <tr key={field.key} className={index % 2 === 0 ? "bg-muted/50" : ""}>
                  <td className="sticky left-0 z-10 bg-background p-4 font-medium">{field.label}</td>
                  {compareList.map((property) => {
                    const value = getNestedValue(property, field.key)
                    const displayValue = field.format ? field.format(value) : value
                    return (
                      <td key={property._id as string} className="p-4 text-center">
                        {displayValue}
                      </td>
                    )
                  })}
                </tr>
              ))}
              <tr>
                <td className="sticky left-0 z-10 bg-background p-4 font-medium">Amenities</td>
                {compareList.map((property) => (
                  <td key={property._id as string} className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {property.amenities.slice(0, 5).map((amenity, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {property.amenities.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{property.amenities.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
