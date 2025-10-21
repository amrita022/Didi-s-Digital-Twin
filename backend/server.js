const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Simple MongoDB connection
const MONGODB_URI = 'mongodb+srv://amrita022:RVvWu83ZN6Ei8aPg@didi.btostpp.mongodb.net/didi_digital_twin?retryWrites=true&w=majority';

console.log('🔗 Connecting to MongoDB...');
mongoose.connect(MONGODB_URI)
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
  type: Strin
  amount: Number,
  category: String,
  description: String,
  date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

// 🎤 VOICE PROCESSING API
app.post('/api/process-voice', async (req, res) => {
  try {
    const { text, userId } = req.body;
    console.log('🔊 Voice command:', text);
    
    // Extract amount
    const amountMatch = text.match(/(\d+)/);
    const amount = amountMatch ? parseInt(amountMatch[1]) : null;
    
    // Detect intent
    let intent = 'unknown';
    let category = 'general';
    
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('खर्च') || lowerText.includes('spent') || lowerText.includes('expense')) {
      intent = 'expense';
    } else if (lowerText.includes('बिक्री') || lowerText.includes('sale') || lowerText.includes('income')) {
      intent = 'income';
    } else if (lowerText.includes('price') || lowerText.includes('कीमत')) {
      intent = 'pricing';
    }
    
    // Save transaction
    let savedTransaction = null;
    if ((intent === 'expense' || intent === 'income') && amount) {
      savedTransaction = new Transaction({
        userId: userId || 'demo-user',
        type: intent,
        amount: amount,
        category: category,
        description: text
      });
      await savedTransaction.save();
      console.log('💾 Saved:', savedTransaction);
    }
    
    // Generate response
    let response = '';
    if (intent === 'expense') {
      response = `💰 I recorded your expense of ₹${amount}. Let me check your budget.`;
    } else if (intent === 'income') {
      response = `🎉 Great! I logged your sale of ₹${amount}. Your business is growing!`;
    } else if (intent === 'pricing') {
      response = `💡 Based on your costs, you should charge at least 30% more to earn fair wages.`;
    } else {
      response = `🤔 I understand: "${text}". Try saying "I spent 500 rupees" or "I sold for 800 rupees".`;
    }
    
    res.json({
      success: true,
      intent: intent,
      amount: amount,
      response: response,
      saved: !!savedTransaction
    });
    
  } catch (error) {
    console.log('❌ Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 📊 DASHBOARD API - FIXED ROUTE (no ?)
app.get('/api/dashboard', async (req, res) => {
  try {
    const userId = req.query.userId || 'demo-user';
    
    const transactions = await Transaction.find({ userId }).sort({ date: -1 }).limit(10);
    const user = await User.findOne({ _id: userId }) || { name: 'Rekha Demo', businessType: 'Pickle Making' };
    
    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');
    
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const profit = totalIncome - totalExpenses;
    
    // Generate AI insights
    const insights = [];
    if (profit > 0) {
      insights.push({
        type: 'savings',
        message: `You're saving ₹${profit} per month! In 6 months, you can buy new equipment worth ₹${profit * 6}.`
      });
    }
    
    if (income.length > 0 && totalIncome < totalExpenses * 1.3) {
      insights.push({
        type: 'pricing', 
        message: `You're underpricing! Your profit margin is low. Consider increasing prices by 30%.`
      });
    }
    
    res.json({
      user: user,
      totalExpenses: totalExpenses,
      totalIncome: totalIncome,
      profit: profit,
      recentTransactions: transactions,
      aiInsights: insights,
      transactionCount: transactions.length
    });
    
  } catch (error) {
    console.log('❌ Dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 👥 CREATE USER
app.post('/api/users', async (req, res) => {
  try {
    const { name, businessType } = req.body;
    
    const user = new User({
      name: name || 'Rekha Demo',
      businessType: businessType || 'Pickle Making'
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
    status: 'OK',
    endpoints: [
      'POST /api/process-voice',
      'GET /api/dashboard',
      'POST /api/users'
    ]
  });
});

// 🚀 START SERVER
const PORT = 5002;
app.listen(PORT, () => {
  console.log(`🎯 Server running on http://localhost:${PORT}`);
  console.log(`📊 MongoDB: Connected to Atlas`);
  console.log(`✅ Ready for frontend!`);
});