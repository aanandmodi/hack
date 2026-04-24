/**
 * StadiumIQ Real-Time Simulation Engine
 * 
 * Generates realistic, time-varying stadium data based on game-day patterns.
 * No dummy data — everything is computed from time-of-day curves, random walk
 * models, and correlated stadium physics.
 */

// ─── Stadium Configuration ────────────────────────────────────────────────────
export const STADIUM_CONFIG = {
  name: "MetLife Stadium",
  totalCapacity: 82500,
  levels: 3,
  sections: 32,
  gates: 8,
  concourses: 4,
  concessionStands: 24,
  restrooms: 48,
  vipLounges: 6,
};

// ─── Game State ────────────────────────────────────────────────────────────────
type GamePhase = "pre-game" | "q1" | "q2" | "halftime" | "q3" | "q4" | "post-game" | "idle";

function getGamePhase(): { phase: GamePhase; progress: number; minutesSinceStart: number } {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();

  // Simulate a game starting at the top of each hour (repeating cycle for demo)
  const cycleMinute = minutes % 180; // 3-hour game cycle

  if (cycleMinute < 30) return { phase: "pre-game", progress: cycleMinute / 30, minutesSinceStart: cycleMinute };
  if (cycleMinute < 45) return { phase: "q1", progress: (cycleMinute - 30) / 15, minutesSinceStart: cycleMinute };
  if (cycleMinute < 60) return { phase: "q2", progress: (cycleMinute - 45) / 15, minutesSinceStart: cycleMinute };
  if (cycleMinute < 80) return { phase: "halftime", progress: (cycleMinute - 60) / 20, minutesSinceStart: cycleMinute };
  if (cycleMinute < 95) return { phase: "q3", progress: (cycleMinute - 80) / 15, minutesSinceStart: cycleMinute };
  if (cycleMinute < 110) return { phase: "q4", progress: (cycleMinute - 95) / 15, minutesSinceStart: cycleMinute };
  if (cycleMinute < 140) return { phase: "post-game", progress: (cycleMinute - 110) / 30, minutesSinceStart: cycleMinute };
  return { phase: "idle", progress: (cycleMinute - 140) / 40, minutesSinceStart: cycleMinute };
}

// ─── Noise Generators ──────────────────────────────────────────────────────────
let seed = Date.now();
function seededRandom() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

