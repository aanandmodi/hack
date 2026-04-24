/**
 * OperationsDashboard — main ops view for venue staff.
 * Asymmetric layout: left 58% (stats + zones + queues), right 42% (agent feed + alerts).
 */

"use client";

import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Users,
  AlertTriangle,
  Clock,
  Zap,
  Send,
  UtensilsCrossed,
  Coffee,
  Bath,
  ShoppingBag,
  DoorOpen,
  CheckCircle2,
  X,
} from "lucide-react";

import { fetchZones, fetchQueues, fetchAlerts, fetchStats, resolveAlert } from "@/lib/api";
import { useAgentStream } from "@/hooks/useAgentStream";
import { AgentFeed } from "@/components/agents/AgentFeed";
import { CountUp } from "@/components/animations/CountUp";
import { FadeUp } from "@/components/animations/FadeUp";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/animations/StaggerContainer";
import type { Zone, Queue, Alert, CongestionLevel } from "@/types";
import { CONGESTION_COLORS, CONGESTION_LABELS } from "@/types";

const STALL_ICONS: Record<string, React.ReactNode> = {
  food: <UtensilsCrossed size={14} />,
  beverage: <Coffee size={14} />,
  restroom: <Bath size={14} />,
  merchandise: <ShoppingBag size={14} />,
  entry_gate: <DoorOpen size={14} />,
};

function getOccupancyPct(zone: Zone): number {
  if (zone.capacity <= 0) return 0;
  return Math.round((zone.current_occupancy / zone.capacity) * 100);
}

function getWaitColor(minutes: number): string {
  if (minutes <= 5) return "#6B8F71";
  if (minutes <= 10) return "#D4A017";
  if (minutes <= 15) return "#C4651A";
  return "#C4451A";
}

