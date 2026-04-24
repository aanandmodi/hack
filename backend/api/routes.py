"""StadiumIQ API routes — agent streaming, zones, queues, alerts, stats.

All Supabase/agent routes gracefully return errors when those services
are not configured, so the simulation engine can run standalone.
"""

import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

logger = logging.getLogger(__name__)
router = APIRouter()


class AgentRequest(BaseModel):
    """Request body for running the agent pipeline."""
    query: str
    zone_data: dict | None = None


# ─── Agent Streaming ─────────────────────────────────────────────────────────

@router.post("/agent/run")
async def agent_run(request: AgentRequest):
    """Run the LangGraph agent pipeline and stream results via SSE."""
    try:
        from agents.graph import run_agent
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Agent pipeline not available: {e}")

    async def event_generator():
        try:
            async for event in run_agent(request.query, request.zone_data):
                yield event
        except Exception as e:
            logger.error(f"Agent streaming error: {e}")
            yield f'data: {{"step": "error", "message": "{str(e)}"}}\n\n'

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ─── Zones ────────────────────────────────────────────────────────────────────

@router.get("/zones")
async def get_zones():
    """Fetch all zones ordered by congestion level."""
    from core.db import supabase
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase not configured")
    try:
        congestion_order = {"critical": 0, "high": 1, "moderate": 2, "low": 3}
        response = supabase.table("zones").select("*").execute()
        zones = response.data or []
        zones.sort(key=lambda z: congestion_order.get(z.get("congestion_level", "low"), 4))
        return {"data": zones, "count": len(zones)}
    except Exception as e:
        logger.error(f"Error fetching zones: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─── Queues ───────────────────────────────────────────────────────────────────

@router.get("/queues")
async def get_queues():
    """Fetch all open queues ordered by wait time."""
    from core.db import supabase
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase not configured")
    try:
        response = (
            supabase.table("queues")
            .select("*")
            .eq("is_open", True)
            .order("wait_minutes", desc=True)
            .execute()
        )
        return {"data": response.data or [], "count": len(response.data or [])}
    except Exception as e:
        logger.error(f"Error fetching queues: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─── Alerts ───────────────────────────────────────────────────────────────────

@router.get("/alerts")
async def get_alerts():
    """Fetch all unresolved alerts ordered by priority."""
    from core.db import supabase
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase not configured")
    try:
        priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        response = (
            supabase.table("alerts")
            .select("*, zones(name)")
            .eq("is_resolved", False)
            .order("created_at", desc=True)
            .execute()
        )
        alerts = response.data or []
        alerts.sort(key=lambda a: priority_order.get(a.get("priority", "low"), 4))
        return {"data": alerts, "count": len(alerts)}
    except Exception as e:
        logger.error(f"Error fetching alerts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/alerts/{alert_id}/resolve")
async def resolve_alert(alert_id: str):
    """Mark an alert as resolved."""
    from core.db import supabase
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase not configured")
    try:
        response = (
            supabase.table("alerts")
            .update({"is_resolved": True})
            .eq("id", alert_id)
            .execute()
        )
        if response.data:
            return {"success": True, "message": f"Alert {alert_id} resolved"}
        raise HTTPException(status_code=404, detail="Alert not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resolving alert: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ─── Stats ────────────────────────────────────────────────────────────────────

@router.get("/stats")
async def get_stats():
    """Return aggregate stadium statistics."""
    from core.db import supabase
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase not configured")
    try:
        zones_resp = supabase.table("zones").select("*").execute()
        zones = zones_resp.data or []
        total_zones = len(zones)
        congested_zones = len(
            [z for z in zones if z.get("congestion_level") in ("high", "critical")]
        )

        queues_resp = (
            supabase.table("queues").select("wait_minutes").eq("is_open", True).execute()
        )
        queues = queues_resp.data or []
        avg_wait = (
            round(sum(q["wait_minutes"] for q in queues) / len(queues), 1)
            if queues
            else 0
        )

        alerts_resp = (
            supabase.table("alerts")
            .select("id", count="exact")
            .eq("is_resolved", False)
            .execute()
        )
        active_alerts = alerts_resp.count or 0

        return {
            "total_zones": total_zones,
            "congested_zones": congested_zones,
            "avg_wait_minutes": avg_wait,
            "active_alerts": active_alerts,
        }
    except Exception as e:
        logger.error(f"Error fetching stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))