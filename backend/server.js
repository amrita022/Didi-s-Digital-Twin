const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nlpProcessor = require('./utils/nlpProcessor');
const { 
  getTransactionsByTime, 
  calculateTotals, 
  getPricingSuggestion, 
  getDemandPrediction,
  generateAIInsights 
} = require('./utils/dbHelpers');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Use MongoDB Atlas URL directly (remove dotenv for now)
const MONGODB_URI = 'mongodb+srv://amrita022:RVvWu83ZN6Ei8aPg@didi.btostpp.mongodb.net/didi_digital_twin?retryWrites=true&w=majority';

console.log('🔗 Connecting to MongoDB...');
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
})
.then(() => console.log('✅ Connected to MongoDB Atlas!'))
.catch(err => {
  console.log('❌ MongoDB Connection Error:', err.message);
});

// Simple Schemas
const userSchema = new mongoose.Schema({
  name: String,
  businessType: String,
  language: { type: String, default: 'hi-IN' }
});

const transactionSchema = new mongoose.Schema({
  userId: String,
  type: String,
  amount: Number,
  category: String,
  description: String,
  date: { type: Date, default: Date.now }
});

const analysisSchema = new mongoose.Schema({
  userId: String,
  type: String,
  message: String,
  data: Object,
  date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const Analysis = mongoose.model('Analysis', analysisSchema);

// 🎯 DEMO USER ID (we'll use a fixed demo user)
const DEMO_USER_ID = 'demo-user-123';

// 🎤 VOICE PROCESSING API - ENHANCED with NLP
app.post('/api/process-voice', async (req, res) => {
  try {
    const { text, userId } = req.body;
    console.log('🔊 Processing voice:', text);
    
    const currentUserId = userId || DEMO_USER_ID;

    // Use NLP processor for better understanding
    const processed = nlpProcessor.process(text);
    console.log('🧠 NLP Result:', processed);

    const { intent, amount, category, timeReference, language } = processed;
    
    let savedTransaction = null;
    let responseData = {};
    
    // Handle different intents
    if (intent === 'expense' && amount) {
      // Record expense
      savedTransaction = new Transaction({
        userId: currentUserId,
        type: 'expense',
        amount: amount,
        category: category,
        description: text
      });
      await savedTransaction.save();
      
      // Get today's totals
      const todayTransactions = await getTransactionsByTime(Transaction, currentUserId, 'today');
      const totals = calculateTotals(todayTransactions);
      
      responseData = {
        totalExpense: totals.totalExpenses,
        saved: true
      };
      
      // Generate AI insights
      await generateAIInsights(Transaction, Analysis, currentUserId);
      
    } else if (intent === 'income' && amount) {
      // Record income/sale
      savedTransaction = new Transaction({
        userId: currentUserId,
        type: 'income',
        amount: amount,
        category: category,
        description: text
      });
      await savedTransaction.save();
      
      // Get today's totals
      const todayTransactions = await getTransactionsByTime(Transaction, currentUserId, 'today');
      const totals = calculateTotals(todayTransactions);
      
      responseData = {
        totalIncome: totals.totalIncome,
        saved: true
      };
      
      // Generate AI insights
      await generateAIInsights(Transaction, Analysis, currentUserId);
      
    } else if (intent === 'query_expense') {
      // Query total expenses
      const transactions = await getTransactionsByTime(Transaction, currentUserId, timeReference);
      const totals = calculateTotals(transactions);
      
      responseData = {
        totalExpense: totals.totalExpenses,
        timeReference: timeReference,
        count: totals.expenseCount
      };
      
    } else if (intent === 'query_income') {
      // Query total income
      const transactions = await getTransactionsByTime(Transaction, currentUserId, timeReference);
      const totals = calculateTotals(transactions);
      
      responseData = {
        totalIncome: totals.totalIncome,
        timeReference: timeReference,
        count: totals.incomeCount
      };
      
    } else if (intent === 'query_profit') {
      // Query profit
      const transactions = await getTransactionsByTime(Transaction, currentUserId, timeReference);
      const totals = calculateTotals(transactions);
      
      responseData = {
        profit: totals.profit,
        totalIncome: totals.totalIncome,
        totalExpense: totals.totalExpenses,
        timeReference: timeReference
      };
      
    } else if (intent === 'pricing') {
      // Get pricing suggestion
      const allTransactions = await Transaction.find({ userId: currentUserId });
      const expenses = allTransactions.filter(t => t.type === 'expense');
      const suggestion = getPricingSuggestion(category, expenses);
      
      responseData = {
        ...suggestion,
        category: category
      };
      
    } else if (intent === 'demand') {
      // Get demand prediction
      const prediction = getDemandPrediction(category);
      
      responseData = {
        ...prediction,
        category: category
      };
    } else if (intent === 'unknown') {
      // Handle unknown intent - check if it looks like pricing question
      const lowerText = text.toLowerCase();
      if (lowerText.includes('mein') || lowerText.includes('में') || 
          lowerText.includes('bechna') || lowerText.includes('बेचना') ||
          lowerText.includes('chahie') || lowerText.includes('चाहिए')) {
        // Likely a pricing question
        const allTransactions = await Transaction.find({ userId: currentUserId });
        const expenses = allTransactions.filter(t => t.type === 'expense');
        const suggestion = getPricingSuggestion(category, expenses);
        
        responseData = {
          ...suggestion,
          category: category
        };
        
        // Override intent to pricing
        intent = 'pricing';
      }
    }

    // Generate natural language response
    const response = nlpProcessor.generateResponse(
      intent, 
      amount, 
      category, 
      language, 
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
      saved: !!savedTransaction
    });
    
  } catch (error) {
    console.log('❌ Error processing voice:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error: ' + error.message 
    });
  }
});

