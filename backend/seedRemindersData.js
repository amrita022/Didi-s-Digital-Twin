// Seed Test Data for Reminders & Nudges Feature
require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
const Reminder = require('./models/Reminder');

const MONGODB_URI = process.env.MONGODB_URI;
// Using a test user ID
const USER_ID = 'test_user_reminders_123';

async function seedRemindersData() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing test data
    console.log('🧹 Clearing existing test data for user...');
    await Transaction.deleteMany({ userId: USER_ID });
    await Reminder.deleteMany({ userId: USER_ID });
    console.log('✅ Cleared existing data');

    // ==========================================
    // SEED DATA FOR STOCK ANALYSIS NUDGES
    // ==========================================
    console.log('\n📦 Creating stock analysis test data...');
    
    // Create a large stock purchase 6 months ago
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const stockPurchase = await Transaction.create({
      userId: USER_ID,
      type: 'expense',
      amount: 15000,
      category: 'raw_materials',
      description: 'Bought extra stock for seasonal sale',
      descriptionHindi: 'मौसमी बिक्री के लिए अतिरिक्त सामान खरीदा',
      paymentMethod: 'cash',
      date: sixMonthsAgo
    });
    console.log('✅ Created stock purchase:', {
      amount: stockPurchase.amount,
      date: stockPurchase.date,
      description: stockPurchase.description
    });

    // Create slow sales after the purchase (only 30% sold in 3 months)
    const salesData = [];
    for (let i = 0; i < 8; i++) {
      const saleDate = new Date(sixMonthsAgo);
      saleDate.setDate(saleDate.getDate() + (i * 14)); // Sales every 2 weeks
      
      const sale = await Transaction.create({
        userId: USER_ID,
        type: 'income',
        amount: 1000 + (Math.random() * 2000), // Variable amounts
        category: 'sales',
        description: 'Product sale',
        paymentMethod: 'cash',
        date: saleDate
      });
      salesData.push(sale);
    }
    console.log(`✅ Created ${salesData.length} slow sales (only 30% of purchase sold)`);

    // ==========================================
    // SEED DATA FOR SEASONAL EVENT REMINDERS
    // ==========================================
    console.log('\n🎉 Creating seasonal event test data...');

    // Create sales from LAST YEAR'S Ganeshotsav (August 17)
    const lastYearGanesh = new Date();
    lastYearGanesh.setFullYear(lastYearGanesh.getFullYear() - 1);
    lastYearGanesh.setMonth(7); // August (0-indexed)
    lastYearGanesh.setDate(17);

    // Create sales 2 weeks before Ganeshotsav
    const beforeGanesh = new Date(lastYearGanesh);
    beforeGanesh.setDate(beforeGanesh.getDate() - 14);
    for (let i = 0; i < 5; i++) {
      await Transaction.create({
        userId: USER_ID,
        type: 'income',
        amount: 2000 + (Math.random() * 2000),
        category: 'sales',
        description: 'Sold modaks for Ganeshotsav',
        descriptionHindi: 'गणेशोत्सव के लिए मोदक बेचे',
        paymentMethod: 'cash',
        date: new Date(beforeGanesh.getTime() + i * 86400000)
      });
    }
    
    // Create sales during Ganeshotsav week
    for (let i = 0; i < 8; i++) {
      await Transaction.create({
        userId: USER_ID,
        type: 'income',
        amount: 3000 + (Math.random() * 3000),
        category: 'sales',
        description: 'Sold मोदक and ladoo',
        descriptionHindi: 'मोदक और लड्डू बेचे',
        paymentMethod: 'cash',
        date: new Date(lastYearGanesh.getTime() + (i - 3) * 86400000)
      });
    }
    
    // Create sales 2 weeks after
    const afterGanesh = new Date(lastYearGanesh);
    afterGanesh.setDate(afterGanesh.getDate() + 14);
    for (let i = 0; i < 5; i++) {
      await Transaction.create({
        userId: USER_ID,
        type: 'income',
        amount: 1500 + (Math.random() * 1500),
        category: 'sales',
        description: 'Ganeshotsav sales',
        paymentMethod: 'cash',
        date: new Date(afterGanesh.getTime() + i * 86400000)
      });
    }
    console.log('✅ Created Ganeshotsav (Aug 17) sales data from last year');

    // Create sales from LAST YEAR'S Diwali (October 12)
    const lastYearDiwali = new Date();
    lastYearDiwali.setFullYear(lastYearDiwali.getFullYear() - 1);
    lastYearDiwali.setMonth(9); // October (0-indexed)
    lastYearDiwali.setDate(12);

    // Create sales around Diwali
    for (let i = -14; i <= 14; i++) {
      if (i % 3 === 0) { // Create sales every 3 days
        await Transaction.create({
          userId: USER_ID,
          type: 'income',
          amount: 3500 + (Math.random() * 4500),
          category: 'sales',
          description: 'Diwali season sales',
          descriptionHindi: 'दिवाली के मौसम में बिक्री',
          paymentMethod: 'cash',
          date: new Date(lastYearDiwali.getTime() + i * 86400000)
        });
      }
    }
    console.log('✅ Created Diwali (Oct 12) sales data from last year');

    // Create sales from LAST YEAR'S Raksha Bandhan (July 30)
    const lastYearRakhi = new Date();
    lastYearRakhi.setFullYear(lastYearRakhi.getFullYear() - 1);
    lastYearRakhi.setMonth(6); // July (0-indexed)
    lastYearRakhi.setDate(30);

    // Create some sales around Raksha Bandhan
    for (let i = -10; i <= 10; i++) {
      if (i % 2 === 0) {
        await Transaction.create({
          userId: USER_ID,
          type: 'income',
          amount: 2000 + (Math.random() * 2500),
          category: 'sales',
          description: 'Raksha Bandhan sales',
          descriptionHindi: 'रक्षा बंधन की बिक्री',
          paymentMethod: 'cash',
          date: new Date(lastYearRakhi.getTime() + i * 86400000)
        });
      }
    }
    console.log('✅ Created Raksha Bandhan (Jul 30) sales data from last year');

    // ==========================================
    // Create some regular income/expense transactions
    // ==========================================
    console.log('\n📊 Creating regular transaction data...');
    
    // Recent expenses
    const recentExpense = new Date();
    recentExpense.setDate(recentExpense.getDate() - 5);
    
    await Transaction.create({
      userId: USER_ID,
      type: 'expense',
      amount: 5000,
      category: 'utilities',
      description: 'Electricity and water bill',
      paymentMethod: 'bank_transfer',
      date: recentExpense
    });

    // Recent income
    const recentIncome = new Date();
    recentIncome.setDate(recentIncome.getDate() - 3);
    
    await Transaction.create({
      userId: USER_ID,
      type: 'income',
      amount: 25000,
      category: 'sales',
      description: 'Daily sales',
      paymentMethod: 'cash',
      date: recentIncome
    });

    console.log('✅ Created regular transactions');

    // ==========================================
    // Summary
    // ==========================================
    const totalTransactions = await Transaction.countDocuments({ userId: USER_ID });
    console.log('\n' + '='.repeat(50));
    console.log('✅ SEED DATA COMPLETE');
    console.log('='.repeat(50));
    console.log(`📊 Total transactions created: ${totalTransactions}`);
    console.log(`👤 User ID: ${USER_ID}`);
    console.log('\n🔗 Test the reminders API:');
    console.log(`GET http://localhost:5002/api/reminders?userId=${USER_ID}&language=english`);
    console.log('\n💡 Features to test:');
    console.log('✓ Stock Analysis Nudge (should appear for old stock purchase with slow sales)');
    console.log('✓ Seasonal Event Reminders (Ganeshotsav, Diwali, Raksha Bandhan)');
    console.log('✓ Click bell icon on dashboard to see reminders modal');
    console.log('='.repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedRemindersData();
