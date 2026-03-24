"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Point = {
  lat: number;
  lng: number;
};

type MapPickerProps = {
  selectedPoint: Point | null;
  correctPoint?: Point | null;
  distanceKm?: number | null;
  onSelect: (point: Point) => void;
};

// ✅ Красивые SVG-пины
function createPinIcon(color: string, symbol: string) {
  return L.divIcon({
    className: "",
    html: `
      <div style="width: 34px; height: 46px;">
        <svg width="34" height="46" viewBox="0 0 34 46">
          <path
            d="M17 1C8.2 1 1 8.2 1 17c0 11.5 13.6 25.4 15.1 26.9a1.3 1.3 0 0 0 1.8 0C19.4 42.4 33 28.5 33 17 33 8.2 25.8 1 17 1z"
            fill="${color}"
            stroke="white"
            stroke-width="2"
          />
          <text
            x="17"
            y="22"
            text-anchor="middle"
            font-size="18"
            font-weight="700"
            fill="white"
            font-family="Arial, sans-serif"
          >${symbol}</text>
        </svg>
      </div>
    `,
    iconSize: [34, 46],
    iconAnchor: [17, 46],
  });
}

const userIcon = createPinIcon("#2563eb", "?");
const correctIcon = createPinIcon("#ef4444", "!");

// 📍 обработка клика
function ClickHandler({ onSelect }: { onSelect: (point: Point) => void }) {
  useMapEvents({
    click(event) {
      onSelect({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });

  return null;
}

// 🔍 авто-зум между точками
function FitBounds({
  selectedPoint,
  correctPoint,
}: {
  selectedPoint: Point | null;
  correctPoint: Point | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedPoint && correctPoint) {
      const bounds = L.latLngBounds(
        [selectedPoint.lat, selectedPoint.lng],
        [correctPoint.lat, correctPoint.lng]
      );

      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 14,
      });
    }
  }, [map, selectedPoint, correctPoint]);

  return null;
}

export default function MapPicker({
  selectedPoint,
  correctPoint = null,
  distanceKm = null,
  onSelect,
}: MapPickerProps) {
  const linePositions =
    selectedPoint && correctPoint
      ? [
          [selectedPoint.lat, selectedPoint.lng],
          [correctPoint.lat, correctPoint.lng],
        ]
      : null;

  const midPoint =
    selectedPoint && correctPoint
      ? [
          (selectedPoint.lat + correctPoint.lat) / 2,
          (selectedPoint.lng + correctPoint.lng) / 2,
        ]
      : null;

  return (
    <div style={{ marginTop: "16px" }}>
      <MapContainer
        center={[48.8566, 2.3522]}
        zoom={4}
        scrollWheelZoom
        style={{ height: "420px", width: "100%", borderRadius: "12px" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ClickHandler onSelect={onSelect} />
        <FitBounds selectedPoint={selectedPoint} correctPoint={correctPoint} />

        {selectedPoint && <Marker position={selectedPoint} icon={userIcon} />}

        {correctPoint && <Marker position={correctPoint} icon={correctIcon} />}

        {linePositions && (
          <Polyline
            positions={linePositions as [number, number][]}
            pathOptions={{
              color: "black",
              weight: 3,
              dashArray: "6, 8",
            }}
          />
        )}

        {midPoint && distanceKm !== null && (
          <Marker position={midPoint as [number, number]} opacity={0}>
            <Tooltip permanent direction="top">
              {distanceKm.toFixed(2)} km
            </Tooltip>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
