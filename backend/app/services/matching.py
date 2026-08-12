import math
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text, func

from app.models.responder import Responder
from app.models.user import User
from app.schemas.sos import ResponderCandidate

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Fallback Haversine formula calculation in meters"""
    R = 6371000.0 # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c

def find_nearest_responders(
    db: Session, 
    victim_lat: float, 
    victim_lon: float, 
    radius_meters: float = 10000.0,
    limit: int = 5
) -> List[ResponderCandidate]:
    """
    Finds nearest verified available responders using PostGIS ST_DWithin and ST_Distance.
    Falls back to Python Haversine calculation if PostGIS extension is not present in environment.
    """
    try:
        # Core PostGIS Query using ST_DWithin and ST_Distance on geography(Point, 4326)
        query = text("""
            SELECT 
                r.id AS responder_id,
                u.full_name,
                u.phone_number,
                r.responder_type,
                r.latitude,
                r.longitude,
                ST_Distance(
                    r.current_location, 
                    ST_MakePoint(:victim_lon, :victim_lat)::geography
                ) AS distance_meters
            FROM responders r
            JOIN users u ON r.user_id = u.id
            WHERE r.is_available = TRUE
              AND r.is_verified = TRUE
              AND r.current_location IS NOT NULL
              AND ST_DWithin(
                    r.current_location, 
                    ST_MakePoint(:victim_lon, :victim_lat)::geography, 
                    :radius_meters
              )
            ORDER BY distance_meters ASC
            LIMIT :limit;
        """)

        result = db.execute(query, {
            "victim_lat": victim_lat,
            "victim_lon": victim_lon,
            "radius_meters": radius_meters,
            "limit": limit
        }).fetchall()

        candidates = []
        for row in result:
            candidates.append(ResponderCandidate(
                responder_id=row.responder_id,
                full_name=row.full_name,
                phone_number=row.phone_number,
                responder_type=row.responder_type,
                latitude=row.latitude,
                longitude=row.longitude,
                distance_meters=round(row.distance_meters, 2)
            ))

        if candidates:
            return candidates

    except Exception as e:
        # Fallback path if spatial queries fail or when PostGIS extension is pending initialization
        print(f"[Matching Service] PostGIS spatial query fallback activated: {e}")

    # Fallback Python calculation using stored lat/lon fields
    responders = db.query(Responder, User).join(User, Responder.user_id == User.id)\
        .filter(Responder.is_available == True, Responder.is_verified == True).all()

    candidates = []
    for r, u in responders:
        if r.latitude is not None and r.longitude is not None:
            dist = haversine_distance(victim_lat, victim_lon, r.latitude, r.longitude)
            if dist <= radius_meters:
                candidates.append(ResponderCandidate(
                    responder_id=r.id,
                    full_name=u.full_name,
                    phone_number=u.phone_number,
                    responder_type=r.responder_type,
                    latitude=r.latitude,
                    longitude=r.longitude,
                    distance_meters=round(dist, 2)
                ))

    # Sort by distance
    candidates.sort(key=lambda x: x.distance_meters)
    return candidates[:limit]
