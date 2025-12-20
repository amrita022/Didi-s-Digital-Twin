// Seed transactions for all inventory items so they appear in Demand/Pricing analysis
const mongoose = require('mongoose');
require('dotenv').config();

const Transaction = require('./models/Transaction');

const TEST_USER = 'zj5NVCFe9lh4jzCfT5Kz85RANJq1';

async function seedTransactions() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!');

    // Clear existing income transactions for inventory items
    await Transaction.deleteMany({ 
      userId: TEST_USER, 
      type: 'income',
      $or: [
        { description: { $regex: 'saree', $options: 'i' } },
        { description: { $regex: 'dress', $options: 'i' } },
        { description: { $regex: 'jewelry', $options: 'i' } },
        { description: { $regex: 'leheng', $options: 'i' } },
        { description: { $regex: 'bangle', $options: 'i' } },
        { description: { $regex: 'kurta', $options: 'i' } }
      ]
    });
    console.log('🗑️  Cleared existing inventory transactions');

    // Create realistic transaction history for each item
    const transactions = [];
    const today = new Date();

    // Helper to create date range transactions
    const createTransactions = (itemName, basePrice, quantity, monthsBack) => {
      const txns = [];
      for (let month = monthsBack; month >= 0; month--) {
        const monthDate = new Date(today);
        monthDate.setMonth(monthDate.getMonth() - month);
        
        // 5-8 sales per month per item
        const salesPerMonth = Math.floor(Math.random() * 4) + 5;
        
        for (let i = 0; i < salesPerMonth; i++) {
          const day = Math.floor(Math.random() * 28) + 1;
          const date = new Date(monthDate);
          date.setDate(day);
          
          // Slight variation in quantity sold (1-5 units)
          const qtySold = Math.floor(Math.random() * 5) + 1;
          // Price variation ±10%
          const priceVariation = basePrice * (0.9 + Math.random() * 0.2);
          const totalAmount = Math.floor(priceVariation * qtySold);
          
          txns.push({
            userId: TEST_USER,
            type: 'income',
            category: 'clothing',
            amount: totalAmount,
            description: `Sold ${qtySold} ${itemName.toLowerCase()} for ₹${totalAmount}`,
            date: date,
            createdAt: date,
            updatedAt: date
          });
        }
      }
      return txns;
    };

    // Generate transactions for all 6 items over last 6 months
    transactions.push(...createTransactions('Sarees', 1500, 50, 6));
    transactions.push(...createTransactions('Dresses', 800, 75, 6));
    transactions.push(...createTransactions('Jewelry', 2500, 120, 6));
    transactions.push(...createTransactions('Lehengas', 3500, 30, 6));
    transactions.push(...createTransactions('Bangles', 150, 200, 6));
    transactions.push(...createTransactions('Traditional Kurta', 1200, 45, 6));

    // Save all transactions
    const result = await Transaction.insertMany(transactions);
    
    console.log(`\n✅ Seeded ${result.length} transactions for inventory items:`);
    console.log(`   📦 Sarees: ${result.filter(t => t.description.includes('Sarees')).length} transactions`);
    console.log(`   👗 Dresses: ${result.filter(t => t.description.includes('Dresses')).length} transactions`);
    console.log(`   💎 Jewelry: ${result.filter(t => t.description.includes('Jewelry')).length} transactions`);
    console.log(`   🎀 Lehengas: ${result.filter(t => t.description.includes('Lehengas')).length} transactions`);
    console.log(`   📿 Bangles: ${result.filter(t => t.description.includes('Bangles')).length} transactions`);
    console.log(`   👕 Traditional Kurta: ${result.filter(t => t.description.includes('Kurta')).length} transactions`);
    
    console.log(`\n💰 Total transaction amount: ₹${result.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}`);
    console.log('\n✨ All items now have transaction history for Demand/Pricing analysis!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedTransactions();
