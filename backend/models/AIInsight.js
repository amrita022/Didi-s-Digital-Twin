const mongoose = require("mongoose");

const AIInsightSchema = new mongoose.Schema({
  userId: String,
  insights: [String],
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("AIInsight", AIInsightSchema);