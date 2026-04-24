import { useState, useEffect } from "react";

export interface StreamData {
  phase: string;
  timestamp: number;
  gates: {
    id: string;
    name: string;
    throughput: number;
    queue_length: number;
    wait_time_minutes: number;
    congestion: "low" | "moderate" | "high" | "critical";
  }[];
  concessions: {
    id: string;
    name: string;
    queue_length: number;
    wait_time_minutes: number;
    congestion: "low" | "moderate" | "high" | "critical";
  }[];
  restrooms: {
    id: string;
    name: string;
    queue_length: number;
    wait_time_minutes: number;
    congestion: "low" | "moderate" | "high" | "critical";
  }[];
}

export function useSimulationStream() {
  const [data, setData] = useState<StreamData | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let ws: WebSocket;
    
    const connect = () => {
      // Determine WebSocket URL dynamically
      const wsBase = process.env.NEXT_PUBLIC_API_URL
        ? process.env.NEXT_PUBLIC_API_URL.replace(/^http/, "ws")
        : "ws://localhost:8000";
      ws = new WebSocket(`${wsBase}/api/ws/simulation`);
      
      ws.onopen = () => {
        console.log("Connected to simulation stream");
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          setData(payload);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onclose = () => {
        console.log("Disconnected from simulation stream, retrying...");
        setIsConnected(false);
        setTimeout(connect, 3000); // Reconnect after 3 seconds
      };
      
      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        ws.close();
      };
    };

    connect();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  return { data, isConnected };
}
