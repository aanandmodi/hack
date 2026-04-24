"""LangGraph agent nodes for StadiumIQ pipeline.

Each node is an async function that processes stadium data through an LLM
and updates the shared state graph.
"""

import json
import logging
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

from core.config import settings
from core.db import supabase
from prompts.system_prompts import (
    CROWD_FLOW_PROMPT,
    QUEUE_ANALYSIS_PROMPT,
    ROUTING_PROMPT,
    ALERT_PROMPT,
    CONCIERGE_PROMPT,
)

logger = logging.getLogger(__name__)


def _get_llm() -> ChatOpenAI:
    """Create a ChatOpenAI instance with gpt-4o."""
    return ChatOpenAI(
        model="gpt-4o",
        api_key=settings.OPENAI_API_KEY,
        temperature=0.3,
        max_tokens=2000,
    )


def _parse_json_response(text: str) -> dict | list:
    """Extract JSON from LLM response, handling markdown code blocks."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        lines = lines[1:]  # Remove opening ```json
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        cleaned = "\n".join(lines)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        logger.warning("Failed to parse JSON from LLM response, returning raw text")
        return {"raw_response": text}


async def crowd_flow_node(state: dict) -> dict:
    """Analyze crowd flow — fetch zones, identify hotspots, predict peaks."""
    try:
        logger.info("🏟️  Running crowd flow analysis...")
        response = supabase.table("zones").select("*").execute()
        zones = response.data or []

        zone_summary = []
        for z in zones:
            occupancy_pct = round(
                (z["current_occupancy"] / z["capacity"]) * 100, 1
            ) if z["capacity"] > 0 else 0
            zone_summary.append({
                "name": z["name"],
                "section": z["section"],
                "capacity": z["capacity"],
                "current_occupancy": z["current_occupancy"],
                "occupancy_pct": occupancy_pct,
                "congestion_level": z["congestion_level"],
            })

        llm = _get_llm()
        prompt = CROWD_FLOW_PROMPT.format(zone_data=json.dumps(zone_summary, indent=2))
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        result = _parse_json_response(response.content)

        return {
            "zone_data": {z["name"]: z for z in zone_summary},
            "crowd_hotspots": result.get("hotspots", []) if isinstance(result, dict) else [],
            "current_step": "crowd_flow",
        }
    except Exception as e:
        logger.error(f"Crowd flow node error: {e}")
        return {
            "zone_data": {},
            "crowd_hotspots": [],
            "current_step": "crowd_flow",
            "error": str(e),
        }


async def queue_node(state: dict) -> dict:
    """Analyze queue wait times and identify overloaded stalls."""
    try:
        logger.info("⏱️  Running queue analysis...")
        response = supabase.table("queues").select("*").eq("is_open", True).execute()
        queues = response.data or []

        queue_summary = []
        for q in queues:
            queue_summary.append({
                "stall_name": q["stall_name"],
                "stall_type": q["stall_type"],
                "wait_minutes": q["wait_minutes"],
                "queue_length": q["queue_length"],
                "zone_id": q.get("zone_id"),
            })

        llm = _get_llm()
        prompt = QUEUE_ANALYSIS_PROMPT.format(queue_data=json.dumps(queue_summary, indent=2))
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        result = _parse_json_response(response.content)

        return {
            "queue_times": result if isinstance(result, dict) else {"raw": result},
            "current_step": "queue_analysis",
        }
    except Exception as e:
        logger.error(f"Queue node error: {e}")
        return {
            "queue_times": {},
            "current_step": "queue_analysis",
            "error": str(e),
        }


async def routing_node(state: dict) -> dict:
    """Generate optimal walking route avoiding congested zones."""
    try:
        logger.info("🗺️  Generating optimal route...")
        llm = _get_llm()
        prompt = ROUTING_PROMPT.format(
            hotspots=json.dumps(state.get("crowd_hotspots", []), indent=2),
            queue_data=json.dumps(state.get("queue_times", {}), indent=2),
            query=state.get("query", "Find the best route to my seat"),
        )
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        result = _parse_json_response(response.content)

        return {
            "recommended_route": result if isinstance(result, dict) else {},
            "current_step": "routing",
        }
    except Exception as e:
        logger.error(f"Routing node error: {e}")
        return {
            "recommended_route": {},
            "current_step": "routing",
            "error": str(e),
        }


async def alert_node(state: dict) -> dict:
    """Generate and persist operational alerts for staff."""
    try:
        logger.info("🚨  Generating alerts...")
        llm = _get_llm()
        prompt = ALERT_PROMPT.format(
            hotspots=json.dumps(state.get("crowd_hotspots", []), indent=2),
            queue_data=json.dumps(state.get("queue_times", {}), indent=2),
        )
        response = await llm.ainvoke([HumanMessage(content=prompt)])
        result = _parse_json_response(response.content)

        alerts = result.get("alerts", []) if isinstance(result, dict) else []

        # Persist alerts to Supabase
        for alert in alerts:
            try:
                # Find the zone_id for this alert
                zone_resp = (
                    supabase.table("zones")
                    .select("id")
                    .ilike("name", f"%{alert.get('zone_name', '')}%")
                    .limit(1)
                    .execute()
                )
                zone_id = zone_resp.data[0]["id"] if zone_resp.data else None

                supabase.table("alerts").insert({
                    "zone_id": zone_id,
                    "alert_type": alert.get("alert_type", "congestion"),
                    "priority": alert.get("priority", "medium"),
                    "message": alert.get("message", ""),
                    "suggested_action": alert.get("suggested_action", ""),
                    "is_resolved": False,
                }).execute()
            except Exception as insert_err:
                logger.warning(f"Failed to insert alert: {insert_err}")

        return {
            "alerts": alerts,
            "current_step": "alerts",
        }
    except Exception as e:
        logger.error(f"Alert node error: {e}")
        return {
            "alerts": [],
            "current_step": "alerts",
            "error": str(e),
        }


async def concierge_node(state: dict) -> dict:
    """Generate a friendly natural language response for the attendee."""
    try:
        logger.info("🎙️  Generating concierge response...")
        llm = _get_llm()
        prompt = CONCIERGE_PROMPT.format(
            query=state.get("query", ""),
            route=json.dumps(state.get("recommended_route", {}), indent=2),
            queue_data=json.dumps(state.get("queue_times", {}), indent=2),
            hotspots=json.dumps(state.get("crowd_hotspots", []), indent=2),
        )
        response = await llm.ainvoke([HumanMessage(content=prompt)])

        return {
            "concierge_response": response.content,
            "current_step": "concierge",
        }
    except Exception as e:
        logger.error(f"Concierge node error: {e}")
        return {
            "concierge_response": "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
            "current_step": "concierge",
            "error": str(e),
        }