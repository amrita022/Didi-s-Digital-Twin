const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Use YOUR MongoDB Atlas URL
const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔗 Connecting to MongoDB...');
mongoose.connect(MONGODB_URI)
.then(() => console.log('✅ Connected to MongoDB Atlas!'))
.catch(err => {
  console.log('❌ MongoDB Connection Error:', err.message);
  console.log('💡 Tips: Check if your IP is whitelisted in MongoDB Atlas');
});

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  businessType: String,
  language: { type: String, default: 'hi-IN' },
  location: String,
  createdAt: { type: Date, default: Date.now }
});

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: String, // 'expense' or 'income'
  amount: Number,
  category: String,
  description: String,
  date: { type: Date, default: Date.now }
});

const analysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: String, // 'pricing', 'demand', 'savings'
  message: String,
  data: Object,
  date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);
const Analysis = mongoose.model('Analysis', analysisSchema);

// 🎯 DEMO: Create a default user for testing
async function createDemoUser() {
  try {
    let demoUser = await User.findOne({ name: 'Rekha Demo' });
    if (!demoUser) {
      demoUser = new User({
        name: 'Rekha Demo',
        businessType: 'Pickle Making',
        location: 'Rajasthan',
        language: 'hi-IN'
      });
      await demoUser.save();
      console.log('👩‍💼 Demo user created:', demoUser._id);
    }
    return demoUser._id;
  } catch (error) {
    console.log('⚠️ Could not create demo user:', error.message);
    return null;
  }
}

// 🎤 VOICE PROCESSING API
app.post('/api/process-voice', async (req, res) => {
  try {
    const { text, userId } = req.body;
    console.log('🔊 Processing voice:', text);
    
    // Get or create demo user
    const demoUserId = await createDemoUser();
    const currentUserId = userId || demoUserId;

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
      else if (lowerText.includes('आटा') || lowerText.includes('flour') || lowerText.includes('ata')) category = 'raw_materials';
    } 
    else if (lowerText.includes('बिक्री') || lowerText.includes('sale') || lowerText.includes('sold') || lowerText.includes('bikri')) {
      intent = 'income';
      if (lowerText.includes('अचार') || lowerText.includes('pickle') || lowerText.includes('achar')) category = 'pickles';
      else if (lowerText.includes('ब्लाउज') || lowerText.includes('blouse') || lowerText.includes('blouse')) category = 'clothing';
    }
    else if (lowerText.includes('कीमत') || lowerText.includes('price') || lowerText.includes('mulya') || lowerText.includes('दाम')) {
      intent = 'pricing_advice';
    }
    else if (lowerText.includes('demand') || lowerText.includes('मांग') || lowerText.includes('mang') || lowerText.includes('बिकने')) {
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
      saved: !!savedTransaction,
      transaction: savedTransaction
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
    unknown: `🤔 I understand you said: "${originalText}". I can help you track expenses, sales, pricing, and demand predictions. Try saying "I spent 500 rupees on cloth" or "I sold pickles for 800 rupees".`
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
    if (income.length > 2 && expenses.length > 0) {
      const avgSale = totalIncome / income.length;
      const totalCosts = totalExpenses + (income.length * 20); // Add time cost
      const avgCost = totalCosts / income.length;
      
      if (avgSale < avgCost * 1.3) {
        const analysis = new Analysis({
          userId,
          type: 'pricing',
          message: `⚠️ You're underpricing! Your average sale is ₹${Math.round(avgSale)} but real cost is ₹${Math.round(avgCost)}. You should charge at least ₹${Math.round(avgCost * 1.5)} to earn fair wages.`,
          data: { currentPrice: avgSale, suggestedPrice: avgCost * 1.5, profitMargin: '30%' }
        });
        await analysis.save();
      }
    }
    
    // Generate savings insights
    if (profit > 0) {
      const analysis = new Analysis({
        userId,
        type: 'savings',
        message: `🎯 You're saving ₹${profit} per month! In 6 months, you can buy that new sewing machine worth ₹${profit * 6}. Keep going!`,
        data: { monthlySavings: profit, goal: profit * 6, timeline: '6 months' }
      });
      await analysis.save();
    }
    
    // Generate demand insights
    if (income.length > 0) {
      const analysis = new Analysis({
        userId,
        type: 'demand',
        message: `📊 Based on your sales pattern, I predict 200% higher demand in summer for pickles. Stock up on raw materials now!`,
        data: { season: 'summer', predictedIncrease: '200%', recommendation: 'stock_materials' }
      });
      await analysis.save();
    }
    
  } catch (error) {
    console.log('⚠️ Error generating insights:', error.message);
  }
}

// 📊 DASHBOARD DATA API
app.get('/api/dashboard/:userId?', async (req, res) => {
  try {
    const demoUserId = await createDemoUser();
    const userId = req.params.userId || demoUserId;
    
    const transactions = await Transaction.find({ userId }).sort({ date: -1 }).limit(10);
    const analyses = await Analysis.find({ userId }).sort({ date: -1 }).limit(5);
    const user = await User.findById(userId);
    
    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');
    
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const profit = totalIncome - totalExpenses;
    
    const dashboardData = {
      user: user || { name: 'Rekha Demo', businessType: 'Pickle Making' },
      totalExpenses: totalExpenses,
      totalIncome: totalIncome,
      profit: profit,
      transactionCount: transactions.length,
      recentTransactions: transactions,
      aiInsights: analyses,
      savingsGoal: profit > 0 ? profit * 6 : 6000, // 6 months savings
      businessHealth: profit > 0 ? 'good' : 'needs_improvement'
    };
    
    res.json(dashboardData);
    
  } catch (error) {
    console.log('❌ Dashboard error:', error);
    res.status(500).json({ error: error.message });
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
    database: 'MongoDB Atlas Connected ✅'
  });
});

// 🚀 START SERVER
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`🎯 Server running on http://localhost:${PORT}`);
  console.log(`📊 MongoDB: ${MONGODB_URI.split('@')[1]?.split('.')[0] || 'Connected'}`);
  console.log(`🎤 Voice API ready at http://localhost:${PORT}/api/process-voice`);
  console.log(`💾 Dashboard ready at http://localhost:${PORT}/api/dashboard`);
});