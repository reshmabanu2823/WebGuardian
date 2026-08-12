import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from geoalchemy2 import Geography
from datetime import datetime, timezone

from app.core.database import Base

class Responder(Base):
    __tablename__ = "responders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    responder_type = Column(String(50), nullable=False) # 'medic', 'police', 'fire', 'volunteer'
    is_verified = Column(Boolean, default=False, index=True) # Verification flow flag
    is_available = Column(Boolean, default=True, index=True)
    
    # PostGIS Geography Column (Point, WGS84 EPSG 4326)
    current_location = Column(Geography(geometry_type='POINT', srid=4326), nullable=True)
    
    # Direct float fields for lightweight caching & fallbacks
    longitude = Column(Float, nullable=True)
    latitude = Column(Float, nullable=True)
    
    last_location_update = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="responder_profile")
    accepted_requests = relationship("EmergencyRequest", back_populates="responder")
