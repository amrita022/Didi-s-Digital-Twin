// utils/analyticsCalculations.js - Generate business analytics from transactions
const Transaction = require('../models/Transaction');

/**
 * Generate comprehensive business analytics
 */
async function generateBusinessAnalytics(userId) {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Get all transactions
    const allTransactions = await Transaction.find({ userId }).sort({ date: 1 });
    
    if (allTransactions.length === 0) {
      return getEmptyAnalytics();
    }
    
    // Calculate time periods
    const last6MonthsData = calculateLast6Months(allTransactions, currentYear, currentMonth);
    const keyMetrics = calculateKeyMetrics(allTransactions, currentYear, currentMonth);
    const categorySpending = calculateCategorySpending(allTransactions, currentYear, currentMonth);
    const monthlyProfitTrend = calculateMonthlyProfitTrend(allTransactions);
    const insights = generateInsights(allTransactions, keyMetrics);
    
    return {
      success: true,
      last6MonthsData,
      keyMetrics,
      categorySpending,
      monthlyProfitTrend,
      insights,
      generatedAt: new Date()
    };
    
  } catch (error) {
    console.error('❌ Error generating analytics:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Calculate last 6 months income vs expenses
 */
function calculateLast6Months(transactions, currentYear, currentMonth) {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const data = [];
  
  for (let i = 5; i >= 0; i--) {
    let targetMonth = currentMonth - i;
    let targetYear = currentYear;
    
    if (targetMonth < 0) {
      targetMonth += 12;
      targetYear -= 1;
    }
    
    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getFullYear() === targetYear && date.getMonth() === targetMonth;
    });
    
    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    data.push({
      month: monthNames[targetMonth],
      income: Math.round(income),
      expenses: Math.round(expenses),
      profit: Math.round(income - expenses)
    });
  }
  
  return data;
}

/**
 * Calculate key metrics with growth percentages
 */
function calculateKeyMetrics(transactions, currentYear, currentMonth) {
  // Current month data
  const currentMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
  });
  
  // Previous month data
  let prevMonth = currentMonth - 1;
  let prevYear = currentYear;
  if (prevMonth < 0) {
    prevMonth = 11;
    prevYear -= 1;
  }
  
  const prevMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getFullYear() === prevYear && date.getMonth() === prevMonth;
  });
  
  // Calculate totals
  const currentIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const currentExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const prevIncome = prevMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const prevExpenses = prevMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const currentProfit = currentIncome - currentExpenses;
  const prevProfit = prevIncome - prevExpenses;
  
  // Calculate changes
  const incomeChange = prevIncome > 0 
    ? Math.round(((currentIncome - prevIncome) / prevIncome) * 100) 
    : 0;
  
  const expensesChange = prevExpenses > 0 
    ? Math.round(((currentExpenses - prevExpenses) / prevExpenses) * 100) 
    : 0;
  
  const profitChange = prevProfit > 0 
    ? Math.round(((currentProfit - prevProfit) / prevProfit) * 100) 
    : 0;
  
  const profitMargin = currentIncome > 0 
    ? Math.round((currentProfit / currentIncome) * 100) 
    : 0;
  
  const prevProfitMargin = prevIncome > 0 
    ? Math.round((prevProfit / prevIncome) * 100) 
    : 0;
  
  const marginChange = prevProfitMargin > 0
    ? Math.round(((profitMargin - prevProfitMargin) / prevProfitMargin) * 100)
    : 0;
  
  return {
    totalIncome: Math.round(currentIncome),
    incomeChange,
    totalExpenses: Math.round(currentExpenses),
    expensesChange,
    netProfit: Math.round(currentProfit),
    profitChange,
    profitMargin,
    marginChange
  };
}

/**
 * Calculate category-wise spending (last 6 months)
 */
