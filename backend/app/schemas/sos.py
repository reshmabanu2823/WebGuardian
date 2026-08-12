from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class SOSCreateRequest(BaseModel):
    latitude: float = Field(..., description="Victim current GPS latitude")
    longitude: float = Field(..., description="Victim current GPS longitude")
    trigger_type: Optional[str] = Field("MANUAL_SOS", description="MANUAL_SOS (Phase 1)")

class ResponderCandidate(BaseModel):
    responder_id: UUID
    full_name: str
    phone_number: str
    responder_type: str
    latitude: float
    longitude: float
    distance_meters: float

class SOSResponse(BaseModel):
    request_id: UUID
    status: str
    victim_id: UUID
    victim_latitude: float
    victim_longitude: float
    matched_responder: Optional[ResponderCandidate] = None
    notified_contacts_count: int
    created_at: datetime

    class Config:
        from_attributes = True
