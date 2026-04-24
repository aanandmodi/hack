"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { StadiumMap } from "@/components/stadium/StadiumMap";
import { generateZones, generateGates, generateLiveStats, type ZoneData } from "@/lib/simulation";
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
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [gates, setGates] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [viewFilter, setViewFilter] = useState<ViewFilter>("all");
  const [selectedZone, setSelectedZone] = useState<ZoneData | null>(null);
  const [level, setLevel] = useState<1 | 2>(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setZones(generateZones());
    setGates(generateGates());
    setStats(generateLiveStats());
    setMounted(true);
    const interval = setInterval(() => {
      setZones(generateZones());
      setGates(generateGates());
      setStats(generateLiveStats());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredZones = useMemo(() => {
    let z = zones.filter((zone) => zone.level === level || zone.type === "gate");
    if (viewFilter !== "all") z = z.filter((zone) => zone.type === viewFilter);
    return z;
  }, [zones, viewFilter, level]);

  const vipZones = zones.filter((z) => z.type === "vip");
  const restroomZones = zones.filter((z) => z.type === "restroom");
  const concessionZones = zones.filter((z) => z.type === "concession");

  if (!mounted || !stats) return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 flex items-center justify-center bg-[#fbf9f5]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#c3c8bf] border-t-[#984800] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-label-caps text-[#434841]">Loading Heatmap Data...</p>
        </div>
      </main>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="ml-64 pt-24 min-h-screen">
        <TopBar activeTab="Live Feed" />

        {/* Header */}
        <div className="px-16 pt-16 pb-6">
          <div className="flex items-baseline justify-between border-b border-[#c3c8bf]/30 pb-4">
            <div>
              <h2 className="text-headline-lg text-[#1a2e1a] mb-2">Level {level} Concourse</h2>
              <p className="text-body-lg text-[#434841]">
                Real-time congestion patterns &amp; facility status — {stats.occupancyPercent}% venue capacity
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
                <span className="w-2 h-2 rounded-full bg-[#fe9246] animate-pulse" />
                <span className="text-label-caps text-[#434841]">Live Updates Active</span>
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
                <div className="flex bg-[#fbf9f5]/90 backdrop-blur rounded shadow-sm border border-[#c3c8bf]/20 overflow-hidden">
                  <button className="p-2 hover:bg-[#efeeea] transition-colors border-r border-[#c3c8bf]/20">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                  </button>
                  <button className="p-2 hover:bg-[#efeeea] transition-colors">
                    <span className="material-symbols-outlined text-[20px]">remove</span>
                  </button>
                </div>
              </div>

              {/* Real-time Stadium Map */}
              <div className="flex-1 rounded-lg overflow-hidden border border-[#061907]/5">
                <StadiumMap
                  zones={filteredZones}
                  gates={gates}
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
                {selectedZone && (
                  <div className="bg-[#30312e] text-[#f2f1ed] px-4 py-2 rounded text-xs">
                    <span className="text-label-caps text-[#fe9246]">{selectedZone.name}</span>
                    <span className="ml-2">{selectedZone.currentOccupancy}/{selectedZone.capacity} • {selectedZone.congestion}</span>
                  </div>
                )}
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
                {restroomZones.map((r) => {
                  const waitMin = Math.round(r.occupancyPercent / 8);
                  return (
                    <li key={r.id} className="flex items-center justify-between border-b border-[#c3c8bf]/20 pb-3 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.congestion === "critical" ? "#ba1a1a" : r.congestion === "high" ? "#fe9246" : "#b5cdb0" }} />
                        <span className="text-sm">{r.name}</span>
                      </div>
                      <span className="text-label-caps" style={{ color: r.congestion === "critical" ? "#ba1a1a" : r.congestion === "high" ? "#984800" : "#434841" }}>
                        ~{waitMin} Min
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
                {concessionZones.map((c) => (
                  <div key={c.id} className="grid grid-cols-[1fr_2fr] items-center gap-4">
                    <span className="text-label-caps text-[#434841] text-[10px]">{c.name}</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-7 rounded flex items-center px-2 transition-all duration-1000"
                        style={{
                          width: `${Math.max(c.occupancyPercent, 15)}%`,
                          backgroundColor: c.congestion === "high" ? "#ba1a1a" : c.congestion === "moderate" ? "#fe9246" : "#e3e2df",
                        }}
                      >
                        <span className="text-label-caps text-[10px]" style={{ color: c.congestion === "high" ? "white" : c.congestion === "moderate" ? "#6b3100" : "#434841" }}>
                          {c.congestion.toUpperCase()}
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
