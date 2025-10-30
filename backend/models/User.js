const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  }, // Firebase UID
  email: { 
    type: String, 
    required: true,
    index: true
  },
  dashboard: {
    totalSavings: { type: Number, default: 0 },
    goalTarget: { type: Number, default: 0 },
    goalName: { type: String, default: "" },
    todayIncome: { type: Number, default: 0 },
    monthlyProfit: { type: Number, default: 0 },
    monthlyExpenses: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { 
  timestamps: true 
});

// Update the updatedAt timestamp before saving
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("User", userSchema);