function calculateCategorySpending(transactions, currentYear, currentMonth) {
  // Get last 6 months expenses
  const sixMonthsAgo = new Date(currentYear, currentMonth - 6, 1);
  const recentExpenses = transactions.filter(t => {
    return t.type === 'expense' && new Date(t.date) >= sixMonthsAgo;
  });
  
  // Group by category
  const categoryTotals = {};
  recentExpenses.forEach(t => {
    const category = t.category || 'other';
    categoryTotals[category] = (categoryTotals[category] || 0) + t.amount;
  });
  
  // Convert to array and add colors
  const colors = ['#C85D3A', '#EBAE82', '#3B7A6D', '#3A2B4D', '#D9A441'];
  const categoryData = Object.entries(categoryTotals)
    .map(([category, value], index) => ({
      name: getCategoryLabel(category),
      value: Math.round(value),
      color: colors[index % colors.length]
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5 categories
  
  return categoryData;
}

/**
 * Get category label in both English and Hindi
 */
function getCategoryLabel(category) {
  const labels = {
    'food': { en: 'Food', hi: 'भोजन' },
    'transport': { en: 'Transport', hi: 'परिवहन' },
    'utilities': { en: 'Utilities', hi: 'उपयोगिताएँ' },
    'rent': { en: 'Rent', hi: 'किराया' },
    'clothing': { en: 'Clothing', hi: 'कपड़े' },
    'other': { en: 'Other', hi: 'अन्य' }
  };
  
  return labels[category]?.en || category.charAt(0).toUpperCase() + category.slice(1);
}

/**
 * Calculate monthly profit trend (last 6 months)
 */
function calculateMonthlyProfitTrend(transactions) {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  const data = [];
  
  for (let i = 5; i >= 0; i--) {
    let targetMonth = currentMonth - i;
    let targetYear = currentYear;
    
    if (targetMonth < 0) {
      targetMonth += 12;
      targetYear -= 1;
    }
    
    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getFullYear() === targetYear && date.getMonth() === targetMonth;
    });
    
    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    data.push({
      month: monthNames[targetMonth],
      profit: Math.round(income - expenses)
    });
  }
  
  return data;
}

/**
 * Generate insights based on data
 */
function generateInsights(transactions, keyMetrics) {
  const insights = [];
  
  // Insight 1: Income trend
  if (keyMetrics.incomeChange > 0) {
    insights.push({
      type: 'positive',
      title: { en: 'Positive Trend', hi: 'सकारात्मक प्रवृत्ति' },
      message: {
        en: `Your income has increased by ${keyMetrics.incomeChange}%. Keep up this trend!`,
        hi: `आपकी आय में ${keyMetrics.incomeChange}% की वृद्धि हुई है। यह प्रवृत्ति जारी रखें!`
      }
    });
  } else if (keyMetrics.incomeChange < 0) {
    insights.push({
      type: 'warning',
      title: { en: 'Income Declined', hi: 'आय में कमी' },
      message: {
        en: `Your income decreased by ${Math.abs(keyMetrics.incomeChange)}%. Consider new strategies.`,
        hi: `आपकी आय में ${Math.abs(keyMetrics.incomeChange)}% की कमी आई है। नई रणनीतियाँ पर विचार करें।`
      }
    });
  }
  
  // Insight 2: Expense management
  if (keyMetrics.expensesChange < 0) {
    insights.push({
      type: 'positive',
      title: { en: 'Expense Management', hi: 'खर्च प्रबंधन' },
      message: {
        en: `Your expenses have decreased by ${Math.abs(keyMetrics.expensesChange)}%. Great job!`,
        hi: `आपके खर्चों में ${Math.abs(keyMetrics.expensesChange)}% की कमी आई है। बहुत अच्छा!`
      }
    });
  } else if (keyMetrics.expensesChange > 15) {
    insights.push({
      type: 'warning',
      title: { en: 'Rising Expenses', hi: 'बढ़ते खर्च' },
      message: {
        en: `Your expenses increased by ${keyMetrics.expensesChange}%. Review your spending.`,
        hi: `आपके खर्चों में ${keyMetrics.expensesChange}% की वृद्धि हुई है। अपने खर्चों की समीक्षा करें।`
      }
    });
  }
  
  // Insight 3: Profit margin
  if (keyMetrics.profitMargin > 50) {
    insights.push({
      type: 'positive',
      title: { en: 'Excellent Margin', hi: 'उत्कृष्ट मार्जिन' },
      message: {
        en: `Your profit margin is ${keyMetrics.profitMargin}%. You're doing great!`,
        hi: `आपका लाभ मार्जिन ${keyMetrics.profitMargin}% है। आप बहुत अच्छा कर रहे हैं!`
      }
    });
  }
  
  // Default insights if none generated
  if (insights.length === 0) {
    insights.push({
      type: 'info',
      title: { en: 'Keep Tracking', hi: 'ट्रैकिंग जारी रखें' },
      message: {
        en: 'Continue tracking your transactions for better insights.',
        hi: 'बेहतर जानकारी के लिए अपने लेनदेन को ट्रैक करना जारी रखें।'
      }
    });
  }
  
  return insights;
}

/**
 * Return empty analytics for new users
 */
function getEmptyAnalytics() {
  return {
    success: true,
    last6MonthsData: [],
    keyMetrics: {
      totalIncome: 0,
      incomeChange: 0,
      totalExpenses: 0,
      expensesChange: 0,
      netProfit: 0,
      profitChange: 0,
      profitMargin: 0,
      marginChange: 0
    },
    categorySpending: [],
    monthlyProfitTrend: [],
    insights: [{
      type: 'info',
      title: { en: 'Start Tracking', hi: 'ट्रैकिंग शुरू करें' },
      message: {
        en: 'Add transactions to see your business analytics.',
        hi: 'अपने व्यापार विश्लेषण देखने के लिए लेनदेन जोड़ें।'
      }
    }],
    generatedAt: new Date()
  };
}

module.exports = {
  generateBusinessAnalytics
};
