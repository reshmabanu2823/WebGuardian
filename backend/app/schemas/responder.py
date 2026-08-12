from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class LocationUpdate(BaseModel):
    latitude: float
    longitude: float

class ResponderResponse(BaseModel):
    id: UUID
    user_id: UUID
    responder_type: str
    is_verified: bool
    is_available: bool
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    class Config:
        from_attributes = True
