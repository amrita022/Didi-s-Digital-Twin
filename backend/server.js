const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
require('dotenv').config();
const aiService = require('./services/aiService'); 
const dbService = require('./services/dbService'); 
const prophetAIService = require('./services/prophetAIService');
// Import models
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const SavingsGoal = require('./models/SavingsGoal');
const AIInsight = require('./models/AIInsight');
const Inventory = require('./models/Inventory');

// Import utilities
const { calculateTotals, calculateHealthScore, getTransactionsByTimeRange } = require('./utils/calculations');
const { generateAIInsights } = require('./utils/aiInsights');

const app = express();

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' })); 

// 🎤 MAIN VOICE PROCESSING ENDPOINT - HANDLES EVERYTHING
app.post('/api/process-voice', async (req, res) => {
  try {
    const { audioData, text, userId = 'DEMO_USER_ID' } = req.body;
    
    console.log('🎤 Processing voice command...');
    console.log('🔑 Received userId from request:', userId);
    console.log('📦 Full request body:', JSON.stringify(req.body, null, 2));
    
    // Process with AI Service (handles both audio and text)
    const result = await aiService.processVoiceCommand(text, userId, audioData);
    
    console.log('✅ AI Processing complete:', {
      intent: result.intent,
      amount: result.amount,
      success: result.success
    });
    
    res.json(result);
    
  } catch (error) {
    console.error('❌ Voice processing error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      response_english: "Sorry, there was an error processing your request.",
      response_hindi: "माफ़ करें, आपके अनुरोध को संसाधित करने में त्रुटि हुई।"
    });
  }
});

