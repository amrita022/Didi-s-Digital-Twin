const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
require('dotenv').config();

const nlpProcessor = require('./utils/nlpProcessor');
const { 
  getTransactionsByTime, 
  calculateTotals, 
  getPricingSuggestion, 
  getDemandPrediction,
  generateAIInsights,
  getBusinessHealthScore
} = require('./utils/dbHelpers');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Performance middleware
app.use(compression());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://amrita022:RVvWu83ZN6Ei8aPg@didi.btostpp.mongodb.net/didi_digital_twin?retryWrites=true&w=majority';

console.log('🔗 Connecting to MongoDB...');
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
})
.then(() => console.log('✅ Connected to MongoDB Atlas!'))
.catch(err => {
  console.log('❌ MongoDB Connection Error:', err.message);
  console.log('💡 Using demo data mode...');
});

// Enhanced Schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true },
  phone: String,
  businessType: { type: String, required: true },
  businessName: String,
  location: String,
  language: { type: String, default: 'hi-IN' },
  savingsGoal: { type: Number, default: 0 },
  monthlyTarget: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const transactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  description: String,
  paymentMethod: { type: String, default: 'cash' },
  isSynced: { type: Boolean, default: true },
  offlineId: String, // For offline sync
  date: { type: Date, default: Date.now, index: true }
});

const analysisSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, enum: ['pricing', 'savings', 'demand', 'general'], required: true },
  title: String,
  message: { type: String, required: true },
  data: Object,
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  isActionable: { type: Boolean, default: false },
  actionLink: String,
  date: { type: Date, default: Date.now, index: true }
});

const savingsGoalSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  deadline: Date,
  category: String,
  isCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const Analysis = mongoose.model('Analysis', analysisSchema);
const SavingsGoal = mongoose.model('SavingsGoal', savingsGoalSchema);

// 🎯 DEMO USER ID
const DEMO_USER_ID = 'demo-user-123';

// Initialize demo user if not exists
async function initializeDemoUser() {
  try {
    const demoUser = await User.findOne({ _id: DEMO_USER_ID });
    if (!demoUser) {
      await User.create({
        _id: DEMO_USER_ID,
        name: 'Rekha Sharma',
        businessType: 'Pickle Making',
        businessName: 'Rekha\'s Homemade Pickles',
        location: 'Uttar Pradesh',
        language: 'hi-IN',
        savingsGoal: 50000,
        monthlyTarget: 20000
      });
      console.log('✅ Demo user initialized');
    }
  } catch (error) {
    console.log('⚠️ Could not initialize demo user:', error.message);
  }
}

