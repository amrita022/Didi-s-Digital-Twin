@echo off
echo =============================================
echo 🔄 FORCING FRONTEND UPDATE - Windows
echo =============================================
echo.

echo 1️⃣ Clearing Vite cache...
cd frontend
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite"
if exist "dist" rmdir /s /q "dist"

echo.
echo ✅ Cache cleared!
echo.
echo 2️⃣ NOW DO THIS:
echo    a) Stop the frontend server (Ctrl+C in that terminal)
echo    b) Run: npm run dev
echo.
echo 3️⃣ In browser:
echo    a) Press Ctrl + Shift + R (hard refresh)
echo    OR
echo    b) Press F12 → Application → Clear storage → Clear site data
echo.
echo 4️⃣ Test: Click microphone and check console for:
echo    🎤 Starting audio recording...
echo    🔴 Recording started
echo.
echo If you see those logs = SUCCESS! ✅
echo If you don't = Browser still cached ❌
echo.
pause
