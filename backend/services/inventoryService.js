// services/inventoryService.js - Manage inventory and stock tracking
const Inventory = require('../models/Inventory');
const Transaction = require('../models/Transaction');
const { default: mongoose } = require('mongoose');

// Normalize free-text item names to canonical labels
function normalizeItemName(name = '') {
  const n = String(name || '').toLowerCase().trim();
  const map = [
    { tokens: ['saree', 'sarees', 'sari', 'saris', 'saadi', 'sadi', 'साड़ी', 'साडी', 'saree\'s'], canon: 'Saree' },
    { tokens: ['blouse', 'blouses', 'ब्लाउज', 'blouse\'s', 'choli'], canon: 'Blouse' },
    { tokens: ['dress', 'dresses', 'ड्रेस', 'dress\'s', 'gown'], canon: 'Dress' },
    { tokens: ['shirt', 'shirts', 'शर्ट', 'shirt\'s', 'kamij'], canon: 'Shirt' },
    { tokens: ['pant', 'pants', 'trouser', 'trousers', 'पैंट', 'पैन्ट', 'pant\'s'], canon: 'Pant' }
  ];
  for (const entry of map) {
    if (entry.tokens.some(t => n.includes(t))) {
      console.log(`🔄 Normalized "${name}" → "${entry.canon}"`);
      return entry.canon;
    }
  }
  console.log(`⚠️ Could not normalize "${name}", using as-is`);
  return name && name.length ? name.charAt(0).toUpperCase() + name.slice(1) : 'Unknown';
}

/**
 * Add or update inventory for a user
 */
async function addOrUpdateInventory(userId, itemName, quantity, price, minStock = 5) {
  try {
    const canonName = normalizeItemName(itemName);
    let inventory = await Inventory.findOne({ userId, itemName: canonName });
    
    if (inventory) {
      inventory.quantity += quantity;
      inventory.price = price; // Update price
      inventory.minStockLevel = minStock;
    } else {
      inventory = await Inventory.create({
        userId,
        itemName: canonName,
        quantity,
        price,
        minStockLevel: minStock,
        lastRestockedDate: new Date()
      });
    }
    
    await inventory.save();
    return inventory;
  } catch (error) {
    console.error('❌ Error adding inventory:', error);
    throw error;
  }
}

/**
 * Deduct inventory when item is sold
 * Called automatically when transaction is created
 */
async function deductInventory(userId, itemName, quantity = 1) {
  try {
    const canonName = normalizeItemName(itemName);
    const inventory = await Inventory.findOne({ userId, itemName: canonName });
    
    if (!inventory) {
      console.warn(`⚠️ No inventory found for ${canonName}`);
      return null;
    }
    
    if (inventory.quantity < quantity) {
      console.warn(`⚠️ Insufficient stock: ${canonName} (Have: ${inventory.quantity}, Need: ${quantity})`);
      return null;
    }
    
    inventory.quantity -= quantity;
    inventory.lastSoldDate = new Date();
    
    await inventory.save();
    
    console.log(`✅ Deducted ${quantity} ${canonName} (Remaining: ${inventory.quantity})`);
    return inventory;
  } catch (error) {
    console.error('❌ Error deducting inventory:', error);
    throw error;
  }
}

/**
 * Get inventory for a user
 */
async function getInventory(userId, itemName = null) {
  try {
    let query = { userId, isActive: true };
    if (itemName) query.itemName = itemName;
    
    const inventory = await Inventory.find(query).sort({ status: 1, itemName: 1 });
    return inventory;
  } catch (error) {
    console.error('❌ Error getting inventory:', error);
    throw error;
  }
}

/**
 * Get low stock items (alerts)
 */
async function getLowStockItems(userId) {
  try {
    const lowStock = await Inventory.find({
      userId,
      isActive: true,
      $expr: { $lte: ['$quantity', '$minStockLevel'] }
    }).sort({ quantity: 1 });
    
    return lowStock;
  } catch (error) {
    console.error('❌ Error getting low stock:', error);
    throw error;
  }
}

/**
 * Update sales stats (called periodically)
 */
