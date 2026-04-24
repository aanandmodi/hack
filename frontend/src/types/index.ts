/**
 * StadiumIQ TypeScript interfaces
 * Matches the Supabase schema exactly
 */

export interface Zone {
  id: string;
  name: string;
  section: string;
  capacity: number;
  current_occupancy: number;
  congestion_level: "low" | "moderate" | "high" | "critical";
  last_updated: string;
}

export interface Queue {
  id: string;
  stall_name: string;
  zone_id: string;
  wait_minutes: number;
  queue_length: number;
  stall_type: "food" | "beverage" | "restroom" | "merchandise" | "entry_gate";
  is_open: boolean;
  last_updated: string;
}

export interface Alert {
  id: string;
  zone_id: string;
  alert_type: "congestion" | "queue_overflow" | "entry_spike" | "weather";
  priority: "low" | "medium" | "high" | "critical";
  message: string;
  suggested_action: string;
  is_resolved: boolean;
  created_at: string;
  zones?: { name: string };
}

export interface AgentStep {
  step: string;
  step_index: number;
  total_steps: number;
  label: string;
  description: string;
  icon: string;
  status: "running" | "complete" | "error";
  message: string;
  data: Record<string, unknown>;
  error?: string;
}

export interface AgentState {
  steps: AgentStep[];
  isRunning: boolean;
  currentStep: string;
  result: Record<string, unknown> | null;
  conciergeResponse: string;
}

export interface StatsOverview {
  total_zones: number;
  congested_zones: number;
  avg_wait_minutes: number;
  active_alerts: number;
}

export interface RouteStep {
  step_number: number;
  instruction: string;
  landmark: string;
  estimated_minutes: number;
}

export interface Route {
  id: string;
  from_zone: string;
  to_zone: string;
  path_description: string;
  estimated_walk_minutes: number;
  congestion_avoided: boolean;
  created_at: string;
  steps?: RouteStep[];
  total_walk_minutes?: number;
  zones_avoided?: string[];
  summary?: string;
}

export interface AgentRunPayload {
  query: string;
  zone_data?: Record<string, unknown>;
}

export type CongestionLevel = "low" | "moderate" | "high" | "critical";

export const CONGESTION_COLORS: Record<CongestionLevel, string> = {
  low: "#6B8F71",
  moderate: "#D4A017",
  high: "#C4451A",
  critical: "#8B0000",
};

export const CONGESTION_LABELS: Record<CongestionLevel, string> = {
  low: "Clear",
  moderate: "Moderate",
  high: "Busy",
  critical: "Critical",
};
