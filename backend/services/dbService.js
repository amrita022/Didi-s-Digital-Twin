const mongoose = require('mongoose');

// Schemas
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

const Transaction = mongoose.model('Transaction', transactionSchema);
const Analysis = mongoose.model('Analysis', analysisSchema);

class DBService {
  async saveTransaction(transactionData) {
    const transaction = new Transaction(transactionData);
    return await transaction.save();
  }

  async getTodaysTotals(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const transactions = await Transaction.find({
      userId,
      date: { $gte: today }
    });
    
    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');
    
    return {
      expenses: expenses.reduce((sum, t) => sum + t.amount, 0),
      income: income.reduce((sum, t) => sum + t.amount, 0)
    };
  }

  async getDashboardData(userId) {
    const transactions = await Transaction.find({ userId }).sort({ date: -1 }).limit(10);
    const analyses = await Analysis.find({ userId }).sort({ date: -1 }).limit(5);
    
    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');
    
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const profit = totalIncome - totalExpenses;
    
    return {
      user: { name: 'Demo User', businessType: 'Small Business' },
      totalExpenses,
      totalIncome,
      profit,
      transactionCount: transactions.length,
      recentTransactions: transactions,
      aiInsights: analyses,
      savingsGoal: profit > 0 ? profit * 6 : 6000,
      businessHealth: profit > 0 ? 'good' : 'needs_improvement'
    };
  }

  async getPricingSuggestion(category, userId) {
    const expenses = await Transaction.find({ 
      userId, 
      type: 'expense',
      category 
    });
    
    if (expenses.length === 0) {
      const defaults = {
        pickles: { cost: 60, suggestedPrice: 120 },
        spices: { cost: 50, suggestedPrice: 100 },
        clothing: { cost: 100, suggestedPrice: 200 },
        general: { cost: 50, suggestedPrice: 100 }
      };
      return defaults[category] || defaults.general;
    }

    const avgCost = expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length;
    const suggestedPrice = Math.round(avgCost * 1.5);
    
    return {
      cost: Math.round(avgCost),
      suggestedPrice,
      margin: 0.5
    };
  }
}

module.exports = new DBService();