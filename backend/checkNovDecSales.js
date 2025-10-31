const mongoose = require('mongoose');
require('dotenv').config();
const Transaction = require('./models/Transaction');

async function checkSales() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/didi-digital-twin');
    console.log('✅ Connected to MongoDB\n');
    
    const userId = 'zj5NVCFe9lh4jzCfT5Kz85RANJq1';
    
    // Get all income transactions
    const allIncome = await Transaction.find({ userId, type: 'income' }).sort({ date: 1 });
    
    // Filter Nov-Dec 2024
    const novDec = allIncome.filter(t => {
      const month = new Date(t.date).getMonth();
      const year = new Date(t.date).getFullYear();
      return year === 2024 && (month === 10 || month === 11); // November = 10, December = 11
    });
    
    console.log('📅 Nov-Dec 2024 Income Transactions:');
    console.log('=' .repeat(60));
    novDec.forEach(t => {
      console.log(`${new Date(t.date).toDateString().padEnd(20)} ₹${t.amount.toString().padStart(6)} - ${t.description}`);
    });
    
    const total = novDec.reduce((sum, t) => sum + t.amount, 0);
    console.log('=' .repeat(60));
    console.log(`\n💰 Total Nov-Dec 2024 Income: ₹${total.toLocaleString()}\n`);
    
    // Also show all-time totals
    const allTimeIncome = allIncome.reduce((sum, t) => sum + t.amount, 0);
    const allExpenses = await Transaction.find({ userId, type: 'expense' });
    const allTimeExpenses = allExpenses.reduce((sum, t) => sum + t.amount, 0);
    const allTimeProfit = allTimeIncome - allTimeExpenses;
    
    console.log('📊 All-Time Stats (2024):');
    console.log(`   Total Income: ₹${allTimeIncome.toLocaleString()}`);
    console.log(`   Total Expenses: ₹${allTimeExpenses.toLocaleString()}`);
    console.log(`   Net Profit: ₹${allTimeProfit.toLocaleString()}\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkSales();
