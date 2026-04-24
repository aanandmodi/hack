/**
 * Next.js API Route — proxies agent requests to the FastAPI backend.
 * This enables SSE streaming through Next.js if needed, but the frontend
 * primarily connects directly to the FastAPI backend for lower latency.
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendResponse = await fetch(`${BACKEND_URL}/api/agent/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: "Backend agent request failed" },
        { status: backendResponse.status }
      );
    }

    // Stream the SSE response through
    const stream = backendResponse.body;
    if (!stream) {
      return NextResponse.json(
        { error: "No stream available from backend" },
        { status: 500 }
      );
    }

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("Agent proxy error:", error);
    return NextResponse.json(
      { error: "Failed to connect to backend" },
      { status: 500 }
    );
  }
}
