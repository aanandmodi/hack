/**
 * AttendeePWA — mobile-first view for stadium attendees.
 * Max-width 420px, centered. Shows live data, quick actions, and AI concierge.
 */

"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  UtensilsCrossed,
  Bath,
  MapPin,
  DoorOpen,
  MessageCircle,
  Navigation,
  Clock,
  ArrowRight,
  ChevronRight,
  Send,
  Sparkles,
  Coffee,
  ShoppingBag,
} from "lucide-react";

import { fetchZones, fetchQueues } from "@/lib/api";
import { useAgentStream } from "@/hooks/useAgentStream";
import { TypewriterText } from "@/components/animations/TypewriterText";
import { FadeUp } from "@/components/animations/FadeUp";
import { CountUp } from "@/components/animations/CountUp";
import type { Zone, Queue, CongestionLevel } from "@/types";
import { CONGESTION_COLORS } from "@/types";

const QUICK_ACTIONS = [
  { label: "Find Food", icon: <UtensilsCrossed size={14} />, query: "Where is the nearest food stall with shortest wait?" },
  { label: "Find Restroom", icon: <Bath size={14} />, query: "Where is the nearest restroom with shortest queue?" },
  { label: "My Route", icon: <Navigation size={14} />, query: "What is the best route to my seat avoiding congestion?" },
  { label: "Entry Gates", icon: <DoorOpen size={14} />, query: "Which entry gate has the shortest wait right now?" },
  { label: "Ask AI", icon: <Sparkles size={14} />, query: "" },
];

const STALL_ICONS: Record<string, React.ReactNode> = {
  food: <UtensilsCrossed size={14} />,
  beverage: <Coffee size={14} />,
  restroom: <Bath size={14} />,
  merchandise: <ShoppingBag size={14} />,
  entry_gate: <DoorOpen size={14} />,
};

function getWaitColor(minutes: number): string {
  if (minutes <= 5) return "#6B8F71";
  if (minutes <= 10) return "#D4A017";
  if (minutes <= 15) return "#C4651A";
  return "#C4451A";
}

