"""LangChain tools for querying Supabase stadium data."""

from langchain_core.tools import tool
from core.db import supabase


@tool
def get_zone_status(zone_name: str) -> dict:
    """Get the current status of a specific stadium zone by name.

    Args:
        zone_name: The name of the zone to query (e.g. "North Stand Gate A")

    Returns:
        Dictionary with zone status including occupancy and congestion level.
    """
    try:
        response = (
            supabase.table("zones")
            .select("*")
            .ilike("name", f"%{zone_name}%")
            .execute()
        )
        if response.data:
            zone = response.data[0]
            occupancy_pct = round(
                (zone["current_occupancy"] / zone["capacity"]) * 100, 1
            )
            return {
                "zone": zone["name"],
                "section": zone["section"],
                "capacity": zone["capacity"],
                "current_occupancy": zone["current_occupancy"],
                "occupancy_percentage": occupancy_pct,
                "congestion_level": zone["congestion_level"],
                "last_updated": zone["last_updated"],
            }
        return {"error": f"Zone '{zone_name}' not found"}
    except Exception as e:
        return {"error": str(e)}


@tool
def get_shortest_queue(stall_type: str) -> dict:
    """Find the stall of a given type with the shortest wait time.

    Args:
        stall_type: Type of stall — "food", "beverage", "restroom", "merchandise", or "entry_gate"

    Returns:
        Dictionary with the stall name, wait time, and queue length.
    """
    try:
        response = (
            supabase.table("queues")
            .select("*")
            .eq("stall_type", stall_type)
            .eq("is_open", True)
            .order("wait_minutes", desc=False)
            .limit(1)
            .execute()
        )
        if response.data:
            q = response.data[0]
            return {
                "stall_name": q["stall_name"],
                "stall_type": q["stall_type"],
                "wait_minutes": q["wait_minutes"],
                "queue_length": q["queue_length"],
                "is_open": q["is_open"],
            }
        return {"error": f"No open stalls of type '{stall_type}' found"}
    except Exception as e:
        return {"error": str(e)}


@tool
def get_all_alerts() -> list:
    """Get all unresolved alerts ordered by priority (critical first).

    Returns:
        List of alert dictionaries with zone, type, priority, and suggested actions.
    """
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
        return alerts
    except Exception as e:
        return [{"error": str(e)}]


@tool
def resolve_alert(alert_id: str) -> dict:
    """Mark a specific alert as resolved.

    Args:
        alert_id: The UUID of the alert to resolve.

    Returns:
        Confirmation dictionary.
    """
    try:
        response = (
            supabase.table("alerts")
            .update({"is_resolved": True})
            .eq("id", alert_id)
            .execute()
        )
        if response.data:
            return {"success": True, "message": f"Alert {alert_id} resolved"}
        return {"success": False, "message": "Alert not found"}
    except Exception as e:
        return {"success": False, "error": str(e)}