async function updateSalesStats(userId) {
  try {
    const items = await Inventory.find({ userId, isActive: true });
    const now = new Date();
    
    for (const item of items) {
      // Get sales for last 1, 3, 6 months
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const threeMonthsAgo = new Date(now);
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const sixMonthsAgo = new Date(now);
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      // Count transactions containing this item name
      const sales1M = await Transaction.countDocuments({
        userId,
        type: 'income',
        description: { $regex: item.itemName, $options: 'i' },
        date: { $gte: oneMonthAgo }
      });
      
      const sales3M = await Transaction.countDocuments({
        userId,
        type: 'income',
        description: { $regex: item.itemName, $options: 'i' },
        date: { $gte: threeMonthsAgo }
      });
      
      const sales6M = await Transaction.countDocuments({
        userId,
        type: 'income',
        description: { $regex: item.itemName, $options: 'i' },
        date: { $gte: sixMonthsAgo }
      });
      
      item.soldLastMonth = sales1M;
      item.soldLast3Months = sales3M;
      item.soldLast6Months = sales6M;
      
      await item.save();
    }
    
    return items;
  } catch (error) {
    console.error('❌ Error updating sales stats:', error);
    throw error;
  }
}

/**
 * Calculate suggested restock quantity based on seasonal demand
 */
async function calculateSuggestedRestock(userId, itemName) {
  try {
    const inventory = await Inventory.findOne({ userId, itemName });
    if (!inventory) return null;
    
    // Base calculation: average monthly sales * 2 months
    const avgMonthlySales = inventory.soldLast3Months / 3;
    let suggestedQty = Math.ceil(avgMonthlySales * 2);
    
    // Boost for upcoming festivals
    if (inventory.upcomingFestivals && inventory.upcomingFestivals.length > 0) {
      suggestedQty = Math.ceil(suggestedQty * inventory.seasonalDemandMultiplier);
      inventory.suggestedRestockReason = `Festival approaching: ${inventory.upcomingFestivals[0]}`;
    } else {
      inventory.suggestedRestockReason = 'Regular restocking based on sales trend';
    }
    
    // Don't suggest less than 5 or more than 100
    suggestedQty = Math.max(5, Math.min(100, suggestedQty));
    inventory.suggestedRestockQty = suggestedQty;
    
    await inventory.save();
    return inventory;
  } catch (error) {
    console.error('❌ Error calculating restock:', error);
    throw error;
  }
}

/**
 * Generate inventory alerts/reminders
 */
async function generateInventoryAlerts(userId) {
  try {
    const alerts = [];
    
    // Get low stock items
    const lowStock = await getLowStockItems(userId);
    for (const item of lowStock) {
      alerts.push({
        type: 'low_stock',
        itemName: item.itemName,
        current: item.quantity,
        minLevel: item.minStockLevel,
        message: `⚠️ Low stock alert: Only ${item.quantity} ${item.itemName} left (Min: ${item.minStockLevel})`
      });
    }
    
    // Get items with upcoming festivals
    const upcomingFestival = await Inventory.find({
      userId,
      isActive: true,
      upcomingFestivals: { $exists: true, $ne: [] }
    });
    
    for (const item of upcomingFestival) {
      const daysToFestival = calculateDaysUntilFestival(item.upcomingFestivals[0]);
      if (daysToFestival <= 30 && daysToFestival > 0) {
        alerts.push({
          type: 'festival_demand',
          itemName: item.itemName,
          festival: item.upcomingFestivals[0],
          daysUntil: daysToFestival,
          currentStock: item.quantity,
          suggestedStock: item.suggestedRestockQty,
          message: `📅 ${item.itemName} sales peak during ${item.upcomingFestivals[0]} (in ${daysToFestival} days). Consider stocking ${item.suggestedRestockQty} units.`
        });
      }
    }
    
    // Get overstock items
    const overstock = await Inventory.find({
      userId,
      isActive: true,
      $expr: { $gt: ['$quantity', { $multiply: ['$minStockLevel', 3] }] }
    });
    
    for (const item of overstock) {
      alerts.push({
        type: 'overstock',
        itemName: item.itemName,
        current: item.quantity,
        suggested: item.minStockLevel * 2,
        message: `📦 Overstock alert: ${item.itemName} has ${item.quantity} units. Consider promotional sale.`
      });
    }
    
    return alerts;
  } catch (error) {
    console.error('❌ Error generating alerts:', error);
    throw error;
  }
}

/**
 * Helper: Calculate days until festival
 */
