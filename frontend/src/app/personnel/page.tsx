"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { StadiumMap } from "@/components/stadium/StadiumMap";
import { generatePersonnel, generateZones, generateGates, generateLiveStats } from "@/lib/simulation";
import { useState, useEffect, useMemo } from "react";

const ROLE_FILTERS = ["All Staff", "Security", "Janitorial", "Guest Services", "Medical", "Maintenance"];

const STATUS_CONFIG: Record<string, { icon: string; color: string }> = {
  Active: { icon: "check_circle", color: "#061907" },
  Break: { icon: "schedule", color: "#984800" },
  Dispatched: { icon: "directions_run", color: "#7591c5" },
  "Off-Duty": { icon: "do_not_disturb_on", color: "#747871" },
};

export default function PersonnelPage() {
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [gates, setGates] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState("All Staff");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPersonnel(generatePersonnel());
    setZones(generateZones());
    setGates(generateGates());
    setStats(generateLiveStats());
    setMounted(true);
    const interval = setInterval(() => {
      setPersonnel(generatePersonnel());
      setZones(generateZones());
      setGates(generateGates());
      setStats(generateLiveStats());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    if (activeFilter === "All Staff") return personnel;
    return personnel.filter((p) => p.role === activeFilter);
  }, [personnel, activeFilter]);

  const roleCount = useMemo(() => {
    const counts: Record<string, number> = {};
    personnel.forEach((p) => { counts[p.role] = (counts[p.role] || 0) + 1; });
    return counts;
  }, [personnel]);

  const activeCount = personnel.filter((p) => p.status === "Active").length;
  const breakCount = personnel.filter((p) => p.status === "Break").length;
  const dispatchedCount = personnel.filter((p) => p.status === "Dispatched").length;

  if (!mounted || !stats) return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 flex items-center justify-center bg-[#fbf9f5]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#c3c8bf] border-t-[#984800] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-label-caps text-[#434841]">Loading Personnel Data...</p>
        </div>
      </main>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64">
        <TopBar activeTab="Overview" />
        <div className="mt-24 p-16 max-w-[1440px] mx-auto">
          {/* Header */}
          <div className="mb-10 flex justify-between items-end">
            <div>
              <h2 className="text-headline-lg text-[#061907] mb-2">Staff Deployment</h2>
              <p className="text-body-lg text-[#434841]">
                Live overview of {personnel.length} active personnel across all venue sectors.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="bg-[#d0e9cb] text-[#0c200d] text-label-caps px-4 py-2 rounded-full flex items-center gap-2 border border-[#b5cdb0]">
                <span className="w-2 h-2 rounded-full bg-[#061907] animate-pulse" />
                {activeCount} Active
              </span>
              <span className="bg-[#ffdbc8] text-[#6b3100] text-label-caps px-4 py-2 rounded-full flex items-center gap-2 border border-[#ffb689]">
                {breakCount} Break
              </span>
              <span className="bg-[#d6e3ff] text-[#001b3e] text-label-caps px-4 py-2 rounded-full flex items-center gap-2 border border-[#aac7fe]">
                {dispatchedCount} Dispatched
              </span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Left: Personnel Table (8 cols) */}
            <div className="col-span-8 flex flex-col gap-6">
              {/* Filter Tabs */}
              <div className="flex gap-4 border-b border-[#747871]/15 pb-4">
                {ROLE_FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`text-label-caps pb-1 transition-colors ${
                      activeFilter === f
                        ? "text-[#984800] border-b-2 border-[#984800]"
                        : "text-[#434841] hover:text-[#984800]"
                    }`}
                  >
                    {f}{f !== "All Staff" ? ` (${roleCount[f] || 0})` : ` (${personnel.length})`}
                  </button>
                ))}
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl border border-[#747871]/15 p-8 flex flex-col gap-2 shadow-sm">
                <div className="grid grid-cols-12 gap-4 pb-4 border-b border-[#747871]/10 text-label-caps text-[#434841]">
                  <div className="col-span-3">Personnel</div>
                  <div className="col-span-2">Role</div>
                  <div className="col-span-3">Location</div>
                  <div className="col-span-2">Shift</div>
                  <div className="col-span-2 text-right">Status</div>
                </div>
                {filtered.map((p) => {
                  const statusCfg = STATUS_CONFIG[p.status] || STATUS_CONFIG["Active"];
                  return (
                    <div
                      key={p.id}
                      className="grid grid-cols-12 gap-4 py-4 items-center border-b border-[#747871]/5 hover:bg-[#f5f3f0]/50 transition-colors cursor-pointer"
                    >
                      <div className="col-span-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#e9e8e4] flex items-center justify-center text-[#061907] font-bold text-sm">
                          {p.initials}
                        </div>
                        <div>
                          <p className="text-ui-button text-[#061907]">{p.name}</p>
                          <p className="text-[10px] text-[#747871] font-mono">ID: {p.id}</p>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className="bg-[#efeeea] text-[#1b1c1a] text-label-caps px-3 py-1 rounded-md border border-[#747871]/10 text-[10px]">
                          {p.role}
                        </span>
                      </div>
                      <div className="col-span-3 text-sm text-[#1b1c1a]">{p.location}</div>
                      <div className="col-span-2 text-[11px] text-[#747871] font-mono">
                        {p.shiftStart} – {p.shiftEnd}
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="text-label-caps flex items-center justify-end gap-1" style={{ color: statusCfg.color }}>
                          <span className="material-symbols-outlined text-[16px]">{statusCfg.icon}</span>
                          {p.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Live Sector Density (4 cols) */}
            <div className="col-span-4 flex flex-col gap-6">
              <div className="bg-white rounded-xl border border-[#747871]/15 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-headline-md text-[#061907] text-xl">Sector Density</h3>
                  <span className="material-symbols-outlined text-[#747871]">map</span>
                </div>
                {/* Real-time SVG Map */}
                <div className="h-[300px] rounded-lg border border-[#061907]/5 overflow-hidden">
                  <StadiumMap zones={zones} gates={gates} showLabels={false} />
                </div>
                <div className="mt-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center border-b border-[#747871]/10 pb-2">
                    <span className="text-body-md text-[#434841]">Total Active Staff</span>
                    <span className="text-headline-md text-[#061907] text-2xl">{activeCount}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#747871]/10 pb-2">
                    <span className="text-body-md text-[#434841]">Venue Occupancy</span>
                    <span className="text-headline-md text-[#061907] text-2xl">{stats.occupancyPercent}%</span>
                  </div>
                  {/* Density by zone type */}
                  {["gate", "concourse", "section"].map((type) => {
                    const typeZones = zones.filter((z) => z.type === type);
                    const congested = typeZones.filter((z) => z.congestion === "high" || z.congestion === "critical").length;
                    return (
                      <div key={type} className="flex justify-between items-center">
                        <span className="text-body-md text-[#434841] capitalize">{type}s</span>
                        <span className={`text-label-caps px-2 py-1 rounded ${congested > 0 ? "bg-[#ffdbc8] text-[#984800]" : "bg-[#d0e9cb] text-[#061907]"}`}>
                          {congested}/{typeZones.length} Congested
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
