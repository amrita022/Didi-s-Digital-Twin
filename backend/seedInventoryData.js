// seedInventoryData.js - Seed initial inventory data for testing
const mongoose = require('mongoose');
require('dotenv').config();

const Inventory = require('./models/Inventory');

const TEST_USER = 'zj5NVCFe9lh4jzCfT5Kz85RANJq1';

async function seedInventory() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!');

    // Clear existing inventory for test user
    await Inventory.deleteMany({ userId: TEST_USER });
    console.log(`🗑️ Cleared existing inventory for ${TEST_USER}`);

    // Seed inventory items based on historical sales patterns
    const items = [
      {
        userId: TEST_USER,
        itemName: 'Sarees',
        quantity: 50,
        minStockLevel: 5,
        price: 1500,
        totalValue: 50 * 1500,
        seasonalDemandMultiplier: 4.3,
        upcomingFestivals: ['Diwali', 'Navratri'],
        status: 'in_stock',
        soldLastMonth: 8,
        soldLast3Months: 22,
        soldLast6Months: 45,
        suggestedRestockQty: 40,
        suggestedRestockReason: 'Festivals approaching: Diwali, Navratri (4.3x demand)'
      },
      {
        userId: TEST_USER,
        itemName: 'Dresses',
        quantity: 75,
        minStockLevel: 8,
        price: 800,
        totalValue: 75 * 800,
        seasonalDemandMultiplier: 2.8,
        upcomingFestivals: ['Valentine'],
        status: 'in_stock',
        soldLastMonth: 12,
        soldLast3Months: 35,
        soldLast6Months: 68,
        suggestedRestockQty: 50,
        suggestedRestockReason: 'Steady demand, Valentine coming'
      },
      {
        userId: TEST_USER,
        itemName: 'Jewelry',
        quantity: 120,
        minStockLevel: 10,
        price: 2500,
        totalValue: 120 * 2500,
        seasonalDemandMultiplier: 3.2,
        upcomingFestivals: ['Diwali', 'Wedding Season'],
        status: 'in_stock',
        soldLastMonth: 15,
        soldLast3Months: 42,
        soldLast6Months: 80,
        suggestedRestockQty: 60,
        suggestedRestockReason: 'High margin item, festival peaks'
      },
      {
        userId: TEST_USER,
        itemName: 'Lehengas',
        quantity: 30,
        minStockLevel: 3,
        price: 3500,
        totalValue: 30 * 3500,
        seasonalDemandMultiplier: 5.1,
        upcomingFestivals: ['Navratri', 'Wedding Season', 'Diwali'],
        status: 'in_stock',
        soldLastMonth: 6,
        soldLast3Months: 18,
        soldLast6Months: 35,
        suggestedRestockQty: 80,
        suggestedRestockReason: 'Premium item with high festival demand (5.1x)'
      },
      {
        userId: TEST_USER,
        itemName: 'Bangles',
        quantity: 200,
        minStockLevel: 20,
        price: 150,
        totalValue: 200 * 150,
        seasonalDemandMultiplier: 3.5,
        upcomingFestivals: ['Karva Chauth', 'Diwali'],
        status: 'in_stock',
        soldLastMonth: 35,
        soldLast3Months: 95,
        soldLast6Months: 180,
        suggestedRestockQty: 150,
        suggestedRestockReason: 'High volume item, festival bulk sales'
      },
      {
        userId: TEST_USER,
        itemName: 'Traditional Kurta',
        quantity: 45,
        minStockLevel: 5,
        price: 1200,
        totalValue: 45 * 1200,
        seasonalDemandMultiplier: 2.5,
        upcomingFestivals: ['Eid', 'Rakhi'],
        status: 'in_stock',
        soldLastMonth: 8,
        soldLast3Months: 20,
        soldLast6Months: 42,
        suggestedRestockQty: 35,
        suggestedRestockReason: 'Modest demand, festival boosts'
      }
    ];

    const created = await Inventory.insertMany(items);
    console.log(`\n✅ Seeded ${created.length} inventory items:`);
    
    created.forEach(item => {
      console.log(`   📦 ${item.itemName}`);
      console.log(`      Qty: ${item.quantity} (Min: ${item.minStockLevel})`);
      console.log(`      Price: ₹${item.price} | Total: ₹${item.totalValue}`);
      console.log(`      Seasonal Multiplier: ${item.seasonalDemandMultiplier}x`);
      console.log(`      Festivals: ${item.upcomingFestivals.join(', ')}`);
      console.log('');
    });

    // Summary
    const totalInventoryValue = created.reduce((sum, item) => sum + item.totalValue, 0);
    const totalItems = created.reduce((sum, item) => sum + item.quantity, 0);
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📊 INVENTORY SUMMARY`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Total Items (units): ${totalItems}`);
    console.log(`Total Inventory Value: ₹${totalInventoryValue.toLocaleString()}`);
    console.log(`Average Item Value: ₹${(totalInventoryValue / totalItems).toFixed(2)}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedInventory();
