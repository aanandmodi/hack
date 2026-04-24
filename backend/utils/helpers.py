"""Utility helpers for StadiumIQ."""

import json
from datetime import datetime


def format_timestamp(ts: str | None) -> str:
    """Format an ISO timestamp to a human-readable string."""
    if not ts:
        return "Unknown"
    try:
        dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        return dt.strftime("%H:%M:%S %d %b %Y")
    except (ValueError, AttributeError):
        return str(ts)


def safe_json_loads(text: str, default=None):
    """Safely parse JSON, returning default on failure."""
    try:
        return json.loads(text)
    except (json.JSONDecodeError, TypeError):
        return default if default is not None else {}


def congestion_color(level: str) -> str:
    """Return the hex color for a congestion level."""
    colors = {
        "low": "#6B8F71",
        "moderate": "#D4A017",
        "high": "#C4451A",
        "critical": "#8B0000",
    }
    return colors.get(level, "#6B8F71")


def calculate_occupancy_pct(current: int, capacity: int) -> float:
    """Calculate occupancy percentage safely."""
    if capacity <= 0:
        return 0.0
    return round((current / capacity) * 100, 1)
