const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  type: { 
    type: String, 
    enum: ['stock_analysis', 'seasonal_event', 'purchase_reminder', 'custom', 'low_stock', 'festival_demand', 'overstock', 'inventory_alert'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  messageHindi: String,
  priority: { type: Number, default: 5 }, // 1-10, higher is more urgent
  actionRequired: { type: String }, // e.g., "buy_materials", "check_stock", "restock", "promote"
  eventDate: Date, // For seasonal reminders
  isActive: { type: Boolean, default: true },
  isDismissed: { type: Boolean, default: false },
  dismissedAt: Date,
  completedAt: Date,
  metadata: {
    category: String,
    amount: Number,
    historicalData: mongoose.Schema.Types.Mixed,
    daysUntilEvent: Number,
    itemName: String,
    quantity: Number,
    minStock: Number,
    suggestedQty: Number,
    festivals: String,
    multiplier: Number
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for faster queries
reminderSchema.index({ userId: 1, isActive: 1, isDismissed: 1 });
reminderSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.models.Reminder || mongoose.model('Reminder', reminderSchema);