function calculateDaysUntilFestival(festivalName) {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  const festivalDates = {
    'New Year': new Date(currentYear + 1, 0, 1),
    'Valentine': new Date(currentYear, 1, 14),
    'Holi': new Date(currentYear, 2, 25),
    'Raksha Bandhan': new Date(currentYear, 6, 30),
    'Ganeshotsav': new Date(currentYear, 7, 17),
    'Independence Day': new Date(currentYear, 7, 15),
    'Navratri': new Date(currentYear, 8, 15),
    'Dussehra': new Date(currentYear, 9, 24),
    'Diwali': new Date(currentYear, 9, 12),
    'Christmas': new Date(currentYear, 11, 25)
  };
  
  const festivalDate = festivalDates[festivalName];
  if (!festivalDate) return -1;
  
  const diff = festivalDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

module.exports = {
  addOrUpdateInventory,
  deductInventory,
  getInventory,
  getLowStockItems,
  updateSalesStats,
  calculateSuggestedRestock,
  generateInventoryAlerts,
  rebuildInventoryFromTransactions
};

/**
 * Derive inventory from transactions (single source of truth)
 * - Increases stock on "expense" transactions that look like restocking
 * - Decreases stock on "income" transactions (sales)
 * - Parses both Hindi and English item names from descriptions
 * - Estimates quantities when not explicitly provided
 */
async function rebuildInventoryFromTransactions(userId, force = false) {
  try {
    if (!userId) return [];

    // Check if we need to rebuild (only if empty or forced)
    if (!force) {
      const existingCount = await Inventory.countDocuments({ userId, isActive: true });
      if (existingCount > 0) {
        console.log('📦 Inventory exists, skipping rebuild. Use force=true to recalculate.');
        return await Inventory.find({ userId, isActive: true }).sort({ status: 1, itemName: 1 });
      }
    }

    console.log('🔄 Rebuilding inventory from transactions...');

    // Canonical items we track
    const canonicalItems = ['Saree', 'Blouse', 'Dress', 'Shirt', 'Pant'];
    // Price hints for quantity estimation on purchase expenses
    const priceHints = { Saree: 1000, Blouse: 250, Dress: 500, Shirt: 200, Pant: 300 };
    // Hindi → English mapping (and a few synonyms)
    const nameMap = {
      'साड़ी': 'Saree', 'साडी': 'Saree', 'saree': 'Saree',
      'ब्लाउज': 'Blouse', 'blouse': 'Blouse',
      'ड्रेस': 'Dress', 'dress': 'Dress',
      'शर्ट': 'Shirt', 'shirt': 'Shirt',
      'पैंट': 'Pant', 'पैन्ट': 'Pant', 'pant': 'Pant', 'trouser': 'Pant'
    };

    // Helper: normalize item name from free text
    function extractItem(text = '') {
      const t = (text || '').toLowerCase();
      // Try direct Hindi/English tokens
      for (const [token, canon] of Object.entries(nameMap)) {
        if (t.includes(token.toLowerCase())) return canon;
      }
      // Fallback simple heuristics
      if (t.includes('sari')) return 'Saree';
      if (t.includes('bangle')) return 'Blouse'; // conservative fallback
      return null;
    }

    // Helper: extract quantity from text, else estimate from amount
    function extractQty(text = '', amount = 0, itemName = null) {
      const qtyMatch = (text || '').match(/(\d{1,3})/);
      if (qtyMatch) {
        const q = parseInt(qtyMatch[1], 10);
        if (!Number.isNaN(q) && q > 0) return q;
      }
      const hint = itemName ? priceHints[itemName] : 200;
      const est = hint > 0 ? Math.max(1, Math.round((amount || 0) / hint)) : 1;
      return est;
    }

    // Initialize derived state per item
    const derived = new Map();
    for (const item of canonicalItems) {
      derived.set(item, {
        totalPurchased: 0,
        totalSold: 0,
        quantity: 0,
        minStockLevel: 5,
        price: 0,
        purchaseCount: 0,
        purchaseTotal: 0,
        salesCount: 0
      });
    }

    // Fetch all transactions for the user
    const txns = await Transaction.find({ userId }).sort({ date: 1 }).lean();

    // First pass: accumulate all purchases and sales
    for (const txn of txns) {
      const itemName = extractItem(txn.description || txn.descriptionHindi || '') || null;
      if (!itemName) continue;

      const current = derived.get(itemName);
      if (!current) continue;

      if (txn.type === 'income') {
        // A sale
        const qty = extractQty(txn.description || txn.descriptionHindi, txn.amount, itemName);
        current.totalSold += qty;
        current.salesCount += 1;
      } else if (txn.type === 'expense') {
        const lowerCat = (txn.category || '').toLowerCase();
        const looksLikeStock = lowerCat.includes('stock') || lowerCat.includes('inventory') || lowerCat.includes('material') || lowerCat.includes('supplies') || lowerCat.includes('purchase') || /खरीद|स्टॉक|माल/i.test(txn.description || '');
        if (looksLikeStock) {
          const qty = extractQty(txn.description || txn.descriptionHindi, txn.amount, itemName);
          current.totalPurchased += qty;
          current.purchaseCount += 1;
          current.purchaseTotal += (txn.amount || 0);
        }
      }

      derived.set(itemName, current);
    }

    // Second pass: compute net stock
    for (const [itemName, state] of derived.entries()) {
      state.quantity = Math.max(0, state.totalPurchased - state.totalSold);
      // Set minStockLevel based on monthly sales velocity
      const monthsOfData = txns.length > 0 ? Math.max(1, (new Date() - new Date(txns[0].date)) / (1000 * 60 * 60 * 24 * 30)) : 1;
      const avgMonthlySales = state.salesCount / monthsOfData;
      state.minStockLevel = Math.max(5, Math.ceil(avgMonthlySales * 1.5));
      console.log(`  ${itemName}: purchased=${state.totalPurchased}, sold=${state.totalSold}, current=${state.quantity}, minStock=${state.minStockLevel}`);
      derived.set(itemName, state);
    }

    // Upsert Inventory docs based on derived state
    const bulkOps = [];
    for (const [itemName, state] of derived.entries()) {
      // Average price from purchase expenses
      const avgPrice = state.purchaseCount > 0 ? Math.round(state.purchaseTotal / state.purchaseCount) : priceHints[itemName] || 0;

      // Basic seasonal mapping (can be refined via demand predictions)
      const upcomingFestivals = getUpcomingFestivalsForItem(itemName);
      const seasonalMultiplier = getSeasonalMultiplier(itemName);

      bulkOps.push({
        updateOne: {
          filter: { userId, itemName },
          update: {
            $set: {
              userId,
              itemName,
              quantity: state.quantity,
              minStockLevel: state.minStockLevel,
              price: avgPrice,
              upcomingFestivals,
              seasonalDemandMultiplier: seasonalMultiplier,
              isActive: true
            }
          },
          upsert: true
        }
      });
    }

    if (bulkOps.length > 0) {
      await Inventory.bulkWrite(bulkOps);
    }

    // Deactivate any legacy/non-canonical items to prevent duplicate bars
    await Inventory.updateMany({ userId, itemName: { $nin: canonicalItems } }, { $set: { isActive: false } });

    // Also refresh sales stats to keep restock suggestions meaningful
    await updateSalesStats(userId);

    // Return updated inventory
    const inventory = await Inventory.find({ userId, isActive: true }).sort({ status: 1, itemName: 1 });
    return inventory;
  } catch (error) {
    console.error('❌ Error rebuilding inventory from transactions:', error);
    return [];
  }
}

function getUpcomingFestivalsForItem(itemName) {
  const map = {
    Saree: ['Navratri', 'Dussehra', 'Diwali'],
    Blouse: ['Navratri', 'Diwali'],
    Dress: ['Holi', 'Ganeshotsav', 'Christmas', 'New Year'],
    Shirt: ['Raksha Bandhan', 'Independence Day'],
    Pant: ['Raksha Bandhan']
  };
  const now = new Date();
  // Only include festivals within ~60 days to make alerts timely
  const festivals = (map[itemName] || []).filter(f => {
    const days = calculateDaysUntilFestival(f);
    return days > 0 && days <= 60;
  });
  return festivals;
}

function getSeasonalMultiplier(itemName) {
  switch (itemName) {
    case 'Saree': return 1.6;
    case 'Blouse': return 1.4;
    case 'Dress': return 1.5;
    case 'Shirt': return 1.2;
    case 'Pant': return 1.2;
    default: return 1.0;
  }
}
