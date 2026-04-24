"use client";

import { useMemo } from "react";
import type { ZoneData, GateData } from "@/lib/simulation";

interface StadiumMapProps {
  zones: ZoneData[];
  gates: GateData[];
  selectedZone?: string | null;
  onZoneClick?: (zone: ZoneData) => void;
  showLabels?: boolean;
  filterType?: string | null;
  className?: string;
}

const CONGESTION_COLORS: Record<string, string> = {
  critical: "#ba1a1a",
  high: "#fe9246",
  moderate: "#7591c5",
  low: "#b5cdb0",
};

const CONGESTION_OPACITY: Record<string, number> = {
  critical: 0.7,
  high: 0.55,
  moderate: 0.35,
  low: 0.15,
};

export function StadiumMap({
  zones,
  gates,
  selectedZone,
  onZoneClick,
  showLabels = false,
  filterType,
  className = "",
}: StadiumMapProps) {
  const filteredZones = useMemo(() => {
    if (!filterType) return zones;
    return zones.filter((z) => z.type === filterType);
  }, [zones, filterType]);

  return (
    <svg
      viewBox="0 0 100 100"
      className={`w-full h-full ${className}`}
      style={{ fontFamily: "Manrope, sans-serif" }}
    >
      <defs>
        {/* Radial gradients for heatmap blobs */}
        <radialGradient id="heat-critical" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ba1a1a" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ba1a1a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="heat-high" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fe9246" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#fe9246" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="heat-moderate" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7591c5" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#7591c5" stopOpacity="0" />
        </radialGradient>
        {/* Stadium field gradient */}
        <linearGradient id="field-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2d5a27" />
          <stop offset="100%" stopColor="#1a3a16" />
        </linearGradient>
        {/* Grid pattern */}
        <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
          <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#1a2e1a" strokeWidth="0.08" opacity="0.15" />
        </pattern>
      </defs>

      {/* Background */}
      <rect x="0" y="0" width="100" height="100" fill="#f5f3f0" rx="2" />
      <rect x="0" y="0" width="100" height="100" fill="url(#grid)" />

      {/* Outer stadium bowl */}
      <ellipse cx="50" cy="50" rx="46" ry="46" fill="none" stroke="#1a2e1a" strokeWidth="0.3" opacity="0.3" />
      <ellipse cx="50" cy="50" rx="42" ry="42" fill="none" stroke="#1a2e1a" strokeWidth="0.15" opacity="0.2" />
      <ellipse cx="50" cy="50" rx="36" ry="36" fill="none" stroke="#1a2e1a" strokeWidth="0.15" opacity="0.15" />

      {/* Upper concourse ring */}
      <ellipse cx="50" cy="50" rx="44" ry="44" fill="none" stroke="#c3c8bf" strokeWidth="4" opacity="0.15" />

      {/* Lower concourse ring */}
      <ellipse cx="50" cy="50" rx="34" ry="34" fill="none" stroke="#c3c8bf" strokeWidth="3" opacity="0.1" />

      {/* Field */}
      <ellipse cx="50" cy="50" rx="18" ry="12" fill="url(#field-gradient)" opacity="0.8" />
      {/* Field markings */}
      <ellipse cx="50" cy="50" rx="18" ry="12" fill="none" stroke="white" strokeWidth="0.2" opacity="0.4" />
      <line x1="50" y1="38" x2="50" y2="62" stroke="white" strokeWidth="0.15" opacity="0.3" />
      <ellipse cx="50" cy="50" rx="4" ry="3" fill="none" stroke="white" strokeWidth="0.15" opacity="0.3" />

      {/* Heatmap blobs for high-congestion zones */}
      {filteredZones
        .filter((z) => z.congestion === "critical" || z.congestion === "high")
        .map((z) => (
          <ellipse
            key={`heat-${z.id}`}
            cx={z.x + z.width / 2}
            cy={z.y + z.height / 2}
            rx={z.congestion === "critical" ? 8 : 6}
            ry={z.congestion === "critical" ? 8 : 6}
            fill={`url(#heat-${z.congestion})`}
            className="animate-pulse"
            style={{ animationDuration: z.congestion === "critical" ? "1.5s" : "2.5s" }}
          />
        ))}

      {/* Zone rectangles */}
      {filteredZones.map((z) => {
        const isSelected = selectedZone === z.id;
        const color = CONGESTION_COLORS[z.congestion];
        return (
          <g
            key={z.id}
            className="cursor-pointer transition-opacity hover:opacity-100"
            opacity={isSelected ? 1 : 0.85}
            onClick={() => onZoneClick?.(z)}
          >
            <rect
              x={z.x}
              y={z.y}
              width={z.width}
              height={z.height}
              rx="0.5"
              fill={color}
              opacity={CONGESTION_OPACITY[z.congestion] + (isSelected ? 0.3 : 0)}
              stroke={isSelected ? "#061907" : color}
              strokeWidth={isSelected ? 0.4 : 0.15}
            />
            {showLabels && z.type !== "section" && (
              <text
                x={z.x + z.width / 2}
                y={z.y + z.height + 2}
                textAnchor="middle"
                fill="#434841"
                fontSize="1.5"
                fontWeight="600"
              >
                {z.name.length > 12 ? z.name.slice(0, 12) + "…" : z.name}
              </text>
            )}
          </g>
        );
      })}

      {/* Gate markers */}
      {gates.map((g) => (
        <g key={g.id}>
          <circle cx={g.x} cy={g.y} r="2.5" fill="white" stroke="#1a2e1a" strokeWidth="0.3" />
          <text x={g.x} y={g.y + 0.6} textAnchor="middle" fill="#1a2e1a" fontSize="1.8" fontWeight="700">
            {g.name.replace("Gate ", "")}
          </text>
          {/* Throughput indicator ring */}
          <circle
            cx={g.x}
            cy={g.y}
            r="3.2"
            fill="none"
            stroke={g.waitMinutes > 5 ? "#ba1a1a" : g.waitMinutes > 2 ? "#fe9246" : "#b5cdb0"}
            strokeWidth="0.4"
            opacity="0.6"
            strokeDasharray={`${Math.min(g.throughputPerMin / 200, 20)} 1`}
          />
        </g>
      ))}
    </svg>
  );
}
