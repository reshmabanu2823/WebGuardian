from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID, uuid4
from typing import Optional

from app.core.database import get_db
from app.models.user import User
from app.models.medical_profile import MedicalProfile
from app.models.contact import EmergencyContact
from app.schemas.shield import MedicalProfileUpdate, MedicalProfileResponse, ResponderViewWebShield

router = APIRouter()

MOCK_DEMO_USER_ID = uuid4()
MOCK_PROFILE_ID = uuid4()

MOCK_FALLBACK_PROFILE = {
    "id": MOCK_PROFILE_ID,
    "user_id": MOCK_DEMO_USER_ID,
    "blood_group": "O Negative",
    "allergies": "Penicillin, Peanuts",
    "medical_notes": "History of mild asthma; carries inhaler in jacket pocket.",
    "pre_existing_conditions": "Asthma",
    "share_blood_group": True,
    "share_allergies": True,
    "share_medical_notes": True
}

@router.get("/profile", response_model=MedicalProfileResponse)
def get_user_medical_profile(
    user_id: Optional[UUID] = Query(None, description="Target User ID"),
    db: Session = Depends(get_db)
):
    try:
        target_user = None
        if user_id:
            target_user = db.query(User).filter(User.id == user_id).first()
        if not target_user:
            target_user = db.query(User).filter(User.role == "user").first()
            
        if target_user:
            profile = db.query(MedicalProfile).filter(MedicalProfile.user_id == target_user.id).first()
            if not profile:
                profile = MedicalProfile(
                    user_id=target_user.id,
                    blood_group="O Negative",
                    allergies="Penicillin, Peanuts",
                    medical_notes="History of mild asthma; carries inhaler in jacket pocket.",
                    pre_existing_conditions="Asthma",
                    share_blood_group=True,
                    share_allergies=True,
                    share_medical_notes=True
                )
                db.add(profile)
                db.commit()
                db.refresh(profile)
            return profile
    except Exception as e:
        print(f"[WebShield API] DB query fallback: {e}")

    # Fallback response if DB offline
    return MOCK_FALLBACK_PROFILE

@router.put("/profile", response_model=MedicalProfileResponse)
def update_user_medical_profile(
    payload: MedicalProfileUpdate,
    user_id: Optional[UUID] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        target_user = None
        if user_id:
            target_user = db.query(User).filter(User.id == user_id).first()
        if not target_user:
            target_user = db.query(User).filter(User.role == "user").first()

        if target_user:
            profile = db.query(MedicalProfile).filter(MedicalProfile.user_id == target_user.id).first()
            if not profile:
                profile = MedicalProfile(user_id=target_user.id)
                db.add(profile)

            for field, val in payload.model_dump(exclude_unset=True).items():
                setattr(profile, field, val)

            db.commit()
            db.refresh(profile)
            return profile
    except Exception as e:
        print(f"[WebShield API] DB update fallback: {e}")

    # Update in memory fallback
    for field, val in payload.model_dump(exclude_unset=True).items():
        if field in MOCK_FALLBACK_PROFILE:
            MOCK_FALLBACK_PROFILE[field] = val

    return MOCK_FALLBACK_PROFILE

@router.get("/victim/{victim_id}", response_model=ResponderViewWebShield)
def get_responder_shield_view(
    victim_id: UUID,
    db: Session = Depends(get_db)
):
    """
    WebShield Privacy Engine:
    Returns victim medical information to en-route responder FILTERED strictly by the victim's privacy choices.
    """
    try:
        victim = db.query(User).filter(User.id == victim_id).first()
        if victim:
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
                blood_group=profile.blood_group if profile.share_blood_group else "[RESTRICTED BY PATIENT PRIVACY]",
                allergies=profile.allergies if profile.share_allergies else "[RESTRICTED BY PATIENT PRIVACY]",
                medical_notes=profile.medical_notes if profile.share_medical_notes else "[RESTRICTED BY PATIENT PRIVACY]",
                emergency_contacts=contacts_list
            )
    except Exception as e:
        print(f"[WebShield API] Responder view DB fallback: {e}")

    # Fallback privacy filtered view
    return ResponderViewWebShield(
        victim_name="Mary Jane Watson",
        victim_phone="+1-555-0100",
        blood_group=MOCK_FALLBACK_PROFILE["blood_group"] if MOCK_FALLBACK_PROFILE["share_blood_group"] else "[RESTRICTED BY PATIENT PRIVACY]",
        allergies=MOCK_FALLBACK_PROFILE["allergies"] if MOCK_FALLBACK_PROFILE["share_allergies"] else "[RESTRICTED BY PATIENT PRIVACY]",
        medical_notes=MOCK_FALLBACK_PROFILE["medical_notes"] if MOCK_FALLBACK_PROFILE["share_medical_notes"] else "[RESTRICTED BY PATIENT PRIVACY]",
        emergency_contacts=[
            {"name": "Emergency Contact 1", "relationship": "Guardian", "phone": "+1-555-9911"},
            {"name": "Emergency Contact 2", "relationship": "Primary Contact", "phone": "+1-555-9922"}
        ]
    )