// ======================
// USER SYNC ROUTE (FIREBASE → MONGODB)
// ======================
app.post('/api/user/sync', async (req, res) => {
  try {
    const { userId, email } = req.body;
    
    if (!userId || !email) {
      return res.status(400).json({ success: false, error: 'Missing userId or email' });
    }

    let user = await User.findOne({ userId });

    if (!user) {
      user = await User.create({
        userId,
        email,
        dashboard: {
          totalSavings: 0,
          goalTarget: 0,
          goalName: ''
        }
      });
      console.log(`✅ New user created: ${email}`);
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('❌ User sync error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ======================
// DASHBOARD API - GET USER DATA
// ======================
app.get('/api/dashboard', async (req, res) => {
  try {
    const { userId, language } = req.query;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID required' });
    }

    console.log('📊 Fetching dashboard for user:', userId, 'Language:', language);

    // Get user from MongoDB
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found. Please sync first.' });
    }

    // Get user's transactions
    const allTransactions = await Transaction.find({ userId }).sort({ date: -1 }).lean();
    // Exclude stock purchases from expense totals for business health (treat as COGS tracked separately)
    const excludeStock = (tx) => !(tx.type === 'expense' && (tx.category || '').toLowerCase().includes('stock'));
    const nonStockTxns = allTransactions.filter(excludeStock);
    
    // Calculate totals for different periods
    const todayTxns = getTransactionsByTimeRange(nonStockTxns, 'today');
    const weekTxns = getTransactionsByTimeRange(nonStockTxns, 'week');
    const monthTxns = getTransactionsByTimeRange(nonStockTxns, 'month');

    const todayTotals = calculateTotals(todayTxns);
    const weekTotals = calculateTotals(weekTxns);
    const monthTotals = calculateTotals(monthTxns);
    const allTimeTotals = calculateTotals(nonStockTxns);
    const healthScore = calculateHealthScore(allTimeTotals); // Use ALL-TIME data for health score

    // Use saved dashboard values ONLY for goals and savings (manual fields)
    // But calculate income/expenses/profit dynamically from transactions
    const savedDashboard = user.dashboard || {};
    
    // Calculate cumulative savings (20% of all-time profit, or use saved value)
    const calculatedSavings = Math.max(0, Math.round(allTimeTotals.profit * 0.2));
    const totalSavings = savedDashboard.totalSavings !== undefined && savedDashboard.totalSavings > 0 
      ? savedDashboard.totalSavings 
      : calculatedSavings;
    
    // Default goal target if not set
    const goalTarget = savedDashboard.goalTarget || 25000;
    
    console.log('💰 Calculated Today Income:', todayTotals.totalIncome);
    console.log('📊 Calculated Month Sales:', monthTotals.totalIncome);
    console.log('💸 Calculated Month Expenses:', monthTotals.totalExpenses);
    console.log('🎯 Calculated Month Profit:', monthTotals.profit);
    console.log('💎 All-Time Profit:', allTimeTotals.profit);
    console.log('🏦 Calculated Savings (20%):', calculatedSavings);
    console.log('🎯 Total Savings (used):', totalSavings);
    console.log('📈 Health Score:', healthScore);
    
    // Get SMART AI insights (seasonal patterns, top sellers, etc.)
    console.log('🤖 Generating smart AI insights...');
    const smartInsights = await generateAIInsights(userId, allTransactions, language || 'english');
    
    // Clear old insights and save new ones
    if (smartInsights && smartInsights.length > 0) {
      await AIInsight.deleteMany({ userId }); // Clear old insights
      
      // Save new insights to database
      for (const insight of smartInsights) {
        await AIInsight.create({
          userId,
          ...insight,
          date: new Date()
        });
      }
    }
    
    // Fetch saved insights
    let insights = await AIInsight.find({ userId }).sort({ date: -1 }).limit(5).lean();

    // Get savings goals
    const savingsGoals = await SavingsGoal.find({ userId }).sort({ createdAt: -1 }).limit(3).lean();

    // Recent transactions
    const recentTransactions = allTransactions.slice(0, 10);

    res.json({
      success: true,
      data: {
        user: {
          email: user.email,
          userId: user.userId
        },
        // DYNAMIC VALUES FROM TRANSACTIONS (these update automatically)
        todayIncome: todayTotals.totalIncome,
        totalSales: monthTotals.totalIncome, // Monthly sales for top cards
        monthlyExpenses: monthTotals.totalExpenses,
        monthlyProfit: monthTotals.profit,
        
        // SAVINGS: Use saved value if set, otherwise calculate from all-time profit
        totalSavings: totalSavings,
        goalTarget: goalTarget,
        goalName: savedDashboard.goalName || 'Savings Goal',
        
        // OVERVIEW (Business Health Score) - ALL-TIME TOTALS
        overview: {
          totalSales: allTimeTotals.totalIncome, // ALL-TIME SALES
          monthlyProfit: allTimeTotals.profit, // ALL-TIME PROFIT
          expenses: allTimeTotals.totalExpenses, // ALL-TIME EXPENSES
          savings: totalSavings,
          healthScore: healthScore
        },
        today: {
          totalIncome: todayTotals.totalIncome,
          totalExpenses: todayTotals.totalExpenses,
          profit: todayTotals.profit
        },
        thisWeek: weekTotals,
        thisMonth: {
          totalIncome: monthTotals.totalIncome,
          totalExpenses: monthTotals.totalExpenses,
          profit: monthTotals.profit
        },
        recentTransactions,
        aiInsights: insights, // Return full insight objects with title, message, type, priority
        savingsGoals
      },
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Dashboard error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ======================
// DEMAND PREDICTIONS API
// ======================
const { generateDemandPredictions } = require('./utils/demandPredictions');

app.get('/api/demand-predictions', async (req, res) => {
    try {
        const { userId, useProphet, language } = req.query;
        
        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                error: 'User ID required' 
            });
        }

        const userLanguage = language || 'english'; // Default to English
        console.log(`🎯 Generating demand predictions for: ${userId} (Language: ${userLanguage})`);
        
        // Use Prophet if requested, otherwise use rule-based
        const predictions = useProphet === 'true' 
            ? await prophetAIService.generateDemandPredictions(userId, userLanguage)
            : await generateDemandPredictions(userId, userLanguage);
        
        res.json(predictions);
    } catch (error) {
        console.error('❌ Demand predictions error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});
// ======================
// BUSINESS ANALYTICS API
// ======================
const { generateBusinessAnalytics } = require('./utils/analyticsCalculations');

app.get('/api/analytics', async (req, res) => {
  try {
    const { userId, language } = req.query;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID required' 
      });
    }

    console.log(`📊 Generating business analytics for: ${userId} (Language: ${language || 'english'})`);
    
    const analytics = await generateBusinessAnalytics(userId, language || 'english');
    
    res.json(analytics);
  } catch (error) {
    console.error('❌ Analytics generation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ======================
// REMINDERS & NUDGES
// ======================
const Reminder = require('./models/Reminder');
const { generateNudges, saveNudgesAsReminders } = require('./utils/nudgeGenerator');

// ======================
// INVENTORY
// ======================
const inventoryService = require('./services/inventoryService');


// Get all active reminders for a user
app.get('/api/reminders', async (req, res) => {
  try {
    const { userId, language } = req.query;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    // Generate and save new nudges
    await saveNudgesAsReminders(userId, language || 'english');

    // Also create/update inventory-based reminders (low stock, festivals)
    try {
      await inventoryService.rebuildInventoryFromTransactions(userId, false);
      const inventoryItems = await Inventory.find({ userId, isActive: true });
      for (const item of inventoryItems) {
        if (item.quantity <= item.minStockLevel) {
          const titleLow = language === 'marathi' ? `कमी साठा: ${item.itemName}` : (language === 'hindi' ? `कम स्टॉक: ${item.itemName}` : `Low Stock: ${item.itemName}`);
          const msgLow = language === 'marathi'
            ? `${item.itemName} कमी होत आहे - फक्त ${item.quantity} शिल्लक`
            : (language === 'hindi'
              ? `${item.itemName} कम स्टॉक - केवल ${item.quantity} बचा है`
              : `${item.itemName} running low - only ${item.quantity} remaining`);
          await Reminder.findOneAndUpdate(
            { userId, type: 'low_stock', 'metadata.itemName': item.itemName },
            {
              $set: {
                userId,
                type: 'low_stock',
                title: titleLow,
                message: msgLow,
                messageHindi: `${item.itemName} कम स्टॉक - केवल ${item.quantity} बचा है`,
                priority: 10,
                isActive: true,
                isDismissed: false,
                actionRequired: 'restock',
                metadata: { itemName: item.itemName, quantity: item.quantity, minStock: item.minStockLevel }
              }
            },
            { upsert: true }
          );
        }
        if (item.upcomingFestivals && item.upcomingFestivals.length > 0) {
          const festivals = item.upcomingFestivals.join(', ');
          const titleFest = language === 'marathi' ? `सणाची संधी: ${item.itemName}` : (language === 'hindi' ? `त्योहार अवसर: ${item.itemName}` : `Festival Opportunity: ${item.itemName}`);
          const msgFest = language === 'marathi'
            ? `${festivals} दरम्यान ${item.itemName} साठी उच्च मागणी (${item.seasonalDemandMultiplier}x)`
            : (language === 'hindi'
              ? `${festivals} के दौरान ${item.itemName} के लिए उच्च मांग (${item.seasonalDemandMultiplier}x)`
              : `High demand for ${item.itemName} during ${festivals} (${item.seasonalDemandMultiplier}x)`);
          await Reminder.findOneAndUpdate(
            { userId, type: 'festival_demand', 'metadata.itemName': item.itemName },
            {
              $set: {
                userId,
                type: 'festival_demand',
                title: titleFest,
                message: msgFest,
                messageHindi: `${festivals} के दौरान ${item.itemName} के लिए उच्च मांग (${item.seasonalDemandMultiplier}x)`,
                priority: 7,
                isActive: true,
                isDismissed: false,
                actionRequired: 'increase_stock',
                metadata: { itemName: item.itemName, festivals, multiplier: item.seasonalDemandMultiplier }
              }
            },
            { upsert: true }
          );
        }
        if (item.quantity > item.minStockLevel * 3) {
          const titleOver = language === 'marathi' ? `जादा साठा: ${item.itemName}` : (language === 'hindi' ? `अधिक स्टॉक: ${item.itemName}` : `Overstock: ${item.itemName}`);
          const msgOver = language === 'marathi'
            ? `${item.itemName} चा साठा ${item.quantity} युनिट आहे. साठा कमी करण्यासाठी प्रमोशनचा विचार करा.`
            : (language === 'hindi'
              ? `${item.itemName} का स्टॉक अधिक है (${item.quantity}). बिक्री बढ़ाने के लिए ऑफर चलाएँ।`
              : `${item.itemName} has ${item.quantity} units. Consider a promotion to clear stock.`);
          await Reminder.findOneAndUpdate(
            { userId, type: 'overstock', 'metadata.itemName': item.itemName },
            {
              $set: {
                userId,
                type: 'overstock',
                title: titleOver,
                message: msgOver,
                messageHindi: `${item.itemName} का स्टॉक अधिक है (${item.quantity}). बिक्री बढ़ाने के लिए ऑफर चलाएँ।`,
                priority: 5,
                isActive: true,
                isDismissed: false,
                actionRequired: 'promote',
                metadata: { itemName: item.itemName, quantity: item.quantity, minStock: item.minStockLevel }
              }
            },
            { upsert: true }
          );
        }
      }
    } catch (e) {
      console.warn('⚠️ Inventory reminder generation skipped:', e.message);
    }
    
    // Get all active, non-dismissed reminders
    const reminders = await Reminder.find({ 
      userId, 
      isActive: true, 
      isDismissed: false 
    }).sort({ priority: -1, createdAt: -1 });
    
    res.json({
      success: true,
      reminders,
      count: reminders.length
    });
  } catch (error) {
    console.error('❌ Get reminders error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get inventory alerts and save them as reminders
app.post('/api/reminders/create-from-inventory', async (req, res) => {
  try {
    const { userId, language } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }
    
    // Ensure inventory reflects transactions before creating reminders
    await inventoryService.rebuildInventoryFromTransactions(userId, false);
    const inventoryItems = await Inventory.find({ userId });
    
    // Get demand predictions for next month
    const demandPredictions = require('./utils/demandPredictions');
    const predictions = await demandPredictions.generateDemandPredictions(userId, language || 'english');
    
    // Create a lookup map for demand predictions by item name
    const demandLookup = {};
    if (predictions.success && predictions.predictions.length > 0) {
      const nextMonth = predictions.predictions[0]; // First prediction is next month
      nextMonth.stockRecommendations?.forEach(rec => {
        const itemEnglish = demandPredictions.translateItemToEnglish(rec.item);
        demandLookup[itemEnglish] = rec.recommendedStock;
      });
    }
    
    let alertCount = 0;

    for (const item of inventoryItems) {
      // Low stock alert with demand prediction
      if (item.quantity <= item.minStockLevel) {
        const suggestedQty = demandLookup[item.itemName] || Math.max(item.minStockLevel * 2, 10);
        const titleLow = language === 'marathi' ? `कमी साठा: ${item.itemName}` : (language === 'hindi' ? `कम स्टॉक: ${item.itemName}` : `Low Stock: ${item.itemName}`);
        const msgLow = language === 'marathi'
          ? `फक्त ${item.quantity} ${item.itemName} उरले आहेत. मागणीच्या आधारे पुढील महिन्यासाठी किमान ${suggestedQty} युनिट साठा ठेवा.`
          : (language === 'hindi'
            ? `केवल ${item.quantity} ${item.itemName} बचा है। मांग के अनुसार अगले महीने के लिए कम से कम ${suggestedQty} यूनिट स्टॉक करें।`
            : `Only ${item.quantity} ${item.itemName} left. Stock up at least ${suggestedQty} units for next month based on demand prediction.`);
        
        await Reminder.findOneAndUpdate(
          { userId, type: 'low_stock', 'metadata.itemName': item.itemName },
          {
            $set: {
              userId,
              type: 'low_stock',
              title: titleLow,
              message: msgLow,
              messageHindi: `केवल ${item.quantity} ${item.itemName} बचा है। मांग के अनुसार अगले महीने के लिए कम से कम ${suggestedQty} यूनिट स्टॉक करें।`,
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
          { upsert: true }
        );
        alertCount++;
      }

      // Festival demand alert
      if (item.upcomingFestivals && item.upcomingFestivals.length > 0) {
        const festivals = item.upcomingFestivals.join(', ');
        const titleFest = language === 'marathi' ? `सणाची संधी: ${item.itemName}` : (language === 'hindi' ? `त्योहार अवसर: ${item.itemName}` : `Festival Opportunity: ${item.itemName}`);
        const msgFest = language === 'marathi'
          ? `${festivals} दरम्यान ${item.itemName} साठी उच्च मागणी (${item.seasonalDemandMultiplier}x)`
          : (language === 'hindi'
            ? `${festivals} के दौरान ${item.itemName} के लिए उच्च मांग (${item.seasonalDemandMultiplier}x)`
            : `High demand for ${item.itemName} during ${festivals} (${item.seasonalDemandMultiplier}x)`);
        await Reminder.findOneAndUpdate(
          { userId, type: 'festival_demand', 'metadata.itemName': item.itemName },
          {
            $set: {
              userId,
              type: 'festival_demand',
              title: titleFest,
              message: msgFest,
              messageHindi: `${festivals} के दौरान ${item.itemName} के लिए उच्च मांग (${item.seasonalDemandMultiplier}x)`,
              priority: 7,
              isActive: true,
              isDismissed: false,
              actionRequired: 'increase_stock',
              metadata: { itemName: item.itemName, festivals, multiplier: item.seasonalDemandMultiplier }
            }
          },
          { upsert: true }
        );
        alertCount++;
      }

      // Overstock alert (3x min stock)
      if (item.quantity > item.minStockLevel * 3) {
        const titleOver = language === 'marathi' ? `जादा साठा: ${item.itemName}` : (language === 'hindi' ? `अधिक स्टॉक: ${item.itemName}` : `Overstock: ${item.itemName}`);
        const msgOver = language === 'marathi'
          ? `${item.itemName} चा साठा ${item.quantity} युनिट आहे. साठा कमी करण्यासाठी प्रमोशनचा विचार करा.`
          : (language === 'hindi'
            ? `${item.itemName} का स्टॉक अधिक है (${item.quantity}). बिक्री बढ़ाने के लिए ऑफर चलाएँ।`
            : `${item.itemName} has ${item.quantity} units. Consider a promotion to clear stock.`);
        await Reminder.findOneAndUpdate(
          { userId, type: 'overstock', 'metadata.itemName': item.itemName },
          {
            $set: {
              userId,
              type: 'overstock',
              title: titleOver,
              message: msgOver,
              messageHindi: `${item.itemName} का स्टॉक अधिक है (${item.quantity}). बिक्री बढ़ाने के लिए ऑफर चलाएँ।`,
              priority: 5,
              isActive: true,
              isDismissed: false,
              actionRequired: 'promote',
              metadata: { itemName: item.itemName, quantity: item.quantity, minStock: item.minStockLevel }
            }
          },
          { upsert: true }
        );
        alertCount++;
      }
    }

    res.json({
      success: true,
      alertsCreated: alertCount,
      message: `Created ${alertCount} inventory alerts`
    });
  } catch (error) {
    console.error('❌ Error creating inventory alerts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create a reminder (when user clicks "yes" on a nudge)
app.post('/api/reminders', async (req, res) => {
  try {
    const { userId, type, title, message, messageHindi, actionRequired, eventDate, metadata } = req.body;
    
    if (!userId || !title || !message) {
      return res.status(400).json({ success: false, error: 'userId, title, and message are required' });
    }

    const reminder = await Reminder.create({
      userId,
      type: type || 'custom',
      title,
      message,
      messageHindi,
      actionRequired,
      eventDate: eventDate ? new Date(eventDate) : undefined,
      metadata,
      isActive: true,
      isDismissed: false
    });
    
    res.json({
      success: true,
      reminder
    });
  } catch (error) {
    console.error('❌ Create reminder error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Dismiss a reminder
app.patch('/api/reminders/:id/dismiss', async (req, res) => {
  try {
    const { userId } = req.body;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, userId },
      { 
        isDismissed: true, 
        dismissedAt: new Date(),
        isActive: false
      },
      { new: true }
    );
    
    if (!reminder) {
      return res.status(404).json({ success: false, error: 'Reminder not found' });
    }
    
    res.json({
      success: true,
      reminder
    });
  } catch (error) {
    console.error('❌ Dismiss reminder error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark reminder as completed
app.patch('/api/reminders/:id/complete', async (req, res) => {
  try {
    const { userId } = req.body;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, userId },
      { 
        completedAt: new Date(),
        isActive: false
      },
      { new: true }
    );
    
    if (!reminder) {
      return res.status(404).json({ success: false, error: 'Reminder not found' });
    }
    
    res.json({
      success: true,
      reminder
    });
  } catch (error) {
    console.error('❌ Complete reminder error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ======================
// INVENTORY MANAGEMENT
// ======================

// Get low stock alerts (MUST be before :itemName route)
app.get('/api/inventory/alerts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }
    // Only rebuild if empty
    await inventoryService.rebuildInventoryFromTransactions(userId, false);

    const alerts = await inventoryService.generateInventoryAlerts(userId);
    
    res.json({
      success: true,
      alerts,
      count: alerts.length
    });
  } catch (error) {
    console.error('❌ Get alerts error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all inventory items for a user
app.get('/api/inventory/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }
    // Only rebuild if inventory is empty (preserve voice adjustments)
    const inventory = await inventoryService.rebuildInventoryFromTransactions(userId, false);
    
    res.json({
      success: true,
      inventory,
      count: inventory.length
    });
  } catch (error) {
    console.error('❌ Get inventory error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get specific inventory item
app.get('/api/inventory/:userId/:itemName', async (req, res) => {
  try {
    const { userId, itemName } = req.params;
    
    if (!userId || !itemName) {
      return res.status(400).json({ success: false, error: 'userId and itemName are required' });
    }
    
    const inventory = await inventoryService.getInventory(userId, itemName);
    
    if (inventory.length === 0) {
      return res.status(404).json({ success: false, error: 'Item not found in inventory' });
    }
    
    res.json({
      success: true,
      item: inventory[0]
    });
  } catch (error) {
    console.error('❌ Get item error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add new item to inventory (or update existing)
app.post('/api/inventory', async (req, res) => {
  try {
    const { userId, itemName, quantity, price, minStockLevel = 5 } = req.body;
    
    if (!userId || !itemName || !quantity) {
      return res.status(400).json({ success: false, error: 'userId, itemName, and quantity are required' });
    }
    
    const inventory = await inventoryService.addOrUpdateInventory(userId, itemName, quantity, price, minStockLevel);
    
    res.json({
      success: true,
      message: `✅ Added/Updated ${quantity} ${itemName}`,
      item: inventory
    });
  } catch (error) {
    console.error('❌ Add inventory error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Deduct inventory when item is sold
app.post('/api/inventory/deduct', async (req, res) => {
  try {
    const { userId, itemName, quantity = 1 } = req.body;
    
    if (!userId || !itemName) {
      return res.status(400).json({ success: false, error: 'userId and itemName are required' });
    }
    
    const inventory = await inventoryService.deductInventory(userId, itemName, quantity);
    
    if (!inventory) {
      return res.status(400).json({ success: false, error: 'Insufficient stock or item not found' });
    }
    
    res.json({
      success: true,
      message: `✅ Deducted ${quantity} ${itemName}`,
      item: inventory
    });
  } catch (error) {
    console.error('❌ Deduct inventory error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update sales statistics
app.post('/api/inventory/update-stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }
    
    const updated = await inventoryService.updateSalesStats(userId);
    
    res.json({
      success: true,
      message: `✅ Updated stats for ${updated.length} items`,
      itemsUpdated: updated.length
    });
  } catch (error) {
    console.error('❌ Update stats error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Calculate and update suggested restock quantities
app.post('/api/inventory/calculate-restock/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }
    // Only rebuild if empty
    const items = await inventoryService.rebuildInventoryFromTransactions(userId, false);
    const results = [];
    
    for (const item of items) {
      const updated = await inventoryService.calculateSuggestedRestock(userId, item.itemName);
      if (updated) results.push(updated);
    }
    
    res.json({
      success: true,
      message: `✅ Calculated restock for ${results.length} items`,
      items: results
    });
  } catch (error) {
    console.error('❌ Calculate restock error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ======================
// PRICING RECOMMENDATIONS (XGBoost)
// ======================
const { generateXGBoostPricingRecommendations } = require('./services/xgboostPricingService');


app.get('/api/pricing-recommendations', async (req, res) => {
  try {
    const { userId, useXGBoost, language } = req.query;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'userId is required' });
    }

    const userLanguage = language || 'english'; // Default to English
    console.log(`💰 Generating pricing recommendations for: ${userId} (XGBoost: ${useXGBoost !== 'false'}, Language: ${userLanguage})`);

    // Use XGBoost by default, fallback to rule-based if specified
    let recommendations;
    if (useXGBoost === 'false') {
      const { generatePricingRecommendations } = require('./utils/pricingAdvisor');
      recommendations = await generatePricingRecommendations(userId, userLanguage);
    } else {
      recommendations = await generateXGBoostPricingRecommendations(userId, userLanguage);
    }
    
    res.json({
      success: true,
      ...recommendations
    });
  } catch (error) {
    console.error('❌ Pricing recommendations error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ======================
// UPDATE DASHBOARD DATA
// ======================
app.post('/api/dashboard', async (req, res) => {
  try {
    const { 
      userId, 
      totalSavings, 
      goalTarget, 
      goalName,
      todayIncome,
      monthlyProfit,
      monthlyExpenses,
      totalSales
    } = req.body;
    
    console.log('💾 Saving dashboard data:', { 
      userId, 
      totalSavings, 
      goalTarget, 
      goalName,
      todayIncome,
      monthlyProfit,
      monthlyExpenses,
      totalSales
    });
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID required' });
    }

    // Update user's dashboard data
    const user = await User.findOneAndUpdate(
      { userId },
      {
        $set: {
          'dashboard.totalSavings': Number(totalSavings) || 0,
          'dashboard.goalTarget': Number(goalTarget) || 0,
          'dashboard.goalName': goalName || '',
          'dashboard.todayIncome': Number(todayIncome) || 0,
          'dashboard.monthlyProfit': Number(monthlyProfit) || 0,
          'dashboard.monthlyExpenses': Number(monthlyExpenses) || 0,
          'dashboard.totalSales': Number(totalSales) || 0
        }
      },
      { new: true, upsert: true }
    );

    console.log('✅ Dashboard saved:', user.dashboard);

    res.json({ 
      success: true, 
      message: 'Dashboard updated successfully',
      data: user.dashboard 
    });
  } catch (error) {
    console.error('❌ Dashboard update error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ======================
// TRANSACTION ROUTES
// ======================
app.post('/api/transaction', async (req, res) => {
  try {
    const { userId, type, amount, category, description } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID required' });
    }

    const txn = await Transaction.create({
      userId,
      type,
      amount,
      category: category || 'general',
      description: description || '',
      date: new Date()
    });

    // 📦 AUTO-DEDUCT INVENTORY: If income transaction, try to deduct from inventory
    if (type === 'income' && description) {
      try {
        const inventoryService = require('./services/inventoryService');
        
        // Extract quantity and item name
        // Pattern 1: "sold 2 shirts" or "2 shirts sold" or "2 shirts" 
        // Pattern 2: "sold shirt" (default 1)
        let quantity = 1;
        let itemName = description;
        
        // Try to match number + item pattern (e.g., "2 shirts", "5 sarees")
        const qtyItemMatch = description.match(/(\d+)\s+([a-zA-Z\u0900-\u097F\s]+)/i);
        if (qtyItemMatch) {
          quantity = parseInt(qtyItemMatch[1]);
          itemName = qtyItemMatch[2].trim();
          console.log(`📊 Extracted quantity: ${quantity}, item: ${itemName}`);
        } else {
          // Try item + number pattern or just item name
          const itemMatch = description.match(/(?:sold|sale|बेच|बेचा|विकल|विक्री)?\s*([a-zA-Z\u0900-\u097F\s]+)/i);
          if (itemMatch) {
            itemName = itemMatch[1].trim();
          }
        }
        
        // Clean up item name (remove common words)
        itemName = itemName.replace(/\b(sold|sale|the|a|an|बेच|बेचा|विकल|विक्री)\b/gi, '').trim();
        
        const deducted = await inventoryService.deductInventory(userId, itemName, quantity);
        if (deducted) {
          console.log(`✅ Auto-deducted inventory: ${quantity} ${itemName}`);
        }
      } catch (inventoryError) {
        console.warn('⚠️ Inventory auto-deduction skipped:', inventoryError.message);
        // Don't fail transaction if inventory deduction fails
      }
    }
    
    // 📦 AUTO-ADD INVENTORY: If expense with stock/material category
    if (type === 'expense' && (category?.toLowerCase().includes('stock') || description?.toLowerCase().includes('stock') || description?.toLowerCase().includes('raw material'))) {
      try {
        // Try to extract item and quantity from description
        const itemMatch = description.match(/([a-zA-Z\s]+?)(?:\s*[-:]?\s*)(\d+)?/i);
        if (itemMatch) {
          let itemName = itemMatch[1].trim();
          let quantity = itemMatch[2] ? parseInt(itemMatch[2]) : Math.ceil(amount / 100); // Rough estimate
          
          const added = await inventoryService.addOrUpdateInventory(userId, itemName, quantity, amount / quantity);
          if (added) {
            console.log(`✅ Auto-added inventory: ${quantity} ${itemName}`);
          }
        }
      } catch (inventoryError) {
        console.warn('⚠️ Inventory auto-add skipped:', inventoryError.message);
      }
    }

    // Regenerate AI insights
    const allTxns = await Transaction.find({ userId });
    await generateAIInsights(userId, allTxns);
    
    res.json({ success: true, txn });
  } catch (error) {
    console.error('❌ Transaction error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/transaction/:id', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID required' });
    }

    const result = await Transaction.findOneAndDelete({ 
      _id: req.params.id,
      userId: userId
    });

    if (!result) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    res.json({ success: true, message: 'Transaction deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ======================
// SAVINGS GOAL ROUTES
// ======================
app.post('/api/savings-goal', async (req, res) => {
  try {
    const { userId, title, targetAmount, currentAmount, deadline } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID required' });
    }

    const goal = await SavingsGoal.create({
      userId,
      title,
      targetAmount,
      currentAmount: currentAmount || 0,
      deadline: deadline ? new Date(deadline) : null
    });
    
    res.json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/savings-goal/:id', async (req, res) => {
  try {
    const { userId, currentAmount } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID required' });
    }

    const goal = await SavingsGoal.findOneAndUpdate(
      { _id: req.params.id, userId: userId },
      { currentAmount },
      { new: true }
    );

    if (!goal) {
      return res.status(404).json({ success: false, error: 'Goal not found' });
    }

    res.json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all savings goals for a user
app.get('/api/savings-goal', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) return res.status(400).json({ success: false, error: 'User ID required' });

    const goals = await SavingsGoal.find({ userId }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, goals });
  } catch (error) {
    console.error('❌ Get savings goals error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get a single savings goal by id
app.get('/api/savings-goal/:id', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, error: 'User ID required' });

    const goal = await SavingsGoal.findOne({ _id: req.params.id, userId }).lean();
    if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });

    res.json({ success: true, goal });
  } catch (error) {
    console.error('❌ Get savings goal error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a savings goal
app.delete('/api/savings-goal/:id', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, error: 'User ID required' });

    const result = await SavingsGoal.findOneAndDelete({ _id: req.params.id, userId });
    if (!result) return res.status(404).json({ success: false, error: 'Goal not found' });

    res.json({ success: true, message: 'Goal deleted' });
  } catch (error) {
    console.error('❌ Delete savings goal error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Increment goal progress (add amount)
app.patch('/api/savings-goal/:id/progress', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    if (!userId) return res.status(400).json({ success: false, error: 'User ID required' });
    const delta = Number(amount) || 0;

    const goal = await SavingsGoal.findOne({ _id: req.params.id, userId });
    if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });

    goal.currentAmount = Math.min((goal.currentAmount || 0) + delta, goal.targetAmount || Infinity);
    if (goal.targetAmount && goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
      goal.currentAmount = goal.targetAmount;
    }

    await goal.save();

    res.json({ success: true, goal });
  } catch (error) {
    console.error('❌ Update goal progress error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ======================
// HEALTH CHECK
// ======================
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Didi\'s Digital Twin Backend',
    version: '1.0.0',
    database: mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected',
    endpoints: {
      userSync: 'POST /api/user/sync',
      dashboard: 'GET /api/dashboard?userId=xxx',
      updateDashboard: 'POST /api/dashboard',
      addTransaction: 'POST /api/transaction',
      deleteTransaction: 'DELETE /api/transaction/:id?userId=xxx',
      addGoal: 'POST /api/savings-goal',
      updateGoal: 'PUT /api/savings-goal/:id'
    }
  });
});

// ======================
// TESTING: Clear all transactions for a user
// ======================
app.delete('/api/transactions/clear/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID required' });
    }

    const result = await Transaction.deleteMany({ userId });
    
    console.log(`🗑️ Cleared ${result.deletedCount} transactions for user: ${userId}`);
    
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} transactions`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ Error clearing transactions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ======================
// START SERVER
// ======================
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5002;

console.log('🔗 Connecting to MongoDB...');

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas!');

    async function startServer() {
      try {
        console.log('🚀 Starting Didi Digital Twin with REAL AI...');
        
        // Initialize AI Service first
        await aiService.initialize(); // This line is now properly placed
        
        app.listen(PORT, () => {
          console.log(`\n🎯 Server running on http://localhost:${PORT}`);
          console.log('📊 MongoDB: Connected');
          console.log('🔐 User isolation: ENABLED');
          console.log('\n📍 Available endpoints:');
          console.log(`   POST   /api/user/sync`);
          console.log(`   GET    /api/dashboard?userId=xxx`);
          console.log(`   POST   /api/dashboard`);
          console.log(`   POST   /api/transaction`);
          console.log(`   DELETE /api/transaction/:id`);
          console.log(`   DELETE /api/transactions/clear/:userId (TEST ONLY)`);
          console.log(`   POST   /api/savings-goal`);
          console.log(`   PUT    /api/savings-goal/:id`);
          console.log(`   GET    /api/reminders`);
          console.log(`   POST   /api/reminders`);
          console.log(`   PATCH  /api/reminders/:id/dismiss`);
          console.log(`   PATCH  /api/reminders/:id/complete`);
          console.log(`   GET    /api/inventory/:userId`);
          console.log(`   GET    /api/inventory/:userId/:itemName`);
          console.log(`   POST   /api/inventory`);
          console.log(`   POST   /api/inventory/deduct`);
          console.log(`   GET    /api/inventory/alerts/:userId`);
          console.log(`   POST   /api/inventory/update-stats/:userId`);
          console.log(`   POST   /api/inventory/calculate-restock/:userId\n`);
        });
      } catch (error) {
        console.error('❌ Server startup error:', error);
        process.exit(1);
      }
    }

    // Start the server
    startServer();
  })
  .catch(err => {
    console.error('❌ MongoDB Error:', err.message);
    process.exit(1);
  });