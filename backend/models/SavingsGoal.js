const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  titleHindi: String,
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  deadline: Date,
  category: String,
  isCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);