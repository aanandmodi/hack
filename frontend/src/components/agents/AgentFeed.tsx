/**
 * AgentFeed — renders streaming agent steps with animations.
 * Reusable component showing the AI pipeline progress in real-time.
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Clock,
  Map,
  AlertTriangle,
  MessageCircle,
  CheckCircle2,
  Loader2,
  Circle,
} from "lucide-react";
import type { AgentStep } from "@/types";

interface AgentFeedProps {
  steps: AgentStep[];
  isRunning: boolean;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  activity: <Activity size={18} />,
  clock: <Clock size={18} />,
  map: <Map size={18} />,
  "alert-triangle": <AlertTriangle size={18} />,
  "message-circle": <MessageCircle size={18} />,
  circle: <Circle size={18} />,
};

function getStepIcon(iconName: string) {
  return ICON_MAP[iconName] || <Circle size={18} />;
}

export function AgentFeed({ steps, isRunning }: AgentFeedProps) {
  return (
    <div className="space-y-3">
      {/* Running indicator */}
      <AnimatePresence>
        {isRunning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 px-4 py-2"
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "#C4651A" }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: "#C4651A", fontFamily: "var(--font-sans)" }}
            >
              AI Agent Running
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step cards */}
      <AnimatePresence mode="popLayout">
        {steps.map((step, index) => (
          <motion.div
            key={`${step.step}-${index}`}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              duration: 0.4,
              delay: index * 0.08,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="relative rounded-2xl overflow-hidden"
            style={{
              backgroundColor: "#FDFAF4",
              border: "1px solid #E8E0D0",
              boxShadow: "0 4px 24px rgba(26,46,26,0.08)",
            }}
          >
            {/* Left border accent */}
            <div
              className="absolute left-0 top-0 bottom-0 w-[3px]"
              style={{
                backgroundColor:
                  step.status === "complete"
                    ? "#6B8F71"
                    : step.status === "error"
                    ? "#C4451A"
                    : "#C4651A",
              }}
            />

            <div className="pl-5 pr-4 py-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg"
                    style={{
                      backgroundColor:
                        step.status === "complete"
                          ? "rgba(107,143,113,0.12)"
                          : "rgba(196,101,26,0.12)",
                      color:
                        step.status === "complete" ? "#6B8F71" : "#C4651A",
                    }}
                  >
                    {getStepIcon(step.icon)}
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{
                        color: "#1A2E1A",
                        fontFamily: "var(--font-sans)",
                      }}
                    >
                      {step.label}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "#6B7B6E" }}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  {step.status === "complete" ? (
                    <CheckCircle2 size={18} color="#6B8F71" />
                  ) : step.status === "error" ? (
                    <AlertTriangle size={18} color="#C4451A" />
                  ) : (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Loader2 size={18} color="#C4651A" />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Step output summary */}
              {step.data && Object.keys(step.data).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="mt-2 pt-2"
                  style={{ borderTop: "1px solid #E8E0D0" }}
                >
                  {step.step === "crowd_flow" && (
                    <p className="text-xs" style={{ color: "#6B7B6E" }}>
                      Found{" "}
                      <span style={{ color: "#C4451A", fontWeight: 600 }}>
                        {(step.data as Record<string, number>).hotspots_count || 0}
                      </span>{" "}
                      congestion hotspots
                    </p>
                  )}
                  {step.step === "queue_analysis" && (
                    <p className="text-xs" style={{ color: "#6B7B6E" }}>
                      Identified{" "}
                      <span style={{ color: "#D4A017", fontWeight: 600 }}>
                        {(step.data as Record<string, number>).overloaded_count || 0}
                      </span>{" "}
                      overloaded queues
                    </p>
                  )}
                  {step.step === "routing" && (
                    <p className="text-xs" style={{ color: "#6B7B6E" }}>
                      Optimal route:{" "}
                      <span style={{ color: "#3D5A8A", fontWeight: 600 }}>
                        {(step.data as Record<string, number>).total_walk_minutes || 0} min
                      </span>{" "}
                      walk
                    </p>
                  )}
                  {step.step === "alerts" && (
                    <p className="text-xs" style={{ color: "#6B7B6E" }}>
                      Generated{" "}
                      <span style={{ color: "#C4451A", fontWeight: 600 }}>
                        {(step.data as Record<string, number>).alerts_count || 0}
                      </span>{" "}
                      staff alerts
                    </p>
                  )}
                  {step.step === "concierge" && (
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "#1A2E1A" }}
                    >
                      {String(
                        (step.data as Record<string, string>).response || ""
                      ).slice(0, 120)}
                      ...
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Thinking indicator */}
      <AnimatePresence>
        {isRunning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 px-5 py-3 rounded-2xl"
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
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: "#C4651A" }}
                />
              ))}
            </div>
            <span className="text-xs" style={{ color: "#C4651A" }}>
              Thinking...
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