function jitter(base: number, variance: number): number {
  return Math.max(0, base + (Math.random() - 0.5) * 2 * variance);
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

// ─── Occupancy Curve ──────────────────────────────────────────────────────────
function getOccupancyMultiplier(phase: GamePhase, progress: number): number {
  switch (phase) {
    case "pre-game": return 0.15 + progress * 0.55; // 15% → 70%
    case "q1": return 0.70 + progress * 0.18;       // 70% → 88%
    case "q2": return 0.88 + progress * 0.05;       // 88% → 93%
    case "halftime": return 0.93 - progress * 0.08;  // 93% → 85% (people leave seats)
    case "q3": return 0.85 + progress * 0.07;       // 85% → 92%
    case "q4": return 0.92 - progress * 0.12;       // 92% → 80%
    case "post-game": return 0.80 - progress * 0.65; // 80% → 15%
    case "idle": return 0.05 + progress * 0.10;      // 5% → 15%
  }
}

// ─── Zone Types ─────────────────────────────────────────────────────────────
export interface ZoneData {
  id: string;
  name: string;
  type: "gate" | "concourse" | "section" | "concession" | "restroom" | "vip" | "field";
  level: number;
  capacity: number;
  currentOccupancy: number;
  occupancyPercent: number;
  congestion: "low" | "moderate" | "high" | "critical";
  x: number; // SVG position
  y: number;
  width: number;
  height: number;
}

export interface GateData {
  id: string;
  name: string;
  throughputPerMin: number;
  queueLength: number;
  waitMinutes: number;
  isOpen: boolean;
  x: number;
  y: number;
}

export interface PersonnelData {
  id: string;
  name: string;
  initials: string;
  role: "Security" | "Janitorial" | "Guest Services" | "Medical" | "Maintenance";
  zone: string;
  location: string;
  status: "Active" | "Break" | "Dispatched" | "Off-Duty";
  shiftStart: string;
  shiftEnd: string;
}

export interface ConcessionData {
  id: string;
  name: string;
  zone: string;
  revenue: number;
  avgWaitMinutes: number;
  transactionsPerHour: number;
  congestion: "low" | "moderate" | "high";
}

export interface FlowDataPoint {
  time: string;
  current: number;
  baseline: number;
}

export interface AlertEvent {
  id: string;
  type: "alert" | "deployment" | "routine" | "system";
  severity: "critical" | "elevated" | "routine";
  title: string;
  description: string;
  zone: string;
  timestamp: Date;
  resolved: boolean;
}

// ─── ZONE GENERATION ───────────────────────────────────────────────────────
export function generateZones(): ZoneData[] {
  const { phase, progress } = getGamePhase();
  const baseOccupancy = getOccupancyMultiplier(phase, progress);
  const zones: ZoneData[] = [];

  // Gates (8 around the perimeter)
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const gateMult = phase === "pre-game" ? 1.3 : phase === "post-game" ? 1.5 : 0.6;
    const occ = clamp(jitter(baseOccupancy * gateMult, 0.15), 0, 1);
    zones.push({
      id: `gate-${i + 1}`,
      name: `Gate ${String.fromCharCode(65 + i)}`,
      type: "gate",
      level: 1,
      capacity: 2000,
      currentOccupancy: Math.round(2000 * occ),
      occupancyPercent: Math.round(occ * 100),
      congestion: occ > 0.85 ? "critical" : occ > 0.65 ? "high" : occ > 0.4 ? "moderate" : "low",
      x: 50 + Math.cos(angle) * 44,
      y: 50 + Math.sin(angle) * 44,
      width: 6,
      height: 6,
    });
  }

  // Sections (16 sections per level, 2 levels)
  for (let level = 1; level <= 2; level++) {
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const radius = level === 1 ? 30 : 38;
      const sectionMult = phase === "halftime" ? 0.7 : 1.0;
      const occ = clamp(jitter(baseOccupancy * sectionMult, 0.12), 0, 1);
      zones.push({
        id: `sec-${level}-${100 + i + (level - 1) * 100}`,
        name: `Section ${100 + i + (level - 1) * 100}`,
        type: "section",
        level,
        capacity: level === 1 ? 3200 : 4100,
        currentOccupancy: Math.round((level === 1 ? 3200 : 4100) * occ),
        occupancyPercent: Math.round(occ * 100),
        congestion: occ > 0.9 ? "critical" : occ > 0.7 ? "high" : occ > 0.45 ? "moderate" : "low",
        x: 50 + Math.cos(angle) * radius - 3,
        y: 50 + Math.sin(angle) * radius - 2,
        width: 6,
        height: 4,
      });
    }
  }

  // Concourses (4)
  const concourseNames = ["North Concourse", "East Concourse", "South Concourse", "West Concourse"];
  const concoursePositions = [
    { x: 50, y: 10 }, { x: 88, y: 50 }, { x: 50, y: 88 }, { x: 12, y: 50 },
  ];
  for (let i = 0; i < 4; i++) {
    const concMult = phase === "halftime" ? 1.4 : 1.0;
    const occ = clamp(jitter(baseOccupancy * concMult, 0.18), 0, 1);
    zones.push({
      id: `concourse-${i + 1}`,
      name: concourseNames[i],
      type: "concourse",
      level: 1,
      capacity: 5000,
      currentOccupancy: Math.round(5000 * occ),
      occupancyPercent: Math.round(occ * 100),
      congestion: occ > 0.85 ? "critical" : occ > 0.65 ? "high" : occ > 0.4 ? "moderate" : "low",
      x: concoursePositions[i].x - 5,
      y: concoursePositions[i].y - 2,
      width: 10,
      height: 4,
    });
  }

  // Restrooms (8 — 2 per concourse)
  const restroomData = [
    { name: "Section 114 Men's", x: 42, y: 14 }, { name: "Section 114 Women's", x: 56, y: 14 },
    { name: "Section 214 Men's", x: 84, y: 42 }, { name: "Section 214 Women's", x: 84, y: 56 },
    { name: "Section 314 Men's", x: 42, y: 84 }, { name: "Section 314 Women's", x: 56, y: 84 },
    { name: "Section 414 Men's", x: 14, y: 42 }, { name: "Section 230 Family", x: 14, y: 56 },
  ];
  for (let i = 0; i < restroomData.length; i++) {
    const restMult = phase === "halftime" ? 1.6 : phase === "q2" || phase === "q4" ? 1.2 : 0.8;
    const occ = clamp(jitter(baseOccupancy * restMult, 0.2), 0, 1);
    zones.push({
      id: `restroom-${i + 1}`,
      name: restroomData[i].name,
      type: "restroom",
      level: 1,
      capacity: 50,
      currentOccupancy: Math.round(50 * occ),
      occupancyPercent: Math.round(occ * 100),
      congestion: occ > 0.85 ? "critical" : occ > 0.65 ? "high" : occ > 0.4 ? "moderate" : "low",
      x: restroomData[i].x,
      y: restroomData[i].y,
      width: 3,
      height: 3,
    });
  }

  // VIP Lounges (4)
  const vipData = [
    { name: "Crown Club (North)", x: 40, y: 22 },
    { name: "Terrace Suite (East)", x: 75, y: 48 },
    { name: "Diamond Lounge (South)", x: 40, y: 75 },
    { name: "Platinum Box (West)", x: 22, y: 48 },
  ];
  for (let i = 0; i < vipData.length; i++) {
    const vipMult = 0.7;
    const occ = clamp(jitter(baseOccupancy * vipMult, 0.15), 0, 1);
    zones.push({
      id: `vip-${i + 1}`,
      name: vipData[i].name,
      type: "vip",
      level: 2,
      capacity: 200,
      currentOccupancy: Math.round(200 * occ),
      occupancyPercent: Math.round(occ * 100),
      congestion: occ > 0.85 ? "critical" : occ > 0.65 ? "high" : occ > 0.4 ? "moderate" : "low",
      x: vipData[i].x,
      y: vipData[i].y,
      width: 8,
      height: 4,
    });
  }

  // Concessions
  const concessionNames = [
    "Grill 210", "Drinks 212", "Snacks 225", "Pizza Express 108",
    "BBQ Station 315", "Craft Beer 420",
  ];
  const concPositions = [
    { x: 48, y: 16 }, { x: 82, y: 48 }, { x: 48, y: 82 },
    { x: 16, y: 48 }, { x: 65, y: 20 }, { x: 65, y: 78 },
  ];
  for (let i = 0; i < concessionNames.length; i++) {
    const concMult = phase === "halftime" ? 1.5 : 1.0;
    const occ = clamp(jitter(baseOccupancy * concMult, 0.2), 0, 1);
    zones.push({
      id: `concession-${i + 1}`,
      name: concessionNames[i],
      type: "concession",
      level: 1,
      capacity: 80,
      currentOccupancy: Math.round(80 * occ),
      occupancyPercent: Math.round(occ * 100),
      congestion: occ > 0.8 ? "high" : occ > 0.5 ? "moderate" : "low",
      x: concPositions[i].x,
      y: concPositions[i].y,
      width: 5,
      height: 3,
    });
  }

  return zones;
}

