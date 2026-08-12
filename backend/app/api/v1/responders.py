from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.sos import ResponderCandidate
from app.services.matching import find_nearest_responders

router = APIRouter()

@router.get("/nearby", response_model=List[ResponderCandidate])
def get_nearby_responders(
    latitude: float = Query(..., description="Center latitude"),
    longitude: float = Query(..., description="Center longitude"),
    radius_meters: float = Query(10000.0, description="Search radius in meters"),
    db: Session = Depends(get_db)
):
    """
    WebPulse Spatial Radar:
    Returns list of verified available responders ordered by PostGIS ST_Distance.
    """
    return find_nearest_responders(
        db=db,
        victim_lat=latitude,
        victim_lon=longitude,
        radius_meters=radius_meters,
        limit=10
    )
