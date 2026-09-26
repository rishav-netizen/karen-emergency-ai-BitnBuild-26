"use client";

import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface EmergencyReport {
  report_id: string;
  text: string;
  incident_type?: string;
  location?: string;
  severity?: string;
  actionability?: string;
  credibility?: number;
  priority?: number;
  latitude?: number | null;
  longitude?: number | null;
  status?: string;
  dispatch_status?: string;
  dispatched_unit?: string | null;
}

interface TacticalMapProps {
  reports: EmergencyReport[];
  selectedReportId?: string | null;
  onSelectReport?: (id: string) => void;
}

export function getReportCoordinates(report: EmergencyReport, index: number): [number, number] {
  if (
    typeof report.latitude === "number" &&
    typeof report.longitude === "number" &&
    !isNaN(report.latitude) &&
    !isNaN(report.longitude)
  ) {
    return [report.latitude, report.longitude];
  }

  // Deterministic seed based on report_id for consistent positioning around NYC (40.7128, -74.0060)
  const idStr = report.report_id || `R${index}`;
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = (hash << 5) - hash + idStr.charCodeAt(i);
    hash |= 0;
  }

  const latOffset = (((Math.abs(hash) % 1000) - 500) / 10000) * 1.4;
  const lonOffset = (((Math.abs(hash * 37) % 1000) - 500) / 10000) * 1.4;

  return [40.7128 + latOffset, -74.0060 + lonOffset];
}

const createCustomIcon = (isHighPriority: boolean) => {
  if (isHighPriority) {
    return L.divIcon({
      className: "tactical-marker",
      html: `
        <div style="position: relative; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;">
          <span style="position: absolute; width: 26px; height: 26px; border-radius: 50%; background-color: rgba(239, 68, 68, 0.45); animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
          <span style="position: relative; width: 14px; height: 14px; border-radius: 50%; background-color: #ef4444; border: 2px solid #ffffff; box-shadow: 0 0 14px rgba(239, 68, 68, 0.9);"></span>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      popupAnchor: [0, -13],
    });
  }

  return L.divIcon({
    className: "tactical-marker",
    html: `
      <div style="position: relative; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">
        <span style="position: absolute; width: 20px; height: 20px; border-radius: 50%; background-color: rgba(34, 211, 238, 0.35); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <span style="position: relative; width: 11px; height: 11px; border-radius: 50%; background-color: #06b6d4; border: 2px solid #0f172a; box-shadow: 0 0 10px rgba(6, 182, 212, 0.8);"></span>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
};

export default function TacticalMap({ reports, onSelectReport }: TacticalMapProps) {
  // Memoize icons
  const highPriorityIcon = useMemo(() => createCustomIcon(true), []);
  const standardPriorityIcon = useMemo(() => createCustomIcon(false), []);

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden border border-white/10 bg-slate-950/60 shadow-2xl backdrop-blur-xl">
      {/* Tactical HUD Overlay Elements */}
      <div className="absolute top-4 left-4 z-[1000] pointer-events-none flex items-center gap-2 bg-slate-950/80 border border-cyan-500/30 px-3 py-1.5 rounded-lg backdrop-blur-md text-[11px] font-mono text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span className="tracking-widest uppercase">SATELLITE RADAR: NYC SECTOR // DARK FEED</span>
      </div>

      <div className="absolute bottom-4 left-4 z-[1000] pointer-events-none bg-slate-950/80 border border-white/10 px-3 py-1 rounded text-[10px] font-mono text-slate-400">
        GEOLOCATED TARGETS: <span className="text-cyan-400 font-bold">{reports.length}</span>
      </div>

      <MapContainer
        center={[40.7128, -74.006]}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ minHeight: "100%", width: "100%", background: "#020617" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="dark-map-tiles"
          maxZoom={19}
        />

        {reports.map((report, idx) => {
          const coords = getReportCoordinates(report, idx);
          const isHighPriority =
            (typeof report.priority === "number" && report.priority > 0.8) ||
            report.severity?.toLowerCase() === "critical";

          const priorityFormatted =
            typeof report.priority === "number"
              ? `${(report.priority * 100).toFixed(0)}%`
              : "N/A";

          return (
            <Marker
              key={report.report_id || `marker-${idx}`}
              position={coords}
              icon={isHighPriority ? highPriorityIcon : standardPriorityIcon}
              eventHandlers={{
                click: () => {
                  if (onSelectReport) onSelectReport(report.report_id);
                },
              }}
            >
              <Popup className="tactical-popup">
                <div className="p-1 font-mono text-xs text-slate-100 max-w-xs">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-700/80 pb-1 mb-1.5">
                    <span
                      className={`font-black uppercase tracking-wider ${
                        isHighPriority ? "text-red-400" : "text-cyan-400"
                      }`}
                    >
                      {report.incident_type ? report.incident_type.toUpperCase() : "INCIDENT"}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        isHighPriority ? "bg-red-950 text-red-300" : "bg-cyan-950 text-cyan-300"
                      }`}
                    >
                      {priorityFormatted}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mb-1">
                    📍 {report.location || "Location Inferred"}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug line-clamp-3">
                    &ldquo;{report.text}&rdquo;
                  </p>
                  <div className="mt-2 pt-1 border-t border-slate-800 text-[9px] text-slate-500 flex justify-between">
                    <span>ID: {report.report_id}</span>
                    <span className="uppercase text-emerald-400">{report.status || "ACTIVE"}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
