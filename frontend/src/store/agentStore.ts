/**
 * StadiumIQ Zustand store — manages agent pipeline state and UI state.
 */

import { create } from "zustand";
import type { AgentStep } from "@/types";

interface AgentStoreState {
  steps: AgentStep[];
  isRunning: boolean;
  currentStep: string;
  result: Record<string, unknown> | null;
  conciergeResponse: string;

  // Actions
  addStep: (step: AgentStep) => void;
  setRunning: (val: boolean) => void;
  setCurrentStep: (step: string) => void;
  setResult: (result: Record<string, unknown>) => void;
  setConciergeResponse: (response: string) => void;
  reset: () => void;
}

export const useAgentStore = create<AgentStoreState>((set) => ({
  steps: [],
  isRunning: false,
  currentStep: "",
  result: null,
  conciergeResponse: "",

  addStep: (step) =>
    set((s) => ({
      steps: [...s.steps, step],
      currentStep: step.step,
    })),

  setRunning: (val) => set({ isRunning: val }),

  setCurrentStep: (step) => set({ currentStep: step }),

  setResult: (result) => set({ result }),

  setConciergeResponse: (response) => set({ conciergeResponse: response }),

  reset: () =>
    set({
      steps: [],
      isRunning: false,
      currentStep: "",
      result: null,
      conciergeResponse: "",
    }),
}));