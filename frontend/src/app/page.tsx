"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { StadiumMap } from "@/components/stadium/StadiumMap";
import { generateZones, generateLiveStats, generateAlerts, type ZoneData } from "@/lib/simulation";
import { useSimulationStream } from "@/hooks/useSimulationStream";
import { useState, useEffect, useCallback } from "react";

export default function OperationsDashboard() {
  const { data: streamData, isConnected } = useSimulationStream();
  const [zones, setZones] = useState<ZoneData[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedZone, setSelectedZone] = useState<ZoneData | null>(null);
  const [level, setLevel] = useState<1 | 2>(1);
  const [mounted, setMounted] = useState(false);

  // Initialize + real-time polling every 3 seconds
  useEffect(() => {
    setZones(generateZones());
    setStats(generateLiveStats());
    setAlerts(generateAlerts());
    setMounted(true);
    const interval = setInterval(() => {
      setZones(generateZones());
      setStats(generateLiveStats());
      setAlerts(generateAlerts());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const setPhase = async (phase: string) => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      await fetch(`${apiBase}/api/simulation/phase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase }),
      });
    } catch (err) {
      console.error("Failed to change phase:", err);
    }
  };

  const filteredZones = zones.filter((z) => z.level === level || z.type === "gate");
  const activeAlerts = alerts.filter((a) => !a.resolved);

  if (!mounted || !stats || !streamData) return (
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
      <main className="flex-1 flex flex-col w-full h-screen overflow-hidden ml-64">
        <TopBar activeTab="Overview" />
        <div className="flex-1 overflow-y-auto p-8 lg:p-16 bg-[#fbf9f5] mt-24">
          {/* Header */}
          <div className="mb-10 flex justify-between items-start">
            <div>
              <h1 className="text-display-xl text-[#061907] mb-2">Operational Intelligence</h1>
              <div className="flex gap-2 mb-2">
                <span className="text-xs font-bold text-[#434841] my-auto">Phase Override:</span>
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
              <p className="text-body-lg text-[#434841] max-w-2xl">
                Real-time venue monitoring — {streamData.phase.toUpperCase()} phase ({stats.gameProgress}% through)
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
              <span className="text-label-caps text-[#434841]">
                {isConnected ? `Live Feed Active` : "Disconnected"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Live Stadium Map (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="bg-white rounded-xl border border-[#061907]/10 p-6 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-headline-md text-[#061907]">Live Concourse Heatmap</h2>
                  <div className="flex gap-2">
                    {[1, 2].map((l) => (
                      <button
                        key={l}
                        onClick={() => setLevel(l as 1 | 2)}
                        className={`px-3 py-1 text-label-caps rounded-full border transition-colors ${
                          level === l
                            ? "bg-[#1a2e1a] text-white border-[#1a2e1a]"
                            : "bg-transparent text-[#434841] border-[#c3c8bf] hover:border-[#1a2e1a]"
                        }`}
                      >
                        Level {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive SVG Stadium */}
                <div className="h-[480px] rounded-lg border border-[#061907]/5 overflow-hidden relative">
                  <StadiumMap
                    zones={filteredZones}
                    gates={streamData.gates.map((g: any) => ({
                      id: g.id,
                      name: g.name,
                      throughputPerMin: g.throughput,
                      queueLength: g.queue_length,
                      waitMinutes: g.wait_time_minutes,
                      isOpen: true,
                      x: g.name.includes("A") ? 94 : g.name.includes("B") ? 81 : g.name.includes("C") ? 50 : 19,
                      y: g.name.includes("A") ? 50 : g.name.includes("B") ? 81 : g.name.includes("C") ? 94 : 81,
                    }))}
                    selectedZone={selectedZone?.id}
                    onZoneClick={setSelectedZone}
                    showLabels
                  />
                </div>

                {/* Legend + Selected Zone Info */}
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#061907]/10">
                  <div className="flex gap-4">
                    {(["critical", "high", "moderate", "low"] as const).map((c) => (
                      <div key={c} className="flex items-center gap-1.5">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: c === "critical" ? "#ba1a1a" : c === "high" ? "#fe9246" : c === "moderate" ? "#7591c5" : "#b5cdb0" }}
                        />
                        <span className="text-[10px] text-[#434841] uppercase font-bold tracking-wider">{c}</span>
                      </div>
                    ))}
                  </div>
                  {selectedZone && (
                    <div className="text-right">
                      <span className="text-label-caps text-[#984800]">{selectedZone.name}</span>
                      <span className="text-body-md text-[#061907] ml-3">
                        {selectedZone.currentOccupancy}/{selectedZone.capacity} ({selectedZone.occupancyPercent}%)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Live Metric Cards */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-[#061907]/10 p-6">
                  <h3 className="text-label-caps text-[#434841] mb-3">Gate Ingress Rate</h3>
                  <div className="flex items-end gap-3">
                    <span className="text-headline-lg text-[#061907]">
                      {streamData.gates.reduce((acc: number, g: any) => acc + g.throughput, 0).toLocaleString()}
                    </span>
                    <span className={`text-sm mb-2 flex items-center ${stats.ingressDelta >= 0 ? "text-[#fe9246]" : "text-[#7591c5]"}`}>
                      <span className="material-symbols-outlined text-sm">
                        {stats.ingressDelta >= 0 ? "trending_up" : "trending_down"}
                      </span>
                      {stats.ingressDelta >= 0 ? "+" : ""}{stats.ingressDelta}%
                    </span>
                  </div>
                  <p className="text-[11px] text-[#434841] mt-1">per/min across 4 open gates</p>
                  <div className="w-full bg-[#efeeea] h-1 mt-3 rounded-full overflow-hidden">
                    <div className="bg-[#fe9246] h-full transition-all duration-1000" style={{ width: `${Math.min(stats.totalIngress / 80, 100)}%` }} />
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-[#061907]/10 p-6">
                  <h3 className="text-label-caps text-[#434841] mb-3">Concession Load</h3>
                  <div className="flex items-end gap-3">
                    <span className="text-headline-lg text-[#061907]">{stats.concessionLoad}%</span>
                    <span className={`text-sm mb-2 flex items-center ${stats.concessionDelta >= 0 ? "text-[#fe9246]" : "text-[#b5cdb0]"}`}>
                      <span className="material-symbols-outlined text-sm">
                        {stats.concessionDelta >= 0 ? "trending_up" : "trending_down"}
                      </span>
                      {stats.concessionDelta >= 0 ? "+" : ""}{stats.concessionDelta}%
                    </span>
                  </div>
                  <p className="text-[11px] text-[#434841] mt-1">${(stats.totalRevenue / 1000).toFixed(0)}k revenue this cycle</p>
                  <div className="w-full bg-[#efeeea] h-1 mt-3 rounded-full overflow-hidden">
                    <div className="bg-[#022956] h-full transition-all duration-1000" style={{ width: `${stats.concessionLoad}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Agent Activity Feed (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Occupancy Summary */}
              <div className="bg-white rounded-xl border border-[#061907]/10 p-6">
                <h3 className="text-label-caps text-[#434841] mb-3">Venue Occupancy</h3>
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-display-xl text-[#061907]">{stats.occupancyPercent}</span>
                    <span className="text-xl text-[#747871]">%</span>
                  </div>
                  <div className="text-right">
                    <p className="text-body-md text-[#061907]">{stats.totalOccupancy.toLocaleString()}</p>
                    <p className="text-[11px] text-[#434841]">of {stats.totalCapacity.toLocaleString()}</p>
                  </div>
                </div>
                <div className="w-full bg-[#efeeea] h-2 mt-4 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${stats.occupancyPercent}%`,
                      backgroundColor: stats.occupancyPercent > 90 ? "#ba1a1a" : stats.occupancyPercent > 70 ? "#fe9246" : "#7591c5",
                    }}
                  />
                </div>
              </div>

              {/* Activity Feed */}
              <div className="bg-white rounded-xl border border-[#061907]/10 p-6 flex flex-col flex-1 max-h-[520px]">
                <div className="flex justify-between items-center mb-6 border-b border-[#061907]/10 pb-3">
                  <h2 className="text-headline-md text-[#061907] text-2xl">Agent Activity</h2>
                  <span className="text-label-caps text-[#984800]">{activeAlerts.length} Active</span>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-5">
                  {activeAlerts.map((alert, i) => (
                    <div key={alert.id} className="relative pl-6 pb-3 border-l border-[#061907]/10 ml-1">
                      <div
                        className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white"
                        style={{ backgroundColor: alert.severity === "critical" ? "#ba1a1a" : alert.severity === "elevated" ? "#fe9246" : "#1a2e1a" }}
                      />
                      <div className="flex justify-between items-baseline mb-1">
                        <span
                          className="text-label-caps text-[10px]"
                          style={{ color: alert.severity === "critical" ? "#ba1a1a" : alert.severity === "elevated" ? "#984800" : "#1a2e1a" }}
                        >
                          {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                        </span>
                        <span className="text-[10px] text-[#434841] font-mono">
                          {alert.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[#061907] mb-1">{alert.title}</h4>
                      <p className="text-xs text-[#434841] leading-relaxed">{alert.description}</p>
                      <span className="text-[10px] text-[#747871] mt-1 block">{alert.zone}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
