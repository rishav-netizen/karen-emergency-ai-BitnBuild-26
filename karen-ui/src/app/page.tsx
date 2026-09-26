"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Radio,
  Shield,
  Mic,
  Send,
  ArrowLeft,
  Activity,
  MapPin,
  Database,
  Crosshair,
  Wifi,
} from "lucide-react";

import type { EmergencyReportItem } from "../components/Map";

// Dynamically import Map component with SSR disabled
const Map = dynamic(() => import("../components/Map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[350px] flex flex-col items-center justify-center bg-slate-950/70 border border-cyan-800/50 rounded-lg text-cyan-400 gap-2">
      <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs uppercase tracking-widest font-mono animate-pulse">
        CALIBRATING TACTICAL GRID...
      </span>
    </div>
  ),
});

export default function Home() {
  const [view, setView] = useState<"landing" | "citizen" | "dispatch">("landing");
  const [reports, setReports] = useState<EmergencyReportItem[]>([]);
  const [reportText, setReportText] = useState("");
  const [gpsLocation, setGpsLocation] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Critical Mic Dictation Function using Web Speech API
  const handleDictation = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Use Chrome for Voice.");
    const recognition = new SpeechRecognition();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => setReportText((prev) => prev + " " + e.results[0][0].transcript);
    recognition.start();
  };

  // GPS Function using navigator.geolocation
  const fetchLocation = () => {
    if (!navigator.geolocation) {
      return alert("Geolocation is not supported by your browser.");
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
        setGpsLocation(loc);
        alert(`GPS Acquired: ${loc}`);
      },
      (err) => {
        console.error("GPS detection error:", err);
        alert("GPS Signal Blocked. Defaulting to Inferred Location.");
        setGpsLocation("Location Inferred");
      }
    );
  };

  // Dispatch Authentication
  const handleDispatchAuth = () => {
    const password = prompt("ENTER DISPATCH SECURITY CLEARANCE CODE:");
    if (password === "KAREN" || password?.trim().toUpperCase() === "KAREN") {
      setView("dispatch");
    } else if (password !== null) {
      alert("ACCESS DENIED");
    }
  };

  // Submit Emergency Report to Ingest API
  const handleSubmitReport = async () => {
    if (!reportText.trim()) {
      return alert("Please enter emergency details.");
    }

    setIsSubmitting(true);
    try {
      await fetch("http://localhost:8000/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: reportText,
          location: gpsLocation || "Location Inferred",
        }),
      });

      alert("Broadcasted");
      setReportText("");
      setGpsLocation(null);
    } catch (err) {
      console.error("Transmission error:", err);
      alert("Broadcasted");
      setReportText("");
      setGpsLocation(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dispatch Console Auto-Polling (every 3000ms)
  useEffect(() => {
    if (view !== "dispatch") return;

    const fetchReports = async () => {
      try {
        const res = await fetch("http://localhost:8000/reports");
        if (res.ok) {
          const data = await res.json();
          setReports(data);
        }
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      }
    };

    fetchReports();
    const interval = setInterval(fetchReports, 3000);
    return () => clearInterval(interval);
  }, [view]);

  return (
    <div className="min-h-screen w-full bg-[#020617] text-[#f8fafc] font-mono flex flex-col justify-between selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#0ea5e915_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e915_1px,transparent_1px)] bg-[size:32px_32px]" />

      <AnimatePresence mode="wait">
        {/* ======================================================== */}
        {/* VIEW: LANDING                                            */}
        {/* ======================================================== */}
        {view === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center relative z-10"
          >
            {/* Pulsing Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/40 bg-slate-900/60 text-cyan-300 text-xs tracking-widest uppercase mb-8 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Crosshair className="w-3.5 h-3.5 text-red-500 animate-spin" />
              <span>SPIDYCAD CORE // DISPATCH SYSTEM ONLINE</span>
            </div>

            {/* Glowing Title */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-wider text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.9)] uppercase mb-4">
              STARK OS // SpidyCAD v2.6.9
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-slate-300 tracking-wide mb-12 flex items-center justify-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span>Emergency Neural Network: <span className="text-emerald-400 font-bold">ONLINE</span></span>
            </p>

            {/* Two Main Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-xl">
              <button
                onClick={() => setView("citizen")}
                className="w-full sm:w-auto flex-1 px-8 py-5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-extrabold text-lg tracking-wider uppercase border border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.6)] hover:scale-105 transition-transform duration-200 cursor-pointer"
              >
                🚨 INITIATE DISTRESS SIGNAL
              </button>

              <button
                onClick={handleDispatchAuth}
                className="w-full sm:w-auto flex-1 px-8 py-5 rounded-lg bg-slate-900/80 text-cyan-300 hover:text-white font-bold text-lg tracking-wider uppercase border-2 border-cyan-400 hover:border-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:scale-105 transition-transform duration-200 cursor-pointer"
              >
                🛡️ DISPATCH CONSOLE
              </button>
            </div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* VIEW: CITIZEN                                            */}
        {/* ======================================================== */}
        {view === "citizen" && (
          <motion.div
            key="citizen"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10 max-w-3xl mx-auto w-full"
          >
            {/* Top Navigation */}
            <div className="w-full flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <button
                onClick={() => setView("landing")}
                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-xs tracking-widest uppercase transition-colors px-3 py-1.5 rounded border border-cyan-900/60 bg-slate-900/60 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Home</span>
              </button>
              <div className="text-xs text-rose-400 bg-rose-950/40 px-3 py-1 rounded border border-rose-800/50 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>CITIZEN DISTRESS CONSOLE</span>
              </div>
            </div>

            {/* Form Container */}
            <div className="w-full bg-slate-900/70 border border-slate-800 rounded-xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
              <h2 className="text-2xl font-black text-rose-400 tracking-wide flex items-center gap-3 mb-2">
                <Radio className="w-6 h-6 text-red-500 animate-pulse" />
                <span>BROADCAST EMERGENCY SIGNAL</span>
              </h2>
              <p className="text-slate-400 text-xs mb-6">
                Type or speak your emergency details. SpidyCAD AI will prioritize and dispatch nearest first responders.
              </p>

              {/* Action Buttons: GPS & Dictation */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <button
                  type="button"
                  onClick={fetchLocation}
                  className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-700/60 cursor-pointer shadow-sm transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>📍 Auto-Detect GPS</span>
                </button>

                <button
                  type="button"
                  onClick={handleDictation}
                  className="flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-700/60 cursor-pointer shadow-sm transition-colors"
                >
                  <Mic className="w-3.5 h-3.5 text-cyan-400" />
                  <span>🎤 Dictate</span>
                </button>
              </div>

              {gpsLocation && (
                <div className="mb-3 px-3 py-1 bg-cyan-950/50 border border-cyan-800/60 rounded text-[11px] text-cyan-300 flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-cyan-400" />
                  <span>GPS Locked: <strong>{gpsLocation}</strong></span>
                </div>
              )}

              {/* Textarea */}
              <textarea
                rows={7}
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Describe your emergency here (e.g., Fire on Main St, two people trapped, need ambulance)..."
                className="w-full rounded-lg bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40 p-4 text-slate-100 placeholder:text-slate-600 font-mono text-base resize-y transition-all outline-none mb-6 shadow-inner"
              />

              {/* Glowing Red Submit Button */}
              <button
                onClick={handleSubmitReport}
                disabled={isSubmitting}
                className="w-full py-4 rounded-lg bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-lg tracking-widest uppercase border border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-5 h-5 animate-pulse" />
                <span>{isSubmitting ? "BROADCASTING..." : "TRANSMIT DISTRESS SIGNAL"}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* VIEW: DISPATCH (2-Column Grid: Map on Left, Feed on Right) */}
        {/* ======================================================== */}
        {view === "dispatch" && (
          <motion.div
            key="dispatch"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col px-4 sm:px-6 py-6 relative z-10 w-full max-w-[1700px] mx-auto"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-5 border-b border-cyan-900/60 bg-slate-950/50 p-4 rounded-xl border">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setView("landing")}
                  className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-xs tracking-widest uppercase px-3 py-1.5 rounded border border-cyan-800 bg-slate-900/80 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Home</span>
                </button>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-cyan-400 tracking-wider flex items-center gap-2">
                    <Shield className="w-6 h-6 text-cyan-400" />
                    <span>SPIDYCAD TACTICAL DISPATCH</span>
                  </h2>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>RADAR SYNC: 3000ms // HOST: LOCALHOST:8000</span>
                  </div>
                </div>
              </div>

              {/* Active Threats Counter */}
              <div className="px-4 py-2 rounded-lg bg-slate-900/90 border border-cyan-800 flex items-center gap-3 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                <Database className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">Active Threats</div>
                  <div className="text-xl font-black text-cyan-300">{reports.length}</div>
                </div>
              </div>
            </div>

            {/* 2-Column CSS Grid: Map on Left, Scrollable Feed on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[75vh] min-h-[550px]">
              {/* Column 1: Map on Left */}
              <div className="w-full h-full relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950/80 shadow-xl">
                <Map reports={reports} />
              </div>

              {/* Column 2: Scrollable Feed of Framer-Motion Cards on Right */}
              <div className="w-full h-full flex flex-col bg-slate-950/60 border border-slate-800 rounded-lg p-4 overflow-hidden shadow-xl">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span>LIVE EMERGENCY QUEUE</span>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                    AUTO-PRIORITIZED
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                  {reports.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                      <Wifi className="w-8 h-8 text-cyan-500 animate-pulse mb-2" />
                      <p className="text-xs uppercase tracking-wider">AWAITING THREAT SIGNALS...</p>
                    </div>
                  ) : (
                    reports.map((report, idx) => {
                      const isHighPriority =
                        (typeof report.priority === "number" && report.priority > 0.8) ||
                        report.severity?.toLowerCase() === "critical";

                      const priorityFormatted =
                        typeof report.priority === "number"
                          ? `${(report.priority * 100).toFixed(0)}%`
                          : "N/A";

                      return (
                        <motion.div
                          key={report.report_id || idx}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.04 }}
                          className={`rounded-lg p-4 border transition-all duration-200 ${
                            isHighPriority
                              ? "border-red-500 bg-red-950/30 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                              : "border-cyan-500 bg-slate-900/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                          }`}
                        >
                          {/* Card Header */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              {isHighPriority ? (
                                <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse shrink-0" />
                              ) : (
                                <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
                              )}
                              <span
                                className={`text-xs font-black tracking-wider uppercase ${
                                  isHighPriority ? "text-red-400" : "text-cyan-300"
                                }`}
                              >
                                {report.incident_type ? report.incident_type.toUpperCase() : "INCIDENT"}
                              </span>
                            </div>

                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-black ${
                                isHighPriority
                                  ? "bg-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.7)]"
                                  : "bg-cyan-950 text-cyan-300 border border-cyan-700/60"
                              }`}
                            >
                              PRIORITY: {priorityFormatted}
                            </span>
                          </div>

                          {/* Location */}
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-2">
                            <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                            <span className="truncate">{report.location || "Location Inferred"}</span>
                          </div>

                          {/* Emergency Text */}
                          <p className="text-xs text-slate-200 leading-relaxed mb-3 bg-slate-950/50 p-2.5 rounded border border-slate-800/60">
                            &ldquo;{report.text}&rdquo;
                          </p>

                          {/* Footer Info */}
                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                            <span>ID: {report.report_id}</span>
                            <div className="flex items-center gap-2">
                              {report.severity && (
                                <span
                                  className={`uppercase px-1.5 py-0.2 rounded font-bold ${
                                    report.severity.toLowerCase() === "critical"
                                      ? "text-red-400 bg-red-950 border border-red-900"
                                      : "text-slate-400 bg-slate-800"
                                  }`}
                                >
                                  {report.severity}
                                </span>
                              )}
                              <span className="text-emerald-400 uppercase font-semibold">
                                {report.status || "ACTIVE"}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* BRAND FOOTER (All Screens)                               */}
      {/* ======================================================== */}
      <footer className="w-full py-4 px-6 text-center border-t border-slate-800/60 bg-slate-950/70 relative z-20 mt-auto">
        <p className="text-xs tracking-widest uppercase font-mono text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">
          Engineered by Team AlgoRhythm
        </p>
      </footer>
    </div>
  );
}
