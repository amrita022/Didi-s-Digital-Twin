// Festival-Based Sales Pattern Seed Data
// Products sell differently during different festivals
// This allows AI to generate smart reminders based on seasonal patterns

require('dotenv').config();
const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');

const MONGODB_URI = process.env.MONGODB_URI;
const USER_ID = 'zj5NVCFe9lh4jzCfT5Kz85RANJq1';

// Festival dates and their associated products
const FESTIVALS = {
  'new_year': {
    name: 'New Year',
    date: { month: 0, day: 1 },
    products: [
      { name: 'Saree', price: 1500, quantity: 12 },  // Peak sale for sarees
      { name: 'Dress', price: 800, quantity: 8 },
      { name: 'Formal Shirt', price: 600, quantity: 6 }
    ],
    daysRange: { before: 20, after: 10 }
  },
  'republic_day': {
    name: 'Republic Day',
    date: { month: 0, day: 26 },
    products: [
      { name: 'Dress', price: 700, quantity: 6 },
      { name: 'Shirt', price: 400, quantity: 5 },
      { name: 'Saree', price: 1200, quantity: 4 }
    ],
    daysRange: { before: 15, after: 5 }
  },
  'valentines_day': {
    name: "Valentine's Day",
    date: { month: 1, day: 14 },
    products: [
      { name: 'Dress', price: 900, quantity: 15 },  // Peak sale for dresses
      { name: 'Shirt', price: 500, quantity: 12 },  // Peak sale for shirts
      { name: 'Blouse', price: 600, quantity: 8 },
      { name: 'Saree', price: 800, quantity: 3 }    // Lower saree sales
    ],
    daysRange: { before: 7, after: 3 }
  },
  'womens_day': {
    name: "Women's Day",
    date: { month: 2, day: 8 },
    products: [
      { name: 'Saree', price: 1400, quantity: 10 },
      { name: 'Dress', price: 750, quantity: 7 },
      { name: 'Blouse', price: 650, quantity: 6 }
    ],
    daysRange: { before: 10, after: 2 }
  },
  'holi': {
    name: 'Holi',
    date: { month: 2, day: 25 },
    products: [
      { name: 'Shirt', price: 450, quantity: 10 },   // Casual wear
      { name: 'Dress', price: 650, quantity: 8 },
      { name: 'Saree', price: 1300, quantity: 6 }
    ],
    daysRange: { before: 15, after: 5 }
  },
  'raksha_bandhan': {
    name: 'Raksha Bandhan',
    date: { month: 6, day: 30 },
    products: [
      { name: 'Saree', price: 1400, quantity: 14 },  // Peak for rakhi celebrations
      { name: 'Dress', price: 700, quantity: 6 },
      { name: 'Blouse', price: 700, quantity: 8 }
    ],
    daysRange: { before: 14, after: 5 }
  },
  'ganeshotsav': {
    name: 'Ganeshotsav',
    date: { month: 7, day: 17 },
    products: [
      { name: 'Saree', price: 1200, quantity: 16 },  // Festival wear
      { name: 'Dress', price: 650, quantity: 7 },
      { name: 'Blouse', price: 700, quantity: 10 }
    ],
    daysRange: { before: 15, after: 5 }
  },
  'independence_day': {
    name: 'Independence Day',
    date: { month: 7, day: 15 },
    products: [
      { name: 'Shirt', price: 500, quantity: 8 },
      { name: 'Dress', price: 700, quantity: 6 },
      { name: 'Saree', price: 1100, quantity: 4 }
    ],
    daysRange: { before: 10, after: 3 }
  },
  'navratri': {
    name: 'Navratri',
    date: { month: 8, day: 15 },
    products: [
      { name: 'Saree', price: 1600, quantity: 20 },  // Peak festival wear
      { name: 'Blouse', price: 750, quantity: 15 },
      { name: 'Dress', price: 700, quantity: 8 }
    ],
    daysRange: { before: 10, after: 10 }
  },
  'dussehra': {
    name: 'Dussehra',
    date: { month: 9, day: 24 },
    products: [
      { name: 'Saree', price: 1400, quantity: 12 },
      { name: 'Blouse', price: 700, quantity: 8 },
      { name: 'Dress', price: 750, quantity: 6 }
    ],
    daysRange: { before: 5, after: 5 }
  },
  'diwali': {
    name: 'Diwali',
    date: { month: 9, day: 12 },  // Approximate Diwali date
    products: [
      { name: 'Saree', price: 1500, quantity: 25 },   // PEAK SAREE SALES
      { name: 'Blouse', price: 800, quantity: 15 },
      { name: 'Dress', price: 850, quantity: 10 }
    ],
    daysRange: { before: 25, after: 15 }
  },
  'christmas': {
    name: 'Christmas',
    date: { month: 11, day: 25 },
    products: [
      { name: 'Saree', price: 1400, quantity: 14 },   // Festive wear
      { name: 'Dress', price: 900, quantity: 12 },
      { name: 'Shirt', price: 550, quantity: 8 }
    ],
    daysRange: { before: 20, after: 5 }
  },
  'new_year_eve': {
    name: 'New Year Eve',
    date: { month: 11, day: 31 },
    products: [
      { name: 'Dress', price: 1000, quantity: 10 },   // Fancy wear
      { name: 'Saree', price: 1300, quantity: 8 },
      { name: 'Formal Shirt', price: 700, quantity: 6 }
    ],
    daysRange: { before: 15, after: 1 }
  }
};