// 🎤 ENHANCED VOICE PROCESSING API
app.post('/api/process-voice', async (req, res) => {
  try {
    const { text, userId, language } = req.body;
    console.log('🔊 Processing voice:', { text, userId, language });
    
    const currentUserId = userId || DEMO_USER_ID;

    // Use NLP processor for better understanding
    const processed = nlpProcessor.process(text, language);
    console.log('🧠 NLP Result:', processed);

    const { intent, amount, category, timeReference, entities } = processed;
    
    let savedTransaction = null;
    let responseData = {};
    
    // Handle different intents
    switch (intent) {
      case 'expense':
        if (amount) {
          savedTransaction = await Transaction.create({
            userId: currentUserId,
            type: 'expense',
            amount: amount,
            category: category || 'general',
            description: text,
            paymentMethod: entities.paymentMethod || 'cash'
          });
          
          const todayTransactions = await getTransactionsByTime(Transaction, currentUserId, 'today');
          const totals = calculateTotals(todayTransactions);
          
          responseData = {
            totalExpense: totals.totalExpenses,
            saved: true,
            transactionId: savedTransaction._id
          };
        }
        break;
        
      case 'income':
        if (amount) {
          savedTransaction = await Transaction.create({
            userId: currentUserId,
            type: 'income',
            amount: amount,
            category: category || 'sales',
            description: text,
            paymentMethod: entities.paymentMethod || 'cash'
          });
          
          const todayTransactions = await getTransactionsByTime(Transaction, currentUserId, 'today');
          const totals = calculateTotals(todayTransactions);
          
          responseData = {
            totalIncome: totals.totalIncome,
            saved: true,
            transactionId: savedTransaction._id
          };
        }
        break;
        
      case 'query_expense':
        const expenseTransactions = await getTransactionsByTime(Transaction, currentUserId, timeReference);
        const expenseTotals = calculateTotals(expenseTransactions);
        responseData = {
          totalExpense: expenseTotals.totalExpenses,
          timeReference: timeReference,
          count: expenseTotals.expenseCount,
          averageExpense: expenseTotals.averageExpense
        };
        break;
        
      case 'query_income':
        const incomeTransactions = await getTransactionsByTime(Transaction, currentUserId, timeReference);
        const incomeTotals = calculateTotals(incomeTransactions);
        responseData = {
          totalIncome: incomeTotals.totalIncome,
          timeReference: timeReference,
          count: incomeTotals.incomeCount,
          averageIncome: incomeTotals.averageIncome
        };
        break;
        
      case 'query_profit':
        const profitTransactions = await getTransactionsByTime(Transaction, currentUserId, timeReference);
        const profitTotals = calculateTotals(profitTransactions);
        responseData = {
          profit: profitTotals.profit,
          totalIncome: profitTotals.totalIncome,
          totalExpense: profitTotals.totalExpenses,
          timeReference: timeReference,
          profitMargin: profitTotals.profitMargin
        };
        break;
        
      case 'pricing':
        const allTransactions = await Transaction.find({ userId: currentUserId });
        const expenses = allTransactions.filter(t => t.type === 'expense');
        const suggestion = getPricingSuggestion(category, expenses);
        responseData = { ...suggestion, category: category };
        break;
        
      case 'demand':
        const prediction = getDemandPrediction(category);
        responseData = { ...prediction, category: category };
        break;
        
      case 'savings':
        const savingsData = await getSavingsProgress(currentUserId);
        responseData = { ...savingsData };
        break;
    }

    // Generate AI insights for meaningful transactions
    if (savedTransaction || intent.includes('query')) {
      await generateAIInsights(Transaction, Analysis, currentUserId);
    }

    // Generate natural language response
    const response = nlpProcessor.generateResponse(
      intent, 
      amount, 
      category, 
      language || 'en', 
      responseData
    );
    
    res.json({
      success: true,
      intent: intent,
      amount: amount,
      category: category,
      language: language,
      response: response,
      data: responseData,
      saved: !!savedTransaction,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.log('❌ Error processing voice:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error: ' + error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 💰 SAVINGS GOALS ENDPOINTS
app.get('/api/savings-goals', async (req, res) => {
  try {
    const userId = req.query.userId || DEMO_USER_ID;
    const goals = await SavingsGoal.find({ userId }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      goals: goals,
      totalGoals: goals.length,
      completedGoals: goals.filter(g => g.isCompleted).length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/savings-goals', async (req, res) => {
  try {
    const { title, targetAmount, deadline, category, userId } = req.body;
    const currentUserId = userId || DEMO_USER_ID;
    
    const goal = await SavingsGoal.create({
      userId: currentUserId,
      title,
      targetAmount,
      deadline: deadline ? new Date(deadline) : null,
      category: category || 'general'
    });
    
    res.json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 📲 ENHANCED SYNC ENDPOINT
app.post('/api/sync', async (req, res) => {
  try {
    const { transactions, savingsGoals, userId } = req.body;
    console.log(`🔄 Syncing data for user ${userId || DEMO_USER_ID}...`);
    
    const currentUserId = userId || DEMO_USER_ID;
    const syncResults = {
      transactions: { success: [], failed: [], totalSynced: 0 },
      savingsGoals: { success: [], failed: [], totalSynced: 0 }
    };

    // Sync transactions
    if (transactions && transactions.length > 0) {
      for (const txn of transactions) {
        try {
          // Check for duplicates using offlineId
          const exists = await Transaction.findOne({ 
            userId: currentUserId,
            offlineId: txn.offlineId
          });

          if (!exists) {
            const newTransaction = new Transaction({
              userId: currentUserId,
              type: txn.type,
              amount: txn.amount,
              category: txn.category || 'general',
              description: txn.description,
              paymentMethod: txn.paymentMethod || 'cash',
              offlineId: txn.offlineId,
              isSynced: true,
              date: new Date(txn.date)
            });
            
            await newTransaction.save();
            syncResults.transactions.success.push(txn);
            syncResults.transactions.totalSynced++;
          }
        } catch (error) {
          console.error('❌ Failed to sync transaction:', error);
          syncResults.transactions.failed.push({ transaction: txn, error: error.message });
        }
      }
    }

    // Sync savings goals
    if (savingsGoals && savingsGoals.length > 0) {
      for (const goal of savingsGoals) {
        try {
          const exists = await SavingsGoal.findOne({
            userId: currentUserId,
            _id: goal.offlineId
          });

          if (!exists) {
            await SavingsGoal.create({
              userId: currentUserId,
              title: goal.title,
              targetAmount: goal.targetAmount,
              currentAmount: goal.currentAmount || 0,
              deadline: goal.deadline ? new Date(goal.deadline) : null,
              category: goal.category || 'general'
            });
            syncResults.savingsGoals.success.push(goal);
            syncResults.savingsGoals.totalSynced++;
          }
        } catch (error) {
          console.error('❌ Failed to sync savings goal:', error);
          syncResults.savingsGoals.failed.push({ goal: goal, error: error.message });
        }
      }
    }

    // Regenerate AI insights after sync
    if (syncResults.transactions.totalSynced > 0) {
      await generateAIInsights(Transaction, Analysis, currentUserId);
    }

    res.json({
      success: true,
      message: `Synced ${syncResults.transactions.totalSynced} transactions and ${syncResults.savingsGoals.totalSynced} savings goals`,
      results: syncResults
    });

  } catch (error) {
    console.error('❌ Sync error:', error);
    res.status(500).json({
      success: false,
      error: 'Sync failed: ' + error.message
    });
  }
});

// 📊 ENHANCED DASHBOARD DATA API
app.get('/api/dashboard', async (req, res) => {
  try {
    const userId = req.query.userId || DEMO_USER_ID;
    
    // Get user data
    const user = await User.findById(userId) || {
      name: 'Rekha Sharma',
      businessType: 'Pickle Making',
      language: 'hi-IN'
    };

    // Get recent transactions
    const transactions = await Transaction.find({ userId })
      .sort({ date: -1 })
      .limit(10)
      .lean();

    // Get AI insights
    const analyses = await Analysis.find({ userId })
      .sort({ date: -1 })
      .limit(5)
      .lean();

    // Get savings goals
    const savingsGoals = await SavingsGoal.find({ userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    // Calculate totals for different time periods
    const todayTransactions = await getTransactionsByTime(Transaction, userId, 'today');
    const weekTransactions = await getTransactionsByTime(Transaction, userId, 'week');
    const monthTransactions = await getTransactionsByTime(Transaction, userId, 'month');

    const todayTotals = calculateTotals(todayTransactions);
    const weekTotals = calculateTotals(weekTransactions);
    const monthTotals = calculateTotals(monthTransactions);

    // Calculate business health score
    const healthScore = getBusinessHealthScore(monthTotals);

    // Prepare dashboard data
    const dashboardData = {
      user: {
        name: user.name,
        businessType: user.businessType,
        language: user.language,
        savingsGoal: user.savingsGoal || 50000
      },
      overview: {
        totalSales: monthTotals.totalIncome,
        monthlyProfit: monthTotals.profit,
        expenses: monthTotals.totalExpenses,
        savings: Math.max(0, monthTotals.profit * 0.3), // Assume 30% savings
        healthScore: healthScore
      },
      today: todayTotals,
      thisWeek: weekTotals,
      thisMonth: monthTotals,
      recentTransactions: transactions,
      aiInsights: analyses,
      savingsGoals: savingsGoals,
      quickStats: {
        transactionCount: transactions.length,
        activeGoals: savingsGoals.filter(g => !g.isCompleted).length,
        profitMargin: monthTotals.profitMargin,
        savingsRate: monthTotals.profit > 0 ? (Math.max(0, monthTotals.profit * 0.3) / monthTotals.profit * 100).toFixed(1) : 0
      }
    };
    
    res.json({
      success: true,
      data: dashboardData,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.log('❌ Dashboard error:', error);
    
    // Return comprehensive demo data
    res.json({
      success: true,
      data: {
        user: { 
          name: 'Rekha Sharma', 
          businessType: 'Pickle Making',
          language: 'hi-IN',
          savingsGoal: 50000
        },
        overview: {
          totalSales: 28500,
          monthlyProfit: 8500,
          expenses: 20000,
          savings: 2550,
          healthScore: 78
        },
        today: {
          totalIncome: 1200,
          totalExpenses: 450,
          profit: 750,
          profitMargin: 62.5
        },
        recentTransactions: [
          { 
            type: 'income', 
            amount: 800, 
            category: 'pickles', 
            description: 'Sold mixed pickles to restaurant',
            date: new Date().toISOString()
          },
          { 
            type: 'expense', 
            amount: 300, 
            category: 'raw_materials', 
            description: 'Bought spices and oils',
            date: new Date().toISOString()
          },
          { 
            type: 'income', 
            amount: 400, 
            category: 'pickles', 
            description: 'Sold mango pickles',
            date: new Date(Date.now() - 86400000).toISOString()
          }
        ],
        aiInsights: [
          {
            type: 'pricing',
            title: 'Price Optimization',
            message: 'You could increase pickle prices by 15% based on your costs and market demand',
            priority: 'high',
            isActionable: true,
            actionLink: '/pricing'
          },
          {
            type: 'savings', 
            title: 'Savings Progress',
            message: 'You are saving 30% of your profits! At this rate, you will reach your goal in 4 months.',
            priority: 'medium',
            isActionable: true,
            actionLink: '/savings'
          },
          {
            type: 'demand',
            title: 'Seasonal Opportunity', 
            message: 'Summer is coming! Mango pickle demand will increase by 40% in the next month.',
            priority: 'high',
            isActionable: true,
            actionLink: '/demand'
          }
        ],
        savingsGoals: [
          {
            title: 'New Refrigerator',
            targetAmount: 25000,
            currentAmount: 8500,
            deadline: new Date(Date.now() + 120 * 86400000).toISOString(),
            isCompleted: false,
            progress: 34
          }
        ]
      },
      lastUpdated: new Date().toISOString()
    });
  }
});

// 📈 ANALYTICS ENDPOINT
app.get('/api/analytics', async (req, res) => {
  try {
    const userId = req.query.userId || DEMO_USER_ID;
    const period = req.query.period || 'month'; // week, month, year
    
    const transactions = await getTransactionsByTime(Transaction, userId, period);
    const totals = calculateTotals(transactions);
    
    // Category breakdown
    const categoryBreakdown = transactions.reduce((acc, txn) => {
      const category = txn.category || 'other';
      if (!acc[category]) {
        acc[category] = { income: 0, expense: 0, count: 0 };
      }
      if (txn.type === 'income') {
        acc[category].income += txn.amount;
      } else {
        acc[category].expense += txn.amount;
      }
      acc[category].count++;
      return acc;
    }, {});

    res.json({
      success: true,
      period: period,
      totals: totals,
      categoryBreakdown: categoryBreakdown,
      transactionCount: transactions.length,
      averageTransaction: totals.totalAmount / Math.max(transactions.length, 1)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 👥 USER MANAGEMENT
app.post('/api/users', async (req, res) => {
  try {
    const { name, businessType, businessName, location, language, savingsGoal } = req.body;
    
    const user = await User.create({
      name: name || 'New User',
      businessType: businessType || 'Small Business',
      businessName: businessName || '',
      location: location || 'Rural India',
      language: language || 'hi-IN',
      savingsGoal: savingsGoal || 0
    });
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 🏠 HEALTH CHECK
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Didi Digital Twin Backend is Running!',
    version: '3.0 - Enhanced Analytics & Savings',
    features: [
      '🎤 Voice-based business intelligence',
      '🌐 Works offline with sync',
      '🗣️ Hindi & English support',
      '🤖 AI-powered insights',
      '📊 Advanced analytics',
      '💰 Savings goals tracking',
      '🔒 Secure & scalable'
    ],
    endpoints: {
      voice: 'POST /api/process-voice - Process voice commands',
      sync: 'POST /api/sync - Sync offline data',
      dashboard: 'GET /api/dashboard - Get dashboard data',
      analytics: 'GET /api/analytics - Get business analytics',
      savings: 'GET/POST /api/savings-goals - Manage savings goals',
      users: 'POST /api/users - Create new user'
    },
    database: mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌',
    timestamp: new Date().toISOString()
  });
});

// 🚀 START SERVER
const PORT = process.env.PORT || 5002;

// Initialize demo data and start server
initializeDemoUser().then(() => {
  app.listen(PORT, () => {
    console.log(`🎯 Server running on http://localhost:${PORT}`);
    console.log(`📊 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌'}`);
    console.log(`🎤 Voice API ready!`);
    console.log(`📈 Analytics ready!`);
    console.log(`💰 Savings goals ready!`);
  });
});