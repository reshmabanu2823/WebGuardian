from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from uuid import UUID
from typing import List, Optional

from app.core.database import get_db
from app.models.request import EmergencyRequest
from app.models.responder import Responder
from app.models.user import User

router = APIRouter()

@router.post("/{request_id}/accept")
def accept_emergency_request(
    request_id: UUID,
    responder_id: Optional[UUID] = None, # Optional responder_id override for testing
    db: Session = Depends(get_db)
):
    """
    WebRescue Flow: Responder accepts the active emergency request.
    Changes request status from PENDING to ACCEPTED / EN_ROUTE.
    """
    req = db.query(EmergencyRequest).filter(EmergencyRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Emergency request not found")

    if req.status == "ACCEPTED":
        return {
            "message": "Request already accepted",
            "request_id": str(req.id),
            "status": req.status,
            "responder_id": str(req.responder_id) if req.responder_id else None
        }

    # Assign responder
    if responder_id:
        responder = db.query(Responder).filter(Responder.id == responder_id).first()
        if responder:
            req.responder_id = responder.id
    elif not req.responder_id:
        # Pick first verified available responder if none assigned yet
        first_responder = db.query(Responder).filter(Responder.is_verified == True).first()
        if first_responder:
            req.responder_id = first_responder.id

    req.status = "ACCEPTED"
    req.accepted_at = datetime.now(timezone.utc)
    
    if req.responder_id:
        resp = db.query(Responder).filter(Responder.id == req.responder_id).first()
        if resp:
            resp.is_available = False

    db.commit()
    db.refresh(req)

    # Fetch victim details
    victim_user = db.query(User).filter(User.id == req.victim_id).first()
    responder_user = None
    if req.responder_id:
        r_obj = db.query(Responder).filter(Responder.id == req.responder_id).first()
        if r_obj:
            responder_user = db.query(User).filter(User.id == r_obj.user_id).first()

    return {
        "message": "Emergency request accepted by responder successfully",
        "request_id": str(req.id),
        "status": req.status,
        "accepted_at": req.accepted_at,
        "victim": {
            "id": str(victim_user.id) if victim_user else str(req.victim_id),
            "name": victim_user.full_name if victim_user else "Unknown Victim",
            "phone": victim_user.phone_number if victim_user else "Unknown",
            "latitude": req.victim_latitude,
            "longitude": req.victim_longitude
        },
        "responder": {
            "id": str(req.responder_id),
            "name": responder_user.full_name if responder_user else "Assigned Responder",
            "phone": responder_user.phone_number if responder_user else "N/A"
        }
    }

@router.get("/{request_id}")
def get_emergency_request(request_id: UUID, db: Session = Depends(get_db)):
    req = db.query(EmergencyRequest).filter(EmergencyRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Emergency request not found")

    victim = db.query(User).filter(User.id == req.victim_id).first()
    responder_info = None
    if req.responder_id:
        r = db.query(Responder).filter(Responder.id == req.responder_id).first()
        if r:
            r_u = db.query(User).filter(User.id == r.user_id).first()
            responder_info = {
                "id": str(r.id),
                "type": r.responder_type,
                "name": r_u.full_name if r_u else "Responder",
                "phone": r_u.phone_number if r_u else "N/A",
                "latitude": r.latitude,
                "longitude": r.longitude
            }

    return {
        "id": str(req.id),
        "status": req.status,
        "trigger_type": req.trigger_type,
        "severity_score": req.severity_score,
        "victim_id": str(req.victim_id),
        "victim_name": victim.full_name if victim else "Victim",
        "victim_latitude": req.victim_latitude,
        "victim_longitude": req.victim_longitude,
        "responder": responder_info,
        "created_at": req.created_at,
        "accepted_at": req.accepted_at
    }

@router.get("")
def list_active_requests(db: Session = Depends(get_db)):
    requests = db.query(EmergencyRequest).order_by(EmergencyRequest.created_at.desc()).all()
    results = []
    for req in requests:
        victim = db.query(User).filter(User.id == req.victim_id).first()
        results.append({
            "id": str(req.id),
            "status": req.status,
            "victim_name": victim.full_name if victim else "Victim",
            "victim_latitude": req.victim_latitude,
            "victim_longitude": req.victim_longitude,
            "created_at": req.created_at
        })
    return results
