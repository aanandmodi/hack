/**
 * useAgentStream — custom hook that runs the agent pipeline
 * and updates Zustand store in real-time as SSE events arrive.
 */

"use client";

import { useCallback } from "react";
import { useAgentStore } from "@/store/agentStore";
import { streamAgent } from "@/lib/api";
import type { AgentStep } from "@/types";

export function useAgentStream() {
  const { steps, isRunning, currentStep, result, conciergeResponse } =
    useAgentStore();
  const { addStep, setRunning, setCurrentStep, setResult, setConciergeResponse, reset } =
    useAgentStore();

  const run = useCallback(
    async (query: string, zoneData?: Record<string, unknown>) => {
      reset();
      setRunning(true);

      try {
        await streamAgent({ query, zone_data: zoneData }, (chunk: AgentStep) => {
          if (chunk.step === "start") {
            setCurrentStep("starting");
            return;
          }

          if (chunk.step === "complete") {
            setResult((chunk.data as Record<string, unknown>) || {});
            setRunning(false);
            return;
          }

          if (chunk.step === "error") {
            setRunning(false);
            return;
          }

          // Agent node completion
          addStep(chunk);

          // Extract concierge response
          if (chunk.step === "concierge" && chunk.data) {
            const response = (chunk.data as Record<string, string>).response;
            if (response) {
              setConciergeResponse(response);
            }
          }
        });
      } catch (error) {
        console.error("Agent stream error:", error);
        setRunning(false);
      }
    },
    [addStep, setRunning, setCurrentStep, setResult, setConciergeResponse, reset]
  );

  return {
    run,
    isRunning,
    steps,
    currentStep,
    result,
    conciergeResponse,
  };
}
