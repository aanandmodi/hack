"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { useState } from "react";

const ARCHIVE_ITEMS = [
  {
    date: "Nov 12", time: "21:40", severity: "Critical", severityColor: "#984800",
    badge: "System Alert", badgeBg: "#4e644c", badgeText: "white",
    zone: "Zone C • Concourse",
    title: "Thermal Spike Detected",
    desc: "Anomalous temperature reading identified near electrical sub-station C-4. Auto-mitigation protocols engaged; structural integrity maintained. Maintenance squad dispatched for post-event audit.",
  },
  {
    date: "Nov 12", time: "18:15", severity: "Routine", severityColor: "#061907",
    badge: "Deployment", badgeBg: "transparent", badgeText: "#7591c5", badgeBorder: "#022956/30",
    zone: "Gate 4 • Perimeter",
    title: "Crowd Density Redistribution",
    desc: "Delta squad redeployed from Gate 2 to Gate 4 to alleviate entry bottleneck observed via overhead ingress heatmaps. Wait times normalized within 12 minutes.",
  },
  {
    date: "Nov 10", time: "23:00", severity: "Logged", severityColor: "#061907",
    badge: "Egress Report", badgeBg: "#e3e2df", badgeText: "#434841", badgeBorder: "#c3c8bf",
    zone: "Venue Wide",
    title: "Post-Match Operability Summary",
    desc: "Complete structural and security sign-off following fixture conclusion. Total egress time: 42 minutes. Minor vandalism noted in Section 112 restrooms; custodial team notified.",
    hasDownload: true,
  },
  {
    date: "Nov 08", time: "09:12", severity: "Elevated", severityColor: "#fe9246",
    badge: "System Alert", badgeBg: "#4e644c", badgeText: "white",
    zone: "Network Core",
    title: "Turnstile Telemetry Latency",
    desc: "Brief drop in packet transmission from northern turnstile bank. Redundant connections engaged automatically. Zero data loss confirmed in secondary audit.",
    faded: true,
  },
];

const TYPOLOGY = ["System Alerts", "Deployments", "Reports", "Audits"];

