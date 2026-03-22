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

const blueIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const redIcon = L.icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

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

        {selectedPoint && (
          <Marker
            position={[selectedPoint.lat, selectedPoint.lng]}
            icon={blueIcon}
          />
        )}

        {correctPoint && (
          <Marker
            position={[correctPoint.lat, correctPoint.lng]}
            icon={redIcon}
          />
        )}

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
