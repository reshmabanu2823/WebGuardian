from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.db.seed import seed_database
from app.api.v1 import auth, sos, responders, requests, shield, websockets

# Create database tables if database server is reachable
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"[Database Init Warning] Could not connect to PostgreSQL on startup: {e}")
    print("[Database Init Info] Please start PostgreSQL/PostGIS (e.g. 'docker-compose up -d') to run DB queries.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Seed database on startup
@app.on_event("startup")
def startup_event():
    try:
        db = SessionLocal()
        try:
            seed_database(db)
        finally:
            db.close()
    except Exception as e:
        print(f"[Seed Event Info] Database not ready yet for auto-seeding: {e}")


# Mount API V1 Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Auth"])
app.include_router(sos.router, prefix=f"{settings.API_V1_STR}", tags=["SpiderSense SOS"])
app.include_router(responders.router, prefix=f"{settings.API_V1_STR}/responders", tags=["WebPulse Responders"])
app.include_router(requests.router, prefix=f"{settings.API_V1_STR}/requests", tags=["WebRescue Requests"])
app.include_router(shield.router, prefix=f"{settings.API_V1_STR}/shield", tags=["WebShield Medical Privacy Profile"])
app.include_router(websockets.router, prefix=f"{settings.API_V1_STR}", tags=["WebTrace Real-Time Tracking"])

@app.get("/")
def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "branding": "Spider-Man Emergency Network",
        "modules": {
            "SpiderSense": "Manual SOS Panic Trigger",
            "WebPulse": "PostGIS Nearest-Responder Spatial Matching",
            "WebTrace": "WebSocket Dual Live Tracking",
            "WebRescue": "Responder Dispatch & Acceptance",
            "WebShield": "Privacy-Controlled Emergency Medical Profile",
            "WebAI": "Phase 2 Severity Scoring Engine [TODO Stub]"
        }
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
