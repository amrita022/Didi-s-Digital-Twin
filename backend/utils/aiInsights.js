// utils/aiInsights.js - Intelligent seasonal insights generator
const Transaction = require("../models/Transaction");

/**
 * Extract specific clothing items from transaction descriptions
 * Detects: साड़ी, लहंगा, कुर्ती, कुर्ता, दुपट्टा, ब्लाउज, etc.
 */
function extractClothingItem(description) {
  if (!description) return null;
  
  const clothingPatterns = {
    'साड़ी': /साड़ी|saree|sari/i,
    'लहंगा': /लहंगा|लेहंगा|lehenga/i,
    'कुर्ती': /कुर्ती|kurti/i,
    'कुर्ता': /कुर्ता|kurta/i,
    'दुपट्टा': /दुपट्टा|dupatta/i,
    'ब्लाउज': /ब्लाउज|blouse/i,
    'सलवार': /सलवार|salwar/i,
    'चुड़ीदार': /चुड़ीदार|churidar/i,
    'शर्ट': /शर्ट|shirt/i,
    'पैंट': /पैंट|pant/i,
    'ड्रेस': /ड्रेस|dress/i,
  };
  
  for (const [item, pattern] of Object.entries(clothingPatterns)) {
    if (pattern.test(description)) {
      return item;
    }
  }
  
  return 'कपड़े'; // Generic clothing
}

/**
 * Generate intelligent AI insights based on historical patterns
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
        title: '� Start tracking to see insights',
        message: 'Add more transactions to get personalized recommendations!',
        priority: 'low'
      }];
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
    
    return insights.slice(0, 4); // Return top 4 insights
    
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