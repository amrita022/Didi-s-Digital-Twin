const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
require('dotenv').config();
const aiService = require('./services/aiService'); 
const dbService = require('./services/dbService'); 
const prophetAIService = require('./services/prophetAIService');
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
    console.log('🔑 Received userId from request:', userId);
    console.log('📦 Full request body:', JSON.stringify(req.body, null, 2));
    
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
    const allTimeTotals = calculateTotals(allTransactions);
    const healthScore = calculateHealthScore(allTimeTotals); // Use ALL-TIME data for health score

    // Use saved dashboard values ONLY for goals and savings (manual fields)
    // But calculate income/expenses/profit dynamically from transactions
    const savedDashboard = user.dashboard || {};
    
    // Calculate cumulative savings (20% of all-time profit, or use saved value)
    const calculatedSavings = Math.max(0, Math.round(allTimeTotals.profit * 0.2));
    const totalSavings = savedDashboard.totalSavings !== undefined && savedDashboard.totalSavings > 0 
      ? savedDashboard.totalSavings 
      : calculatedSavings;
    
    // Default goal target if not set
    const goalTarget = savedDashboard.goalTarget || 25000;
    
    console.log('💰 Calculated Today Income:', todayTotals.totalIncome);
    console.log('📊 Calculated Month Sales:', monthTotals.totalIncome);
    console.log('💸 Calculated Month Expenses:', monthTotals.totalExpenses);
    console.log('🎯 Calculated Month Profit:', monthTotals.profit);
    console.log('💎 All-Time Profit:', allTimeTotals.profit);
    console.log('🏦 Calculated Savings (20%):', calculatedSavings);
    console.log('🎯 Total Savings (used):', totalSavings);
    console.log('📈 Health Score:', healthScore);
    
    // Get SMART AI insights (seasonal patterns, top sellers, etc.)
    console.log('🤖 Generating smart AI insights...');
    const smartInsights = await generateAIInsights(userId, allTransactions);
    
    // Clear old insights and save new ones
    if (smartInsights && smartInsights.length > 0) {
      await AIInsight.deleteMany({ userId }); // Clear old insights
      
      // Save new insights to database
      for (const insight of smartInsights) {
        await AIInsight.create({
          userId,
          ...insight,
          date: new Date()
        });
      }
    }
    
    // Fetch saved insights
    let insights = await AIInsight.find({ userId }).sort({ date: -1 }).limit(5).lean();

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
        // DYNAMIC VALUES FROM TRANSACTIONS (these update automatically)
        todayIncome: todayTotals.totalIncome,
        totalSales: monthTotals.totalIncome, // Monthly sales for top cards
        monthlyExpenses: monthTotals.totalExpenses,
        monthlyProfit: monthTotals.profit,
        
        // SAVINGS: Use saved value if set, otherwise calculate from all-time profit
        totalSavings: totalSavings,
        goalTarget: goalTarget,
        goalName: savedDashboard.goalName || 'Savings Goal',
        
        // OVERVIEW (Business Health Score) - ALL-TIME TOTALS
        overview: {
          totalSales: allTimeTotals.totalIncome, // ALL-TIME SALES
          monthlyProfit: allTimeTotals.profit, // ALL-TIME PROFIT
          expenses: allTimeTotals.totalExpenses, // ALL-TIME EXPENSES
          savings: totalSavings,
          healthScore: healthScore
        },
        today: {
          totalIncome: todayTotals.totalIncome,
          totalExpenses: todayTotals.totalExpenses,
          profit: todayTotals.profit
        },
        thisWeek: weekTotals,
        thisMonth: {
          totalIncome: monthTotals.totalIncome,
          totalExpenses: monthTotals.totalExpenses,
          profit: monthTotals.profit
        },
        recentTransactions,
        aiInsights: insights, // Return full insight objects with title, message, type, priority
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
// DEMAND PREDICTIONS API
// ======================
const { generateDemandPredictions } = require('./utils/demandPredictions');

