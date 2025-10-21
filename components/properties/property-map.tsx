"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  FeatureGroup,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";

type AnyProperty = any;
interface PropertyMapProps {
  properties: AnyProperty[];
  onAreaSelect?: (area: number[][]) => void; // Array of [lat, lng]
}

function getLatLng(p: AnyProperty): [number, number] | null {
  const loc = p?.location || {};
  const coords = (loc as any).coordinates || loc;
  const lat = coords?.lat;
  const lng = coords?.lng;
  if (typeof lat === "number" && typeof lng === "number") return [lat, lng];
  return null;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  onAreaSelect,
}) => {
  // Ethiopia geographic constraints
  const ETH_CENTER: [number, number] = [9.145, 40.489673];
  // Addis Ababa center
  const ADDIS_CENTER: [number, number] = [8.9806, 38.7578];
  const ETH_BOUNDS: [[number, number], [number, number]] = [
    [3.4, 32.9], // Southwest (lat, lng)
    [14.9, 48.0], // Northeast (lat, lng)
  ];

  const inEthBounds = (pos: [number, number]) => {
    const [lat, lng] = pos;
    return (
      lat >= ETH_BOUNDS[0][0] &&
      lat <= ETH_BOUNDS[1][0] &&
      lng >= ETH_BOUNDS[0][1] &&
      lng <= ETH_BOUNDS[1][1]
    );
  };

  const positions = useMemo(
    () =>
      properties
        .map((p) => ({ p, pos: getLatLng(p) }))
        .filter((x) => x.pos && inEthBounds(x.pos as [number, number])),
    [properties]
  );
  // Start centered on Addis Ababa for a better initial view
  const defaultCenter: [number, number] = ADDIS_CENTER;

  const mapRef = useRef(null);
  const featureGroupRef = useRef<any>(null);
  const [fgReady, setFgReady] = useState(false);

  // After mount, ensure the FeatureGroup ref is available, then mark ready to render EditControl
  useEffect(() => {
    if (!fgReady && featureGroupRef.current) {
      setFgReady(true);
    }
  }, [fgReady]);

  // Configure default marker icons (avoid Next routing requesting /properties/marker-*.png)
  useEffect(() => {
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

  // Handle area selection (polygon/rectangle)
  const onDrawCreated = (e: any) => {
    let coords: number[][] = [];
    if (e.layerType === "rectangle" || e.layerType === "polygon") {
      // For rectangle, getLatLngs returns [[{lat, lng}, ...]]
      // For polygon, getLatLngs returns [[{lat, lng}, ...]]
      const latlngs = e.layer.getLatLngs();
      if (Array.isArray(latlngs) && Array.isArray(latlngs[0])) {
        coords = latlngs[0].map((pt: any) => [pt.lat, pt.lng]);
      }
    }
    if (onAreaSelect && coords.length > 0) {
      onAreaSelect(coords);
    }
  };

  return (
    <div
      style={{
        height: 400,
        width: "100%",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {/* Type casting to satisfy react-leaflet v5 types in this setup */}
      {
        <MapContainer
          {...({
            center: defaultCenter,
            zoom: 12,
            scrollWheelZoom: true,
            worldCopyJump: false,
            minZoom: 4,
          } as any)}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef as any}
        >
          <TileLayer
            // @ts-ignore
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FeatureGroup ref={featureGroupRef as any}>
            {fgReady && (
              <EditControl
                position="topright"
                onCreated={onDrawCreated}
                draw={{
                  rectangle: true,
                  polygon: true,
                  circle: false,
                  marker: false,
                  polyline: false,
                  circlemarker: false,
                }}
                edit={{
                  featureGroup: featureGroupRef.current as any,
                }}
              />
            )}
          </FeatureGroup>
          {positions.map(({ p, pos }) => (
            <Marker key={p._id} position={pos as [number, number]}>
              <Popup>
                <strong>{p.title}</strong>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      }
    </div>
  );
};