export function AttendeePWA() {
  const [inputQuery, setInputQuery] = useState("");
  const [showAIInput, setShowAIInput] = useState(false);
  const { run, isRunning, steps, conciergeResponse } = useAgentStream();

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

  const congestedZone = zones.find(
    (z: Zone) => z.congestion_level === "critical" || z.congestion_level === "high"
  );

  const foodStalls = queues
    .filter((q: Queue) => q.stall_type === "food")
    .sort((a: Queue, b: Queue) => a.wait_minutes - b.wait_minutes)
    .slice(0, 3);

  const nearestFacilities = queues
    .sort((a: Queue, b: Queue) => a.wait_minutes - b.wait_minutes)
    .slice(0, 5);

  const handleQuickAction = useCallback(
    (query: string) => {
      if (!query) {
        setShowAIInput(true);
        return;
      }
      run(query);
    },
    [run]
  );

  const handleSendQuery = useCallback(() => {
    if (!inputQuery.trim() || isRunning) return;
    run(inputQuery);
    setInputQuery("");
  }, [inputQuery, isRunning, run]);

  // Mock route steps (these come from the agent when run)
  const routeSteps = [
    { step: 1, instruction: "Enter via Gate 4 — South Main", time: "0 min" },
    { step: 2, instruction: "Turn right along South Concourse", time: "2 min" },
    { step: 3, instruction: "Pass Restrooms South on your left", time: "3 min" },
    { step: 4, instruction: "Follow signs to East Pavilion Level 2", time: "5 min" },
    { step: 5, instruction: "Arrive at Section E — Row 14", time: "6 min" },
  ];

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex justify-center py-6 px-4">
      <div className="w-full max-w-[420px] space-y-5">
        {/* Welcome Card */}
        <FadeUp>
          <motion.div
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              backgroundColor: "#1A2E1A",
              boxShadow: "0 8px 32px rgba(26,46,26,0.3)",
            }}
          >
            {/* Grain overlay */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
              }}
            />
            <div className="relative z-10">
              <p
                className="text-xs uppercase tracking-widest mb-1"
                style={{ color: "#6B8F71" }}
              >
                {greeting}
              </p>
              <h2
                className="text-2xl font-bold mb-2"
                style={{
                  fontFamily: "var(--font-serif)",
                  color: "#FDFAF4",
                }}
              >
                Welcome to the match
              </h2>
              <p
                className="text-sm"
                style={{ color: "#9CA89E" }}
              >
                {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                {congestedZone && (
                  <span>
                    {" · "}
                    <span style={{ color: CONGESTION_COLORS[congestedZone.congestion_level as CongestionLevel] }}>
                      {congestedZone.name} is busy
                    </span>
                    {" — alternative routes available"}
                  </span>
                )}
              </p>
            </div>
          </motion.div>
        </FadeUp>

        {/* Quick Action Pills */}
        <FadeUp delay={0.1}>
          <div className="overflow-x-auto -mx-1 px-1 pb-1">
            <div className="flex gap-2" style={{ minWidth: "max-content" }}>
              {QUICK_ACTIONS.map((action, i) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 + i * 0.06 }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleQuickAction(action.query)}
                  disabled={isRunning}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all disabled:opacity-50"
                  style={{
                    backgroundColor: "#FDFAF4",
                    border: "1px solid #E8E0D0",
                    color: "#1A2E1A",
                    fontFamily: "var(--font-sans)",
                    boxShadow: "0 2px 8px rgba(26,46,26,0.06)",
                  }}
                >
                  <span style={{ color: "#C4651A" }}>{action.icon}</span>
                  {action.label}
                </motion.button>
              ))}
            </div>
          </div>
        </FadeUp>

        {/* Live Cards */}
        <LayoutGroup>
          {/* Best Route Card */}
          <FadeUp delay={0.15}>
            <motion.div
              layout
              className="rounded-2xl p-5"
              style={{
                backgroundColor: "#FDFAF4",
                border: "1px solid #E8E0D0",
                boxShadow: "0 4px 24px rgba(26,46,26,0.08)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "rgba(61,90,138,0.1)" }}
                >
                  <Navigation size={16} color="#3D5A8A" />
                </div>
                <div>
                  <h3
                    className="text-sm font-semibold"
                    style={{
                      color: "#1A2E1A",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    Best Route to Your Seat
                  </h3>
                  <p className="text-xs" style={{ color: "#6B7B6E" }}>
                    Est.{" "}
                    <span
                      className="font-semibold"
                      style={{ color: "#3D5A8A" }}
                    >
                      6 min
                    </span>{" "}
                    walk · Avoids North Stand
                  </p>
                </div>
              </div>

              <div className="space-y-0">
                {routeSteps.map((step, i) => (
                  <div key={step.step} className="flex items-start gap-3">
                    {/* Amber connecting line */}
                    <div className="flex flex-col items-center">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{
                          backgroundColor:
                            i === routeSteps.length - 1
                              ? "#6B8F71"
                              : "rgba(196,101,26,0.15)",
                          color:
                            i === routeSteps.length - 1
                              ? "#FDFAF4"
                              : "#C4651A",
                          fontFamily: "var(--font-serif)",
                        }}
                      >
                        {step.step}
                      </div>
                      {i < routeSteps.length - 1 && (
                        <div
                          className="w-[2px] h-6"
                          style={{ backgroundColor: "#E8E0D0" }}
                        />
                      )}
                    </div>
                    <div className="pb-2 pt-0.5">
                      <p
                        className="text-sm"
                        style={{
                          color: "#1A2E1A",
                          fontFamily: "var(--font-sans)",
                        }}
                      >
                        {step.instruction}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#6B7B6E" }}>
                        {step.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </FadeUp>

          {/* Nearest Food Stall Card */}
          <FadeUp delay={0.2}>
            <motion.div
              layout
              className="rounded-2xl p-5"
              style={{
                backgroundColor: "#FDFAF4",
                border: "1px solid #E8E0D0",
                boxShadow: "0 4px 24px rgba(26,46,26,0.08)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "rgba(196,101,26,0.1)" }}
                >
                  <UtensilsCrossed size={16} color="#C4651A" />
                </div>
                <h3
                  className="text-sm font-semibold"
                  style={{
                    color: "#1A2E1A",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Nearest Open Food Stalls
                </h3>
              </div>

              <div className="space-y-2.5">
                {foodStalls.map((stall: Queue, i: number) => (
                  <motion.div
                    key={stall.id}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{
                      backgroundColor: i === 0 ? "rgba(196,101,26,0.06)" : "#F5F0E8",
                      border: i === 0 ? "1px solid rgba(196,101,26,0.2)" : "1px solid transparent",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: `${getWaitColor(stall.wait_minutes)}14`,
                          color: getWaitColor(stall.wait_minutes),
                        }}
                      >
                        {STALL_ICONS[stall.stall_type]}
                      </div>
                      <div>
                        <p
                          className="text-sm font-medium"
                          style={{ color: "#1A2E1A" }}
                        >
                          {stall.stall_name}
                        </p>
                        <p className="text-xs capitalize" style={{ color: "#6B7B6E" }}>
                          {stall.stall_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-lg font-bold"
                        style={{
                          fontFamily: "var(--font-serif)",
                          color: i === 0 ? "#C4651A" : getWaitColor(stall.wait_minutes),
                        }}
                      >
                        {stall.wait_minutes}
                      </span>
                      <span className="text-xs" style={{ color: "#6B7B6E" }}>
                        min
                      </span>
                      <ChevronRight size={14} color="#E8E0D0" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </FadeUp>

          {/* Live Wait Times Card */}
          <FadeUp delay={0.25}>
            <motion.div
              layout
              className="rounded-2xl p-5"
              style={{
                backgroundColor: "#FDFAF4",
                border: "1px solid #E8E0D0",
                boxShadow: "0 4px 24px rgba(26,46,26,0.08)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "rgba(107,143,113,0.1)" }}
                >
                  <Clock size={16} color="#6B8F71" />
                </div>
                <h3
                  className="text-sm font-semibold"
                  style={{
                    color: "#1A2E1A",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Live Wait Times
                </h3>
              </div>

              <div className="space-y-2">
                {nearestFacilities.map((facility: Queue) => (
                  <div
                    key={facility.id}
                    className="flex items-center justify-between py-2 px-1"
                    style={{ borderBottom: "1px solid #E8E0D0" }}
                  >
                    <div className="flex items-center gap-2">
                      <span style={{ color: "#6B7B6E" }}>
                        {STALL_ICONS[facility.stall_type] || <MapPin size={14} />}
                      </span>
                      <span
                        className="text-sm"
                        style={{
                          color: "#1A2E1A",
                          fontFamily: "var(--font-sans)",
                        }}
                      >
                        {facility.stall_name}
                      </span>
                    </div>
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: `${getWaitColor(facility.wait_minutes)}14`,
                        color: getWaitColor(facility.wait_minutes),
                      }}
                    >
                      {facility.wait_minutes} min
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </FadeUp>
        </LayoutGroup>

        {/* AI Concierge Response */}
        <AnimatePresence>
          {conciergeResponse && !isRunning && (
            <FadeUp>
              <motion.div
                layout
                className="rounded-2xl p-5"
                style={{
                  backgroundColor: "#FDFAF4",
                  border: "1px solid #6B8F71",
                  boxShadow: "0 4px 24px rgba(107,143,113,0.15)",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} color="#C4651A" />
                  <span
                    className="text-xs uppercase tracking-wider font-semibold"
                    style={{ color: "#6B8F71" }}
                  >
                    AI Concierge
                  </span>
                </div>
                <TypewriterText
                  text={conciergeResponse}
                  speed={20}
                  className="text-sm leading-relaxed"
                />
              </motion.div>
            </FadeUp>
          )}
        </AnimatePresence>

        {/* Running indicator */}
        <AnimatePresence>
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl p-4 flex items-center justify-center gap-3"
              style={{
                backgroundColor: "rgba(196,101,26,0.06)",
                border: "1px dashed #E8E0D0",
              }}
            >
              <div className="flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: "#C4651A" }}
                  />
                ))}
              </div>
              <span className="text-sm" style={{ color: "#C4651A" }}>
                Finding the best option for you...
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Input */}
        <FadeUp delay={0.3}>
          <div
            className="sticky bottom-4 rounded-2xl p-3"
            style={{
              backgroundColor: "#FDFAF4",
              border: "1px solid #E8E0D0",
              boxShadow: "0 8px 32px rgba(26,46,26,0.12)",
            }}
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendQuery()}
                placeholder="Ask anything about the stadium..."
                className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  backgroundColor: "#F5F0E8",
                  border: "1px solid #E8E0D0",
                  color: "#1A2E1A",
                  fontFamily: "var(--font-sans)",
                }}
                disabled={isRunning}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendQuery}
                disabled={isRunning || !inputQuery.trim()}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                style={{
                  backgroundColor: "#C4651A",
                  color: "#FDFAF4",
                }}
              >
                <Send size={16} />
              </motion.button>
            </div>
          </div>
        </FadeUp>
      </div>
    </div>
  );
}
