"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { generateFlowData, generateLiveStats, generateConcessionEconomics, generateAlerts } from "@/lib/simulation";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamic import recharts to avoid SSR issues
const RechartsLine = dynamic(
  () => import("recharts").then((mod) => {
    const { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Line, Legend } = mod;
    return function FlowChart({ data }: { data: any[] }) {
      return (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7591c5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7591c5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#c3c8bf" opacity={0.3} />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#747871" }} axisLine={{ stroke: "#c3c8bf" }} />
            <YAxis tick={{ fontSize: 10, fill: "#747871" }} axisLine={{ stroke: "#c3c8bf" }} tickFormatter={(v: any) => `${(Number(v) / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: "#30312e", border: "none", borderRadius: 4, color: "#f2f1ed", fontSize: 12 }}
              labelStyle={{ color: "#984800", fontWeight: 700, fontSize: 11 }}
              formatter={(value: any) => [Number(value).toLocaleString(), ""]}
            />
            <Area type="monotone" dataKey="current" stroke="#7591c5" strokeWidth={2.5} fill="url(#colorCurrent)" name="Current Match" />
            <Line type="monotone" dataKey="baseline" stroke="#c3c8bf" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Baseline" />
          </AreaChart>
        </ResponsiveContainer>
      );
    };
  }),
  { ssr: false, loading: () => <div className="h-[280px] bg-[#f5f3f0] rounded animate-pulse" /> }
);

const RechartsBar = dynamic(
  () => import("recharts").then((mod) => {
    const { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Line, ComposedChart } = mod;
    return function ConcessionChart({ data }: { data: any[] }) {
      return (
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#c3c8bf" opacity={0.3} />
            <XAxis dataKey="zone" tick={{ fontSize: 10, fill: "#747871" }} axisLine={{ stroke: "#c3c8bf" }} />
            <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#747871" }} tickFormatter={(v: any) => `$${(Number(v) / 1000).toFixed(0)}k`} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#984800" }} tickFormatter={(v: any) => `${v}m`} />
            <Tooltip
              contentStyle={{ backgroundColor: "#30312e", border: "none", borderRadius: 4, color: "#f2f1ed", fontSize: 12 }}
              formatter={(value: any, name: any) => [name === "revenue" ? `$${Number(value).toLocaleString()}` : `${value} min`, name === "revenue" ? "Revenue" : "Wait Time"]}
            />
            <Bar yAxisId="left" dataKey="revenue" fill="#7591c5" radius={[2, 2, 0, 0]} opacity={0.8} />
            <Line yAxisId="right" type="monotone" dataKey="avgWaitMinutes" stroke="#984800" strokeWidth={2} dot={{ fill: "#fff", stroke: "#984800", strokeWidth: 1.5, r: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      );
    };
  }),
  { ssr: false, loading: () => <div className="h-[220px] bg-[#f5f3f0] rounded animate-pulse" /> }
);

export default function IntelligencePage() {
  const [flowData, setFlowData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [concessions, setConcessions] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setFlowData(generateFlowData());
    setStats(generateLiveStats());
    setConcessions(generateConcessionEconomics());
    setAlerts(generateAlerts());
    setMounted(true);
    const interval = setInterval(() => {
      setFlowData(generateFlowData());
      setStats(generateLiveStats());
      setConcessions(generateConcessionEconomics());
      setAlerts(generateAlerts());
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const totalRevenue = concessions.reduce((s, c) => s + c.revenue, 0);
  const activeAlerts = alerts.filter((a) => !a.resolved);

  if (!mounted || !stats) return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 flex items-center justify-center bg-[#fbf9f5]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#c3c8bf] border-t-[#984800] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-label-caps text-[#434841]">Loading Intelligence...</p>
        </div>
      </main>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 pt-24 w-full min-h-screen px-16 pb-16 flex flex-col gap-12 relative overflow-hidden">
        <TopBar activeTab="Live Feed" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#7591c5]/5 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />

        {/* Header */}
        <header className="max-w-4xl pt-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-label-caps text-[#7591c5] bg-[#001532]/5 px-2 py-1 rounded-sm border border-[#001532]/10">
              System Status: Optimal
            </span>
            <span className="text-label-caps text-[#747871] ml-4">
              Phase: {stats.gamePhase.replace("-", " ").toUpperCase()} • Updated: {new Date(stats.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <h2 className="text-display-xl text-[#1b1c1a] tracking-tighter leading-none mb-6">Venue Intelligence</h2>
          <p className="text-body-lg text-[#434841] max-w-2xl border-l-2 border-[#984800] pl-6">
            Comprehensive analysis of attendee flow dynamics, spatial utilization, and real-time
            revenue velocity across all concourses.
          </p>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-12 gap-8">
          {/* Flow Velocity Chart (8 cols) */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded border border-[#c3c8bf]/30 p-8 flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-blueprint opacity-50 pointer-events-none z-0" />
            <div className="relative z-10 flex justify-between items-start mb-6">
              <div>
                <h3 className="text-headline-md text-[#1b1c1a] mb-1">Concourse Flow Velocity</h3>
                <p className="text-body-md text-[#434841]">Pedestrian throughput per minute vs historical baseline.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#7591c5]" />
                  <span className="text-label-caps text-[#434841]">Current Match</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border border-[#c3c8bf] bg-transparent" />
                  <span className="text-label-caps text-[#747871]">Baseline</span>
                </div>
              </div>
            </div>
            <div className="relative z-10">
              <RechartsLine data={flowData} />
            </div>
          </div>

          {/* Live Occupancy Gauge (4 cols) */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded border border-[#c3c8bf]/30 p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-headline-md text-[#1b1c1a] mb-1">Live Occupancy</h3>
              <p className="text-body-md text-[#434841]">Current capacity saturation across all zones.</p>
            </div>
            <div className="flex flex-col items-center justify-center py-6">
              {/* Animated gauge */}
              <div className="relative w-48 h-24 overflow-hidden mb-4">
                <svg viewBox="0 0 200 100" className="w-full h-full">
                  {/* Background arc */}
                  <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#e3e2df" strokeWidth="16" strokeLinecap="round" />
                  {/* Active arc */}
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke={stats.occupancyPercent > 90 ? "#ba1a1a" : stats.occupancyPercent > 70 ? "#7591c5" : "#b5cdb0"}
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeDasharray={`${(stats.occupancyPercent / 100) * 251} 251`}
                    className="transition-all duration-1000"
                  />
                </svg>
              </div>
              <div className="text-center -mt-8">
                <span className="block text-display-xl text-[#1b1c1a] leading-none">
                  {stats.occupancyPercent}<span className="text-3xl text-[#747871]">%</span>
                </span>
                <span className="text-label-caps text-[#984800] mt-2 block">
                  {stats.occupancyPercent > 90 ? "Critical Capacity" : stats.occupancyPercent > 70 ? "Approaching Peak" : "Normal Flow"}
                </span>
              </div>
            </div>
            <div className="border-t border-[#c3c8bf]/20 pt-4 flex justify-between items-center">
              <span className="text-label-caps text-[#747871]">
                Total: {stats.totalOccupancy.toLocaleString()} / {stats.totalCapacity.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Concession Economics (6 cols) */}
          <div className="col-span-12 lg:col-span-6 bg-white rounded border border-[#c3c8bf]/30 p-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-headline-md text-[#1b1c1a] mb-1">Concession Economics</h3>
                <p className="text-body-md text-[#434841]">Revenue: ${(totalRevenue / 1000).toFixed(0)}k total</p>
              </div>
              <span className="material-symbols-outlined text-[#747871]">point_of_sale</span>
            </div>
            <RechartsBar data={concessions} />
          </div>

          {/* Intelligence Briefing (6 cols) */}
          <div className="col-span-12 lg:col-span-6 bg-[#fbf9f5] rounded border border-[#c3c8bf]/30 p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-[#984800]">auto_awesome</span>
                <h3 className="text-headline-md text-[#1b1c1a]">Intelligence Briefing</h3>
              </div>
              <ul className="space-y-5">
                {activeAlerts.slice(0, 3).map((alert) => (
                  <li key={alert.id} className="flex gap-4 items-start">
                    <div
                      className="w-1 min-h-[40px] rounded-full mt-1 flex-shrink-0"
                      style={{ backgroundColor: alert.severity === "critical" ? "#984800" : "#7591c5" }}
                    />
                    <div>
                      <h4 className="text-ui-button text-[#1b1c1a] mb-1">{alert.title}</h4>
                      <p className="text-sm text-[#434841]">{alert.description}</p>
                      <span className="text-[10px] text-[#747871] mt-1 block">
                        {alert.zone} • {alert.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-[#c3c8bf]/20 flex gap-4">
              <button className="text-ui-button bg-[#061907] text-white px-6 py-3 rounded hover:bg-[#061907]/90 transition-colors">
                Deploy Mobile Units
              </button>
              <button className="text-ui-button bg-transparent border border-[#747871] text-[#1b1c1a] px-6 py-3 rounded hover:bg-[#e3e2df] transition-colors uppercase">
                View Full Report
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
