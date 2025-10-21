import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CurrencyAmount from "@/components/common/currency-amount";
import { CompareButton } from "@/components/properties/compare-button";
import type { IProperty } from "@/models";
import PropertyCardFooter from "@/components/properties/property-card-footer";

interface PropertyCardProps {
  property: IProperty & { listedBy?: { name: string; profileImage?: string } };
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={`/properties/${property._id}`}>
        <div className="relative h-48 w-full">
          <Image
            src={property.images[0] || "/placeholder.svg?height=200&width=400"}
            alt={property.title}
            fill
            className="object-cover"
          />
          {property.featured && (
            <Badge className="absolute right-2 top-2 bg-primary">
              Featured
            </Badge>
          )}
          <Badge className="absolute left-2 top-2 bg-background/90 text-foreground">
            {property.listingType === "sale" ? "For Sale" : "For Rent"}
          </Badge>
          {property.vrTourUrl && (
            <Badge className="absolute bottom-2 left-2 bg-purple-600 text-white">
              VR Tour
            </Badge>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/properties/${property._id}`}>
          <div className="mb-2 flex items-start justify-between">
            <h3 className="line-clamp-1 text-lg font-semibold">
              {property.title}
            </h3>
            <p className="text-lg font-bold text-primary">
              <CurrencyAmount amountUsd={property.price} />
            </p>
          </div>

          <p className="mb-2 text-sm text-muted-foreground">
            {property.location.city}, {property.location.region}
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {property.specifications.bedrooms && (
              <span>{property.specifications.bedrooms} beds</span>
            )}
            {property.specifications.bathrooms && (
              <span>{property.specifications.bathrooms} baths</span>
            )}
            <span>{property.specifications.area} sq ft</span>
          </div>
        </Link>
        <div className="mt-3">
          <CompareButton property={property} size="sm" />
        </div>
      </CardContent>

      <CardFooter className="border-t p-4">
        <PropertyCardFooter
          propertyId={String(property._id)}
          listedBy={property.listedBy}
        />
      </CardFooter>
    </Card>
  );
}