// 📲 SYNC ENDPOINT - For offline transactions
app.post('/api/sync', async (req, res) => {
  try {
    const { transactions, userId } = req.body;
    console.log(`🔄 Syncing ${transactions?.length || 0} offline transactions...`);
    
    const currentUserId = userId || DEMO_USER_ID;
    const syncResults = {
      success: [],
      failed: [],
      totalSynced: 0
    };

    if (!transactions || transactions.length === 0) {
      return res.json({
        success: true,
        message: 'No transactions to sync',
        results: syncResults
      });
    }

    // Process each offline transaction
    for (const txn of transactions) {
      try {
        // Check if transaction already exists (by client-side ID)
        const exists = await Transaction.findOne({ 
          userId: currentUserId,
          description: txn.description,
          amount: txn.amount,
          date: { 
            $gte: new Date(txn.date), 
            $lt: new Date(new Date(txn.date).getTime() + 60000) // Within 1 minute
          }
        });

        if (!exists) {
          const newTransaction = new Transaction({
            userId: currentUserId,
            type: txn.type,
            amount: txn.amount,
            category: txn.category || 'general',
            description: txn.description,
            date: new Date(txn.date)
          });
          
          await newTransaction.save();
          syncResults.success.push(txn);
          syncResults.totalSynced++;
        } else {
          console.log('⏭️ Transaction already exists, skipping...');
          syncResults.success.push(txn); // Still count as success
        }
        
      } catch (error) {
        console.error('❌ Failed to sync transaction:', error);
        syncResults.failed.push({ transaction: txn, error: error.message });
      }
    }

    // Regenerate AI insights after sync
    if (syncResults.totalSynced > 0) {
      await generateAIInsights(Transaction, Analysis, currentUserId);
    }

    res.json({
      success: true,
      message: `Synced ${syncResults.totalSynced} transactions`,
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

// 🤖 AI RESPONSE GENERATOR - DEPRECATED (using nlpProcessor now)
// Kept for backward compatibility
function generateAIResponse(intent, amount, category, originalText) {
  return nlpProcessor.generateResponse(intent, amount, category, 'english', {});
}

// 🧠 AI INSIGHTS GENERATOR - DEPRECATED (using dbHelpers now)
// Kept for backward compatibility
async function oldGenerateAIInsights(userId) {
  return await generateAIInsights(Transaction, Analysis, userId);
}

// 📊 DASHBOARD DATA API - FIXED ROUTE (no ? parameter)
app.get('/api/dashboard', async (req, res) => {
  try {
    const userId = req.query.userId || DEMO_USER_ID;
    
    const transactions = await Transaction.find({ userId }).sort({ date: -1 }).limit(10);
    const analyses = await Analysis.find({ userId }).sort({ date: -1 }).limit(5);
    
    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');
    
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const profit = totalIncome - totalExpenses;
    
    const dashboardData = {
      user: { name: 'Rekha Demo', businessType: 'Pickle Making' },
      totalExpenses: totalExpenses,
      totalIncome: totalIncome,
      profit: profit,
      transactionCount: transactions.length,
      recentTransactions: transactions,
      aiInsights: analyses,
      savingsGoal: profit > 0 ? profit * 6 : 6000,
      businessHealth: profit > 0 ? 'good' : 'needs_improvement'
    };
    
    res.json(dashboardData);
    
  } catch (error) {
    console.log('❌ Dashboard error:', error);
    
    // Return demo data if database fails
    res.json({
      user: { name: 'Rekha Demo', businessType: 'Pickle Making' },
      totalExpenses: 1500,
      totalIncome: 4000,
      profit: 2500,
      transactionCount: 3,
      recentTransactions: [
        { type: 'income', amount: 1200, category: 'pickles', description: 'Sold mango pickles' },
        { type: 'expense', amount: 500, category: 'raw_materials', description: 'Bought materials' },
        { type: 'income', amount: 800, category: 'pickles', description: 'Sold spicy pickles' }
      ],
      aiInsights: [
        {
          type: 'pricing',
          message: '💡 You could increase prices by 30% to earn better wages!'
        },
        {
          type: 'savings', 
          message: '🎯 You are saving ₹2500/month! In 6 months, you can buy a new refrigerator.'
        }
      ],
      savingsGoal: 15000,
      businessHealth: 'good'
    });
  }
});

// 👥 CREATE NEW USER
app.post('/api/users', async (req, res) => {
  try {
    const { name, businessType, location } = req.body;
    
    const user = new User({
      name: name || 'New User',
      businessType: businessType || 'Small Business',
      location: location || 'Rural India'
    });
    
    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🏠 HEALTH CHECK
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Didi Digital Twin Backend is Running!',
    version: '2.0 - Enhanced with Offline Support',
    features: [
      '🎤 Voice-based business intelligence',
      '🌐 Works offline with sync',
      '🗣️ Hindi & English support',
      '🤖 AI-powered insights',
      '📊 Real-time analytics'
    ],
    endpoints: {
      voice: 'POST /api/process-voice - Process voice commands',
      sync: 'POST /api/sync - Sync offline transactions',
      dashboard: 'GET /api/dashboard - Get dashboard data',
      users: 'POST /api/users - Create new user'
    },
    database: mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌'
  });
});

// 🚀 START SERVER
const PORT = 5002;
app.listen(PORT, () => {
  console.log(`🎯 Server running on http://localhost:${PORT}`);
  console.log(`📊 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
  console.log(`🎤 Voice API ready!`);
  console.log(`💾 Dashboard ready!`);
});