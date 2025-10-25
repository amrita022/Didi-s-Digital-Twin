const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
require('dotenv').config();
const aiService = require('./services/aiService'); 
const dbService = require('./services/dbService'); 

// Import models
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const SavingsGoal = require('./models/SavingsGoal');
const AIInsight = require('./models/AIInsight');

// Import utilities
const { calculateTotals, calculateHealthScore, getTransactionsByTimeRange } = require('./utils/calculations');
const { generateAIInsights } = require('./utils/aiInsights');

const app = express();

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' })); 

// 🎤 MAIN VOICE PROCESSING ENDPOINT - HANDLES EVERYTHING
app.post('/api/process-voice', async (req, res) => {
  try {
    const { audioData, text, userId = 'DEMO_USER_ID' } = req.body;
    
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

// ======================
// USER SYNC ROUTE (FIREBASE → MONGODB)
// ======================
app.post('/api/user/sync', async (req, res) => {
  try {
    const { userId, email } = req.body;
    
    if (!userId || !email) {
      return res.status(400).json({ success: false, error: 'Missing userId or email' });
    }

    let user = await User.findOne({ userId });

    if (!user) {
      user = await User.create({
        userId,
        email,
        dashboard: {
          totalSavings: 0,
          goalTarget: 0,
          goalName: ''
        }
      });
      console.log(`✅ New user created: ${email}`);
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('❌ User sync error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ======================
// DASHBOARD API - GET USER DATA
// ======================
app.get('/api/dashboard', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID required' });
    }

    console.log('📊 Fetching dashboard for user:', userId);

    // Get user from MongoDB
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found. Please sync first.' });
    }

    // Get user's transactions
    const allTransactions = await Transaction.find({ userId }).sort({ date: -1 }).lean();
    
    // Calculate totals for different periods
    const todayTxns = getTransactionsByTimeRange(allTransactions, 'today');
    const weekTxns = getTransactionsByTimeRange(allTransactions, 'week');
    const monthTxns = getTransactionsByTimeRange(allTransactions, 'month');

    const todayTotals = calculateTotals(todayTxns);
    const weekTotals = calculateTotals(weekTxns);
    const monthTotals = calculateTotals(monthTxns);
    const healthScore = calculateHealthScore(monthTotals);

    // Use saved dashboard values OR calculated values as fallback
    const savedDashboard = user.dashboard || {};
    
    // Get AI insights
    let insights = await AIInsight.find({ userId }).sort({ date: -1 }).limit(5).lean();
    
    // Generate new insights if none exist and user has transactions
    if (insights.length === 0 && allTransactions.length > 0) {
      await generateAIInsights(userId, allTransactions);
      insights = await AIInsight.find({ userId }).sort({ date: -1 }).limit(5).lean();
    }

    // Get savings goals
    const savingsGoals = await SavingsGoal.find({ userId }).sort({ createdAt: -1 }).limit(3).lean();

    // Recent transactions
    const recentTransactions = allTransactions.slice(0, 10);

    res.json({
      success: true,
      data: {
        user: {
          email: user.email,
          userId: user.userId
        },
        // DIRECTLY RETURN SAVED VALUES (not nested in objects)
        totalSavings: savedDashboard.totalSavings || 0,
        goalTarget: savedDashboard.goalTarget || 0,
        goalName: savedDashboard.goalName || '',
        todayIncome: savedDashboard.todayIncome || 0,
        totalSales: savedDashboard.totalSales || 0,
        monthlyExpenses: savedDashboard.monthlyExpenses || 0,
        monthlyProfit: savedDashboard.monthlyProfit || 0,
        overview: {
          totalSales: savedDashboard.totalSales || monthTotals.totalIncome,
          monthlyProfit: savedDashboard.monthlyProfit || monthTotals.profit,
          expenses: savedDashboard.monthlyExpenses || monthTotals.totalExpenses,
          savings: Math.round((savedDashboard.monthlyProfit || monthTotals.profit) * 0.3),
          healthScore
        },
        today: {
          totalIncome: savedDashboard.todayIncome || todayTotals.totalIncome,
          totalExpenses: todayTotals.totalExpenses,
          profit: todayTotals.profit
        },
        thisWeek: weekTotals,
        thisMonth: {
          totalIncome: savedDashboard.totalSales || monthTotals.totalIncome,
          totalExpenses: savedDashboard.monthlyExpenses || monthTotals.totalExpenses,
          profit: savedDashboard.monthlyProfit || monthTotals.profit
        },
        recentTransactions,
        aiInsights: insights.map(i => i.message || i.title || (i.insights && i.insights[0]) || 'Insight'),
        savingsGoals
      },
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Dashboard error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ======================
// UPDATE DASHBOARD DATA
// ======================
app.post('/api/dashboard', async (req, res) => {
  try {
    const { 
      userId, 
      totalSavings, 
      goalTarget, 
      goalName,
      todayIncome,
      monthlyProfit,
      monthlyExpenses,
      totalSales
    } = req.body;
    
    console.log('💾 Saving dashboard data:', { 
      userId, 
      totalSavings, 
      goalTarget, 
      goalName,
      todayIncome,
      monthlyProfit,
      monthlyExpenses,
      totalSales
    });
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID required' });
    }

    // Update user's dashboard data
    const user = await User.findOneAndUpdate(
      { userId },
      {
        $set: {
          'dashboard.totalSavings': Number(totalSavings) || 0,
          'dashboard.goalTarget': Number(goalTarget) || 0,
          'dashboard.goalName': goalName || '',
          'dashboard.todayIncome': Number(todayIncome) || 0,
          'dashboard.monthlyProfit': Number(monthlyProfit) || 0,
          'dashboard.monthlyExpenses': Number(monthlyExpenses) || 0,
          'dashboard.totalSales': Number(totalSales) || 0
        }
      },
      { new: true, upsert: true }
    );

    console.log('✅ Dashboard saved:', user.dashboard);

    res.json({ 
      success: true, 
      message: 'Dashboard updated successfully',
      data: user.dashboard 
    });
  } catch (error) {
    console.error('❌ Dashboard update error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ======================
// TRANSACTION ROUTES
// ======================
app.post('/api/transaction', async (req, res) => {
  try {
    const { userId, type, amount, category, description } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID required' });
    }

    const txn = await Transaction.create({
      userId,
      type,
      amount,
      category: category || 'general',
      description: description || '',
      date: new Date()
    });

    // Regenerate AI insights
    const allTxns = await Transaction.find({ userId });
    await generateAIInsights(userId, allTxns);
    
    res.json({ success: true, txn });
  } catch (error) {
    console.error('❌ Transaction error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/transaction/:id', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID required' });
    }

    const result = await Transaction.findOneAndDelete({ 
      _id: req.params.id,
      userId: userId
    });

    if (!result) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    res.json({ success: true, message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ======================
// SAVINGS GOAL ROUTES
// ======================
app.post('/api/savings-goal', async (req, res) => {
  try {
    const { userId, title, targetAmount, currentAmount, deadline } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID required' });
    }

    const goal = await SavingsGoal.create({
      userId,
      title,
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline: deadline ? new Date(deadline) : null
    });
    
    res.json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/savings-goal/:id', async (req, res) => {
  try {
    const { userId, currentAmount } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID required' });
    }

    const goal = await SavingsGoal.findOneAndUpdate(
      { _id: req.params.id, userId: userId },
      { currentAmount },
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({ success: false, error: 'Goal not found' });
    }

    res.json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ======================
// HEALTH CHECK
// ======================
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Didi\'s Digital Twin Backend',
    version: '1.0.0',
    database: mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected',
    endpoints: {
      userSync: 'POST /api/user/sync',
      dashboard: 'GET /api/dashboard?userId=xxx',
      updateDashboard: 'POST /api/dashboard',
      addTransaction: 'POST /api/transaction',
      deleteTransaction: 'DELETE /api/transaction/:id?userId=xxx',
      addGoal: 'POST /api/savings-goal',
      updateGoal: 'PUT /api/savings-goal/:id'
    }
  });
});

// ======================
// START SERVER
// ======================
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5002;

console.log('🔗 Connecting to MongoDB...');

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas!');

    async function startServer() {
      try {
        console.log('🚀 Starting Didi Digital Twin with REAL AI...');
        
        // Initialize AI Service first
        await aiService.initialize(); // This line is now properly placed
        
        app.listen(PORT, () => {
          console.log(`\n🎯 Server running on http://localhost:${PORT}`);
          console.log('📊 MongoDB: Connected');
          console.log('🔐 User isolation: ENABLED');
          console.log('\n📍 Available endpoints:');
          console.log(`   POST   /api/user/sync`);
          console.log(`   GET    /api/dashboard?userId=xxx`);
          console.log(`   POST   /api/dashboard`);
          console.log(`   POST   /api/transaction`);
          console.log(`   DELETE /api/transaction/:id`);
          console.log(`   POST   /api/savings-goal`);
          console.log(`   PUT    /api/savings-goal/:id\n`);
        });
      } catch (error) {
        console.error('❌ Server startup error:', error);
        process.exit(1);
      }
    }

    // Start the server
    startServer();
  })
  .catch(err => {
    console.error('❌ MongoDB Error:', err.message);
    process.exit(1);
  });