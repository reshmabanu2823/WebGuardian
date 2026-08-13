from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.schemas.sos import ResponderCandidate
from app.services.matching import find_nearest_responders

router = APIRouter()

@router.get("/nearby", response_model=List[ResponderCandidate])
@router.get("", response_model=List[ResponderCandidate])
def get_nearby_responders(
    latitude: Optional[float] = Query(12.9716, description="Center latitude"),
    longitude: Optional[float] = Query(77.5946, description="Center longitude"),
    radius_meters: float = Query(10000.0, description="Search radius in meters"),
    db: Session = Depends(get_db)
):
    """
    WebPulse Spatial Radar:
    Returns list of verified available responders ordered by PostGIS ST_Distance.
    """
    return find_nearest_responders(
        db=db,
        victim_lat=latitude if latitude is not None else 12.9716,
        victim_lon=longitude if longitude is not None else 77.5946,
        radius_meters=radius_meters,
        limit=10
    )
