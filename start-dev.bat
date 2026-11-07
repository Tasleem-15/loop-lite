@echo off
echo ============================================================
echo   Starting LOOP Lite (Node.js Express + React Vite)
echo ============================================================

start cmd /k "cd server && npm run dev"
start cmd /k "cd client && npm run dev"

echo Backend starting on http://localhost:5000
echo Frontend starting on http://localhost:5173
echo.
echo Press any key to close this launcher window (servers keep running).
pause > nul
