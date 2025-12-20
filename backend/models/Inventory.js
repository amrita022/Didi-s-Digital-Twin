const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  itemName: { type: String, required: true }, // e.g., "Saree", "Dress", "Shirt"
  quantity: { type: Number, required: true, default: 0 },
  minStockLevel: { type: Number, default: 5 }, // Alert when below this
  price: { type: Number, default: 0 }, // Average price
  totalValue: { type: Number, default: 0 }, // quantity * price
  
  // Festival tracking
  seasonalDemandMultiplier: { type: Number, default: 1 }, // How much more in peak season
  upcomingFestivals: [String], // Array of festival names when this item peaks
  lastRestockedDate: { type: Date },
  lastSoldDate: { type: Date },
  
  // Usage stats
  soldLastMonth: { type: Number, default: 0 },
  soldLast3Months: { type: Number, default: 0 },
  soldLast6Months: { type: Number, default: 0 },
  
  // Smart recommendation
  suggestedRestockQty: { type: Number, default: 0 },
  suggestedRestockReason: String, // e.g., "Festival approaching: Diwali in 15 days"
  
  status: { 
    type: String, 
    enum: ['in_stock', 'low_stock', 'out_of_stock', 'overstock'],
    default: 'in_stock'
  },
  
  notes: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Index for faster queries
inventorySchema.index({ userId: 1, itemName: 1 });
inventorySchema.index({ userId: 1, status: 1 });

// Calculate total value before save
inventorySchema.pre('save', function(next) {
  this.totalValue = this.quantity * this.price;
  
  // Update status based on quantity
  if (this.quantity === 0) {
    this.status = 'out_of_stock';
  } else if (this.quantity <= this.minStockLevel) {
    this.status = 'low_stock';
  } else if (this.quantity > this.minStockLevel * 3) {
    this.status = 'overstock';
  } else {
    this.status = 'in_stock';
  }
  
  next();
});

module.exports = mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);
