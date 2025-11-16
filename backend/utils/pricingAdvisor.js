// pricingAdvisor.js - AI-powered pricing recommendations for clothing business
const Transaction = require('../models/Transaction');

/**
 * Analyze historical sales data to generate pricing recommendations
 */
async function generatePricingRecommendations(userId) {
  try {
    // Get all income transactions (sales) for the user
    const salesTransactions = await Transaction.find({
      userId,
      type: 'income',
      category: 'clothing'
    }).sort({ date: -1 });

    if (!salesTransactions.length) {
      return {
        products: [],
        insights: {
          currentMargin: 0,
          suggestedMargin: 0,
          potentialIncrease: 0,
          message: 'कोई बिक्री डेटा नहीं मिला'
        }
      };
    }

    // Analyze products by category
    const productAnalysis = analyzeProductPricing(salesTransactions);
    
    // Generate recommendations for each product type
    const recommendations = generateRecommendations(productAnalysis);

    // Calculate overall insights
    const insights = calculateInsights(recommendations);

    return {
      products: recommendations,
      insights,
      totalProducts: recommendations.length
    };

  } catch (error) {
    console.error('❌ Error generating pricing recommendations:', error);
    throw error;
  }
}

/**
 * Analyze historical pricing data by product category
 */
function analyzeProductPricing(transactions) {
  const products = {
    'साड़ी': { sales: [], keyword: 'साड़ी' },
    'लहंगा': { sales: [], keyword: 'लहंगा' },
    'कुर्ती': { sales: [], keyword: 'कुर्ती' },
    'कुर्ता': { sales: [], keyword: 'कुर्ता' },
    'दुपट्टा': { sales: [], keyword: 'दुपट्टा' }
  };

  // Categorize transactions by product type
  transactions.forEach(transaction => {
    const desc = transaction.description.toLowerCase();
    
    for (const [productName, data] of Object.entries(products)) {
      if (desc.includes(data.keyword.toLowerCase())) {
        products[productName].sales.push({
          amount: transaction.amount,
          date: transaction.date,
          description: transaction.description
        });
        break; // Only count once per transaction
      }
    }
  });

  // Calculate statistics for each product
  const analysis = {};
  for (const [productName, data] of Object.entries(products)) {
    if (data.sales.length > 0) {
      const prices = data.sales.map(s => s.amount);
      analysis[productName] = {
        avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
        totalSales: data.sales.length,
        recentSales: data.sales.slice(0, 5) // Last 5 sales
      };
    }
  }

  return analysis;
}

/**
 * Generate pricing recommendations based on analysis
 */
function generateRecommendations(analysis) {
  const recommendations = [];

  // Market benchmarks for rural clothing business
  const marketBenchmarks = {
    'साड़ी': { optimal: 1800, competitor: 1750, margin: 40 },
    'लहंगा': { optimal: 2400, competitor: 2300, margin: 45 },
    'कुर्ती': { optimal: 1200, competitor: 1150, margin: 38 },
    'कुर्ता': { optimal: 2100, competitor: 2000, margin: 42 },
    'दुपट्टा': { optimal: 1500, competitor: 1400, margin: 35 }
  };

  for (const [productName, stats] of Object.entries(analysis)) {
    const benchmark = marketBenchmarks[productName];
    if (!benchmark) continue;

    const currentPrice = stats.avgPrice;
    const suggestedPrice = benchmark.optimal;
    const priceDiff = suggestedPrice - currentPrice;
    const percentDiff = Math.round((priceDiff / currentPrice) * 100);

    // Determine recommendation reason
    let reason = '';
    let priority = 'medium';

    if (percentDiff > 20) {
      reason = 'आप बाजार से 20% कम कीमत रख रहे हैं। कीमत बढ़ाएं।';
      priority = 'high';
    } else if (percentDiff > 10) {
      reason = 'बाजार औसत से कम है। थोड़ी कीमत बढ़ाने की सिफारिश।';
      priority = 'medium';
    } else if (percentDiff > 0) {
      reason = 'कीमत ठीक है, लेकिन थोड़ा सुधार हो सकता है।';
      priority = 'low';
    } else if (percentDiff === 0) {
      reason = 'आपकी कीमत बाजार के अनुसार सही है।';
      priority = 'low';
    } else {
      reason = 'आपकी कीमत बाजार से अधिक है। यह ठीक है यदि गुणवत्ता अच्छी है।';
      priority = 'low';
    }

    // Estimate monthly profit increase (assuming 10 sales per month)
    const estimatedMonthlySales = 10;
    const potentialIncrease = Math.max(0, priceDiff * estimatedMonthlySales);

    recommendations.push({
      name: productName,
      currentPrice,
      suggestedPrice,
      competitorPrice: benchmark.competitor,
      priceDifference: priceDiff,
      percentDifference: percentDiff,
      reason,
      priority,
      totalSales: stats.totalSales,
      potentialMonthlyIncrease: potentialIncrease,
      optimalMargin: benchmark.margin
    });
  }

  // Sort by priority (high first) and potential increase
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return b.potentialMonthlyIncrease - a.potentialMonthlyIncrease;
  });
}

/**
 * Calculate overall business insights
 */
function calculateInsights(recommendations) {
  if (!recommendations.length) {
    return {
      currentMargin: 0,
      suggestedMargin: 0,
      potentialIncrease: 0,
      message: 'पर्याप्त डेटा नहीं है'
    };
  }

  // Calculate average margins
  const avgCurrentMargin = 35; // Estimated based on rural business
  const avgSuggestedMargin = Math.round(
    recommendations.reduce((sum, r) => sum + r.optimalMargin, 0) / recommendations.length
  );

  // Calculate total potential monthly increase
  const totalPotentialIncrease = Math.round(
    recommendations.reduce((sum, r) => sum + r.potentialMonthlyIncrease, 0)
  );

  // Calculate average underpricing percentage
  const avgUnderpricing = Math.round(
    recommendations
      .filter(r => r.percentDifference > 0)
      .reduce((sum, r) => sum + r.percentDifference, 0) / 
      recommendations.filter(r => r.percentDifference > 0).length
  );

  let message = '';
  if (totalPotentialIncrease > 2000) {
    message = `आप औसतन ${avgUnderpricing}% कम कीमत लगा रहे हैं। कीमतें समायोजित करने से आपका मासिक लाभ ₹${totalPotentialIncrease.toLocaleString('en-IN')} बढ़ सकता है!`;
  } else if (totalPotentialIncrease > 0) {
    message = `कीमतें समायोजित करने से आपका मासिक लाभ ₹${totalPotentialIncrease.toLocaleString('en-IN')} बढ़ सकता है।`;
  } else {
    message = 'आपकी कीमतें बाजार के अनुसार अच्छी हैं। गुणवत्ता बनाए रखें!';
  }

  return {
    currentMargin: avgCurrentMargin,
    suggestedMargin: avgSuggestedMargin,
    potentialIncrease: totalPotentialIncrease,
    averageUnderpricing: avgUnderpricing || 0,
    message
  };
}

module.exports = {
  generatePricingRecommendations
};
