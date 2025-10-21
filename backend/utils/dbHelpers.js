/**
 * Database utilities for querying and aggregating transaction data
 */

/**
 * Get transactions for a specific time period
 */
async function getTransactionsByTime(Transaction, userId, timeReference) {
  const now = new Date();
  let startDate;

  switch (timeReference) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'yesterday':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return await Transaction.find({ 
        userId, 
        date: { $gte: startDate, $lt: endDate } 
      });
    case 'this_week':
      const dayOfWeek = now.getDay();
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
      break;
    case 'this_month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  return await Transaction.find({ 
    userId, 
    date: { $gte: startDate } 
  });
}

/**
 * Calculate totals from transactions
 */
function calculateTotals(transactions) {
  const expenses = transactions.filter(t => t.type === 'expense');
  const income = transactions.filter(t => t.type === 'income');
  
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
  const profit = totalIncome - totalExpenses;

  return {
    totalExpenses,
    totalIncome,
    profit,
    expenseCount: expenses.length,
    incomeCount: income.length
  };
}

/**
 * Get pricing suggestions based on category
 */
function getPricingSuggestion(category, expenses) {
  const categoryExpenses = expenses.filter(e => e.category === category);
  
  if (categoryExpenses.length === 0) {
    // Default suggestions by category
    const defaults = {
      pickles: { cost: 60, suggestedPrice: 120, margin: 1.0 },
      clothing: { cost: 100, suggestedPrice: 200, margin: 1.0 },
      raw_materials: { cost: 50, suggestedPrice: 80, margin: 0.6 },
      general: { cost: 50, suggestedPrice: 100, margin: 1.0 }
    };
    return defaults[category] || defaults.general;
  }

  const avgCost = categoryExpenses.reduce((sum, e) => sum + e.amount, 0) / categoryExpenses.length;
  const suggestedPrice = Math.round(avgCost * 1.5); // 50% margin
  
  return {
    cost: Math.round(avgCost),
    suggestedPrice,
    margin: 0.5
  };
}

/**
 * Get demand prediction based on season and category
 */
function getDemandPrediction(category) {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  
  // Seasonal demand patterns
  const seasonalDemand = {
    pickles: {
      high: [3, 4, 5], // Apr, May, Jun (Summer)
      medium: [0, 1, 2, 9, 10, 11], // Jan-Mar, Oct-Dec
      low: [6, 7, 8] // Jul-Sep (Monsoon)
    },
    clothing: {
      high: [0, 1, 9, 10], // Jan, Feb, Oct, Nov (Wedding/Festival season)
      medium: [2, 3, 8, 11], // Mar, Apr, Sep, Dec
      low: [4, 5, 6, 7] // May-Aug
    }
  };

  const pattern = seasonalDemand[category] || seasonalDemand.pickles;
  
  let demandLevel = 'medium';
  let advice = '';
  let season = '';

  if (pattern.high.includes(month)) {
    demandLevel = 'high';
    season = 'peak season';
    advice = 'Stock up materials now! Increase production by 50%.';
  } else if (pattern.low.includes(month)) {
    demandLevel = 'low';
    season = 'off-season';
    advice = 'Focus on marketing and new products.';
  } else {
    demandLevel = 'medium';
    season = 'regular season';
    advice = 'Maintain steady production.';
  }

  return {
    demandLevel,
    season,
    advice,
    month: now.toLocaleString('en-US', { month: 'long' })
  };
}

/**
 * Generate AI insights based on transaction patterns
 */
async function generateAIInsights(Transaction, Analysis, userId) {
  try {
    const transactions = await Transaction.find({ userId });
    const { totalExpenses, totalIncome, profit } = calculateTotals(transactions);
    
    // Clear old insights
    await Analysis.deleteMany({ userId });
    
    const insights = [];

    // Pricing insight
    if (totalIncome > 0 && totalExpenses > 0) {
      const avgSale = totalIncome / transactions.filter(t => t.type === 'income').length;
      const avgCost = totalExpenses / transactions.filter(t => t.type === 'expense').length;
      
      if (avgSale < avgCost * 1.3) {
        insights.push({
          userId,
          type: 'pricing',
          message: `⚠️ You're underpricing! Average sale: ₹${Math.round(avgSale)}, Average cost: ₹${Math.round(avgCost)}. Charge at least ₹${Math.round(avgCost * 1.5)}.`,
          data: { currentPrice: avgSale, suggestedPrice: avgCost * 1.5, margin: 'low' }
        });
      } else {
        insights.push({
          userId,
          type: 'pricing',
          message: `✅ Good pricing! You're earning healthy margins. Keep it up!`,
          data: { currentPrice: avgSale, suggestedPrice: avgCost * 1.5, margin: 'good' }
        });
      }
    }

    // Savings insight
    if (profit > 0) {
      const sixMonthSavings = profit * 6;
      insights.push({
        userId,
        type: 'savings',
        message: `🎯 You're saving ₹${profit} per month! In 6 months: ₹${sixMonthSavings}. That's enough for a new sewing machine!`,
        data: { monthlySavings: profit, sixMonthGoal: sixMonthSavings }
      });
    } else if (profit < 0) {
      insights.push({
        userId,
        type: 'alert',
        message: `⚠️ You're spending more than earning! Reduce expenses by ₹${Math.abs(profit)} to break even.`,
        data: { deficit: Math.abs(profit) }
      });
    }

    // Demand insight
    const demand = getDemandPrediction('pickles');
    insights.push({
      userId,
      type: 'demand',
      message: `📊 ${demand.season} ahead! Demand will be ${demand.demandLevel}. ${demand.advice}`,
      data: demand
    });

    // Save all insights
    for (const insight of insights) {
      await new Analysis(insight).save();
    }

    return insights;

  } catch (error) {
    console.error('Error generating insights:', error);
    return [];
  }
}

module.exports = {
  getTransactionsByTime,
  calculateTotals,
  getPricingSuggestion,
  getDemandPrediction,
  generateAIInsights
};
