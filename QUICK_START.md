# 🚀 QUICK START GUIDE

## Start in 3 Simple Steps:

### Terminal 1 - Backend:
```cmd
cd backend
npm install
npm start
```
✅ Wait for: "Server running on http://localhost:5002"

### Terminal 2 - Frontend:
```cmd
cd frontend
npm install
npm run dev
```
✅ Wait for: "Local: http://localhost:5173/"

### Browser:
```
Open: http://localhost:5173/
```

---

## 🎤 Quick Voice Commands Test:

| Hindi | English | What it does |
|-------|---------|--------------|
| "Maine 100 rupaye ka saman liya" | "Spent 100 rupees on materials" | Records expense |
| "200 rupaye ka achar becha" | "Sold pickle for 200 rupees" | Records sale |
| "Aaj kitna kharcha hua?" | "How much did I spend today?" | Shows total expense |
| "Pickle ki kya keemat rakhoon?" | "What price for pickles?" | Pricing advice |

---

## 🧪 Test Offline Mode:

1. **Go Offline**: Chrome DevTools (F12) → Network Tab → Check "Offline"
2. **Record Transaction**: Say "Expense 50"
3. **See Orange Banner**: "📴 Offline - Data will be saved locally"
4. **Go Online**: Uncheck "Offline"
5. **Click Sync Button**: "Sync (1)"
6. **See Green Banner**: "✅ All data synced!"

---

## 🐛 Quick Fixes:

**Can't connect to backend?**
→ Make sure backend server is running on port 5002

**Microphone not working?**
→ Allow microphone permission in browser settings

**Hindi not recognized?**
→ Check language is set to Hindi in app settings

**Offline not working?**
→ Use Chrome/Edge, check Service Worker in DevTools

---

## 📂 Files You Created:

✅ `backend/utils/nlpProcessor.js` - Voice understanding  
✅ `backend/utils/dbHelpers.js` - Database queries  
✅ `backend/server.js` - Updated API endpoints  
✅ `frontend/src/utils/offlineStorage.js` - Offline storage  
✅ `frontend/src/utils/api.js` - API calls  
✅ `frontend/src/components/VoiceAssistant/VoiceAssistant.jsx` - Updated UI  
✅ `frontend/public/sw.js` - Enhanced service worker  

---

## 🎯 What Works:

- ✅ Voice commands in Hindi & English
- ✅ Records expenses/sales without typing
- ✅ Works completely offline
- ✅ Auto-syncs when back online
- ✅ AI pricing suggestions
- ✅ Demand predictions
- ✅ Natural conversation

---

For detailed instructions, see: **IMPLEMENTATION_GUIDE.md**
