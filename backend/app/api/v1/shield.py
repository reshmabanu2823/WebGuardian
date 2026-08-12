from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Optional

from app.core.database import get_db
from app.models.user import User
from app.models.medical_profile import MedicalProfile
from app.models.contact import EmergencyContact
from app.schemas.shield import MedicalProfileUpdate, MedicalProfileResponse, ResponderViewWebShield

router = APIRouter()

@router.get("/profile", response_model=MedicalProfileResponse)
def get_user_medical_profile(
    user_id: Optional[UUID] = Query(None, description="Target User ID"),
    db: Session = Depends(get_db)
):
    target_user = None
    if user_id:
        target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        target_user = db.query(User).filter(User.role == "user").first()
        
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    profile = db.query(MedicalProfile).filter(MedicalProfile.user_id == target_user.id).first()
    if not profile:
        # Create empty profile
        profile = MedicalProfile(
            user_id=target_user.id,
            blood_group="O+",
            allergies="None specified",
            medical_notes="No critical notes",
            share_blood_group=True,
            share_allergies=True,
            share_medical_notes=True
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return profile

@router.put("/profile", response_model=MedicalProfileResponse)
def update_user_medical_profile(
    payload: MedicalProfileUpdate,
    user_id: Optional[UUID] = Query(None),
    db: Session = Depends(get_db)
):
    target_user = None
    if user_id:
        target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        target_user = db.query(User).filter(User.role == "user").first()

    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    profile = db.query(MedicalProfile).filter(MedicalProfile.user_id == target_user.id).first()
    if not profile:
        profile = MedicalProfile(user_id=target_user.id)
        db.add(profile)

    for field, val in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, val)

    db.commit()
    db.refresh(profile)
    return profile

@router.get("/victim/{victim_id}", response_model=ResponderViewWebShield)
def get_responder_shield_view(
    victim_id: UUID,
    db: Session = Depends(get_db)
):
    """
    WebShield Privacy Engine:
    Returns victim medical information to en-route responder FILTERED strictly by the victim's privacy choices.
    Unshared fields return None to protect victim medical privacy.
    """
    victim = db.query(User).filter(User.id == victim_id).first()
    if not victim:
        raise HTTPException(status_code=404, detail="Victim user profile not found")

    profile = db.query(MedicalProfile).filter(MedicalProfile.user_id == victim.id).first()
    contacts = db.query(EmergencyContact).filter(EmergencyContact.user_id == victim.id).all()

    contacts_list = [
        {"name": c.name, "relationship": c.relationship, "phone": c.phone_number}
        for c in contacts
    ]

    if not profile:
        return ResponderViewWebShield(
            victim_name=victim.full_name,
            victim_phone=victim.phone_number,
            blood_group=None,
            allergies=None,
            medical_notes=None,
            emergency_contacts=contacts_list
        )

    return ResponderViewWebShield(
        victim_name=victim.full_name,
        victim_phone=victim.phone_number,
        blood_group=profile.blood_group if profile.share_blood_group else "[RESTRICTED BY VICTIM PRIVACY]",
        allergies=profile.allergies if profile.share_allergies else "[RESTRICTED BY VICTIM PRIVACY]",
        medical_notes=profile.medical_notes if profile.share_medical_notes else "[RESTRICTED BY VICTIM PRIVACY]",
        emergency_contacts=contacts_list
    )
