const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
require('dotenv').config();

async function analyzeItems() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Get all income transactions
    const transactions = await Transaction.find({ 
      type: 'income', 
      category: 'clothing' 
    });
    
    console.log(`📊 Analyzing ${transactions.length} clothing sales...\n`);
    
    // Group by item with revenue
    const items = {};
    transactions.forEach(t => {
      const desc = t.description || 'Unknown';
      let item = 'Other';
      
      if (/साड़ी|saree/i.test(desc)) item = 'साड़ी';
      else if (/लहंगा|lehenga/i.test(desc)) item = 'लहंगा';
      else if (/कुर्ती|kurti/i.test(desc)) item = 'कुर्ती';
      else if (/कुर्ता|kurta/i.test(desc)) item = 'कुर्ता';
      else if (/दुपट्टा|dupatta/i.test(desc)) item = 'दुपट्टा';
      else if (/ब्लाउज|blouse/i.test(desc)) item = 'ब्लाउज';
      
      if (!items[item]) {
        items[item] = { count: 0, revenue: 0 };
      }
      items[item].count += 1;
      items[item].revenue += t.amount;
    });
    
    // Sort by revenue
    const sorted = Object.entries(items)
      .map(([item, data]) => ({
        item,
        count: data.count,
        revenue: data.revenue,
        avgPrice: Math.round(data.revenue / data.count)
      }))
      .sort((a, b) => b.revenue - a.revenue);
    
    console.log('💰 TOP SELLING ITEMS (by revenue):\n');
    sorted.forEach((item, i) => {
      console.log(`${i + 1}. ${item.item}`);
      console.log(`   Sales: ${item.count} units`);
      console.log(`   Revenue: ₹${item.revenue.toLocaleString('en-IN')}`);
      console.log(`   Avg Price: ₹${item.avgPrice}`);
      console.log('');
    });
    
    // Analyze December specifically
    const decTransactions = transactions.filter(t => {
      const month = new Date(t.date).getMonth();
      return month === 11; // December
    });
    
    console.log(`\n🎄 DECEMBER ANALYSIS (${decTransactions.length} sales):\n`);
    
    const decItems = {};
    decTransactions.forEach(t => {
      const desc = t.description || 'Unknown';
      let item = 'Other';
      
      if (/साड़ी|saree/i.test(desc)) item = 'साड़ी';
      else if (/लहंगा|lehenga/i.test(desc)) item = 'लहंगा';
      else if (/कुर्ती|kurti/i.test(desc)) item = 'कुर्ती';
      else if (/कुर्ता|kurta/i.test(desc)) item = 'कुर्ता';
      else if (/दुपट्टा|dupatta/i.test(desc)) item = 'दुपट्टा';
      else if (/ब्लाउज|blouse/i.test(desc)) item = 'ब्लाउज';
      
      if (!decItems[item]) {
        decItems[item] = { count: 0, revenue: 0 };
      }
      decItems[item].count += 1;
      decItems[item].revenue += t.amount;
    });
    
    const decSorted = Object.entries(decItems)
      .map(([item, data]) => ({
        item,
        count: data.count,
        revenue: data.revenue,
        avgPrice: Math.round(data.revenue / data.count)
      }))
      .sort((a, b) => b.revenue - a.revenue);
    
    decSorted.forEach((item, i) => {
      console.log(`${i + 1}. ${item.item}`);
      console.log(`   Sales: ${item.count} units`);
      console.log(`   Revenue: ₹${item.revenue.toLocaleString('en-IN')}`);
      console.log(`   Avg Price: ₹${item.avgPrice}`);
      console.log('');
    });
    
    await mongoose.disconnect();
    console.log('👋 Done!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

analyzeItems();
