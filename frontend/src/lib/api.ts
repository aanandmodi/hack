/**
 * StadiumIQ API client — axios instance + typed fetch functions + SSE streaming.
 */

import axios from "axios";
import type {
  Zone,
  Queue,
  Alert,
  StatsOverview,
  AgentStep,
  AgentRunPayload,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

/** Fetch all zones ordered by congestion level */
export async function fetchZones(): Promise<Zone[]> {
  const { data } = await api.get<{ data: Zone[]; count: number }>("/api/zones");
  return data.data;
}

/** Fetch all open queues ordered by wait time */
export async function fetchQueues(): Promise<Queue[]> {
  const { data } = await api.get<{ data: Queue[]; count: number }>(
    "/api/queues"
  );
  return data.data;
}

/** Fetch all unresolved alerts */
export async function fetchAlerts(): Promise<Alert[]> {
  const { data } = await api.get<{ data: Alert[]; count: number }>(
    "/api/alerts"
  );
  return data.data;
}

/** Fetch aggregate stats */
export async function fetchStats(): Promise<StatsOverview> {
  const { data } = await api.get<StatsOverview>("/api/stats");
  return data;
}

/** Resolve an alert by ID */
export async function resolveAlert(
  id: string
): Promise<{ success: boolean; message: string }> {
  const { data } = await api.patch(`/api/alerts/${id}/resolve`);
  return data;
}

/**
 * Stream the agent pipeline via SSE using the Fetch API.
 * Calls onChunk with each parsed JSON event as it arrives.
 */
export async function streamAgent(
  payload: AgentRunPayload,
  onChunk: (chunk: AgentStep) => void
): Promise<void> {
  const response = await fetch(`${API_BASE}/api/agent/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Agent request failed: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No readable stream available");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("data: ")) {
        try {
          const data = JSON.parse(trimmed.slice(6)) as AgentStep;
          onChunk(data);
        } catch {
          // Skip malformed JSON lines
        }
      }
    }
  }

  // Process any remaining buffer
  if (buffer.trim().startsWith("data: ")) {
    try {
      const data = JSON.parse(buffer.trim().slice(6)) as AgentStep;
      onChunk(data);
    } catch {
      // Skip malformed JSON
    }
  }
}