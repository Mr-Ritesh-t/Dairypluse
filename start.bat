@echo off
echo ========================================================
echo   DairyPulse Enterprise Platform - Starting Fullstack Dev
echo ========================================================

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000...
if exist "%~dp0backend\.venv\Scripts\python.exe" (
    start "DairyPulse FastAPI Backend" cmd /k "cd /d %~dp0backend && .venv\Scripts\python.exe -m uvicorn app.main:app --port 8000 --host 127.0.0.1 --reload"
) else (
    start "DairyPulse FastAPI Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --port 8000 --host 127.0.0.1 --reload"
)

echo [2/2] Starting Next.js Frontend on http://localhost:3000...
start "DairyPulse Next.js Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both services are starting:
echo  - Frontend: http://localhost:3000
echo  - Backend API: http://127.0.0.1:8000
echo  - API Docs: http://127.0.0.1:8000/docs
echo ========================================================
