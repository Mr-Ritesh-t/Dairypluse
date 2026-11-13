# Production Deployment Guide — DairyPulse

> **Document Version:** 1.0.0  
> **Team:** NEXURA  
> **Target Cloud Platforms:** Vercel (Frontend) | Render / Railway / Docker (Backend) | Supabase / Render (PostgreSQL)  

---

## 1. Verified Deployment Assets Discovered in Repository

The DairyPulse codebase contains several production-ready deployment configurations:

| Configuration File | Path | Target Infrastructure | Purpose |
|---|---|---|---|
| **Render Cloud Blueprint** | `render.yaml` | Render.com | Automated deployment of FastAPI backend service (`web`) and managed PostgreSQL database (`db`) |
| **Backend Dockerfile** | `backend/Dockerfile` | Any Container Host (AWS ECS, GCP Cloud Run, Railway) | Multi-stage production container build using `python:3.10-slim` |
| **Procfile** | `backend/Procfile` | Heroku / Render / Dokku | Declares ASGI web process: `web: uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Windows Dual Runner** | `start.bat` | Local Development | Starts both FastAPI (`localhost:8000`) and Next.js (`localhost:3000`) concurrently |
| **Deployment Notes** | `DEPLOYMENT.md` | General Operations | Instructions for environment variables and build verification |

---

## 2. Verified Configuration Files Inspection

### 2.1 Render Cloud Blueprint (`render.yaml`)
```yaml
services:
  - type: web
    name: dairypulse-backend
    env: python
    buildCommand: "pip install -r backend/requirements.txt"
    startCommand: "cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT"
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: dairypulse-db
          property: connectionString
      - key: SECRET_KEY
        generateValue: true
      - key: ALLOWED_ORIGINS
        value: "https://dairypulse.vercel.app"

databases:
  - name: dairypulse-db
    databaseName: dairypulse
    user: dairypulse_user
    plan: standard
```

### 2.2 Backend Production Dockerfile (`backend/Dockerfile`)
```dockerfile
FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
```

---

## 3. Step-by-Step Production Deployment Playbook

### Stage 1: Provision the PostgreSQL Database (Supabase or Render)
1. **Option A (Supabase):**
   - Create a project on [Supabase](https://supabase.com).
   - In Settings -> Database, copy the **Transaction Pooler Connection String** (Port `6543`) or Direct Connection String (Port `5432`).
   - Example URI: `postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres`.
2. **Option B (Render PostgreSQL):**
   - Render automatically provisions the database defined in `render.yaml`.
   - Copy the Internal Database URL: `postgresql://dairypulse_user:[PASSWORD]@dairypulse-db:5432/dairypulse`.

### Stage 2: Deploy the FastAPI Backend (Render or Railway)
1. Link your GitHub repository to Render or Railway.
2. Configure Environment Variables:
   - `DATABASE_URL`: Your PostgreSQL connection string. (Note: `database.py` automatically normalizes `postgres://` to `postgresql+psycopg2://`).
   - `SECRET_KEY`: A high-entropy 64-character secret string.
   - `ALLOWED_ORIGINS`: Comma-separated domains: `https://your-frontend.vercel.app,http://localhost:3000`.
   - `TIMEZONE`: `"Asia/Kolkata"`.
3. Set Build & Start Commands:
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Verify Deployment:
   - Make a `GET` request to `https://your-backend.onrender.com/health`.
   - Expected Response: `{"status":"healthy","service":"DairyPulse API","version":"1.0.0","database":"postgresql"}`.

### Stage 3: Initial Database Seeding
To populate initial multi-dairy test accounts, routes, and milk products on the cloud database:
```bash
# Run standalone cloud seeder from your local terminal pointing to the cloud DB:
$env:DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres"
python backend/seed_supabase.py
```

### Stage 4: Deploy the Next.js 16 Frontend (Vercel)
1. Import the repository into [Vercel](https://vercel.com).
2. Set the **Root Directory** to `frontend`.
3. Framework Preset: **Next.js**.
4. Configure Production Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend.onrender.com/api/v1`
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://your-project.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `your-supabase-public-anon-key`
5. Click **Deploy**. Vercel will run `next build` and deploy the application globally across edge networks.

---

## 4. Production Health Checks & Monitoring

- **Uptime Monitoring:** Configure an external monitor (such as UptimeRobot, BetterUptime, or Pingdom) to poll `GET /health` every 5 minutes. This also prevents free-tier Render containers from going into sleep mode.
- **Log Inspection:** Uvicorn outputs structured HTTP access logs and SQLAlchemy errors directly to stdout/stderr.
- **Database Connection Pool Verification:** The SQLAlchemy connection pool is configured with `pool_pre_ping=True` and `pool_recycle=300`, automatically replacing dropped connections without restarting the web service.

---

This completes the production deployment specification.
