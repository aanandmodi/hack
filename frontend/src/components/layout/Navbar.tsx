/**
 * Navbar — top navigation with StadiumIQ wordmark, view toggle, and live clock.
 */

"use client";

import { motion } from "framer-motion";
import { Radio, Shield, Smartphone } from "lucide-react";

interface NavbarProps {
  activeView: "operations" | "attendee";
  onViewChange: (view: "operations" | "attendee") => void;
  matchTime: string;
}

export function Navbar({ activeView, onViewChange, matchTime }: NavbarProps) {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="sticky top-0 z-50 backdrop-blur-md"
      style={{
        backgroundColor: "rgba(26,46,26,0.97)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "rgba(196,101,26,0.15)" }}
          >
            <Radio size={18} color="#C4651A" />
          </div>
          <h1
            className="text-xl tracking-tight"
            style={{
              fontFamily: "var(--font-serif)",
              color: "#FDFAF4",
              fontWeight: 700,
            }}
          >
            Stadium<span style={{ color: "#C4651A" }}>IQ</span>
          </h1>
        </div>

        {/* View Toggle */}
        <div
          className="flex items-center rounded-full p-1 gap-1"
          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onViewChange("operations")}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all"
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              backgroundColor:
                activeView === "operations"
                  ? "rgba(196,101,26,0.9)"
                  : "transparent",
              color: activeView === "operations" ? "#FDFAF4" : "#9CA89E",
            }}
          >
            <Shield size={14} />
            Operations
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onViewChange("attendee")}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all"
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              backgroundColor:
                activeView === "attendee"
                  ? "rgba(196,101,26,0.9)"
                  : "transparent",
              color: activeView === "attendee" ? "#FDFAF4" : "#9CA89E",
            }}
          >
            <Smartphone size={14} />
            Attendee
          </motion.button>
        </div>

        {/* Live Clock */}
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: "#6B8F71" }}
          />
          <div className="text-right">
            <p
              className="text-xs"
              style={{
                color: "#9CA89E",
                fontFamily: "var(--font-sans)",
              }}
            >
              LIVE MATCH
            </p>
            <p
              className="text-sm font-medium"
              style={{
                color: "#FDFAF4",
                fontFamily: "var(--font-sans)",
              }}
            >
              {matchTime}
            </p>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
