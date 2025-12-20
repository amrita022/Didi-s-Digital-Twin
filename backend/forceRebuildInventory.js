// Force rebuild inventory from transactions to fix current state
require('dotenv').config();
const mongoose = require('mongoose');
const inventoryService = require('./services/inventoryService');
const Inventory = require('./models/Inventory');

const MONGODB_URI = process.env.MONGODB_URI;
const USER_ID = 'zj5NVCFe9lh4jzCfT5Kz85RANJq1';

async function forceRebuild() {
  try {
    console.log('🔄 Force rebuilding inventory from transactions...\n');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Clear existing inventory
    console.log('🗑️  Clearing old inventory...');
    const deleted = await Inventory.deleteMany({ userId: USER_ID });
    console.log(`   Deleted ${deleted.deletedCount} old inventory records\n`);
    
    // Force rebuild
    const inventory = await inventoryService.rebuildInventoryFromTransactions(USER_ID, true);
    
    console.log('\n📦 Final Inventory:');
    console.log('='.repeat(60));
    for (const item of inventory) {
      console.log(`${item.itemName.padEnd(12)} Qty: ${String(item.quantity).padStart(4)} | MinStock: ${item.minStockLevel} | Price: ₹${item.price}`);
    }
    console.log('='.repeat(60));
    
    await mongoose.disconnect();
    console.log('\n✅ Done! Inventory rebuilt from transactions.');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

forceRebuild();
