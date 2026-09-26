"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Configure default marker icon to prevent 404 image errors in Next.js
const defaultMarkerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export interface EmergencyReportItem {
  report_id?: string;
  text?: string;
  incident_type?: string;
  location?: string;
  severity?: string;
  priority?: number;
  lat?: number | null;
  lon?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  status?: string;
  [key: string]: unknown;
}

export default function Map({ reports }: { reports: EmergencyReportItem[] }) {
  return (
    <MapContainer
      center={[20.296, 85.824]}
      zoom={11}
      style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
    >
      {/* 100% Free OpenStreetMap with tactical dark filter — No API Key or Watermark */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        className="dark-map-tiles"
      />
      {reports.map((r, i) => {
        const lat = r.lat ?? r.latitude ?? (20.296 + (((i * 19) % 60) - 30) / 400);
        const lon = r.lon ?? r.longitude ?? (85.824 + (((i * 29) % 60) - 30) / 400);
        return (
          <Marker key={i} position={[lat, lon]} icon={defaultMarkerIcon}>
            <Popup>
              <div className="text-slate-900 font-mono text-xs">
                <p className="font-bold uppercase text-red-600">
                  {r.incident_type || "Emergency"}
                </p>
                <p className="text-slate-700 mt-1">{r.text || "Report logged"}</p>
                <p className="text-[10px] text-slate-500 mt-1">📍 {r.location || "Inferred"}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
