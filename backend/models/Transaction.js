const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  type: { 
    type: String, 
    enum: ['income', 'expense'], 
    required: true 
  },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  description: String,
  descriptionHindi: String,
  paymentMethod: { type: String, default: 'cash' },
  isSynced: { type: Boolean, default: true },
  offlineId: String,
  date: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

// Index for faster queries
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1 });

// FIX: Check if model already exists to prevent overwrite
module.exports = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);