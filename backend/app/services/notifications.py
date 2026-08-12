from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.contact import EmergencyContact

def dispatch_emergency_notifications(
    db: Session, 
    user_id: str, 
    request_id: str, 
    lat: float, 
    lon: float
) -> Dict[str, Any]:
    """
    WebPulse Notification Dispatcher:
    Alerts victim's emergency contacts with GPS map coordinates link upon SOS trigger.
    (Mocked SMS Gateway for Phase 1 - Twilio/SNS integration point)
    """
    contacts = db.query(EmergencyContact).filter(
        EmergencyContact.user_id == user_id,
        EmergencyContact.notify_on_sos == True
    ).all()

    dispatched = []
    for c in contacts:
        alert_msg = (
            f"🚨 EMERGENCY ALERT (WebGuardian): {c.name}, your contact has triggered SpiderSense SOS! "
            f"GPS Location: https://maps.google.com/?q={lat},{lon} | Request ID: {request_id}"
        )
        print(f"[WebPulse Dispatcher] SMS sent to {c.name} ({c.phone_number}): {alert_msg}")
        dispatched.append({
            "contact_id": str(c.id),
            "name": c.name,
            "phone_number": c.phone_number,
            "status": "DELIVERED_MOCK"
        })

    return {
        "success": True,
        "notified_count": len(dispatched),
        "dispatches": dispatched
    }
