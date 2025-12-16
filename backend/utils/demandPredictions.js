// utils/demandPredictions.js - Rule-based demand forecasting
const Transaction = require('../models/Transaction');

/**
 * Extract clothing item from description
 */
function extractClothingItem(description) {
  if (!description) return 'अन्य';
  
  const clothingPatterns = {
    'साड़ी': /साड़ी|saree|sari/i,
    'लहंगा': /लहंगा|लेहंगा|lehenga/i,
    'ब्लाउज': /ब्लाउज|blouse/i,
    'कुर्ती': /कुर्ती|kurti/i,
    'कुर्ता': /कुर्ता|kurta/i,
    'शर्ट': /शर्ट|shirt/i,
    'पैंट': /पैंट|pant/i,
    'ड्रेस': /ड्रेस|dress/i,
    'दुपट्टा': /दुपट्टा|dupatta/i,
    'सलवार': /सलवार|salwar/i,
  };
  
  for (const [item, pattern] of Object.entries(clothingPatterns)) {
    if (pattern.test(description)) {
      return item;
    }
  }
  
  return 'अन्य';
}

/**
 * Translate clothing item name to English
 */
function translateItemToEnglish(hindiItem) {
  const translations = {
    'साड़ी': 'Saree',
    'लहंगा': 'Lehenga',
    'ब्लाउज': 'Blouse',
    'कुर्ती': 'Kurti',
    'कुर्ता': 'Kurta',
    'शर्ट': 'Shirt',
    'पैंट': 'Pant',
    'ड्रेस': 'Dress',
    'दुपट्टा': 'Dupatta',
    'सलवार': 'Salwar',
    'अन्य': 'Other'
  };
  return translations[hindiItem] || hindiItem;
}

/**
 * Get month name in English
 */