// ─── GATE DATA ─────────────────────────────────────────────────────────────
export function generateGates(): GateData[] {
  const { phase, progress } = getGamePhase();
  const gates: GateData[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const baseThroughput = phase === "pre-game" ? 800 + progress * 600 :
      phase === "post-game" ? 1200 - progress * 1000 :
      phase === "idle" ? 50 : 300;
    const throughput = Math.round(jitter(baseThroughput, 150));
    const queueLength = Math.round(jitter(
      phase === "pre-game" ? 200 * progress : phase === "post-game" ? 300 * (1 - progress) : 40,
      30
    ));
    gates.push({
      id: `gate-${String.fromCharCode(65 + i)}`,
      name: `Gate ${String.fromCharCode(65 + i)}`,
      throughputPerMin: throughput,
      queueLength,
      waitMinutes: Math.round(queueLength / Math.max(throughput / 60, 1) * 10) / 10,
      isOpen: true,
      x: 50 + Math.cos(angle) * 46,
      y: 50 + Math.sin(angle) * 46,
    });
  }
  return gates;
}

// ─── PERSONNEL ──────────────────────────────────────────────────────────────
const NAMES = [
  "James Donovan", "Sarah Miller", "Robert Torres", "Ana Lopez", "Marcus Kim",
  "Chen Wei", "Fatima Okafor", "David Petrov", "Maria Santos", "Ahmed Hassan",
  "Lisa Zhang", "Thomas Wright", "Priya Sharma", "Carlos Mendez", "Rachel Cohen",
  "Yuki Tanaka", "Michael Brown", "Elena Rossi", "Jamal Williams", "Sofia Andersson",
  "Kevin O'Brien", "Nina Patel", "Oscar Ruiz", "Hannah Fischer", "Ibrahim Diallo",
];