// Non-festival days baseline sales (normal pattern)
const BASELINE_PRODUCTS = [
  { name: 'Shirt', price: 400, quantity: 2 },
  { name: 'Pant', price: 500, quantity: 1 },
  { name: 'Blouse', price: 500, quantity: 1 },
  { name: 'Dress', price: 650, quantity: 1 },
  { name: 'Saree', price: 1200, quantity: 0.5 }  // Low saree sales on normal days
];

function getDateInYear(year, month, day) {
  return new Date(year, month, day);
}

function generateSalesForFestival(festival, year) {
  const sales = [];
  const festivalDate = getDateInYear(year, festival.date.month, festival.date.day);
  
  // Generate sales before festival
  for (let daysBack = festival.daysRange.before; daysBack > 0; daysBack--) {
    const saleDate = new Date(festivalDate);
    saleDate.setDate(saleDate.getDate() - daysBack);
    
    // More sales closer to festival
    const intensityMultiplier = 1 - (daysBack / festival.daysRange.before) * 0.5;
    
    festival.products.forEach(product => {
      let salesToCreate = Math.ceil(product.quantity * intensityMultiplier * 0.4);
      for (let i = 0; i < salesToCreate; i++) {
        sales.push({
          date: saleDate,
          item: product.name,
          price: product.price + Math.floor(Math.random() * 100)
        });
      }
    });
  }
  
  // Generate sales on festival day (peak)
  festival.products.forEach(product => {
    let salesToCreate = Math.ceil(product.quantity * 0.8);
    for (let i = 0; i < salesToCreate; i++) {
      sales.push({
        date: festivalDate,
        item: product.name,
        price: product.price + Math.floor(Math.random() * 150)
      });
    }
  });
  
  // Generate sales after festival (decline)
  for (let daysAfter = 1; daysAfter <= festival.daysRange.after; daysAfter++) {
    const saleDate = new Date(festivalDate);
    saleDate.setDate(saleDate.getDate() + daysAfter);
    
    const intensityMultiplier = 1 - (daysAfter / festival.daysRange.after);
    
    festival.products.forEach(product => {
      let salesToCreate = Math.ceil(product.quantity * intensityMultiplier * 0.3);
      for (let i = 0; i < salesToCreate; i++) {
        sales.push({
          date: saleDate,
          item: product.name,
          price: product.price
        });
      }
    });
  }
  
  return sales;
}

async function seedFestivalData() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing transactions for user...');
    await Transaction.deleteMany({ userId: USER_ID });

    let totalSales = 0;
    const salesData = [];

    // Generate sales for each festival (2024 and 2025)
    console.log('\n📅 Generating festival-based sales patterns...');
    
    for (const [key, festival] of Object.entries(FESTIVALS)) {
      console.log(`  📍 ${festival.name}...`);
      
      // Generate for 2024
      const sales2024 = generateSalesForFestival(festival, 2024);
      salesData.push(...sales2024);
      
      // Generate for 2025
      const sales2025 = generateSalesForFestival(festival, 2025);
      salesData.push(...sales2025);
    }

    // Add baseline sales for random days (non-festival)
    console.log('  📍 Adding baseline sales for regular days...');
    const startDate = new Date(2024, 0, 1);
    const endDate = new Date(2025, 11, 19);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      // Skip weekends occasionally (25% chance)
      if (Math.random() < 0.25) continue;
      
      // Add 2-4 baseline sales per day
      const numSales = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numSales; i++) {
        const randomProduct = BASELINE_PRODUCTS[Math.floor(Math.random() * BASELINE_PRODUCTS.length)];
        salesData.push({
          date: new Date(d),
          item: randomProduct.name,
          price: randomProduct.price + Math.floor(Math.random() * 50)
        });
      }
    }

    // Create transactions in database
    console.log('\n💾 Saving transactions to database...');
    for (const sale of salesData) {
      await Transaction.create({
        userId: USER_ID,
        type: 'income',
        amount: sale.price,
        category: 'sales',
        description: `Sold ${sale.item}`,
        paymentMethod: 'cash',
        date: sale.date
      });
      totalSales++;
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ FESTIVAL DATA SEEDED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log(`📊 Total transactions created: ${totalSales}`);
    console.log(`👤 User ID: ${USER_ID}`);
    console.log(`📅 Date range: Jan 2024 - Dec 2025`);
    console.log('\n🎯 Pattern Analysis:');
    console.log('✓ Sarees: Peak sales during Navratri, Diwali, Raksha Bandhan');
    console.log('✓ Dresses: High sales during Valentine\'s Day, New Year');
    console.log('✓ Shirts: More sales during casual festivals & Valentine\'s');
    console.log('✓ Blouses: Peak during Ganeshotsav, Navratri');
    console.log('\n🤖 AI Analysis Ready:');
    console.log('✓ System can now detect seasonal product trends');
    console.log('✓ Reminders will suggest buying stock before peak seasons');
    console.log('✓ Example: "Sarees sell 5x more during Diwali - buy stock by Oct 1"');
    console.log('✓ Example: "Dresses peak during Valentine\'s - prepare inventory"');
    console.log('='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedFestivalData();
