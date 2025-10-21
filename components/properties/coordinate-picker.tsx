"use client";
import React from "react";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const LazyMap = dynamic<any>(() => import("./property-map-picker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 w-full items-center justify-center rounded-md border">
      Loading map...
    </div>
  ),
});

export default function CoordinatePicker({
  lat,
  lng,
  onChange,
  onResolve,
}: any) {
  const [mode, setMode] = React.useState<"map" | "manual">("map");
  const [resolving, setResolving] = React.useState(false);
  const [resolveError, setResolveError] = React.useState<string>("");

  const reverseGeocode = async (latNum: number, lngNum: number) => {
    try {
      setResolveError("");
      setResolving(true);
      const params = new URLSearchParams({
        format: "jsonv2",
        lat: String(latNum),
        lon: String(lngNum),
        zoom: "14",
        addressdetails: "1",
        countrycodes: "et",
      });
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
        {
          headers: {
            // Browsers restrict setting User-Agent; rely on referer. This is here for documentation only.
          },
        }
      );
      if (!res.ok) throw new Error("Reverse geocoding failed");
      const data = await res.json();
      const addr = data?.address || {};
      const address = data?.display_name?.split(",")[0]?.trim() || "";
      const city = addr.city || addr.town || addr.village || addr.county || "";
      const region =
        addr.state || addr.region || addr.province || addr.county || "";
      if (onResolve) {
        onResolve({
          address,
          city,
          region,
          lat: String(latNum),
          lng: String(lngNum),
        });
      }
    } catch (e: any) {
      setResolveError(e?.message || "Failed to auto-fill address from map");
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === "map" ? "default" : "outline"}
          onClick={() => setMode("map")}
        >
          Add from map
        </Button>
        <Button
          type="button"
          variant={mode === "manual" ? "default" : "outline"}
          onClick={() => setMode("manual")}
        >
          Add manually
        </Button>
      </div>
      {mode === "map" ? (
        <div className="space-y-2">
          <LazyMap
            value={{
              lat: lat ? Number.parseFloat(lat) : undefined,
              lng: lng ? Number.parseFloat(lng) : undefined,
            }}
            onPick={async (p: any) => {
              onChange(String(p.lat), String(p.lng));
              await reverseGeocode(p.lat, p.lng);
            }}
          />
          <p className="text-xs text-muted-foreground">
            Tip: Click on the location in Ethiopia to fill coordinates
            automatically.
          </p>
          {resolving && (
            <p className="text-xs text-muted-foreground">
              Resolving address from map…
            </p>
          )}
          {resolveError && (
            <p className="text-xs text-red-600">{resolveError}</p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="lat">Latitude</Label>
            <Input
              id="lat"
              type="number"
              step="any"
              value={lat}
              onChange={(e) => onChange(e.target.value, lng)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="lng">Longitude</Label>
            <Input
              id="lng"
              type="number"
              step="any"
              value={lng}
              onChange={(e) => onChange(lat, e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
