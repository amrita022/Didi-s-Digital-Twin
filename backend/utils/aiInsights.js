// utils/aiInsights.js - Intelligent seasonal insights generator with Prophet AI
const Transaction = require("../models/Transaction");
const prophetAIService = require('../services/prophetAIService');

/**
 * Extract specific clothing items from transaction descriptions
 * Detects: साड़ी, लहंगा, कुर्ती, कुर्ता, दुपट्टा, ब्लाउज, etc.
 */
function extractClothingItem(description) {
  if (!description) return null;
  
  const clothingPatterns = {
    'साड़ी': /साड़ी|saree|sari/i,
    'लहंगा': /लहंगा|लेहंगा|lehenga/i,
    'ब्लाउज': /ब्लाउज|blouse/i,
    'कुर्ती': /कुर्ती|kurti/i,
    'कुर्ता': /कुर्ता|kurta/i,
    'शर्ट': /shirt/i,
    'पैंट': /pant/i,
    'ड्रेस': /dress/i,
    'दुपट्टा': /दुपट्टा|dupatta/i,
    'सलवार': /सलवार|salwar/i,
    'चुड़ीदार': /चुड़ीदार|churidar/i,
  };
  
  for (const [item, pattern] of Object.entries(clothingPatterns)) {
    if (pattern.test(description)) {
      return item;
    }
  }
  
  return 'अन्य'; // Generic clothing
}

/**
 * Generate intelligent AI insights based on historical patterns
 * Uses Prophet AI for ML-powered predictions + seasonal analysis
 * Compares current period with same period last year
 */
