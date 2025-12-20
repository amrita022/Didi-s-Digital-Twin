// Test reminder generation with demand predictions
require('dotenv').config();
const mongoose = require('mongoose');
const Inventory = require('./models/Inventory');
const Reminder = require('./models/Reminder');
const demandPredictions = require('./utils/demandPredictions');

const TEST_USER_ID = 'zj5NVCFe9lh4jzCfT5Kz85RANJq1';

async function testReminders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get inventory items
    const inventoryItems = await Inventory.find({ userId: TEST_USER_ID });
    console.log(`\n📦 Found ${inventoryItems.length} inventory items:\n`);
    
    inventoryItems.forEach(item => {
      const isLowStock = item.quantity <= item.minStockLevel;
      const icon = isLowStock ? '⚠️' : '✅';
      console.log(`${icon} ${item.itemName}: ${item.quantity} units (Min: ${item.minStockLevel})`);
    });

    // Get demand predictions
    console.log('\n🔮 Fetching demand predictions...\n');
    const predictions = await demandPredictions.generateDemandPredictions(TEST_USER_ID, 'english');
    
    if (predictions.success && predictions.predictions.length > 0) {
      const nextMonth = predictions.predictions[0];
      console.log(`📅 Next Month: ${nextMonth.month} ${nextMonth.year}`);
      console.log(`📊 Expected Revenue: ₹${nextMonth.predictedRevenue.toLocaleString('en-IN')}`);
      console.log(`🎯 Demand Level: ${nextMonth.demand}`);
      console.log(`🎉 Festival: ${nextMonth.festival || 'None'}\n`);
      
      console.log('📦 Stock Recommendations:');
      nextMonth.stockRecommendations?.forEach(rec => {
        const itemEnglish = demandPredictions.translateItemToEnglish(rec.item);
        console.log(`   ${itemEnglish}: ${rec.recommendedStock} units (₹${rec.expectedRevenue.toLocaleString('en-IN')} revenue)`);
      });
    }

    // Create demand lookup
    const demandLookup = {};
    if (predictions.success && predictions.predictions.length > 0) {
      const nextMonth = predictions.predictions[0];
      nextMonth.stockRecommendations?.forEach(rec => {
        const itemEnglish = demandPredictions.translateItemToEnglish(rec.item);
        demandLookup[itemEnglish] = rec.recommendedStock;
      });
    }

    // Generate reminders for low stock items
    console.log('\n\n🔔 Generating Low Stock Reminders:\n');
    let reminderCount = 0;

    for (const item of inventoryItems) {
      if (item.quantity <= item.minStockLevel) {
        const suggestedQty = demandLookup[item.itemName] || Math.max(item.minStockLevel * 2, 10);
        
        console.log(`⚠️ ${item.itemName}:`);
        console.log(`   Current: ${item.quantity} units`);
        console.log(`   Minimum: ${item.minStockLevel} units`);
        console.log(`   Suggested for next month: ${suggestedQty} units`);
        
        const message = `Only ${item.quantity} ${item.itemName} left. Stock up at least ${suggestedQty} units for next month based on demand prediction.`;
        const messageHindi = `केवल ${item.quantity} ${item.itemName} बचा है। मांग के अनुसार अगले महीने के लिए कम से कम ${suggestedQty} यूनिट स्टॉक करें।`;
        
        console.log(`   Message: ${message}\n`);
        
        await Reminder.findOneAndUpdate(
          { userId: TEST_USER_ID, type: 'low_stock', 'metadata.itemName': item.itemName },
          {
            $set: {
              userId: TEST_USER_ID,
              type: 'low_stock',
              title: `Low Stock: ${item.itemName}`,
              message,
              messageHindi,
              priority: 10,
              isActive: true,
              isDismissed: false,
              actionRequired: 'restock',
              metadata: { 
                itemName: item.itemName, 
                quantity: item.quantity, 
                minStock: item.minStockLevel,
                suggestedQty: suggestedQty
              }
            }
          },
          { upsert: true, new: true }
        );
        
        reminderCount++;
      }
    }

    console.log(`\n✅ Created ${reminderCount} low stock reminders`);

    // Fetch and display all active reminders
    const allReminders = await Reminder.find({ 
      userId: TEST_USER_ID, 
      isActive: true, 
      isDismissed: false 
    }).sort({ priority: -1 });

    console.log(`\n\n📢 Active Reminders (${allReminders.length}):\n`);
    allReminders.forEach((reminder, idx) => {
      console.log(`${idx + 1}. [${reminder.type}] ${reminder.title}`);
      console.log(`   ${reminder.message}`);
      if (reminder.metadata?.suggestedQty) {
        console.log(`   💡 Suggestion: Stock ${reminder.metadata.suggestedQty} units`);
      }
      console.log();
    });

    mongoose.disconnect();
    console.log('✅ Test complete!');

  } catch (error) {
    console.error('❌ Error:', error);
    mongoose.disconnect();
  }
}

testReminders();
