const mongoose = require("mongoose");

const AIInsightSchema = new mongoose.Schema({
  userId: String,
  type: String, // 'seasonal', 'festive', 'trend', 'growth', 'info', 'error'
  title: String,
  message: String,
  priority: String, // 'high', 'medium', 'low'
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AIInsight", AIInsightSchema);