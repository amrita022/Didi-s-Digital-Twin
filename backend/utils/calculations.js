// utils/calculations.js
function calculateTotals(transactions = []) {
  let totalIncome = 0;
  let totalExpenses = 0;

  transactions.forEach(txn => {
    if (txn.type === "income") totalIncome += txn.amount;
    else if (txn.type === "expense") totalExpenses += txn.amount;
  });

  return {
    totalIncome,
    totalExpenses,
    profit: totalIncome - totalExpenses
  };
}

function calculateHealthScore({ totalIncome, totalExpenses }) {
  if (totalIncome === 0) return 0;
  
  // Calculate profit and profit margin
  const profit = totalIncome - totalExpenses;
  const profitMargin = (profit / totalIncome) * 100;
  
  // Business Health Score Formula (more nuanced):
  // Takes into account both profit margin AND absolute profit
  let baseScore = 0;
  
  if (profitMargin >= 50) {
    // Excellent profit margin (50%+) = 80-100 score
    baseScore = 80 + Math.min(20, (profitMargin - 50) / 2);
  } else if (profitMargin >= 30) {
    // Good profit margin (30-50%) = 60-80 score
    baseScore = 60 + ((profitMargin - 30) / 20) * 20;
  } else if (profitMargin >= 15) {
    // Fair profit margin (15-30%) = 40-60 score
    baseScore = 40 + ((profitMargin - 15) / 15) * 20;
  } else if (profitMargin > 0) {
    // Low profit margin (0-15%) = 20-40 score
    baseScore = 20 + (profitMargin / 15) * 20;
  } else {
    // Negative profit = 0-20 score (based on how bad the loss is)
    const lossPercentage = Math.abs(profitMargin);
    baseScore = Math.max(0, 20 - Math.min(20, lossPercentage / 5));
  }
  
  const healthScore = Math.round(Math.max(0, Math.min(100, baseScore)));
  
  console.log('🏥 Health Score Calculation:');
  console.log(`   Income: ₹${totalIncome}`);
  console.log(`   Expenses: ₹${totalExpenses}`);
  console.log(`   Profit: ₹${profit}`);
  console.log(`   Profit Margin: ${profitMargin.toFixed(2)}%`);
  console.log(`   Health Score: ${healthScore}/100`);
  
  return healthScore;
}

function getTransactionsByTimeRange(transactions = [], range = "month") {
  const now = new Date();
  return transactions.filter(txn => {
    const diff = now - new Date(txn.date);
    const days = diff / (1000 * 60 * 60 * 24);
    if (range === "today") return days < 1;
    if (range === "week") return days < 7;
    if (range === "month") return days < 30;
    return true;
  });
}

module.exports = {
  calculateTotals,
  calculateHealthScore,
  getTransactionsByTimeRange
};
