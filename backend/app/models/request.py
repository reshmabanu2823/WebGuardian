import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from geoalchemy2 import Geography
from datetime import datetime, timezone

from app.core.database import Base

class EmergencyRequest(Base):
    __tablename__ = "emergency_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    victim_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    responder_id = Column(UUID(as_uuid=True), ForeignKey("responders.id", ondelete="SET NULL"), nullable=True)
    
    status = Column(String(30), default="PENDING", nullable=False, index=True) # PENDING, ACCEPTED, EN_ROUTE, ARRIVED, RESOLVED, CANCELLED
    
    # PostGIS Locations
    victim_location = Column(Geography(geometry_type='POINT', srid=4326), nullable=True)
    responder_location = Column(Geography(geometry_type='POINT', srid=4326), nullable=True)
    
    # Lat/Lon float helpers
    victim_latitude = Column(Float, nullable=False)
    victim_longitude = Column(Float, nullable=False)
    responder_latitude = Column(Float, nullable=True)
    responder_longitude = Column(Float, nullable=True)

    trigger_type = Column(String(30), default="MANUAL_SOS") # MANUAL_SOS (Phase 1), FALL_DETECTED (Phase 2), IOT_TRIGGER (Phase 2)
    severity_score = Column(Integer, default=50)            # 1-100 (Phase 2 AI engine stub)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    accepted_at = Column(DateTime(timezone=True), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    victim = relationship("User", back_populates="emergency_requests")
    responder = relationship("Responder", back_populates="accepted_requests")