export function OperationsDashboard() {
  const [query, setQuery] = useState("");
  const { run, isRunning, steps, conciergeResponse } = useAgentStream();
  const queryClient = useQueryClient();

  // Data fetching with auto-refresh
  const { data: zones = [] } = useQuery({
    queryKey: ["zones"],
    queryFn: fetchZones,
    refetchInterval: 15000,
  });

  const { data: queues = [] } = useQuery({
    queryKey: ["queues"],
    queryFn: fetchQueues,
    refetchInterval: 15000,
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ["alerts"],
    queryFn: fetchAlerts,
    refetchInterval: 15000,
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    refetchInterval: 15000,
  });

  const handleRunAgent = useCallback(() => {
    if (!query.trim() || isRunning) return;
    run(query);
  }, [query, isRunning, run]);

  const handleResolveAlert = useCallback(
    async (alertId: string) => {
      try {
        await resolveAlert(alertId);
        queryClient.invalidateQueries({ queryKey: ["alerts"] });
        queryClient.invalidateQueries({ queryKey: ["stats"] });
      } catch (error) {
        console.error("Failed to resolve alert:", error);
      }
    },
    [queryClient]
  );

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-6">
      {/* Stats Bar */}
      <FadeUp>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Active Zones",
              value: stats?.total_zones ?? 0,
              icon: <MapPin size={18} />,
              color: "#3D5A8A",
            },
            {
              label: "Congested Zones",
              value: stats?.congested_zones ?? 0,
              icon: <Users size={18} />,
              color: "#C4451A",
            },
            {
              label: "Avg Wait Time",
              value: stats?.avg_wait_minutes ?? 0,
              icon: <Clock size={18} />,
              color: "#D4A017",
              suffix: " min",
              decimals: 1,
            },
            {
              label: "Active Alerts",
              value: stats?.active_alerts ?? 0,
              icon: <AlertTriangle size={18} />,
              color: "#C4651A",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl p-5"
              style={{
                backgroundColor: "#FDFAF4",
                border: "1px solid #E8E0D0",
                boxShadow: "0 4px 24px rgba(26,46,26,0.08)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: `${stat.color}14`,
                    color: stat.color,
                  }}
                >
                  {stat.icon}
                </div>
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: stat.color }}
                />
              </div>
              <div
                className="text-3xl font-bold mb-1"
                style={{
                  fontFamily: "var(--font-serif)",
                  color: "#1A2E1A",
                }}
              >
                <CountUp
                  value={stat.value}
                  decimals={(stat as { decimals?: number }).decimals || 0}
                  suffix={(stat as { suffix?: string }).suffix || ""}
                />
              </div>
              <p
                className="text-xs uppercase tracking-wider"
                style={{
                  color: "#6B7B6E",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </FadeUp>

      {/* Main Content — Asymmetric Layout */}
      <div className="grid gap-6" style={{ gridTemplateColumns: "58% 1fr" }}>
        {/* LEFT PANEL — Stadium Zones + Queues */}
        <div className="space-y-6">
          {/* Zone Grid */}
          <FadeUp delay={0.1}>
            <div>
              <h2
                className="text-lg font-bold mb-4"
                style={{
                  fontFamily: "var(--font-serif)",
                  color: "#1A2E1A",
                }}
              >
                Stadium Zones
              </h2>
              <StaggerContainer className="grid grid-cols-2 gap-3" stagger={0.06}>
                {zones.map((zone: Zone) => {
                  const pct = getOccupancyPct(zone);
                  const congestionColor =
                    CONGESTION_COLORS[zone.congestion_level as CongestionLevel];

                  return (
                    <StaggerItem key={zone.id}>
                      <motion.div
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="rounded-2xl p-4 cursor-pointer"
                        style={{
                          backgroundColor: "#FDFAF4",
                          border: "1px solid #E8E0D0",
                          boxShadow: "0 4px 24px rgba(26,46,26,0.08)",
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p
                              className="text-sm font-semibold"
                              style={{
                                color: "#1A2E1A",
                                fontFamily: "var(--font-sans)",
                              }}
                            >
                              {zone.name}
                            </p>
                            <p
                              className="text-xs mt-0.5"
                              style={{ color: "#6B7B6E" }}
                            >
                              {zone.section} Section
                            </p>
                          </div>
                          <div className="relative">
                            <span
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: `${congestionColor}18`,
                                color: congestionColor,
                              }}
                            >
                              {CONGESTION_LABELS[zone.congestion_level as CongestionLevel]}
                            </span>
                            {/* Pulsing ring for 80%+ capacity */}
                            {pct >= 80 && (
                              <motion.span
                                className="absolute inset-0 rounded-full"
                                animate={{
                                  boxShadow: [
                                    `0 0 0 0 ${congestionColor}40`,
                                    `0 0 0 6px ${congestionColor}00`,
                                  ],
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                }}
                              />
                            )}
                          </div>
                        </div>

                        {/* Occupancy Bar */}
                        <div className="mb-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span style={{ color: "#6B7B6E" }}>Occupancy</span>
                            <span
                              className="font-semibold"
                              style={{
                                color: congestionColor,
                                fontFamily: "var(--font-serif)",
                              }}
                            >
                              {pct}%
                            </span>
                          </div>
                          <div
                            className="w-full h-2 rounded-full overflow-hidden"
                            style={{ backgroundColor: "#E8E0D0" }}
                          >
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{
                                duration: 1,
                                ease: "easeOut",
                              }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: congestionColor }}
                            />
                          </div>
                        </div>
                        <p className="text-xs" style={{ color: "#6B7B6E" }}>
                          {zone.current_occupancy.toLocaleString()} /{" "}
                          {zone.capacity.toLocaleString()}
                        </p>
                      </motion.div>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            </div>
          </FadeUp>

          {/* Queue Status — Horizontal Scroll */}
          <FadeUp delay={0.2}>
            <div>
              <h2
                className="text-lg font-bold mb-4"
                style={{
                  fontFamily: "var(--font-serif)",
                  color: "#1A2E1A",
                }}
              >
                Queue Status
              </h2>
              <div className="overflow-x-auto pb-2 -mx-1 px-1">
                <div className="flex gap-3" style={{ minWidth: "max-content" }}>
                  {queues.map((q: Queue, i: number) => (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                      whileHover={{ scale: 1.03, y: -2 }}
                      className="flex-shrink-0 w-44 rounded-2xl p-4"
                      style={{
                        backgroundColor: "#FDFAF4",
                        border: "1px solid #E8E0D0",
                        boxShadow: "0 4px 24px rgba(26,46,26,0.08)",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{
                            backgroundColor: `${getWaitColor(q.wait_minutes)}14`,
                            color: getWaitColor(q.wait_minutes),
                          }}
                        >
                          {STALL_ICONS[q.stall_type] || <MapPin size={14} />}
                        </div>
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: getWaitColor(q.wait_minutes),
                          }}
                        />
                      </div>
                      <p
                        className="text-xs font-medium mb-1 truncate"
                        style={{
                          color: "#1A2E1A",
                          fontFamily: "var(--font-sans)",
                        }}
                      >
                        {q.stall_name}
                      </p>
                      <p
                        className="text-2xl font-bold"
                        style={{
                          fontFamily: "var(--font-serif)",
                          color: getWaitColor(q.wait_minutes),
                        }}
                      >
                        {q.wait_minutes}
                        <span
                          className="text-xs font-normal ml-1"
                          style={{ color: "#6B7B6E" }}
                        >
                          min
                        </span>
                      </p>
                      <p
                        className="text-xs capitalize mt-1"
                        style={{ color: "#6B7B6E" }}
                      >
                        {q.stall_type.replace("_", " ")}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </FadeUp>
        </div>

        {/* RIGHT PANEL — Agent Feed + Alerts */}
        <div className="space-y-6">
          {/* Query Input */}
          <FadeUp delay={0.15}>
            <div
              className="rounded-2xl p-5"
              style={{
                backgroundColor: "#FDFAF4",
                border: "1px solid #E8E0D0",
                boxShadow: "0 4px 24px rgba(26,46,26,0.08)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Zap size={16} color="#C4651A" />
                <h3
                  className="text-sm font-semibold"
                  style={{
                    color: "#1A2E1A",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  AI Analysis
                </h3>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRunAgent()}
                  placeholder="Ask the AI... e.g. Which gates need immediate staff support?"
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{
                    backgroundColor: "#F5F0E8",
                    border: "1px solid #E8E0D0",
                    color: "#1A2E1A",
                    fontFamily: "var(--font-sans)",
                  }}
                  disabled={isRunning}
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRunAgent}
                  disabled={isRunning || !query.trim()}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-50"
                  style={{
                    backgroundColor: "#C4651A",
                    color: "#FDFAF4",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  <Send size={14} />
                  Run
                </motion.button>
              </div>
            </div>
          </FadeUp>

          {/* Agent Activity Feed */}
          <FadeUp delay={0.2}>
            <div>
              <h2
                className="text-lg font-bold mb-4"
                style={{
                  fontFamily: "var(--font-serif)",
                  color: "#1A2E1A",
                }}
              >
                Agent Activity
              </h2>
              <AgentFeed steps={steps} isRunning={isRunning} />

              {/* Concierge Response */}
              <AnimatePresence>
                {conciergeResponse && !isRunning && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 rounded-2xl p-5"
                    style={{
                      backgroundColor: "#FDFAF4",
                      border: "1px solid #6B8F71",
                      boxShadow: "0 4px 24px rgba(107,143,113,0.15)",
                    }}
                  >
                    <p
                      className="text-xs uppercase tracking-wider mb-2"
                      style={{ color: "#6B8F71" }}
                    >
                      AI Response
                    </p>
                    <p
                      className="text-sm leading-relaxed"
                      style={{
                        color: "#1A2E1A",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      {conciergeResponse}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </FadeUp>

          {/* Alerts Panel */}
          <FadeUp delay={0.25}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-lg font-bold"
                  style={{
                    fontFamily: "var(--font-serif)",
                    color: "#1A2E1A",
                  }}
                >
                  Active Alerts
                </h2>
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: "rgba(196,69,26,0.12)",
                    color: "#C4451A",
                  }}
                >
                  {alerts.length} active
                </span>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                <AnimatePresence>
                  {alerts.map((alert: Alert) => {
                    const priorityColors: Record<string, string> = {
                      critical: "#8B0000",
                      high: "#C4451A",
                      medium: "#D4A017",
                      low: "#6B8F71",
                    };
                    const pColor = priorityColors[alert.priority] || "#6B7B6E";

                    return (
                      <motion.div
                        key={alert.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{
                          opacity: 0,
                          x: -20,
                          height: 0,
                          marginBottom: 0,
                        }}
                        transition={{ duration: 0.3 }}
                        className="rounded-2xl p-4 relative overflow-hidden"
                        style={{
                          backgroundColor: "#FDFAF4",
                          border: "1px solid #E8E0D0",
                          boxShadow: "0 4px 24px rgba(26,46,26,0.08)",
                        }}
                      >
                        {/* Left border accent */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-[3px]"
                          style={{ backgroundColor: pColor }}
                        />

                        <div className="pl-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <AlertTriangle size={14} color={pColor} />
                              <span
                                className="text-xs font-semibold uppercase"
                                style={{ color: pColor }}
                              >
                                {alert.zones?.name || "Unknown Zone"}
                              </span>
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase"
                                style={{
                                  backgroundColor: `${pColor}18`,
                                  color: pColor,
                                }}
                              >
                                {alert.priority}
                              </span>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleResolveAlert(alert.id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                              style={{
                                backgroundColor: "rgba(107,143,113,0.1)",
                                color: "#6B8F71",
                              }}
                              title="Resolve alert"
                            >
                              <CheckCircle2 size={14} />
                            </motion.button>
                          </div>
                          <p
                            className="text-sm mb-1"
                            style={{
                              color: "#1A2E1A",
                              fontFamily: "var(--font-sans)",
                            }}
                          >
                            {alert.message}
                          </p>
                          {alert.suggested_action && (
                            <p
                              className="text-xs"
                              style={{ color: "#3D5A8A" }}
                            >
                              💡 {alert.suggested_action}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {alerts.length === 0 && (
                  <div
                    className="text-center py-8 rounded-2xl"
                    style={{
                      backgroundColor: "#FDFAF4",
                      border: "1px dashed #E8E0D0",
                    }}
                  >
                    <CheckCircle2
                      size={24}
                      color="#6B8F71"
                      className="mx-auto mb-2"
                    />
                    <p className="text-sm" style={{ color: "#6B7B6E" }}>
                      All clear — no active alerts
                    </p>
                  </div>
                )}
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </div>
  );
}
