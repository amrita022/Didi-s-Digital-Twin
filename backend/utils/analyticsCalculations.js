// utils/analyticsCalculations.js - Generate business analytics from transactions
const Transaction = require('../models/Transaction');

/**
 * Generate comprehensive business analytics
 */
async function generateBusinessAnalytics(userId, language = 'english') {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Get all transactions
    const allTransactions = await Transaction.find({ userId }).sort({ date: 1 });

    if (allTransactions.length === 0) {
      return getEmptyAnalytics(language);
    }

    // Calculate time periods
    const last6MonthsData = calculateLast6Months(allTransactions, currentYear, currentMonth, language);
    const keyMetrics = calculateKeyMetrics(allTransactions, currentYear, currentMonth);
    const categorySpending = calculateCategorySpending(allTransactions, currentYear, currentMonth, language);
    const monthlyProfitTrend = calculateMonthlyProfitTrend(allTransactions, language);
    const insights = generateInsights(allTransactions, keyMetrics, language);

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
function calculateLast6Months(transactions, currentYear, currentMonth, language = 'english') {
  const monthNames = language === 'marathi'
    ? ['जाने', 'फेब्रु', 'मार्च', 'एप्रि', 'मे', 'जून', 'जुलै', 'ऑग', 'सप्टे', 'ऑक्टो', 'नोव्हे', 'डिसे']
    : (language === 'hindi'
      ? ['जन', 'फ़र', 'मार्च', 'अप्र', 'मई', 'जून', 'जुलाई', 'अग', 'सितं', 'अक्टू', 'नवं', 'दिसं']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);

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
function calculateCategorySpending(transactions, currentYear, currentMonth, language = 'english') {
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
      name: getCategoryLabel(category, language),
      value: Math.round(value),
      color: colors[index % colors.length]
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5 categories

  return categoryData;
}

/**
 * Get category label in selected language
 */
function getCategoryLabel(category, language = 'english') {
  const labels = {
    'food': { en: 'Food', hi: 'भोजन', mr: 'अन्न' },
    'transport': { en: 'Transport', hi: 'परिवहन', mr: 'वाहतूक' },
    'utilities': { en: 'Utilities', hi: 'उपयोगिताएँ', mr: 'उपयुक्तता' },
    'rent': { en: 'Rent', hi: 'किराया', mr: 'भाडे' },
    'clothing': { en: 'Clothing', hi: 'कपड़े', mr: 'कपडे' },
    'other': { en: 'Other', hi: 'अन्य', mr: 'इतर' }
  };

  const map = labels[category];
  if (!map) return category.charAt(0).toUpperCase() + category.slice(1);
  if (language === 'marathi') return map.mr;
  if (language === 'hindi') return map.hi;
  return map.en;
}

/**
 * Calculate monthly profit trend (last 6 months)
 */
function calculateMonthlyProfitTrend(transactions, language = 'english') {
  const monthNames = language === 'marathi'
    ? ['जाने', 'फेब्रु', 'मार्च', 'एप्रि', 'मे', 'जून', 'जुलै', 'ऑग', 'सप्टे', 'ऑक्टो', 'नोव्हे', 'डिसे']
    : (language === 'hindi'
      ? ['जन', 'फ़र', 'मार्च', 'अप्र', 'मई', 'जून', 'जुलाई', 'अग', 'सितं', 'अक्टू', 'नवं', 'दिसं']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);

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
function generateInsights(transactions, keyMetrics, language = 'english') {
  const insights = [];

  // Insight 1: Income trend
  if (keyMetrics.incomeChange > 0) {
    insights.push({
      type: 'positive',
      title: language === 'marathi' ? 'सकारात्मक प्रवृत्ती' : (language === 'hindi' ? 'सकारात्मक प्रवृत्ति' : 'Positive Trend'),
      message: language === 'marathi'
        ? `तुमची उत्पन्न ${keyMetrics.incomeChange}% ने वाढली आहे. ही प्रवृत्ती कायम ठेवा!`
        : (language === 'hindi'
          ? `आपकी आय में ${keyMetrics.incomeChange}% की वृद्धि हुई है। यह प्रवृत्ति जारी रखें!`
          : `Your income has increased by ${keyMetrics.incomeChange}%. Keep up this trend!`)
    });
  } else if (keyMetrics.incomeChange < 0) {
    insights.push({
      type: 'warning',
      title: language === 'marathi' ? 'उत्पन्न कमी' : (language === 'hindi' ? 'आय में कमी' : 'Income Declined'),
      message: language === 'marathi'
        ? `तुमची उत्पन्न ${Math.abs(keyMetrics.incomeChange)}% ने कमी झाली आहे. नवीन धोरणांचा विचार करा.`
        : (language === 'hindi'
          ? `आपकी आय में ${Math.abs(keyMetrics.incomeChange)}% की कमी आई है। नई रणनीतियाँ पर विचार करें।`
          : `Your income decreased by ${Math.abs(keyMetrics.incomeChange)}%. Consider new strategies.`)
    });
  }

  // Insight 2: Expense management
  if (keyMetrics.expensesChange < 0) {
    insights.push({
      type: 'positive',
      title: language === 'marathi' ? 'खर्च व्यवस्थापन' : (language === 'hindi' ? 'खर्च प्रबंधन' : 'Expense Management'),
      message: language === 'marathi'
        ? `तुमचे खर्च ${Math.abs(keyMetrics.expensesChange)}% ने कमी झाले आहेत. छान काम!`
        : (language === 'hindi'
          ? `आपके खर्चों में ${Math.abs(keyMetrics.expensesChange)}% की कमी आई है। बहुत अच्छा!`
          : `Your expenses have decreased by ${Math.abs(keyMetrics.expensesChange)}%. Great job!`)
    });
  } else if (keyMetrics.expensesChange > 15) {
    insights.push({
      type: 'warning',
      title: language === 'marathi' ? 'वाढते खर्च' : (language === 'hindi' ? 'बढ़ते खर्च' : 'Rising Expenses'),
      message: language === 'marathi'
        ? `तुमचे खर्च ${keyMetrics.expensesChange}% ने वाढले आहेत. तुमचा खर्च तपासा.`
        : (language === 'हिंदी'
          ? `आपके खर्चों में ${keyMetrics.expensesChange}% की वृद्धि हुई है। अपने खर्चों की समीक्षा करें।`
          : `Your expenses increased by ${keyMetrics.expensesChange}%. Review your spending.`)
    });
  }

  // Insight 3: Profit margin
  if (keyMetrics.profitMargin > 50) {
    insights.push({
      type: 'positive',
      title: language === 'marathi' ? 'उत्कृष्ट मार्जिन' : (language === 'hindi' ? 'उत्कृष्ट मार्जिन' : 'Excellent Margin'),
      message: language === 'marathi'
        ? `तुमचा नफा मार्जिन ${keyMetrics.profitMargin}% आहे. तुम्ही छान करत आहात!`
        : (language === 'hindi'
          ? `आपका लाभ मार्जिन ${keyMetrics.profitMargin}% है। आप बहुत अच्छा कर रहे हैं!`
          : `Your profit margin is ${keyMetrics.profitMargin}%. You're doing great!`)
    });
  }

  // Default insights if none generated
  if (insights.length === 0) {
    insights.push({
      type: 'info',
      title: language === 'marathi' ? 'ट्रॅकिंग सुरू ठेवा' : (language === 'hindi' ? 'ट्रैकिंग जारी रखें' : 'Keep Tracking'),
      message: language === 'marathi'
        ? 'चांगल्या अंतर्दृष्टीसाठी तुमचे व्यवहार ट्रॅक करत राहा.'
        : (language === 'hindi'
          ? 'बेहतर जानकारी के लिए अपने लेनदेन को ट्रैक करना जारी रखें।'
          : 'Continue tracking your transactions for better insights.')
    });
  }

  return insights;
}

/**
 * Return empty analytics for new users
 */
function getEmptyAnalytics(language = 'english') {
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
      title: language === 'marathi' ? 'ट्रॅकिंग सुरू करा' : (language === 'hindi' ? 'ट्रैकिंग शुरू करें' : 'Start Tracking'),
      message: language === 'marathi'
        ? 'तुमचे व्यापार विश्लेषण पाहण्यासाठी व्यवहार जोडा.'
        : (language === 'hindi'
          ? 'अपने व्यापार विश्लेषण देखने के लिए लेनदेन जोड़ें।'
          : 'Add transactions to see your business analytics.')
    }],
    generatedAt: new Date()
  };
}

module.exports = {
  generateBusinessAnalytics
};
