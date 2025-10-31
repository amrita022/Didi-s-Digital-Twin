// Seed script to add historical transaction data for AI insights
const mongoose = require('mongoose');
require('dotenv').config();

const transactionSchema = new mongoose.Schema({
  userId: String,
  type: String,
  amount: Number,
  category: String,
  description: String,
  date: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Historical transactions for last year (2024)
// Realistic rural business: More items, reasonable prices
const historicalData = [
  // December 2024 - Wedding Season (More transactions, reasonable prices)
  { type: 'income', amount: 2500, category: 'clothing', description: 'लहंगा बेचा - शादी', date: new Date('2024-12-02') },
  { type: 'expense', amount: 2500, category: 'inventory', description: 'कपड़े का स्टॉक खरीदा', date: new Date('2024-12-03') },
  { type: 'income', amount: 1800, category: 'clothing', description: 'साड़ी बेची', date: new Date('2024-12-05') },
  { type: 'income', amount: 2200, category: 'clothing', description: 'लहंगा बेचा', date: new Date('2024-12-08') },
  { type: 'expense', amount: 1200, category: 'rent', description: 'दुकान का किराया', date: new Date('2024-12-01') },
  { type: 'income', amount: 1500, category: 'clothing', description: 'साड़ी बेची - शादी', date: new Date('2024-12-10') },
  { type: 'income', amount: 2000, category: 'clothing', description: 'लहंगा और ब्लाउज', date: new Date('2024-12-12') },
  { type: 'income', amount: 1800, category: 'clothing', description: 'साड़ी बेची', date: new Date('2024-12-15') },
  { type: 'income', amount: 2500, category: 'clothing', description: 'लहंगा बेचा - शादी', date: new Date('2024-12-17') },
  { type: 'income', amount: 1200, category: 'clothing', description: 'कुर्ती बेची', date: new Date('2024-12-18') },
  { type: 'income', amount: 1700, category: 'clothing', description: 'साड़ी बेची', date: new Date('2024-12-20') },
  { type: 'income', amount: 2300, category: 'clothing', description: 'लहंगा बेचा', date: new Date('2024-12-22') },
  { type: 'income', amount: 1600, category: 'clothing', description: 'साड़ी और ब्लाउज', date: new Date('2024-12-24') },
  { type: 'expense', amount: 700, category: 'utilities', description: 'बिजली बिल', date: new Date('2024-12-28') },
  
  // November 2024 - Diwali Period (High Sales + Stock Purchases)
  { type: 'expense', amount: 3000, category: 'inventory', description: 'दिवाली स्टॉक - नए कपड़े', date: new Date('2024-11-01') },
  { type: 'income', amount: 3000, category: 'clothing', description: 'दिवाली साड़ी बेची', date: new Date('2024-11-02') },
  { type: 'income', amount: 2500, category: 'clothing', description: 'लहंगा बेचा', date: new Date('2024-11-05') },
  { type: 'expense', amount: 1200, category: 'rent', description: 'दुकान का किराया', date: new Date('2024-11-01') },
  { type: 'income', amount: 1800, category: 'clothing', description: 'साड़ी बेची', date: new Date('2024-11-08') },
  { type: 'income', amount: 2200, category: 'clothing', description: 'कुर्ता सेट बेचा', date: new Date('2024-11-12') },
  { type: 'expense', amount: 500, category: 'transport', description: 'माल ढुलाई', date: new Date('2024-11-15') },
  
  // October 2024 - Pre-Diwali (Stocking Up)
  { type: 'expense', amount: 1800, category: 'inventory', description: 'त्योहार के लिए स्टॉक', date: new Date('2024-10-05') },
  { type: 'income', amount: 1500, category: 'clothing', description: 'दुपट्टा बेचा', date: new Date('2024-10-15') },
  { type: 'expense', amount: 1200, category: 'rent', description: 'दुकान का किराया', date: new Date('2024-10-01') },
  { type: 'income', amount: 2000, category: 'clothing', description: 'साड़ी बेची', date: new Date('2024-10-20') },
  { type: 'income', amount: 1200, category: 'clothing', description: 'कुर्ती बेची', date: new Date('2024-10-25') },
  
  // September 2024 - Normal Month
  { type: 'income', amount: 1800, category: 'clothing', description: 'कपड़े बेचे', date: new Date('2024-09-10') },
  { type: 'expense', amount: 1200, category: 'rent', description: 'दुकान का किराया', date: new Date('2024-09-01') },
  { type: 'income', amount: 900, category: 'clothing', description: 'साड़ी बिक्री', date: new Date('2024-09-15') },
  { type: 'expense', amount: 1000, category: 'inventory', description: 'कपड़े का स्टॉक', date: new Date('2024-09-20') },
  
  // August 2024 - Monsoon (Lower Sales)
  { type: 'expense', amount: 1200, category: 'rent', description: 'दुकान का किराया', date: new Date('2024-08-01') },
  { type: 'income', amount: 1200, category: 'clothing', description: 'कुर्ती बेची', date: new Date('2024-08-05') },
  { type: 'income', amount: 800, category: 'clothing', description: 'कपड़े बेचे', date: new Date('2024-08-18') },
  { type: 'expense', amount: 600, category: 'maintenance', description: 'दुकान की मरम्मत', date: new Date('2024-08-25') },
  
  // July 2024
  { type: 'expense', amount: 1200, category: 'rent', description: 'दुकान का किराया', date: new Date('2024-07-01') },
  { type: 'income', amount: 1500, category: 'clothing', description: 'साड़ी बेची', date: new Date('2024-07-10') },
  { type: 'expense', amount: 900, category: 'inventory', description: 'कपड़े खरीदे', date: new Date('2024-07-20') },
  
  // June 2024
  { type: 'expense', amount: 1200, category: 'rent', description: 'दुकान का किराया', date: new Date('2024-06-01') },
  { type: 'income', amount: 1800, category: 'clothing', description: 'कपड़े बेचे', date: new Date('2024-06-12') },
  { type: 'expense', amount: 800, category: 'utilities', description: 'बिजली और पानी', date: new Date('2024-06-25') },
  
  // May 2024 - Wedding Season
  { type: 'expense', amount: 1200, category: 'rent', description: 'दुकान का किराया', date: new Date('2024-05-01') },
  { type: 'expense', amount: 1600, category: 'inventory', description: 'शादी के कपड़े - स्टॉक', date: new Date('2024-05-05') },
  { type: 'income', amount: 2000, category: 'clothing', description: 'लहंगा बेचा', date: new Date('2024-05-08') },
  { type: 'expense', amount: 600, category: 'transport', description: 'डिलीवरी खर्च', date: new Date('2024-05-22') },
  
  // April 2024 - Wedding Season Start
  { type: 'expense', amount: 1200, category: 'rent', description: 'दुकान का किराया', date: new Date('2024-04-01') },
  { type: 'expense', amount: 2000, category: 'inventory', description: 'शादी सीजन स्टॉक', date: new Date('2024-04-05') },
  { type: 'income', amount: 2500, category: 'clothing', description: 'शादी का लहंगा', date: new Date('2024-04-15') },
  { type: 'income', amount: 1800, category: 'clothing', description: 'साड़ी बेची', date: new Date('2024-04-28') },
  
  // March 2024
  { type: 'expense', amount: 1200, category: 'rent', description: 'दुकान का किराया', date: new Date('2024-03-01') },
  { type: 'income', amount: 1500, category: 'clothing', description: 'कपड़े', date: new Date('2024-03-10') },
  { type: 'expense', amount: 900, category: 'inventory', description: 'नया स्टॉक', date: new Date('2024-03-20') },
  
  // February 2024 - Post Festive (Lower)
  { type: 'expense', amount: 1200, category: 'rent', description: 'दुकान का किराया', date: new Date('2024-02-01') },
  { type: 'income', amount: 1000, category: 'clothing', description: 'कुर्ती', date: new Date('2024-02-14') },
  { type: 'expense', amount: 500, category: 'utilities', description: 'बिजली बिल', date: new Date('2024-02-25') },
  
  // January 2024 - Slow Month
  { type: 'expense', amount: 1200, category: 'rent', description: 'दुकान का किराया', date: new Date('2024-01-01') },
  { type: 'income', amount: 800, category: 'clothing', description: 'कपड़े', date: new Date('2024-01-15') },
  { type: 'expense', amount: 700, category: 'inventory', description: 'छोटा स्टॉक', date: new Date('2024-01-28') },
];

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/didi-digital-twin');
    console.log('✅ Connected to MongoDB');

    // Get userId from command line or use default
    const userId = process.argv[2] || 'demo-user-for-testing';
    
    console.log(`📊 Seeding historical data for userId: ${userId}`);

    // Add userId to all transactions
    const transactionsWithUser = historicalData.map(t => ({
      ...t,
      userId
    }));

    // 🗑️ CLEANUP: Delete existing data before seeding to prevent duplicates
    console.log('🗑️ Cleaning up old data...');
    const deleteResult = await Transaction.deleteMany({ userId });
    console.log(`   Deleted ${deleteResult.deletedCount} existing transactions`);
    
    // Insert transactions with explicit date preservation
    // Use insertMany with timestamps: false to prevent default Date.now
    const result = await Transaction.insertMany(transactionsWithUser, { 
      timestamps: false // Don't auto-update createdAt/updatedAt
    });
    
    console.log(`✅ Successfully added ${result.length} historical transactions!`);
    
    // Verify dates were saved correctly
    const firstTransaction = await Transaction.findOne({ userId }).sort({ date: 1 });
    const lastTransaction = await Transaction.findOne({ userId }).sort({ date: -1 });
    console.log(`\n🔍 Date Verification:`);
    console.log(`   Oldest: ${firstTransaction?.date?.toISOString().split('T')[0]}`);
    console.log(`   Newest: ${lastTransaction?.date?.toISOString().split('T')[0]}`);
    console.log('\n📈 Data Summary:');
    console.log(`   Year: 2024 (Last Year)`);
    console.log(`   Total Transactions: ${result.length}`);
    console.log(`   Festive Season (Nov-Dec): High sales recorded`);
    console.log(`   Wedding Season (Apr-May): Good performance`);
    console.log(`   Regular Months: Baseline data available`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedData();
}

module.exports = { historicalData };