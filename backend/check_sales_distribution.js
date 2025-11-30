require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');

async function checkDistribution() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const sales = await Transaction.find({ 
    userId: 'zj5NVCFe9lh4jzCfT5Kz85RANJq1', 
    type: 'income' 
  }).sort({ date: -1 }).limit(500);
  
  const items = {};
  sales.forEach(t => {
    const desc = t.description.toLowerCase();
    ['साड़ी', 'लहंगा', 'कुर्ती', 'कुर्ता', 'दुपट्टा', 'ब्लाउज', 'शर्ट', 'पैंट', 'ड्रेस'].forEach(item => {
      if (desc.includes(item.toLowerCase())) {
        items[item] = (items[item] || 0) + 1;
      }
    });
  });
  
  const sorted = Object.entries(items).sort((a, b) => b[1] - a[1]);
  const maxSales = sorted[0][1];
  
  console.log('\n📊 Sales Distribution:\n');
  sorted.forEach(([item, count], i) => {
    const pct = ((count / maxSales) * 100).toFixed(1);
    const ratio = count / maxSales;
    
    let tier;
    if (ratio >= 0.9) tier = '30% cap (Top sellers)';
    else if (ratio >= 0.7) tier = '25% cap (High performers)';
    else if (ratio >= 0.5) tier = '20% cap (Medium)';
    else if (ratio >= 0.3) tier = '15% cap (Lower medium)';
    else tier = '10% cap (Low volume)';
    
    console.log(`${i+1}. ${item.padEnd(10)} ${count} sales (${pct.padStart(5)}% of max) → ${tier}`);
  });
  
  process.exit(0);
}

checkDistribution().catch(e => {
  console.error(e);
  process.exit(1);
});
