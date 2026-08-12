from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional

from app.core.database import get_db
from app.models.user import User
from app.models.request import EmergencyRequest
from app.models.responder import Responder
from app.schemas.sos import SOSCreateRequest, SOSResponse
from app.services.matching import find_nearest_responders
from app.services.notifications import dispatch_emergency_notifications

router = APIRouter()

@router.post("/sos", response_model=SOSResponse)
def trigger_sos(
    payload: SOSCreateRequest, 
    user_id: Optional[str] = None, # Optional query param for test demo convenience
    db: Session = Depends(get_db)
):
    """
    SpiderSense SOS Trigger:
    1. Captures victim GPS location.
    2. Runs PostGIS ST_DWithin / ST_Distance query to match closest verified responder.
    3. Notifies user emergency contacts via WebPulse.
    4. Initializes emergency request for live WebSocket tracking.
    """
    # Fetch or default demo user
    victim = None
    if user_id:
        victim = db.query(User).filter(User.id == user_id).first()
    if not victim:
        victim = db.query(User).filter(User.role == "user").first()
    
    if not victim:
        raise HTTPException(status_code=400, detail="No registered victim user found. Please register/seed first.")

    # Match nearest responder via PostGIS
    candidates = find_nearest_responders(
        db=db,
        victim_lat=payload.latitude,
        victim_lon=payload.longitude,
        radius_meters=15000.0, # 15km search radius
        limit=5
    )

    matched_candidate = candidates[0] if candidates else None
    assigned_responder_id = matched_candidate.responder_id if matched_candidate else None

    # Create Emergency Request
    wkt_point = f"SRID=4326;POINT({payload.longitude} {payload.latitude})"
    req = EmergencyRequest(
        victim_id=victim.id,
        responder_id=assigned_responder_id,
        status="PENDING",
        victim_latitude=payload.latitude,
        victim_longitude=payload.longitude,
        trigger_type=payload.trigger_type or "MANUAL_SOS",
        severity_score=50 # Baseline MVP score
    )

    try:
        req.victim_location = wkt_point
    except Exception:
        pass

    db.add(req)
    db.commit()
    db.refresh(req)

    # Dispatch emergency notifications to victim's contacts
    dispatch_res = dispatch_emergency_notifications(
        db=db,
        user_id=str(victim.id),
        request_id=str(req.id),
        lat=payload.latitude,
        lon=payload.longitude
    )

    return SOSResponse(
        request_id=req.id,
        status=req.status,
        victim_id=victim.id,
        victim_latitude=payload.latitude,
        victim_longitude=payload.longitude,
        matched_responder=matched_candidate,
        notified_contacts_count=dispatch_res["notified_count"],
        created_at=req.created_at
    )