export default function ArchivePage() {
  const [activeType, setActiveType] = useState("System Alerts");

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64">
        <TopBar activeTab="Overview" />
        <div className="mt-24 p-16 mx-auto max-w-[1440px]">
          {/* Header */}
          <header className="mb-8">
            <h2 className="text-display-xl text-[#061907] mb-2">Operational Archive</h2>
            <p className="text-body-lg text-[#434841] max-w-2xl">
              Historical ledger of venue anomalies, staff deployments, and systemic shifts.
              Maintained for longitudinal intelligence and protocol refinement.
            </p>
          </header>

          <div className="grid grid-cols-12 gap-8 items-start">
            {/* Left: Timeline (8 cols) */}
            <section className="col-span-8 flex flex-col gap-2">
              {/* Search */}
              <div className="mb-8 relative border-b border-[#061907]/20 focus-within:border-[#061907]/80 transition-colors duration-300 pb-2 flex items-end">
                <span className="material-symbols-outlined text-[#061907]/50 absolute left-0 bottom-3">search</span>
                <input
                  type="text"
                  placeholder="Query historical logs by Event ID, Zone, or Protocol..."
                  className="w-full bg-transparent border-none focus:ring-0 pl-10 pr-4 py-2 text-body-lg text-[#1b1c1a] placeholder:text-[#434841]/50"
                />
                <label className="absolute -top-4 left-0 text-label-caps text-[#061907]/70">
                  Archive Query
                </label>
              </div>

              {/* Archive Items */}
              {ARCHIVE_ITEMS.map((item, i) => (
                <article
                  key={i}
                  className={`bg-white rounded-xl border border-[#c3c8bf]/50 p-8 flex gap-8 hover:border-[#747871]/50 transition-colors relative overflow-hidden ${
                    item.faded ? "opacity-75" : ""
                  }`}
                >
                  {item.hasDownload && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4e644c] opacity-20" />
                  )}
                  <div className={`w-32 flex-shrink-0 flex flex-col gap-1 border-r border-[#c3c8bf]/30 pr-4 ${item.hasDownload ? "pl-3" : ""}`}>
                    <span className="text-label-caps text-[#434841]">{item.date}</span>
                    <span className="text-headline-md text-[#061907]">{item.time}</span>
                    <span className="text-label-caps mt-2" style={{ color: item.severityColor }}>
                      {item.severity}
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className="px-3 py-1 rounded-full text-label-caps text-[10px] tracking-widest"
                        style={{
                          backgroundColor: item.badgeBg,
                          color: item.badgeText,
                          border: item.badgeBorder ? `1px solid ${item.badgeBorder}` : undefined,
                        }}
                      >
                        {item.badge}
                      </span>
                      <span className="text-label-caps text-[#434841]">{item.zone}</span>
                    </div>
                    <h3
                      className="text-[#1b1c1a] text-2xl mb-2"
                      style={{ fontFamily: "var(--font-serif)", fontWeight: 500, lineHeight: 1.3 }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-body-md text-[#434841] line-clamp-2">{item.desc}</p>
                  </div>
                  {item.hasDownload && (
                    <div className="flex items-center justify-center pl-4 border-l border-[#c3c8bf]/30">
                      <button className="text-[#061907] hover:text-[#984800] transition-colors">
                        <span className="material-symbols-outlined text-3xl">download</span>
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </section>

            {/* Right: Filter Panel (4 cols) */}
            <aside className="col-span-4 sticky top-32">
              <div className="bg-[#fbf9f5] rounded-xl border border-[#c3c8bf]/30 p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
                <h3
                  className="text-[#061907] text-xl mb-6 border-b border-[#c3c8bf]/20 pb-4"
                  style={{ fontFamily: "var(--font-serif)", fontWeight: 500 }}
                >
                  Refine Intelligence
                </h3>

                {/* Chronology */}
                <div className="mb-8">
                  <h4 className="text-label-caps text-[#434841] mb-4 tracking-widest">Chronology</h4>
                  <div className="flex flex-col gap-3">
                    {["Past 7 Days", "Past 30 Days", "Current Season"].map((label, i) => (
                      <label key={label} className="flex items-center gap-3 text-body-md cursor-pointer group">
                        <input
                          type="radio"
                          name="timeframe"
                          defaultChecked={i === 0}
                          className="text-[#984800] focus:ring-[#984800]/20 bg-transparent border-[#c3c8bf]"
                        />
                        <span className="group-hover:text-[#061907] transition-colors">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Event Typology */}
                <div className="mb-8">
                  <h4 className="text-label-caps text-[#434841] mb-4 tracking-widest">Event Typology</h4>
                  <div className="flex flex-wrap gap-2">
                    {TYPOLOGY.map((t) => (
                      <button
                        key={t}
                        onClick={() => setActiveType(t)}
                        className={`px-4 py-2 rounded text-label-caps tracking-widest transition-colors ${
                          activeType === t
                            ? "bg-[#4e644c] text-white border border-transparent"
                            : "bg-transparent text-[#061907] border border-[#c3c8bf] hover:border-[#061907]"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Severity Index */}
                <div>
                  <h4 className="text-label-caps text-[#434841] mb-4 tracking-widest">Severity Index</h4>
                  <div className="flex flex-col gap-3">
                    {[
                      { label: "Critical Anomalies", color: "#984800" },
                      { label: "Elevated Warnings", color: "#fe9246" },
                      { label: "Routine Logs", color: "#c3c8bf" },
                    ].map((s) => (
                      <label key={s.label} className="flex items-center gap-3 text-body-md cursor-pointer group">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded text-[#984800] focus:ring-[#984800]/20 bg-transparent border-[#c3c8bf]"
                        />
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                        <span className="group-hover:text-[#061907] transition-colors">{s.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
