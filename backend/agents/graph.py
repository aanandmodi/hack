"""LangGraph state graph definition for StadiumIQ agent pipeline.

Wires 5 nodes sequentially: crowd_flow → queue → routing → alert → concierge → END
Exports the compiled graph and a streaming run_agent async generator.
"""

import json
import time
import logging
from typing import TypedDict, AsyncGenerator

from langgraph.graph import StateGraph, END

from agents.nodes import (
    crowd_flow_node,
    queue_node,
    routing_node,
    alert_node,
    concierge_node,
)

logger = logging.getLogger(__name__)


class AgentState(TypedDict, total=False):
    """Typed state flowing through the StadiumIQ agent graph."""

    query: str
    zone_data: dict
    crowd_hotspots: list
    queue_times: dict
    recommended_route: dict
    alerts: list
    concierge_response: str
    current_step: str
    error: str


# Build the state graph
_graph_builder = StateGraph(AgentState)

# Add nodes
_graph_builder.add_node("crowd_flow", crowd_flow_node)
_graph_builder.add_node("queue_analysis", queue_node)
_graph_builder.add_node("routing", routing_node)
_graph_builder.add_node("alerts", alert_node)
_graph_builder.add_node("concierge", concierge_node)

# Wire edges: linear pipeline
_graph_builder.set_entry_point("crowd_flow")
_graph_builder.add_edge("crowd_flow", "queue_analysis")
_graph_builder.add_edge("queue_analysis", "routing")
_graph_builder.add_edge("routing", "alerts")
_graph_builder.add_edge("alerts", "concierge")
_graph_builder.add_edge("concierge", END)

# Compile
agent_graph = _graph_builder.compile()

# Node metadata for streaming progress updates
NODE_META = {
    "crowd_flow": {
        "label": "Crowd Flow Analysis",
        "description": "Analyzing zone occupancy and identifying hotspots",
        "icon": "activity",
    },
    "queue_analysis": {
        "label": "Queue Analysis",
        "description": "Evaluating wait times and finding best options",
        "icon": "clock",
    },
    "routing": {
        "label": "Route Optimization",
        "description": "Calculating optimal path avoiding congestion",
        "icon": "map",
    },
    "alerts": {
        "label": "Alert Generation",
        "description": "Creating actionable alerts for operations staff",
        "icon": "alert-triangle",
    },
    "concierge": {
        "label": "Concierge Response",
        "description": "Generating your personalized recommendation",
        "icon": "message-circle",
    },
}


async def run_agent(query: str, zone_data: dict | None = None) -> AsyncGenerator[str, None]:
    """Run the agent graph and yield SSE events as each node completes.

    Yields:
        SSE-formatted strings with JSON payloads for each step.
    """
    start_time = time.time()
    initial_state: AgentState = {
        "query": query,
        "zone_data": zone_data or {},
        "crowd_hotspots": [],
        "queue_times": {},
        "recommended_route": {},
        "alerts": [],
        "concierge_response": "",
        "current_step": "",
        "error": "",
    }

    step_index = 0
    node_order = ["crowd_flow", "queue_analysis", "routing", "alerts", "concierge"]

    # Send initial event
    yield f"data: {json.dumps({'step': 'start', 'message': 'StadiumIQ agent pipeline starting...', 'data': {'query': query}})}\n\n"

    try:
        async for event in agent_graph.astream(initial_state, stream_mode="updates"):
            for node_name, node_output in event.items():
                meta = NODE_META.get(node_name, {})
                step_index += 1

                step_data = {
                    "step": node_name,
                    "step_index": step_index,
                    "total_steps": len(node_order),
                    "label": meta.get("label", node_name),
                    "description": meta.get("description", ""),
                    "icon": meta.get("icon", "circle"),
                    "status": "complete",
                    "message": f"Completed: {meta.get('label', node_name)}",
                    "data": {},
                }

                # Include relevant output data
                if node_name == "crowd_flow":
                    step_data["data"] = {
                        "hotspots_count": len(node_output.get("crowd_hotspots", [])),
                        "hotspots": node_output.get("crowd_hotspots", []),
                    }
                elif node_name == "queue_analysis":
                    qt = node_output.get("queue_times", {})
                    step_data["data"] = {
                        "overloaded_count": len(qt.get("overloaded", [])) if isinstance(qt, dict) else 0,
                        "queue_times": qt,
                    }
                elif node_name == "routing":
                    route = node_output.get("recommended_route", {})
                    step_data["data"] = {
                        "total_walk_minutes": route.get("total_walk_minutes", 0) if isinstance(route, dict) else 0,
                        "route": route,
                    }
                elif node_name == "alerts":
                    step_data["data"] = {
                        "alerts_count": len(node_output.get("alerts", [])),
                        "alerts": node_output.get("alerts", []),
                    }
                elif node_name == "concierge":
                    step_data["data"] = {
                        "response": node_output.get("concierge_response", ""),
                    }

                if node_output.get("error"):
                    step_data["status"] = "error"
                    step_data["error"] = node_output["error"]

                yield f"data: {json.dumps(step_data)}\n\n"

    except Exception as e:
        logger.error(f"Agent pipeline error: {e}")
        yield f"data: {json.dumps({'step': 'error', 'message': str(e), 'status': 'error'})}\n\n"

    duration_ms = int((time.time() - start_time) * 1000)

    # Send completion event
    yield f"data: {json.dumps({'step': 'complete', 'message': 'Analysis complete', 'data': {'duration_ms': duration_ms}})}\n\n"

    # Log the run to Supabase
    try:
        from core.db import supabase as db
        db.table("agent_runs").insert({
            "query": query,
            "steps": [{"step": n, "label": NODE_META[n]["label"]} for n in node_order],
            "result": {"duration_ms": duration_ms},
            "duration_ms": duration_ms,
        }).execute()
    except Exception as log_err:
        logger.warning(f"Failed to log agent run: {log_err}")