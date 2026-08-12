import json
from typing import Dict, List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.request import EmergencyRequest
from app.models.responder import Responder

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        # Maps request_id -> List of active WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, request_id: str, websocket: WebSocket):
        await websocket.accept()
        if request_id not in self.active_connections:
            self.active_connections[request_id] = []
        self.active_connections[request_id].append(websocket)
        print(f"[WebTrace Manager] Client connected to tracking channel room: {request_id}")

    def disconnect(self, request_id: str, websocket: WebSocket):
        if request_id in self.active_connections:
            if websocket in self.active_connections[request_id]:
                self.active_connections[request_id].remove(websocket)
            if not self.active_connections[request_id]:
                del self.active_connections[request_id]
        print(f"[WebTrace Manager] Client disconnected from channel room: {request_id}")

    async def broadcast(self, request_id: str, message: dict):
        if request_id in self.active_connections:
            for connection in self.active_connections[request_id]:
                await connection.send_json(message)

manager = ConnectionManager()

@router.websocket("/track/{request_id}")
async def websocket_tracking_endpoint(websocket: WebSocket, request_id: str):
    """
    WebTrace Real-Time WebSocket Channel:
    Streams live GPS location coordinates between victim and en-route responder.
    """
    await manager.connect(request_id, websocket)
    db = SessionLocal()
    try:
        # Send initial status
        req = db.query(EmergencyRequest).filter(EmergencyRequest.id == request_id).first()
        if req:
            await websocket.send_json({
                "type": "INITIAL_STATE",
                "request_id": str(req.id),
                "status": req.status,
                "victim_latitude": req.victim_latitude,
                "victim_longitude": req.victim_longitude,
                "responder_latitude": req.responder_latitude,
                "responder_longitude": req.responder_longitude
            })

        while True:
            data_str = await websocket.receive_text()
            data = json.loads(data_str)
            
            sender_role = data.get("role", "unknown") # "victim" or "responder"
            lat = float(data.get("latitude", 0.0))
            lon = float(data.get("longitude", 0.0))

            # Update database coordinates
            if req:
                if sender_role == "victim":
                    req.victim_latitude = lat
                    req.victim_longitude = lon
                elif sender_role == "responder":
                    req.responder_latitude = lat
                    req.responder_longitude = lon
                    if req.responder_id:
                        resp = db.query(Responder).filter(Responder.id == req.responder_id).first()
                        if resp:
                            resp.latitude = lat
                            resp.longitude = lon
                db.commit()

            # Broadcast live position update to both parties
            broadcast_payload = {
                "type": "LOCATION_UPDATE",
                "request_id": request_id,
                "sender_role": sender_role,
                "latitude": lat,
                "longitude": lon,
                "timestamp": data.get("timestamp")
            }

            await manager.broadcast(request_id, broadcast_payload)

    except WebSocketDisconnect:
        manager.disconnect(request_id, websocket)
    except Exception as e:
        print(f"[WebTrace WS Error] Exception on request_id {request_id}: {e}")
        manager.disconnect(request_id, websocket)
    finally:
        db.close()
