from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class MedicalProfileUpdate(BaseModel):
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    medical_notes: Optional[str] = None
    pre_existing_conditions: Optional[str] = None
    share_blood_group: Optional[bool] = True
    share_allergies: Optional[bool] = True
    share_medical_notes: Optional[bool] = True

class MedicalProfileResponse(BaseModel):
    id: UUID
    user_id: UUID
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    medical_notes: Optional[str] = None
    pre_existing_conditions: Optional[str] = None
    share_blood_group: bool
    share_allergies: bool
    share_medical_notes: bool

    class Config:
        from_attributes = True

class ResponderViewWebShield(BaseModel):
    """Filtered medical profile presented to responder respecting victim's privacy toggles"""
    victim_name: str
    victim_phone: str
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    medical_notes: Optional[str] = None
    emergency_contacts: list = []
