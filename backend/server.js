const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const aiService = require('./services/aiService');
const dbService = require('./services/dbService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// MongoDB connection
mongoose.connect('mongodb+srv://amrita022:RVvWu83ZN6Ei8aPg@didi.btostpp.mongodb.net/didi_digital_twin?retryWrites=true&w=majority')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err));

// DEMO USER
const DEMO_USER_ID = 'demo-user-123';

// 🎤 MAIN VOICE PROCESSING ENDPOINT - HANDLES EVERYTHING
app.post('/api/process-voice', async (req, res) => {
  try {
    const { audioData, text, userId = DEMO_USER_ID } = req.body;
    
    console.log('🎤 Processing voice command...');
    
    // Process with AI Service (handles both audio and text)
    const result = await aiService.processVoiceCommand(text, userId, audioData);
    
    console.log('✅ AI Processing complete:', {
      intent: result.intent,
      amount: result.amount,
      success: result.success
    });
    
    res.json(result);
    
  } catch (error) {
    console.error('❌ Voice processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      response_english: "Sorry, there was an error processing your request.",
      response_hindi: "माफ़ करें, आपके अनुरोध को संसाधित करने में त्रुटि हुई।"
    });
  }
});

// 📊 GET USER DASHBOARD
app.get('/api/dashboard', async (req, res) => {
  try {
    const userId = req.query.userId || DEMO_USER_ID;
    const dashboard = await dbService.getDashboardData(userId);
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🏠 Health check
app.get('/health', async (req, res) => {
  try {
    const aiHealth = await aiService.healthCheck();
    res.json({
      message: '🚀 Didi Digital Twin - REAL AI Version',
      status: 'Running',
      ai: aiHealth,
      database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      endpoints: {
        'process-voice': 'POST /api/process-voice',
        'dashboard': 'GET /api/dashboard',
        'health': 'GET /health'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🚀 INITIALIZE AND START SERVER
const PORT = 5002;

async function startServer() {
  try {
    console.log('🚀 Starting Didi Digital Twin with REAL AI...');
    
    // Initialize AI Service first
    await aiService.initialize();
    
    app.listen(PORT, () => {
      console.log(`🎯 Server running on http://localhost:${PORT}`);
      console.log('🤖 REAL AI Service Ready!');
      console.log('💾 Database Connected!');
      console.log('🎤 Voice processing endpoint: POST /api/process-voice');
    });
    
  } catch (error) {
    console.error('❌ FAILED TO START SERVER:', error);
    process.exit(1);
  }
}

startServer();