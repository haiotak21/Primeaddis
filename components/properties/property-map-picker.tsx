"use client";
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

function ClickHandler({
  onPick,
}: {
  onPick: (pos: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click(e: any) {
      const { lat, lng } = e.latlng;
      // Ethiopia bounds
      const ETH = { minLat: 3.4, maxLat: 14.9, minLng: 32.9, maxLng: 48.0 };
      if (
        lat < ETH.minLat ||
        lat > ETH.maxLat ||
        lng < ETH.minLng ||
        lng > ETH.maxLng
      )
        return;
      onPick({ lat, lng });
    },
  });
  return null;
}

export default function PropertyMapPicker({ value, onPick }: any) {
  const center: [number, number] = [8.9806, 38.7578]; // Addis Ababa
  const pos: [number, number] | undefined =
    value?.lat && value?.lng ? [value.lat, value.lng] : undefined;

  useEffect(() => {
    // Ensure marker icons resolve from CDN (prevents Next from routing to /properties/[id])
    const iconRetinaUrl =
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
    const iconUrl =
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
    const shadowUrl =
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";
    // @ts-ignore
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });
  }, []);

  return (
    <div className="h-64 w-full overflow-hidden rounded-md border">
      {
        // Type cast to satisfy react-leaflet types in this setup
        <MapContainer
          {...({
            center,
            zoom: 12,
            scrollWheelZoom: true,
          } as any)}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            // @ts-ignore
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={onPick} />
          {pos && <Marker position={pos} />}
        </MapContainer>
      }
    </div>
  );
}
