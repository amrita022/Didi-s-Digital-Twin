// utils/demandPredictions.js - Rule-based demand forecasting
const Transaction = require('../models/Transaction');

/**
 * Extract clothing item from description
 */
function extractClothingItem(description) {
  if (!description) return 'कपड़े';
  
  const clothingPatterns = {
    'साड़ी': /साड़ी|saree|sari/i,
    'लहंगा': /लहंगा|लेहंगा|lehenga/i,
    'कुर्ती': /कुर्ती|kurti/i,
    'कुर्ता': /कुर्ता|kurta/i,
    'दुपट्टा': /दुपट्टा|dupatta/i,
    'ब्लाउज': /ब्लाउज|blouse/i,
    'सलवार': /सलवार|salwar/i,
  };
  
  for (const [item, pattern] of Object.entries(clothingPatterns)) {
    if (pattern.test(description)) {
      return item;
    }
  }
  
  return 'कपड़े';
}

/**
 * Get month name in English
 */
function getMonthName(monthIndex) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex];
}

/**
 * Get seasonal information for a month
 */
function getSeasonalInfo(monthIndex) {
  const seasonalData = {
    0: { season: 'Winter', festival: 'New Year', demand: 'low', weather: 'Cold' },
    1: { season: 'Winter', festival: 'Valentine\'s Day', demand: 'low', weather: 'Cool' },
    2: { season: 'Spring', festival: 'Holi', demand: 'high', weather: 'Warm' },
    3: { season: 'Summer', festival: 'Wedding Season', demand: 'very-high', weather: 'Hot' },
    4: { season: 'Summer', festival: 'Wedding Season', demand: 'very-high', weather: 'Very Hot' },
    5: { season: 'Monsoon', festival: '', demand: 'medium', weather: 'Rainy' },
    6: { season: 'Monsoon', festival: '', demand: 'medium', weather: 'Rainy' },
    7: { season: 'Monsoon', festival: '', demand: 'low', weather: 'Rainy' },
    8: { season: 'Autumn', festival: '', demand: 'medium', weather: 'Pleasant' },
    9: { season: 'Autumn', festival: 'Navratri/Dussehra', demand: 'high', weather: 'Pleasant' },
    10: { season: 'Festive', festival: 'Diwali', demand: 'very-high', weather: 'Cool' },
    11: { season: 'Winter', festival: 'Wedding Season', demand: 'very-high', weather: 'Cold' },
  };
  
  return seasonalData[monthIndex];
}

/**
 * Analyze last year's data for a specific month
 */
async function analyzeMonthData(userId, year, month) {
  const transactions = await Transaction.find({
    userId,
    type: 'income',
    category: 'clothing',
  });
  
  // Filter transactions for specific month and year
  const monthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });
  
  if (monthTransactions.length === 0) {
    return null;
  }
  
  // Calculate total revenue
  const totalRevenue = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  // Count items sold
  const itemsSold = {};
  monthTransactions.forEach(t => {
    const item = extractClothingItem(t.description);
    if (!itemsSold[item]) {
      itemsSold[item] = { count: 0, revenue: 0 };
    }
    itemsSold[item].count += 1;
    itemsSold[item].revenue += t.amount;
  });
  
  // Sort items by revenue
  const topItems = Object.entries(itemsSold)
    .map(([item, data]) => ({
      item,
      quantity: data.count,
      revenue: data.revenue,
      avgPrice: Math.round(data.revenue / data.count)
    }))
    .sort((a, b) => b.revenue - a.revenue);
  
  return {
    totalRevenue,
    transactionCount: monthTransactions.length,
    topItems,
    avgTransactionValue: Math.round(totalRevenue / monthTransactions.length)
  };
}

/**
 * Generate demand predictions for next 1-2 months
 */
async function generateDemandPredictions(userId) {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const lastYear = currentYear - 1;
    
    const predictions = [];
    
    // Predict for next 2 months
    for (let i = 1; i <= 2; i++) {
      const targetMonth = (currentMonth + i) % 12;
      const targetYear = currentMonth + i >= 12 ? currentYear + 1 : currentYear;
      const monthName = getMonthName(targetMonth);
      const seasonalInfo = getSeasonalInfo(targetMonth);
      
      // Analyze same month last year
      const lastYearData = await analyzeMonthData(userId, lastYear, targetMonth);
      
      if (!lastYearData) {
        continue;
      }
      
      // Apply seasonal multiplier
      let multiplier = 1.0;
      let confidence = 'medium';
      
      if (seasonalInfo.demand === 'very-high') {
        multiplier = 1.2;
        confidence = 'high';
      } else if (seasonalInfo.demand === 'high') {
        multiplier = 1.1;
        confidence = 'high';
      } else if (seasonalInfo.demand === 'low') {
        multiplier = 0.9;
        confidence = 'medium';
      }
      
      // Calculate predictions
      const predictedRevenue = Math.round(lastYearData.totalRevenue * multiplier);
      const revenueRange = {
        min: Math.round(predictedRevenue * 0.9),
        max: Math.round(predictedRevenue * 1.1)
      };
      
      // Stock recommendations (top 3 items)
      const stockRecommendations = lastYearData.topItems.slice(0, 3).map(item => ({
        item: item.item,
        recommendedStock: Math.ceil(item.quantity * multiplier),
        expectedSales: item.quantity,
        avgPrice: item.avgPrice,
        expectedRevenue: Math.round(item.revenue * multiplier)
      }));
      
      predictions.push({
        month: monthName,
        year: targetYear,
        monthIndex: targetMonth,
        expectedRevenue: revenueRange,
        predictedRevenue,
        season: seasonalInfo.season,
        festival: seasonalInfo.festival,
        demand: seasonalInfo.demand,
        weather: seasonalInfo.weather,
        confidence,
        stockRecommendations,
        lastYearRevenue: lastYearData.totalRevenue,
        reasoning: `Based on ${monthName} ${lastYear} sales: ₹${lastYearData.totalRevenue.toLocaleString('en-IN')}. ${seasonalInfo.festival ? seasonalInfo.festival + ' season.' : ''}`
      });
    }
    
    // Generate "This Month Alert" based on next month's prediction
    let alert = null;
    if (predictions.length > 0) {
      const nextMonth = predictions[0];
      if (nextMonth.demand === 'very-high') {
        alert = {
          type: 'high',
          message: `${nextMonth.festival || nextMonth.season} demand will be very high in ${nextMonth.month}. Stock up on ${nextMonth.stockRecommendations[0]?.item || 'popular items'} now!`
        };
      } else if (nextMonth.demand === 'high') {
        alert = {
          type: 'medium',
          message: `${nextMonth.month} shows good demand potential. Prepare stock of ${nextMonth.stockRecommendations[0]?.item || 'top sellers'}.`
        };
      }
    }
    
    return {
      success: true,
      predictions,
      alert,
      generatedAt: new Date()
    };
    
  } catch (error) {
    console.error('❌ Error generating demand predictions:', error);
    return {
      success: false,
      error: error.message,
      predictions: []
    };
  }
}

module.exports = {
  generateDemandPredictions,
  getSeasonalInfo
};
