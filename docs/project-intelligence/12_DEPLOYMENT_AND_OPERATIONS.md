# DairyPulse — Deployment, DevOps & Infrastructure Operations

This document outlines the deployment architecture, configuration parameters, containerization, and operations procedures for DairyPulse.

---

## 1. Development vs. Production Setup

| Component | Development Environment | Production Target Environment |
| :--- | :--- | :--- |
| **Frontend Runtime** | `npm run dev` (Turbopack Hot Reload on `localhost:3000`) | `next build` ➔ `next start` (Node.js Cluster on Vercel / AWS ECS) |
| **Backend Runtime** | `uvicorn app.main:app --reload` (`127.0.0.1:8000`) | Gunicorn + Uvicorn Workers (`gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app`) |
| **Database** | SQLite embedded (`dairypulse.db`) with zero config | Managed PostgreSQL 15+ (AWS RDS / Supabase / Google Cloud SQL) |
| **Reverse Proxy** | None (Direct CORS with localhost) | Nginx or AWS Application Load Balancer with SSL/TLS (Let's Encrypt) |
| **Static Assets** | Served locally by Next.js | CloudFront / Vercel Edge CDN |

---

## 2. Startup & Execution Instructions

### 2.1 One-Click Windows Development Startup
Run the pre-configured script in the root directory:
```powershell
d:\coding\dairypluse\start.bat
```
This spawns two independent console windows:
1. `DairyPulse FastAPI Backend` running on `http://127.0.0.1:8000`.
2. `DairyPulse Next.js Frontend` running on `http://localhost:3000`.

### 2.2 Production Build Commands

#### Backend:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Or .\.venv\Scripts\Activate.ps1 on Windows
pip install -r requirements.txt
export DATABASE_URL="postgresql://user:password@prod-db.internal:5432/dairypulse"
export SECRET_KEY="generate-secure-production-random-key"
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

#### Frontend:
```bash
cd frontend
npm ci
export NEXT_PUBLIC_API_URL="https://api.dairypulse.farm/api/v1"
npm run build
npm run start -- -p 3000
```

---

## 3. Environment Variable Specification

Defined in `backend/app/config.py` and `.env.example`:

| Variable | Required | Default (Dev) | Description |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Optional | `sqlite:///./dairypulse.db` | Connection string for SQLite or PostgreSQL |
| `SECRET_KEY` | **Required in Prod** | `dairypulse-secret-key-development-2026` | Cryptographic secret for signing JWT tokens |
| `API_V1_STR` | Optional | `/api/v1` | URL prefix for REST endpoints |
| `TIMEZONE` | Optional | `Asia/Kolkata` | Operating timezone for morning delivery scheduling |
| `NEXT_PUBLIC_API_URL` | **Required in Prod** | `http://localhost:8000/api/v1` | Public API gateway URL accessed by browser clients |

---

## 4. Health Checks & Monitoring

The backend exposes an unauthenticated health check endpoint:

```
GET /health
```

### Verified Response:
```json
{
  "status": "healthy",
  "service": "DairyPulse API",
  "version": "1.0.0",
  "database": "sqlite"
}
```

This endpoint can be attached directly to AWS Route 53 or Kubernetes liveness/readiness probes to trigger automatic container restarts if the database connection drops.
