import asyncio
import json
import logging
import random
from typing import List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

logger = logging.getLogger(__name__)

router = APIRouter()

# --- Simulation State ---
PHASES = ["Ingress", "Steady State", "Intermission", "Egress"]
current_phase = "Ingress"

# --- WebSocket Manager ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        # Convert message to JSON string
        msg_str = json.dumps(message)
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_text(msg_str)
            except Exception as e:
                logger.error(f"Error sending to WS: {e}")
                dead_connections.append(connection)
        for dead in dead_connections:
            self.disconnect(dead)

manager = ConnectionManager()

# --- Baseline Data Generators ---

def generate_gates_data(phase: str):
    # 4 Gates
    gates = []
    base_throughput = {"Ingress": 800, "Steady State": 150, "Intermission": 100, "Egress": 1200}[phase]
    base_queue = {"Ingress": 250, "Steady State": 20, "Intermission": 10, "Egress": 300}[phase]
    
    for i in range(4):
        throughput = max(0, int(random.gauss(base_throughput, base_throughput * 0.2)))
        queue = max(0, int(random.gauss(base_queue, base_queue * 0.2)))
        wait_time = max(0.0, round(queue / max(throughput / 60, 1), 1))
        
        gates.append({
            "id": f"gate-{i+1}",
            "name": f"Gate {chr(65+i)}",
            "throughput": throughput,
            "queue_length": queue,
            "wait_time_minutes": wait_time,
            "congestion": "critical" if wait_time > 10 else "high" if wait_time > 5 else "moderate" if wait_time > 2 else "low"
        })
    return gates

def generate_fb_data(phase: str):
    # 6 F&B stalls
    fb_stalls = []
    base_queue = {"Ingress": 10, "Steady State": 30, "Intermission": 150, "Egress": 5}[phase]
    names = ["Grill 210", "Drinks 212", "Snacks 225", "Pizza Express", "BBQ Station", "Craft Beer"]
    
    for i in range(6):
        queue = max(0, int(random.gauss(base_queue, base_queue * 0.3)))
        wait_time = max(0.0, round(queue / 8, 1)) # approx 8 people served per minute
        
        fb_stalls.append({
            "id": f"fb-{i+1}",
            "name": names[i],
            "queue_length": queue,
            "wait_time_minutes": wait_time,
            "congestion": "critical" if wait_time > 15 else "high" if wait_time > 8 else "moderate" if wait_time > 3 else "low"
        })
    return fb_stalls

def generate_restroom_data(phase: str):
    # 4 Restroom blocks
    restrooms = []
    base_queue = {"Ingress": 15, "Steady State": 40, "Intermission": 200, "Egress": 20}[phase]
    names = ["Sec 114 Restrooms", "Sec 214 Restrooms", "Sec 314 Restrooms", "Sec 414 Restrooms"]
    
    for i in range(4):
        queue = max(0, int(random.gauss(base_queue, base_queue * 0.25)))
        wait_time = max(0.0, round(queue / 15, 1)) # approx 15 people served per min
        
        restrooms.append({
            "id": f"restroom-{i+1}",
            "name": names[i],
            "queue_length": queue,
            "wait_time_minutes": wait_time,
            "congestion": "critical" if wait_time > 10 else "high" if wait_time > 5 else "moderate" if wait_time > 2 else "low"
        })
    return restrooms

# --- Background Task ---
async def simulation_loop():
    global current_phase
    logger.info("Starting simulation loop")
    while True:
        try:
            # Generate fluctuating data
            payload = {
                "phase": current_phase,
                "timestamp": asyncio.get_event_loop().time(),
                "gates": generate_gates_data(current_phase),
                "concessions": generate_fb_data(current_phase),
                "restrooms": generate_restroom_data(current_phase)
            }
            # Broadcast to clients
            if manager.active_connections:
                await manager.broadcast(payload)
                
            # Wait 3 to 5 seconds
            await asyncio.sleep(random.uniform(3, 5))
        except Exception as e:
            logger.error(f"Simulation loop error: {e}")
            await asyncio.sleep(5)

# --- Routes ---

@router.websocket("/ws/simulation")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive, can accept messages if needed
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

class PhaseOverrideRequest(BaseModel):
    phase: str

@router.post("/simulation/phase")
async def override_phase(request: PhaseOverrideRequest):
    global current_phase
    if request.phase in PHASES:
        current_phase = request.phase
        return {"status": "success", "phase": current_phase}
    return {"status": "error", "message": f"Invalid phase. Must be one of {PHASES}"}
