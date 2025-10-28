"use client";
import React from "react";
import { PropertyCard } from "@/components/properties/property-card";
import dynamic from "next/dynamic";

// Dynamically load the Leaflet map only on the client to avoid "window is not defined"
const PropertyMap = dynamic(
  () =>
    import("@/components/properties/property-map").then((m) => m.PropertyMap),
  {
    ssr: false,
    loading: () => (
      <div
        style={{ height: 400, width: "100%" }}
        className="flex items-center justify-center rounded-md border"
      >
        Loading map...
      </div>
    ),
  }
);

type AnyProperty = any;

function getLatLng(p: AnyProperty): [number, number] | null {
  const loc = p?.location || {};
  const coords = (loc as any).coordinates || loc;
  const lat = coords?.lat;
  const lng = coords?.lng;
  if (typeof lat === "number" && typeof lng === "number") return [lat, lng];
  return null;
}

function isPointInPolygon(point: [number, number], polygon: number[][]) {
  const [x, y] = point; // here x=lat, y=lng in our usage
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0],
      yi = polygon[i][1];
    const xj = polygon[j][0],
      yj = polygon[j][1];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export default function PropertyResultsWithMap({
  properties,
  pagination,
}: {
  properties: AnyProperty[];
  pagination: any;
}) {
  const [areaCoords, setAreaCoords] = React.useState<number[][] | null>(null);

  const mappable = React.useMemo(
    () => properties.filter((p) => !!getLatLng(p)),
    [properties]
  );

  const filtered = React.useMemo(() => {
    if (!areaCoords) return properties;
    return properties.filter((p) => {
      const pos = getLatLng(p);
      return pos ? isPointInPolygon(pos, areaCoords) : false;
    });
  }, [properties, areaCoords]);

  return (
    <>
      <div className="mb-8">
        <PropertyMap properties={mappable} onAreaSelect={setAreaCoords} />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filtered.length} of{" "}
          {pagination?.total || properties.length || 0} properties
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map((property: AnyProperty) => (
          <PropertyCard key={property._id} property={property} compactSpecs />
        ))}
      </div>
    </>
  );
}
