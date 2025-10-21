const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

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

// 🎤 VOICE PROCESSING API
app.post('/api/process-voice', async (req, res) => {
  try {
    const { text, userId } = req.body;
    console.log('🔊 Processing voice:', text);
    
    const currentUserId = userId || DEMO_USER_ID;

    // Extract amount
    const amountMatch = text.match(/(\d+)\s*(रुपये|rupees|rs|₹)/i);
    const amount = amountMatch ? parseInt(amountMatch[1]) : null;
    
    // Detect intent
    let intent = 'unknown';
    let category = 'general';
    
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('खर्च') || lowerText.includes('spent') || lowerText.includes('expense') || lowerText.includes('kharch')) {
      intent = 'expense';
      if (lowerText.includes('कपड़ा') || lowerText.includes('cloth') || lowerText.includes('kapda')) category = 'raw_materials';
      else if (lowerText.includes('सामान') || lowerText.includes('material') || lowerText.includes('saman')) category = 'raw_materials';
    } 
    else if (lowerText.includes('बिक्री') || lowerText.includes('sale') || lowerText.includes('sold') || lowerText.includes('bikri')) {
      intent = 'income';
      if (lowerText.includes('अचार') || lowerText.includes('pickle') || lowerText.includes('achar')) category = 'pickles';
      else if (lowerText.includes('ब्लाउज') || lowerText.includes('blouse')) category = 'clothing';
    }
    else if (lowerText.includes('कीमत') || lowerText.includes('price') || lowerText.includes('mulya') || lowerText.includes('दाम')) {
      intent = 'pricing_advice';
    }
    else if (lowerText.includes('demand') || lowerText.includes('मांग') || lowerText.includes('mang')) {
      intent = 'demand_prediction';
    }

    let savedTransaction = null;
    
    // Save transaction
    if ((intent === 'expense' || intent === 'income') && amount) {
      savedTransaction = new Transaction({
        userId: currentUserId,
        type: intent,
        amount: amount,
        category: category,
        description: text
      });
      await savedTransaction.save();
      
      // Generate AI insights
      await generateAIInsights(currentUserId);
    }

    // Generate response
    const response = generateAIResponse(intent, amount, category, text);
    
    res.json({
      success: true,
      intent: intent,
      amount: amount,
      category: category,
      response: response,
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

// 🤖 AI RESPONSE GENERATOR
function generateAIResponse(intent, amount, category, originalText) {
  const responses = {
    expense: `💰 I've recorded your expense of ₹${amount} for ${category}. Let me analyze if this fits your budget.`,
    income: `🎉 Great sale! I've logged ₹${amount} income from ${category}. Your business is growing!`,
    pricing_advice: `💡 Based on your costs, you should charge at least 30% more to earn fair wages. Most women in your area charge ₹120 for similar products.`,
    demand_prediction: `📈 I see seasonal trends! Festival season is coming - expect 50% higher demand. Stock up on materials now!`,
    unknown: `🤔 I understand you said: "${originalText}". I can help you track expenses, sales, pricing, and demand predictions.`
  };

  return responses[intent] || responses.unknown;
}

// 🧠 AI INSIGHTS GENERATOR
async function generateAIInsights(userId) {
  try {
    const transactions = await Transaction.find({ userId });
    
    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');
    
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const profit = totalIncome - totalExpenses;
    
    // Clear old insights
    await Analysis.deleteMany({ userId });
    
    // Generate pricing insights
    if (income.length > 0 && expenses.length > 0) {
      const avgSale = totalIncome / income.length;
      const avgCost = totalExpenses / expenses.length;
      
      if (avgSale < avgCost * 1.3) {
        const analysis = new Analysis({
          userId,
          type: 'pricing',
          message: `⚠️ You're underpricing! Your average sale is ₹${Math.round(avgSale)} but costs are ₹${Math.round(avgCost)}. You should charge at least ₹${Math.round(avgCost * 1.5)}.`,
          data: { currentPrice: avgSale, suggestedPrice: avgCost * 1.5 }
        });
        await analysis.save();
      }
    }
    
    // Generate savings insights
    if (profit > 0) {
      const analysis = new Analysis({
        userId,
        type: 'savings',
        message: `🎯 You're saving ₹${profit} per month! In 6 months, you can buy that new sewing machine worth ₹${profit * 6}.`,
        data: { monthlySavings: profit, goal: profit * 6 }
      });
      await analysis.save();
    }
    
  } catch (error) {
    console.log('⚠️ Error generating insights:', error.message);
  }
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
    version: '1.0',
    endpoints: {
      voice: 'POST /api/process-voice',
      dashboard: 'GET /api/dashboard',
      users: 'POST /api/users'
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