function getMonthName(monthIndex, language = 'english') {
  const months = {
    english: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ],
    hindi: [
      'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
      'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
    ]
  };
  const monthArray = months[language] || months.english;
  return monthArray[monthIndex];
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
async function generateDemandPredictions(userId, language = 'english') {
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
      const monthName = getMonthName(targetMonth, language);
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
      
      // Stock recommendations with profit analysis (top 3 items)
      // Filter out 'अन्य' and get top 3 actual named items
      // If less than 3 named items, pad with remaining items
      const profitMargin = 0.35;
      const namedItems = lastYearData.topItems.filter(item => item.item !== 'अन्य');
      const itemsToRecommend = namedItems.length >= 3 ? namedItems.slice(0, 3) : namedItems;
      
      const stockRecommendations = itemsToRecommend.map(item => {
        const recommendedQty = Math.ceil(item.quantity * multiplier);
        const expectedRevenue = Math.round(item.revenue * multiplier);
        const expectedProfit = Math.round(expectedRevenue * profitMargin);
        const investmentNeeded = Math.round(expectedRevenue * (1 - profitMargin));
        
        return {
          item: item.item,
          recommendedStock: recommendedQty,
          expectedSales: item.quantity,
          avgPrice: item.avgPrice,
          expectedRevenue,
          expectedProfit,
          investmentNeeded,
          profitMargin: `${Math.round(profitMargin * 100)}%`
        };
      });
      
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
        reasoning: language === 'hindi'
          ? `${monthName} ${lastYear} की बिक्री के आधार पर: ₹${lastYearData.totalRevenue.toLocaleString('en-IN')}.${seasonalInfo.festival ? ' ' + seasonalInfo.festival + ' आ रहा है!' : ''}`
          : `Based on ${monthName} ${lastYear} sales: ₹${lastYearData.totalRevenue.toLocaleString('en-IN')}.${seasonalInfo.festival ? ' ' + seasonalInfo.festival + ' approaching!' : ''}`
      });
    }
    
    // Generate "This Month Alert" based on next month's prediction
    let alert = null;
    if (predictions.length > 0) {
      const nextMonth = predictions[0];
      if (nextMonth.demand === 'very-high') {
        let topItem = nextMonth.stockRecommendations[0]?.item || (language === 'hindi' ? 'तैयार माल' : 'stock items');
        if (language === 'english') {
          topItem = translateItemToEnglish(topItem);
        }
        if (language === 'hindi') {
          alert = {
            type: 'high',
            message: `${nextMonth.festival || nextMonth.season} की मांग ${nextMonth.month} में बहुत अधिक रहेगी। अभी ${topItem} का स्टॉक बढ़ाएँ!`
          };
        } else {
          alert = {
            type: 'high',
            message: `${nextMonth.festival || nextMonth.season} demand will be very high in ${nextMonth.month}. Stock up on ${topItem} now!`
          };
        }
      } else if (nextMonth.demand === 'high') {
        let topItem = nextMonth.stockRecommendations[0]?.item || (language === 'hindi' ? 'सामान' : 'stock items');
        if (language === 'english') {
          topItem = translateItemToEnglish(topItem);
        }
        if (language === 'hindi') {
          alert = {
            type: 'medium',
            message: `${nextMonth.month} में अच्छी मांग की संभावना है। ${topItem} का स्टॉक तैयार करें।`
          };
        } else {
          alert = {
            type: 'medium',
            message: `${nextMonth.month} shows good demand potential. Prepare stock of ${topItem}.`
          };
        }
      }
    }
    
    // Generate dynamic market insights
    const marketInsights = await generateMarketInsights(userId, language);
    
    return {
      success: true,
      predictions,
      alert,
      marketInsights,
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

/**
 * Generate dynamic market insights from historical data
 */
async function generateMarketInsights(userId, language = 'english') {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Get all transactions for analysis
    const allTransactions = await Transaction.find({
      userId,
      type: 'income',
      category: 'clothing'
    });
    
    if (allTransactions.length < 30) {
      return getDefaultInsights(language);
    }
    
    // Insight 1: Best selling items in peak season
    const peakMonths = [3, 4, 11]; // Apr, May, Dec
    const peakSales = allTransactions.filter(t => {
      const month = new Date(t.date).getMonth();
      return peakMonths.includes(month);
    });
    
    const peakItems = {};
    peakSales.forEach(t => {
      const item = extractClothingItem(t.description);
      if (item !== 'अन्य') {
        peakItems[item] = (peakItems[item] || 0) + t.amount;
      }
    });
    
    const topPeakItems = Object.entries(peakItems)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([item]) => item);
    
    // Insight 2: Festive season boost calculation
    const festiveSales = allTransactions.filter(t => {
      const month = new Date(t.date).getMonth();
      return month === 10 || month === 11; // Nov-Dec
    });
    
    const regularSales = allTransactions.filter(t => {
      const month = new Date(t.date).getMonth();
      return month >= 6 && month <= 8; // Jul-Sep (regular)
    });
    
    const festiveAvg = festiveSales.length > 0 
      ? festiveSales.reduce((sum, t) => sum + t.amount, 0) / festiveSales.length 
      : 0;
    const regularAvg = regularSales.length > 0
      ? regularSales.reduce((sum, t) => sum + t.amount, 0) / regularSales.length
      : 0;
    
    const festiveBoost = regularAvg > 0 
      ? Math.round(((festiveAvg - regularAvg) / regularAvg) * 100)
      : 120;
    
    // Insight 3: Best profit margins by item
    const itemStats = {};
    allTransactions.forEach(t => {
      const item = extractClothingItem(t.description);
      if (item !== 'अन्य') {
        if (!itemStats[item]) {
          itemStats[item] = { total: 0, count: 0 };
        }
        itemStats[item].total += t.amount;
        itemStats[item].count += 1;
      }
    });
    
    const highValueItem = Object.entries(itemStats)
      .map(([item, stats]) => ({
        item,
        avgPrice: Math.round(stats.total / stats.count)
      }))
      .sort((a, b) => b.avgPrice - a.avgPrice)[0];
    
    // Generate bilingual content based on language
    if (language === 'hindi') {
      return {
        weddingSeason: {
          title: 'शादी का मौसम',
          description: topPeakItems.length > 0
            ? `दिसंबर और अप्रैल-मई में ${topPeakItems.join(' और ')} की सबसे अधिक मांग है`
            : 'शादी का मौसम अप्रैल-मई और दिसंबर में सबसे अधिक बिक्री चलाता है'
        },
        festive: {
          title: 'त्योहार की अवधि',
          description: festiveBoost > 0
            ? `दिवाली (नवंबर-दिसंबर) बिक्री को नियमित महीनों की तुलना में ${festiveBoost}% बढ़ाता है`
            : 'त्योहार के मौसम में ग्राहकों की मांग में वृद्धि दिखाई देती है'
        },
        stockPlanning: {
          title: 'स्टॉक योजना',
          description: highValueItem
            ? `बेहतर लाभ मार्जिन के लिए ${highValueItem.item} (औसत ₹${highValueItem.avgPrice}) पर ध्यान दें`
            : 'पीक सीजन से 1 महीने पहले सर्वोत्तम कीमत के लिए इन्वेंटरी ऑर्डर करें'
        }
      };
    }
    
    // Translate items to English for English mode
    const englishTopItems = topPeakItems.map(item => translateItemToEnglish(item));
    const englishHighValueItem = highValueItem ? { ...highValueItem, item: translateItemToEnglish(highValueItem.item) } : null;
    
    return {
      weddingSeason: {
        title: 'Wedding Season',
        description: englishTopItems.length > 0
          ? `Dec & Apr-May see highest demand for ${englishTopItems.join(' and ')}`
          : 'Peak wedding season drives highest sales in Apr-May & Dec'
      },
      festive: {
        title: 'Festive Period',
        description: festiveBoost > 0
          ? `Diwali (Nov-Dec) boosts sales by ${festiveBoost}% compared to regular months`
          : 'Festive season shows increased customer demand'
      },
      stockPlanning: {
        title: 'Stock Planning',
        description: englishHighValueItem
          ? `Focus on ${englishHighValueItem.item} (avg ₹${englishHighValueItem.avgPrice}) for better profit margins`
          : 'Order inventory 1 month before peak seasons for best pricing'
      }
    };
    
  } catch (error) {
    console.error('Error generating market insights:', error);
    return getDefaultInsights(language);
  }
}

function getDefaultInsights(language = 'english') {
  if (language === 'hindi') {
    return {
      weddingSeason: {
        title: 'शादी का मौसम',
        description: 'दिसंबर और अप्रैल-मई आमतौर पर सबसे अधिक मांग देखते हैं'
      },
      festive: {
        title: 'त्योहार की अवधि',
        description: 'त्योहार के मौसम में बिक्री में महत्वपूर्ण वृद्धि होती है'
      },
      stockPlanning: {
        title: 'स्टॉक योजना',
        description: 'पीक सीजन से 1 महीने पहले सर्वोत्तम कीमत के लिए इन्वेंटरी ऑर्डर करें'
      }
    };
  }
  
  return {
    weddingSeason: {
      title: 'Wedding Season',
      description: 'Dec & Apr-May typically see highest demand'
    },
    festive: {
      title: 'Festive Period',
      description: 'Festive seasons boost sales significantly'
    },
    stockPlanning: {
      title: 'Stock Planning',
      description: 'Order inventory 1 month before peak seasons'
    }
  };
}

module.exports = {
  generateDemandPredictions,
  getSeasonalInfo
};