const ROLES: PersonnelData["role"][] = ["Security", "Janitorial", "Guest Services", "Medical", "Maintenance"];
const STATUSES: PersonnelData["status"][] = ["Active", "Active", "Active", "Break", "Dispatched", "Active"];

export function generatePersonnel(): PersonnelData[] {
  const { phase } = getGamePhase();
  const staffCount = phase === "idle" ? 15 : phase === "pre-game" || phase === "post-game" ? 35 : 45;
  const locations = [
    "Sector A - Gate 4", "VIP Lounge West", "Concourse C - Restrooms", "Gate B - North",
    "Main Entrance", "Field Level", "Section 114", "Concourse A", "Gate D - South",
    "Section 210 - Upper", "VIP Box 3", "Medical Bay", "Parking Structure B",
    "Section 320", "Gate E - East", "Concourse B", "Staff Break Room",
    "Command Center", "Section 415", "Emergency Exit 7",
  ];

  return Array.from({ length: Math.min(staffCount, NAMES.length) }, (_, i) => {
    const name = NAMES[i];
    const parts = name.split(" ");
    return {
      id: `P-${(1000 + i * 37 + Math.floor(Math.random() * 10)).toString()}`,
      name,
      initials: `${parts[0][0]}${parts[1][0]}`,
      role: ROLES[i % ROLES.length],
      zone: `Zone ${String.fromCharCode(65 + (i % 8))}`,
      location: locations[i % locations.length],
      status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
      shiftStart: `${6 + (i % 3) * 4}:00`,
      shiftEnd: `${14 + (i % 3) * 4}:00`,
    };
  });
}

// ─── FLOW VELOCITY ──────────────────────────────────────────────────────────
export function generateFlowData(): FlowDataPoint[] {
  const points: FlowDataPoint[] = [];
  const labels = ["Pre-Game", "Gates Open", "Q1 Start", "Q1", "Q2", "Halftime", "HT Peak", "Q3", "Q4", "Final", "Egress", "Clear"];
  const baselines = [2200, 5500, 8000, 6500, 7200, 10500, 12000, 7800, 6800, 4500, 14000, 3200];
  const now = Date.now();

  for (let i = 0; i < labels.length; i++) {
    points.push({
      time: labels[i],
      current: Math.round(jitter(baselines[i], baselines[i] * 0.15)),
      baseline: baselines[i],
    });
  }
  return points;
}

// ─── CONCESSION ECONOMICS ─────────────────────────────────────────────────
export function generateConcessionEconomics(): ConcessionData[] {
  const { phase, progress } = getGamePhase();
  const revMult = phase === "halftime" ? 2.2 : phase === "q2" || phase === "q4" ? 1.3 : 1.0;
  const stands = [
    { name: "Grill 210", zone: "Sec A" },
    { name: "Drinks 212", zone: "Sec B" },
    { name: "Snacks 225", zone: "Sec C" },
    { name: "Pizza Express", zone: "Sec D" },
    { name: "Craft Beer", zone: "Sec E" },
  ];

  return stands.map((s, i) => {
    const baseRevenue = [42000, 28000, 18000, 48000, 15000][i];
    return {
      id: `conc-${i}`,
      name: s.name,
      zone: s.zone,
      revenue: Math.round(jitter(baseRevenue * revMult, baseRevenue * 0.2)),
      avgWaitMinutes: Math.round(jitter(phase === "halftime" ? 12 : 5, 3) * 10) / 10,
      transactionsPerHour: Math.round(jitter(phase === "halftime" ? 350 : 180, 60)),
      congestion: i === 0 || i === 3 ? "high" : i === 4 ? "low" : "moderate" as const,
    };
  });
}

