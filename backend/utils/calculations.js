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
  const ratio = (totalIncome - totalExpenses) / totalIncome;
  return Math.round(Math.max(0, Math.min(100, ratio * 100)));
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