async function generateAIInsights(userId, currentTransactions = []) {
  const insights = [];
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-11
  const currentYear = now.getFullYear();
  
  try {
    // Get all transactions for analysis
    const allTransactions = await Transaction.find({ userId }).sort({ date: 1 });
    
    if (allTransactions.length === 0) {
      return [{
        type: 'info',
        title: '📊 Start tracking to see insights',
        message: 'Add more transactions to get personalized recommendations!',
        priority: 'low'
      }];
    }
    
    // === PROPHET AI INSIGHT: ML-Powered Forecast ===
    try {
      console.log('🤖 Fetching Prophet AI predictions for insights...');
      const prophetPredictions = await prophetAIService.generateDemandPredictions(userId);
      
      if (prophetPredictions.success && prophetPredictions.model === 'prophet_ai' && prophetPredictions.predictions?.length > 0) {
        // Use the first FULL prediction (should be next month, not partial current month)
        const nextMonth = prophetPredictions.predictions[0];
        const monthName = nextMonth.month;
        const revenue = nextMonth.predictedRevenue;
        const demand = nextMonth.demand;
        
        // Skip if revenue seems too low (likely partial month data)
        if (revenue < 5000) {
          console.log('⚠️ Skipping Prophet insight - revenue too low (partial month)');
        } else {
          let demandEmoji = '📈';
          if (demand === 'very-high') demandEmoji = '🔥';
          else if (demand === 'high') demandEmoji = '📈';
          else if (demand === 'medium') demandEmoji = '📊';
          
          insights.push({
            type: 'prophet',
            title: `${demandEmoji} Prophet AI: ${monthName} Forecast`,
            message: `AI predicts ₹${revenue.toLocaleString('en-IN')} revenue next month with ${demand} demand.${nextMonth.festival ? ' ' + nextMonth.festival + ' approaching!' : ''}`,
            priority: 'high',
            model: 'prophet_ai'
          });
          
          console.log('✅ Added Prophet AI insight');
        }
      }
    } catch (prophetError) {
      console.log('⚠️ Prophet AI insight generation failed:', prophetError.message);
      // Continue with other insights even if Prophet fails
    }
    
    // Separate historical (last year) and current year data
    const lastYearTransactions = allTransactions.filter(t => {
      const year = new Date(t.date).getFullYear();
      return year === currentYear - 1;
    });
    
    const currentYearTransactions = allTransactions.filter(t => {
      const year = new Date(t.date).getFullYear();
      return year === currentYear;
    });
    
    // === INSIGHT 1: Seasonal Pattern Analysis ===
    if (lastYearTransactions.length > 0) {
      const sameMonthLastYear = lastYearTransactions.filter(t => {
        return new Date(t.date).getMonth() === currentMonth;
      });
      
      if (sameMonthLastYear.length > 0) {
        // Analyze top-selling items in this month last year
        const itemSales = {};
        sameMonthLastYear
          .filter(t => t.type === 'income' && t.category === 'clothing')
          .forEach(t => {
            const item = extractClothingItem(t.description);
            itemSales[item] = (itemSales[item] || 0) + t.amount;
          });
        
        // Find top item
        const sortedItems = Object.entries(itemSales).sort((a, b) => b[1] - a[1]);
        if (sortedItems.length > 0) {
          const [topItem, amount] = sortedItems[0];
          const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                             'July', 'August', 'September', 'October', 'November', 'December'];
          
          insights.push({
            type: 'seasonal',
            title: `📅 ${monthNames[currentMonth]} Peak Season Alert!`,
            message: `Last year you sold ₹${amount.toLocaleString('en-IN')} worth of ${topItem} in ${monthNames[currentMonth]}. Stock up now!`,
            priority: 'high'
          });
        }
      }
    }
    
    // === INSIGHT 2: Festive Season Analysis (Nov-Dec) ===
    if (currentMonth >= 9) { // October onwards
      const festiveMonths = lastYearTransactions.filter(t => {
        const month = new Date(t.date).getMonth();
        return month === 10 || month === 11; // Nov-Dec
      });
      
      const festiveIncome = festiveMonths
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      if (festiveIncome > 10000) {
        insights.push({
          type: 'festive',
          title: '🪔 Festive Season Opportunity',
          message: `Last year's Nov-Dec sales: ₹${festiveIncome.toLocaleString('en-IN')}. Wedding & Diwali season approaching!`,
          priority: 'high'
        });
      }
    }
    
    // === INSIGHT 3: Best-Selling Item Analysis ===
    const allClothingIncome = lastYearTransactions.filter(
      t => t.type === 'income' && t.category === 'clothing'
    );
    
    if (allClothingIncome.length > 0) {
      const itemTotals = {};
      allClothingIncome.forEach(t => {
        const item = extractClothingItem(t.description);
        itemTotals[item] = (itemTotals[item] || 0) + t.amount;
      });
      
      const topSeller = Object.entries(itemTotals).sort((a, b) => b[1] - a[1])[0];
      if (topSeller) {
        insights.push({
          type: 'trend',
          title: `⭐ Best Seller: ${topSeller[0]}`,
          message: `${topSeller[0]} generated ₹${topSeller[1].toLocaleString('en-IN')} last year. Keep this in stock!`,
          priority: 'medium'
        });
      }
    }
    
    // === INSIGHT 4: Wedding Season Alert (Apr-May) ===
    if (currentMonth >= 2 && currentMonth <= 4) { // Mar-May
      const weddingSeason = lastYearTransactions.filter(t => {
        const month = new Date(t.date).getMonth();
        return (month === 3 || month === 4) && t.type === 'income'; // Apr-May
      });
      
      const weddingIncome = weddingSeason.reduce((sum, t) => sum + t.amount, 0);
      
      if (weddingIncome > 5000) {
        insights.push({
          type: 'seasonal',
          title: '💍 Wedding Season Approaching',
          message: `Apr-May wedding season earned ₹${weddingIncome.toLocaleString('en-IN')} last year. Prepare bridal wear!`,
          priority: 'high'
        });
      }
    }
    
    // === INSIGHT 5: Current Performance vs Last Year ===
    if (currentYearTransactions.length > 0 && lastYearTransactions.length > 0) {
      const currentYearIncome = currentYearTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const lastYearIncome = lastYearTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const growth = ((currentYearIncome - lastYearIncome) / lastYearIncome * 100).toFixed(1);
      
      if (growth > 0) {
        insights.push({
          type: 'growth',
          title: `📈 ${growth}% Growth!`,
          message: `You're ${growth}% ahead of last year. Keep up the momentum!`,
          priority: 'medium'
        });
      }
    }
    
    // === Default insight if no patterns found ===
    if (insights.length === 0) {
      insights.push({
        type: 'info',
        title: '📊 Building your insights',
        message: 'Keep adding transactions to discover seasonal patterns and trends!',
        priority: 'low'
      });
    }
    
    // Prioritize Prophet AI insights first, then others
    const prophetInsights = insights.filter(i => i.model === 'prophet_ai');
    const otherInsights = insights.filter(i => i.model !== 'prophet_ai');
    const sortedInsights = [...prophetInsights, ...otherInsights];
    
    return sortedInsights.slice(0, 4); // Return top 4 insights with Prophet first
    
  } catch (error) {
    console.error('❌ Error generating AI insights:', error);
    return [{
      type: 'error',
      title: '⚠️ Unable to generate insights',
      message: 'Continue tracking transactions for personalized recommendations.',
      priority: 'low'
    }];
  }
}

// Legacy function for basic insights (kept for backward compatibility)
async function generateBasicInsights(userId, transactions = []) {
  if (!transactions.length) return;

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const profit = totalIncome - totalExpenses;
  const insights = [];

  if (profit < 0) {
    insights.push({
      type: "savings",
      title: "Your expenses exceed income this month",
      message: "Try reducing unnecessary costs or increasing revenue.",
      priority: "high"
    });
  } else if (profit > 0 && profit < totalIncome * 0.2) {
    insights.push({
      type: "savings",
      title: "Low profit margin detected",
      message: "You're earning but saving very little. Consider a goal-based saving plan.",
      priority: "medium"
    });
  } else {
    insights.push({
      type: "general",
      title: "Good financial health",
      message: "Your business is doing well this month. Keep it up!",
      priority: "low"
    });
  }

  for (const insight of insights) {
    await AIInsight.create({
      userId,
      ...insight,
      date: new Date()
    });
  }
}

module.exports = { generateAIInsights, generateBasicInsights };