"use client";
import type { IProperty } from "@/models";
import { HomePropertyCard } from "./home-property-card";

type Props = {
  properties: IProperty[];
};

export function HomeLatest({ properties }: Props) {
  if (!properties || properties.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No properties found.
      </div>
    );
  }

  return (
    <div>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((p) => (
          <div key={String(p._id)} className="w-full">
            <HomePropertyCard property={p as any} />
          </div>
        ))}
      </div>
    </div>
  );
}
