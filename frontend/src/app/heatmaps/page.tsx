"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { StadiumMap } from "@/components/stadium/StadiumMap";
import { useSimulationStream } from "@/hooks/useSimulationStream";
import { generateZones, type ZoneData } from "@/lib/simulation";
import { useState, useEffect, useMemo } from "react";

type ViewFilter = "all" | "section" | "gate" | "concourse" | "restroom" | "vip" | "concession";

const VIEW_OPTIONS: { id: ViewFilter; label: string; icon: string }[] = [
  { id: "all", label: "All Zones", icon: "grid_view" },
  { id: "section", label: "Sections", icon: "event_seat" },
  { id: "gate", label: "Gates", icon: "door_front" },
  { id: "concourse", label: "Concourses", icon: "directions_walk" },
  { id: "restroom", label: "Restrooms", icon: "wc" },
  { id: "vip", label: "VIP Lounges", icon: "chair" },
  { id: "concession", label: "Concessions", icon: "storefront" },
];

export default function HeatmapsPage() {
  const { data: streamData, isConnected } = useSimulationStream();
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [viewFilter, setViewFilter] = useState<ViewFilter>("all");
  const [selectedZone, setSelectedZone] = useState<ZoneData | null>(null);
  const [level, setLevel] = useState<1 | 2>(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setZones(generateZones());
    setMounted(true);
  }, []);

  const setPhase = async (phase: string) => {
    try {
      await fetch("http://localhost:8000/api/simulation/phase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase }),
      });
    } catch (err) {
      console.error("Failed to change phase:", err);
    }
  };

  const filteredZones = useMemo(() => {
    let z = zones.filter((zone) => zone.level === level || zone.type === "gate");
    if (viewFilter !== "all") z = z.filter((zone) => zone.type === viewFilter);
    return z;
  }, [zones, viewFilter, level]);

  const vipZones = zones.filter((z) => z.type === "vip");

  if (!mounted || !streamData) return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 flex items-center justify-center bg-[#fbf9f5]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#c3c8bf] border-t-[#984800] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-label-caps text-[#434841]">Connecting to Simulation Engine...</p>
        </div>
      </main>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-64 pt-24 min-h-screen">
        <TopBar activeTab="Live Feed" />

        {/* Phase Overrides */}
        <div className="absolute top-28 right-16 flex gap-2 z-50 bg-white/80 p-2 rounded border border-[#c3c8bf] shadow-sm backdrop-blur">
          <span className="text-xs font-bold my-auto mr-2">Phase Override:</span>
          {["Ingress", "Steady State", "Intermission", "Egress"].map((phase) => (
            <button
              key={phase}
              onClick={() => setPhase(phase)}
              className={`px-2 py-1 text-[10px] rounded border ${streamData.phase === phase ? "bg-[#1a2e1a] text-white" : "bg-white text-black hover:bg-gray-100"}`}
            >
              {phase}
            </button>
          ))}
        </div>

        {/* Header */}
        <div className="px-16 pt-16 pb-6">
          <div className="flex items-baseline justify-between border-b border-[#c3c8bf]/30 pb-4">
            <div>
              <h2 className="text-headline-lg text-[#1a2e1a] mb-2">Level {level} Concourse</h2>
              <p className="text-body-lg text-[#434841]">
                Real-time congestion patterns &amp; facility status
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {[1, 2].map((l) => (
                  <button
                    key={l}
                    onClick={() => setLevel(l as 1 | 2)}
                    className={`px-3 py-1 text-label-caps rounded border transition-colors ${
                      level === l ? "bg-[#1a2e1a] text-white border-[#1a2e1a]" : "bg-transparent text-[#434841] border-[#c3c8bf]"
                    }`}
                  >
                    Level {l}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-[#b5cdb0] animate-pulse" : "bg-red-500"}`} />
                <span className="text-label-caps text-[#434841]">
                  {isConnected ? `Live Feed Active - ${streamData.phase}` : "Disconnected"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* View Selector */}
        <div className="px-16 pb-6">
          <div className="flex gap-2 flex-wrap">
            {VIEW_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setViewFilter(opt.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded text-label-caps transition-colors ${
                  viewFilter === opt.id
                    ? "bg-[#1a2e1a] text-white"
                    : "bg-white text-[#434841] border border-[#c3c8bf] hover:border-[#1a2e1a]"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-12 gap-8 px-16 pb-16">
          {/* Left: Interactive Heatmap (8 cols) */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white rounded-xl border border-[#1a2e1a]/10 p-6 relative overflow-hidden h-[600px] flex flex-col">
              {/* Controls */}
              <div className="flex justify-between items-start mb-4 z-10 relative">
                <div className="bg-[#fbf9f5]/90 backdrop-blur px-4 py-2 rounded shadow-sm border border-[#c3c8bf]/20 inline-flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#022956]">my_location</span>
                  <span className="text-label-caps text-[#022956]">
                    {viewFilter === "all" ? "All Zones" : VIEW_OPTIONS.find((o) => o.id === viewFilter)?.label}
                  </span>
                </div>
              </div>

              {/* Real-time Stadium Map */}
              <div className="flex-1 rounded-lg overflow-hidden border border-[#061907]/5">
                <StadiumMap
                  zones={filteredZones}
                  gates={streamData.gates.map(g => ({
                    id: g.id,
                    name: g.name,
                    throughputPerMin: g.throughput,
                    queueLength: g.queue_length,
                    waitMinutes: g.wait_time_minutes,
                    isOpen: true,
                    x: g.name.includes("A") ? 94 : g.name.includes("B") ? 81 : g.name.includes("C") ? 50 : 19, // approximate for 4 gates
                    y: g.name.includes("A") ? 50 : g.name.includes("B") ? 81 : g.name.includes("C") ? 94 : 81,
                  }))}
                  selectedZone={selectedZone?.id}
                  onZoneClick={setSelectedZone}
                  showLabels
                />
              </div>

              {/* Legend + Selection */}
              <div className="flex justify-between items-center mt-4 z-10 relative">
                <div className="bg-[#fbf9f5]/90 backdrop-blur p-3 rounded border border-[#c3c8bf]/20 inline-flex items-center gap-5">
                  {(["low", "moderate", "high", "critical"] as const).map((c) => (
                    <div key={c} className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c === "critical" ? "#ba1a1a" : c === "high" ? "#fe9246" : c === "moderate" ? "#7591c5" : "#b5cdb0" }} />
                      <span className="text-label-caps text-[#434841] text-[10px]">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Data Cards (4 cols) */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            {/* VIP Lounges */}
            <div className="bg-white rounded-xl border border-[#1a2e1a]/10 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-[18px] font-semibold text-[#1a2e1a]" style={{ fontFamily: "var(--font-serif)" }}>VIP Lounges</h3>
                <span className="material-symbols-outlined text-[#747871]">chair</span>
              </div>
              <div className="space-y-5">
                {vipZones.map((v) => (
                  <div key={v.id}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-[#1b1c1a]">{v.name}</span>
                      <span className="text-[#434841]">{v.occupancyPercent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#e3e2df] rounded overflow-hidden">
                      <div
                        className="h-full rounded transition-all duration-1000"
                        style={{
                          width: `${v.occupancyPercent}%`,
                          backgroundColor: v.occupancyPercent > 80 ? "#fe9246" : v.occupancyPercent > 50 ? "#022956" : "#b5cdb0",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Facilities Wait Time */}
            <div className="bg-white rounded-xl border border-[#1a2e1a]/10 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-[18px] font-semibold text-[#1a2e1a]" style={{ fontFamily: "var(--font-serif)" }}>Facilities Wait Time</h3>
                <span className="material-symbols-outlined text-[#747871]">wc</span>
              </div>
              <ul className="space-y-3">
                {streamData.restrooms.map((r) => {
                  return (
                    <li key={r.id} className="flex items-center justify-between border-b border-[#c3c8bf]/20 pb-3 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.congestion === "critical" ? "#ba1a1a" : r.congestion === "high" ? "#fe9246" : "#b5cdb0" }} />
                        <span className="text-sm">{r.name}</span>
                      </div>
                      <span className="text-label-caps" style={{ color: r.congestion === "critical" ? "#ba1a1a" : r.congestion === "high" ? "#984800" : "#434841" }}>
                        ~{r.wait_time_minutes} Min
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Concessions */}
            <div className="bg-white rounded-xl border border-[#1a2e1a]/10 p-6 shadow-sm flex-grow">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-[18px] font-semibold text-[#1a2e1a]" style={{ fontFamily: "var(--font-serif)" }}>Concessions</h3>
                <span className="material-symbols-outlined text-[#747871]">storefront</span>
              </div>
              <div className="flex flex-col gap-4">
                {streamData.concessions.map((c) => (
                  <div key={c.id} className="grid grid-cols-[1fr_2fr] items-center gap-4">
                    <span className="text-label-caps text-[#434841] text-[10px] whitespace-nowrap overflow-hidden text-ellipsis">{c.name}</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-7 rounded flex items-center px-2 transition-all duration-1000"
                        style={{
                          width: `${Math.max((c.wait_time_minutes / 20) * 100, 15)}%`,
                          backgroundColor: c.congestion === "high" || c.congestion === "critical" ? "#ba1a1a" : c.congestion === "moderate" ? "#fe9246" : "#e3e2df",
                        }}
                      >
                        <span className="text-label-caps text-[10px]" style={{ color: c.congestion === "high" || c.congestion === "critical" ? "white" : c.congestion === "moderate" ? "#6b3100" : "#434841" }}>
                          {c.congestion.toUpperCase()} ({c.wait_time_minutes}m)
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
