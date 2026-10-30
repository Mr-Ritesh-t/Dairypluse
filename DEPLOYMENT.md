# 🚀 DairyPulse Cloud Deployment Guide
### Complete Setup: Vercel (Frontend) + Render (Backend) + Supabase (PostgreSQL)

This repository is pre-configured for instant zero-friction deployment across **Vercel**, **Render**, and **Supabase**.

```
┌────────────────────────┐      REST API Calls      ┌─────────────────────────┐
│     Vercel Edge        │ ───────────────────────> │     Render Web Service  │
│  Next.js 16 (Frontend) │                          │  FastAPI Python Backend │
└────────────────────────┘                          └───────────┬─────────────┘
                                                                │
                                                         SQLAlchemy Connection
                                                                ▼
                                                    ┌─────────────────────────┐
                                                    │    Supabase Managed     │
                                                    │   PostgreSQL Database   │
                                                    └─────────────────────────┘
```

---

## 📌 Step 1: Create Supabase PostgreSQL Database

1. Sign in or register at [supabase.com](https://supabase.com).
2. Click **New Project**:
   - **Name**: `dairypulse-db`
   - **Database Password**: Set a strong password (save this!).
   - **Region**: Choose the region closest to your users (e.g., `Mumbai / ap-south-1` or `Frankfurt`).
3. Once the database is provisioned (approx. 1-2 minutes):
   - Go to **Project Settings** (gear icon) -> **Database**.
   - Scroll down to **Connection parameters** -> **Connection string**.
   - Select **URI** and choose **Session** pooler (port `5432` or `6543` for transaction pooling).
   - Your connection string will look like:
     ```
     postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
     ```
   - Replace `[YOUR-PASSWORD]` with your real database password.

*(Optional Local Test)*: You can test and seed your Supabase database from your local terminal:
```bash
cd backend
# Windows PowerShell:
$env:DATABASE_URL="your-supabase-connection-string"
python seed_supabase.py
```
*Note: DairyPulse also automatically initializes tables and seeds the product catalog on its first launch!*

---

## 📌 Step 2: Deploy FastAPI Backend on Render

1. Sign in to [render.com](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository (`dairypluse`).
4. Configure the web service settings:
   - **Name**: `dairypulse-backend` (or your preferred name)
   - **Region**: Same or close to your Supabase region (e.g. `Singapore` or `Frankfurt`)
   - **Branch**: `main`
   - **Root Directory**: `backend` *(CRITICAL: do not leave blank)*
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free`
5. Under **Environment Variables**, add:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `DATABASE_URL` | `postgresql://postgres.vgpflayyocspsrakuvvs:riteshtayade68@aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require` | Supabase IPv4 Session Pooler (Render compatible) |
   | `SECRET_KEY` | `dairypulse-production-secret-key-2026` | Any secure random string |
   | `ALLOWED_ORIGINS` | `https://*.vercel.app,http://localhost:3000` | Allows your Vercel frontend |
   | `TIMEZONE` | `Asia/Kolkata` | Standard farm operating timezone |
6. Click **Deploy Web Service**.
7. Wait 2-3 minutes for the build to finish.
8. Copy your live backend URL (e.g., `https://dairypulse-backend.onrender.com`).
9. Verify by opening `https://dairypulse-backend.onrender.com/health` in your browser. You should see:
   ```json
   {
     "status": "healthy",
     "service": "DairyPulse API",
     "version": "1.0.0",
     "database": "postgresql"
   }
   ```

---

## 📌 Step 3: Deploy Next.js Frontend on Vercel

1. Sign in to [vercel.com](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository (`dairypluse`).
4. In the configuration screen:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click **Edit** and choose `frontend` *(CRITICAL: do not leave at root)*
5. Expand **Environment Variables** and add:
   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `NEXT_PUBLIC_API_URL` | `https://dairypulse-backend.onrender.com/api/v1` | Your Render FastAPI backend URL |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://vgpflayyocspsrakuvvs.supabase.co` | Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(your-supabase-anon-key)* | From Supabase -> Project Settings -> API (`anon` `public` key) |

6. **Google OAuth & Phone Auth Setup (Optional in Supabase Dashboard)**:
   - In [Supabase Dashboard](https://supabase.com/dashboard/project/vgpflayyocspsrakuvvs) -> **Authentication** -> **Providers**:
     - **Google**: Enable and enter your Google Cloud OAuth Client ID & Secret.
     - **Phone**: Enable SMS provider (Twilio or MessageBird) for real SMS OTP.
   - Set Redirect URL in Supabase Auth Settings to `https://your-vercel-domain.vercel.app/login`.

7. Click **Deploy**.
8. In ~60 seconds, Vercel will give you a live production URL (e.g., `https://dairypulse.vercel.app`).

---

## 📌 Step 4: Final Connection Verification

1. Open your new Vercel deployment URL in your browser.
2. The Top Navbar will display **FastAPI v1 Live** with a pulsing green indicator.
3. Sign in or create a real account:
   - **Dairy Owner**: Register your real dairy farm under **Register Dairy**.
   - **Customer**: Sign up under **Customer Sign Up** or use **Sign in with Google**.
   - **Delivery Rider**: Added directly by the dairy owner with login credentials.
4. All records, routes, deliveries, and subscriptions are securely synchronized with your cloud **Supabase PostgreSQL** database.

---

## 🛠️ Troubleshooting

- **CORS error in browser console**:
  In Render, go to **Environment** and add your exact Vercel domain to `ALLOWED_ORIGINS` (e.g., `ALLOWED_ORIGINS=https://dairypulse.vercel.app,https://*.vercel.app`).
- **Render free tier sleep**:
  Free Render instances sleep after 15 minutes of inactivity and take ~30 seconds to wake up on the first request. The frontend has built-in resilient offline fallbacks so the app never crashes during cold starts.
- **Supabase connection pooler vs direct**:
  If using Supabase Transaction pooler (`port 6543`), ensure `sslmode=require` is at the end of your connection string: `?sslmode=require`.

