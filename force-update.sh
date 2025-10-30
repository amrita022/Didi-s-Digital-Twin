#!/bin/bash

echo "🔄 FORCING FRONTEND UPDATE"
echo "=========================="
echo ""

echo "1️⃣ Clearing npm cache..."
cd frontend
rm -rf node_modules/.vite
rm -rf dist

echo ""
echo "2️⃣ Restarting dev server..."
echo "Press Ctrl+C to stop the old server first!"
echo ""
echo "Then run: npm run dev"
echo ""
echo "3️⃣ In browser, clear cache:"
echo "   - Press Ctrl + Shift + R (hard refresh)"
echo "   - Or Ctrl + Shift + Delete → Clear cache"
echo ""
echo "4️⃣ Look for these logs when you click mic:"
echo "   🎤 Starting audio recording..."
echo "   🔴 Recording started"
echo ""
echo "If you see those, it's working! ✅"
