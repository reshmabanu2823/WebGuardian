# 🕸️ WebGuardian — Emergency Response Network (Phase 1 MVP)

WebGuardian is a Spider-Man themed emergency response platform built around a high-performance "web" spatial network concept. 

---

## 🌟 Key Features (Phase 1 MVP)

1. **SpiderSense SOS Trigger**: Manual panic button with 3-second safeguard countdown that captures GPS location coordinates (`POST /api/v1/sos`).
2. **WebPulse Spatial Radar**: PostGIS `ST_DWithin` & `ST_Distance` matching query that pairs the victim with the nearest verified available responder.
3. **WebTrace Live Tracking**: Bi-directional real-time location stream between victim and responder powered by WebSockets (`ws://.../api/v1/track/{request_id}`).
4. **WebShield Emergency Profile**: Privacy-controlled medical record. Responders see blood type, allergies, and notes **only if the victim granted consent**.
5. **Phase 2 TODO Architecture Preview**: Visual preview cards reserving endpoints and namespaces for Fall Detection, WebAI Severity Engine, and IoT Wearable telemetry.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite, Leaflet maps, Lucide icons, Vanilla CSS dark mode theme)
- **Backend**: Python FastAPI (Uvicorn, Pydantic v2, SQLAlchemy)
- **Database**: PostgreSQL with PostGIS extension (`geography(Point, 4326)`)
- **Real-Time**: WebSockets (`ws://`)

---

## 🚀 Quick Start Instructions

### Option 1: Run with Docker Compose (PostgreSQL + PostGIS + FastAPI Backend)

```bash
# 1. Start PostgreSQL with PostGIS & Backend Container
cd backend
docker-compose up --build -d

# 2. Run React Frontend
cd ../frontend
npm install
npm run dev
```

### Option 2: Run Backend & Frontend Locally

```bash
# Backend (FastAPI)
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000

# Frontend (React + Vite)
cd frontend
npm install
npm run dev
```

Frontend app will open at: `http://localhost:3000`  
Backend OpenAPI Docs available at: `http://localhost:8000/docs`

---

## 📐 PostGIS Spatial Query Schema

```sql
SELECT 
    r.id AS responder_id,
    u.full_name,
    u.phone_number,
    r.responder_type,
    ST_X(r.current_location::geometry) AS longitude,
    ST_Y(r.current_location::geometry) AS latitude,
    ST_Distance(r.current_location, ST_MakePoint(:victim_lon, :victim_lat)::geography) AS distance_meters
FROM responders r
JOIN users u ON r.user_id = u.id
WHERE r.is_available = TRUE
  AND r.is_verified = TRUE
  AND ST_DWithin(r.current_location, ST_MakePoint(:victim_lon, :victim_lat)::geography, :radius_meters)
ORDER BY distance_meters ASC
LIMIT 5;
```