app.get('/api/demand-predictions', async (req, res) => {
    try {
        const { userId, useProphet, language } = req.query;
        
        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                error: 'User ID required' 
            });
        }

        const userLanguage = language || 'english'; // Default to English
        console.log(`🎯 Generating demand predictions for: ${userId} (Language: ${userLanguage})`);
        
        // Use Prophet if requested, otherwise use rule-based
        const predictions = useProphet === 'true' 
            ? await prophetAIService.generateDemandPredictions(userId, userLanguage)
            : await generateDemandPredictions(userId, userLanguage);
        
        res.json(predictions);
    } catch (error) {
        console.error('❌ Demand predictions error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});
// ======================
// BUSINESS ANALYTICS API
// ======================
const { generateBusinessAnalytics } = require('./utils/analyticsCalculations');

app.get('/api/analytics', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID required' 
      });
    }

    console.log(`📊 Generating business analytics for: ${userId}`);
    
    const analytics = await generateBusinessAnalytics(userId);
    
    res.json(analytics);
  } catch (error) {
    console.error('❌ Analytics generation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ======================
// REMINDERS & NUDGES
// ======================
const Reminder = require('./models/Reminder');
const { generateNudges, saveNudgesAsReminders } = require('./utils/nudgeGenerator');

// Get all active reminders for a user
app.get('/api/reminders', async (req, res) => {
  try {
    const { userId, language } = req.query;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    // Generate and save new nudges
    await saveNudgesAsReminders(userId, language || 'english');
    
    // Get all active, non-dismissed reminders
    const reminders = await Reminder.find({ 
      userId, 
      isActive: true, 
      isDismissed: false 
    }).sort({ priority: -1, createdAt: -1 });
    
    res.json({
      success: true,
      reminders,
      count: reminders.length
    });
  } catch (error) {
    console.error('❌ Get reminders error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create a reminder (when user clicks "yes" on a nudge)
app.post('/api/reminders', async (req, res) => {
  try {
    const { userId, type, title, message, messageHindi, actionRequired, eventDate, metadata } = req.body;
    
    if (!userId || !title || !message) {
      return res.status(400).json({ success: false, error: 'userId, title, and message are required' });
    }

    const reminder = await Reminder.create({
      userId,
      type: type || 'custom',
      title,
      message,
      messageHindi,
      actionRequired,
      eventDate: eventDate ? new Date(eventDate) : undefined,
      metadata,
      isActive: true,
      isDismissed: false
    });
    
    res.json({
      success: true,
      reminder
    });
  } catch (error) {
    console.error('❌ Create reminder error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Dismiss a reminder
app.patch('/api/reminders/:id/dismiss', async (req, res) => {
  try {
    const { userId } = req.body;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, userId },
      { 
        isDismissed: true, 
        dismissedAt: new Date(),
        isActive: false
      },
      { new: true }
    );
    
    if (!reminder) {
      return res.status(404).json({ success: false, error: 'Reminder not found' });
    }
    
    res.json({
      success: true,
      reminder
    });
  } catch (error) {
    console.error('❌ Dismiss reminder error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark reminder as completed
app.patch('/api/reminders/:id/complete', async (req, res) => {
  try {
    const { userId } = req.body;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, userId },
      { 
        completedAt: new Date(),
        isActive: false
      },
      { new: true }
    );
    
    if (!reminder) {
      return res.status(404).json({ success: false, error: 'Reminder not found' });
    }
    
    res.json({
      success: true,
      reminder
    });
  } catch (error) {
    console.error('❌ Complete reminder error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ======================
// PRICING RECOMMENDATIONS (XGBoost)
// ======================
const { generateXGBoostPricingRecommendations } = require('./services/xgboostPricingService');

app.get('/api/pricing-recommendations', async (req, res) => {
  try {
    const { userId, useXGBoost, language } = req.query;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    const userLanguage = language || 'english'; // Default to English
    console.log(`💰 Generating pricing recommendations for: ${userId} (XGBoost: ${useXGBoost !== 'false'}, Language: ${userLanguage})`);

    // Use XGBoost by default, fallback to rule-based if specified
    let recommendations;
    if (useXGBoost === 'false') {
      const { generatePricingRecommendations } = require('./utils/pricingAdvisor');
      recommendations = await generatePricingRecommendations(userId, userLanguage);
    } else {
      recommendations = await generateXGBoostPricingRecommendations(userId, userLanguage);
    }
    
    res.json({
      success: true,
      ...recommendations
    });
  } catch (error) {
    console.error('❌ Pricing recommendations error:', error);
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

// Get all savings goals for a user
app.get('/api/savings-goal', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) return res.status(400).json({ success: false, error: 'User ID required' });

    const goals = await SavingsGoal.find({ userId }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, goals });
  } catch (error) {
    console.error('❌ Get savings goals error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get a single savings goal by id
app.get('/api/savings-goal/:id', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, error: 'User ID required' });

    const goal = await SavingsGoal.findOne({ _id: req.params.id, userId }).lean();
    if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });

    res.json({ success: true, goal });
  } catch (error) {
    console.error('❌ Get savings goal error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a savings goal
app.delete('/api/savings-goal/:id', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, error: 'User ID required' });

    const result = await SavingsGoal.findOneAndDelete({ _id: req.params.id, userId });
    if (!result) return res.status(404).json({ success: false, error: 'Goal not found' });

    res.json({ success: true, message: 'Goal deleted' });
  } catch (error) {
    console.error('❌ Delete savings goal error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Increment goal progress (add amount)
app.patch('/api/savings-goal/:id/progress', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    if (!userId) return res.status(400).json({ success: false, error: 'User ID required' });
    const delta = Number(amount) || 0;

    const goal = await SavingsGoal.findOne({ _id: req.params.id, userId });
    if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });

    goal.currentAmount = Math.min((goal.currentAmount || 0) + delta, goal.targetAmount || Infinity);
    if (goal.targetAmount && goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
      goal.currentAmount = goal.targetAmount;
    }

    await goal.save();

    res.json({ success: true, goal });
  } catch (error) {
    console.error('❌ Update goal progress error:', error);
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
// TESTING: Clear all transactions for a user
// ======================
app.delete('/api/transactions/clear/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID required' });
    }

    const result = await Transaction.deleteMany({ userId });
    
    console.log(`🗑️ Cleared ${result.deletedCount} transactions for user: ${userId}`);
    
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} transactions`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ Error clearing transactions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
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
          console.log(`   DELETE /api/transactions/clear/:userId (TEST ONLY)`);
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