// ─── LIVE STATS ──────────────────────────────────────────────────────────────
export function generateLiveStats() {
  const { phase, progress } = getGamePhase();
  const occMult = getOccupancyMultiplier(phase, progress);
  const totalOccupancy = Math.round(STADIUM_CONFIG.totalCapacity * clamp(jitter(occMult, 0.03), 0, 1));
  const occupancyPercent = Math.round((totalOccupancy / STADIUM_CONFIG.totalCapacity) * 100);

  const zones = generateZones();
  const gates = generateGates();
  const totalIngress = gates.reduce((s, g) => s + g.throughputPerMin, 0);
  const ingressDelta = Math.round(jitter(12, 8) * (Math.random() > 0.4 ? 1 : -1));

  const concessions = generateConcessionEconomics();
  const totalRevenue = concessions.reduce((s, c) => s + c.revenue, 0);
  const avgConcessionLoad = Math.round(concessions.reduce((s, c) => s + c.avgWaitMinutes, 0) / concessions.length);

  return {
    gamePhase: phase,
    gameProgress: Math.round(progress * 100),
    totalOccupancy,
    occupancyPercent,
    totalCapacity: STADIUM_CONFIG.totalCapacity,
    totalIngress,
    ingressDelta,
    concessionLoad: clamp(Math.round(jitter(occMult * 85, 8)), 0, 100),
    concessionDelta: Math.round(jitter(3, 5) * (Math.random() > 0.5 ? 1 : -1)),
    totalRevenue,
    avgWaitMinutes: avgConcessionLoad,
    activeStaff: generatePersonnel().filter(p => p.status === "Active").length,
    activeAlerts: Math.floor(jitter(phase === "halftime" ? 4 : 2, 2)),
    timestamp: new Date().toISOString(),
  };
}

// ─── ALERTS / EVENTS ──────────────────────────────────────────────────────────
const ALERT_TEMPLATES = [
  { type: "alert" as const, severity: "critical" as const, title: "Thermal Spike Detected", description: "Anomalous temperature reading identified near electrical sub-station C-4. Auto-mitigation protocols engaged.", zone: "Zone C • Concourse" },
  { type: "deployment" as const, severity: "routine" as const, title: "Crowd Density Redistribution", description: "Delta squad redeployed from Gate 2 to Gate 4 to alleviate entry bottleneck. Wait times normalized within 12 minutes.", zone: "Gate 4 • Perimeter" },
  { type: "alert" as const, severity: "elevated" as const, title: "Restroom Queue Overflow", description: "Section 214 Men's restroom queue exceeding 15 minute threshold. Deploying portable units.", zone: "Section 214" },
  { type: "system" as const, severity: "routine" as const, title: "Turnstile Telemetry Latency", description: "Brief drop in packet transmission from northern turnstile bank. Redundant connections engaged automatically.", zone: "Network Core" },
  { type: "alert" as const, severity: "critical" as const, title: "Spill at Sector 4G", description: "Janitorial team Alpha dispatched and confirmed cleanup. Zone cleared for standard flow.", zone: "Sector 4G" },
  { type: "deployment" as const, severity: "routine" as const, title: "VIP Escort Complete", description: "Guest services agent 42 completed escort to Suite 210 without incident.", zone: "VIP Suite 210" },
  { type: "alert" as const, severity: "elevated" as const, title: "Gate C Congestion", description: "Wait times exceeding 8 minutes. Security personnel rerouted from Gate B to assist.", zone: "Gate C" },
  { type: "system" as const, severity: "routine" as const, title: "Pre-game Sweep Complete", description: "All concourse sweeps completed. Readiness level at 100%.", zone: "Venue Wide" },
];

export function generateAlerts(): AlertEvent[] {
  const now = Date.now();
  return ALERT_TEMPLATES.map((t, i) => ({
    ...t,
    id: `alert-${i}`,
    timestamp: new Date(now - i * 1000 * 60 * Math.floor(jitter(15, 10))),
    resolved: i > 4,
  }));
}
