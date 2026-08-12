from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.user import User
from app.models.responder import Responder
from app.models.contact import EmergencyContact
from app.models.medical_profile import MedicalProfile
from app.core.security import get_password_hash

MOCK_RESPONDERS = [
    {
        "email": "peter.parker@webguardian.io",
        "full_name": "Peter Parker (Spider-Man)",
        "phone_number": "+1-555-0199",
        "responder_type": "rapid_response_medic",
        "lat_offset": 0.008,
        "lon_offset": 0.005
    },
    {
        "email": "miles.morales@webguardian.io",
        "full_name": "Miles Morales (Web Strike Medic)",
        "phone_number": "+1-555-0188",
        "responder_type": "police_unit",
        "lat_offset": -0.006,
        "lon_offset": 0.009
    },
    {
        "email": "gwen.stacy@webguardian.io",
        "full_name": "Gwen Stacy (Ghost-Spider Rescue)",
        "phone_number": "+1-555-0177",
        "responder_type": "fire_rescue",
        "lat_offset": 0.012,
        "lon_offset": -0.007
    },
    {
        "email": "miguel.ohara@webguardian.io",
        "full_name": "Miguel O'Hara (Spider 2099 Tactical)",
        "phone_number": "+1-555-0209",
        "responder_type": "paramedic_specialist",
        "lat_offset": -0.015,
        "lon_offset": -0.011
    },
    {
        "email": "jessica.drew@webguardian.io",
        "full_name": "Jessica Drew (Spider-Woman Shield)",
        "phone_number": "+1-555-0155",
        "responder_type": "volunteer_first_responder",
        "lat_offset": 0.003,
        "lon_offset": -0.014
    }
]

def seed_database(db: Session, base_lat: float = 12.9716, base_lon: float = 77.5946):
    """
    Seeds mock verified responders near base_lat / base_lon coordinates.
    Also creates a default demo user with emergency contacts & WebShield medical profile.
    """
    # Create extension if postgis supported
    try:
        db.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'))
        db.execute(text('CREATE EXTENSION IF NOT EXISTS "postgis";'))
        db.commit()
    except Exception as e:
        print(f"[Seed] PostGIS extension creation notice: {e}")
        db.rollback()

    # Check if demo user exists
    demo_user = db.query(User).filter(User.email == "victim@webguardian.io").first()
    if not demo_user:
        demo_user = User(
            email="victim@webguardian.io",
            hashed_password=get_password_hash("password123"),
            full_name="Mary Jane Watson",
            phone_number="+1-555-0100",
            role="user"
        )
        db.add(demo_user)
        db.flush()

        # Seed Emergency Contacts for victim
        c1 = EmergencyContact(
            user_id=demo_user.id,
            name="Aunt May",
            relationship="Guardian / Aunt",
            phone_number="+1-555-9911"
        )
        c2 = EmergencyContact(
            user_id=demo_user.id,
            name="Ned Leeds",
            relationship="Trusted Friend",
            phone_number="+1-555-9922"
        )
        db.add_all([c1, c2])

        # Seed WebShield Medical Profile
        med_profile = MedicalProfile(
            user_id=demo_user.id,
            blood_group="O Negative",
            allergies="Penicillin, Peanuts",
            medical_notes="History of mild asthma; carries inhaler in jacket pocket.",
            pre_existing_conditions="Asthma",
            share_blood_group=True,
            share_allergies=True,
            share_medical_notes=True
        )
        db.add(med_profile)
        db.commit()
        print("[Seed] Created demo victim user with WebShield medical profile and emergency contacts.")

    # Seed mock responders
    for r_data in MOCK_RESPONDERS:
        existing = db.query(User).filter(User.email == r_data["email"]).first()
        if not existing:
            r_user = User(
                email=r_data["email"],
                hashed_password=get_password_hash("responder123"),
                full_name=r_data["full_name"],
                phone_number=r_data["phone_number"],
                role="responder"
            )
            db.add(r_user)
            db.flush()

            resp_lat = base_lat + r_data["lat_offset"]
            resp_lon = base_lon + r_data["lon_offset"]

            # Try setting PostGIS geography geometry point
            wkt_point = f"SRID=4326;POINT({resp_lon} {resp_lat})"
            
            resp = Responder(
                user_id=r_user.id,
                responder_type=r_data["responder_type"],
                is_verified=True,
                is_available=True,
                longitude=resp_lon,
                latitude=resp_lat
            )
            
            try:
                # PostGIS Geometry point SQL update
                resp.current_location = wkt_point
            except Exception:
                pass

            db.add(resp)
            db.commit()
            print(f"[Seed] Added verified responder: {r_data['full_name']} at ({resp_lat}, {resp_lon})")
