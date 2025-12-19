// utils/nudgeGenerator.js - Generate gentle nudges and reminders
const Transaction = require('../models/Transaction');
const Reminder = require('../models/Reminder');

// Seasonal events with dates (using approximate dates, adjust as needed)
const SEASONAL_EVENTS = {
  'New Year': { month: 0, day: 1, name: 'New Year', nameHindi: 'नया साल' },
  'Ganeshotsav': { month: 8, day: 17, name: 'Ganeshotsav', nameHindi: 'गणेशोत्सव' },
  'Diwali': { month: 10, day: 12, name: 'Diwali', nameHindi: 'दिवाली' },
  'Holi': { month: 2, day: 25, name: 'Holi', nameHindi: 'होली' },
  'Navratri': { month: 9, day: 15, name: 'Navratri', nameHindi: 'नवरात्रि' },
  'Raksha Bandhan': { month: 7, day: 30, name: 'Raksha Bandhan', nameHindi: 'रक्षा बंधन' },
  'Dussehra': { month: 9, day: 24, name: 'Dussehra', nameHindi: 'दशहरा' }
};

/**
 * Calculate days until a seasonal event
 */
function getDaysUntilEvent(eventMonth, eventDay, currentDate = new Date()) {
  const currentYear = currentDate.getFullYear();
  let eventDate = new Date(currentYear, eventMonth, eventDay);
  
  // If event has passed this year, check next year
  if (eventDate < currentDate) {
    eventDate = new Date(currentYear + 1, eventMonth, eventDay);
  }
  
  const diffTime = eventDate - currentDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Analyze stock purchase and sale patterns
 * Returns how long it took to sell stock after purchase
 */
async function analyzeStockPatterns(userId) {
  const transactions = await Transaction.find({ userId }).sort({ date: 1 });
  
  const stockPurchases = [];
  const stockSales = [];
  
  // Categorize transactions
  transactions.forEach(txn => {
    const date = new Date(txn.date);
    if (txn.type === 'expense' && (
      txn.category === 'raw_materials' || 
      txn.description?.toLowerCase().includes('stock') ||
      txn.description?.toLowerCase().includes('material') ||
      txn.description?.toLowerCase().includes('सामान')
    )) {
      stockPurchases.push({ date, amount: txn.amount, category: txn.category, description: txn.description });
    }
    
    if (txn.type === 'income') {
      stockSales.push({ date, amount: txn.amount, category: txn.category });
    }
  });
  
  // Analyze patterns: For each purchase, find when similar sales happened
  const patterns = [];
  
  stockPurchases.forEach((purchase, index) => {
    // Find sales that happened after this purchase
    const subsequentSales = stockSales.filter(sale => sale.date > purchase.date);
    
    if (subsequentSales.length > 0) {
      // Calculate time to first significant sale (or total time to clear)
      const firstSale = subsequentSales[0];
      const daysToFirstSale = Math.ceil((firstSale.date - purchase.date) / (1000 * 60 * 60 * 24));
      
      // Calculate total sales in the months following purchase
      const threeMonthsLater = new Date(purchase.date);
      threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
      const sixMonthsLater = new Date(purchase.date);
      sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
      
      const salesIn3Months = subsequentSales
        .filter(s => s.date <= threeMonthsLater)
        .reduce((sum, s) => sum + s.amount, 0);
      
      const salesIn6Months = subsequentSales
        .filter(s => s.date <= sixMonthsLater)
        .reduce((sum, s) => sum + s.amount, 0);
      
      // If purchase amount is significant and sales are slow
      if (purchase.amount > 5000 && salesIn3Months < purchase.amount * 0.5) {
        const monthsToSell = Math.ceil(daysToFirstSale / 30);
        patterns.push({
          purchaseDate: purchase.date,
          purchaseAmount: purchase.amount,
          daysToFirstSale,
          monthsToSell,
          salesIn3Months,
          salesIn6Months,
          category: purchase.category
        });
      }
    }
  });
  
  return patterns;
}

/**
 * Get seasonal sales data for a specific event
 */
async function getSeasonalSalesData(userId, eventName) {
  const event = SEASONAL_EVENTS[eventName];
  if (!event) return null;
  
  const transactions = await Transaction.find({ userId }).sort({ date: 1 });
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Get sales from last year's event period (2 weeks before and after)
  const lastYearEventDate = new Date(currentYear - 1, event.month, event.day);
  const periodStart = new Date(lastYearEventDate);
  periodStart.setDate(periodStart.getDate() - 14);
  const periodEnd = new Date(lastYearEventDate);
  periodEnd.setDate(periodEnd.getDate() + 14);
  
  const seasonalSales = transactions.filter(txn => {
    const txnDate = new Date(txn.date);
    return txn.type === 'income' && 
           txnDate >= periodStart && 
           txnDate <= periodEnd;
  });
  
  const totalSales = seasonalSales.reduce((sum, txn) => sum + txn.amount, 0);
  const itemCount = seasonalSales.length;
  
  // Try to identify specific items sold (e.g., modaks for Ganeshotsav)
  const itemKeywords = {
    'Ganeshotsav': ['modak', 'मोदक', 'ladoo', 'लड्डू'],
    'Diwali': ['sweet', 'मिठाई', 'cracker', 'पटाखा'],
    'Holi': ['gulal', 'गुलाल', 'color', 'रंग'],
    'Navratri': ['fasting', 'व्रत', 'prasad', 'प्रसाद']
  };
  
  const keywords = itemKeywords[eventName] || [];
  const specificItems = seasonalSales.filter(txn => 
    keywords.some(keyword => 
      txn.description?.toLowerCase().includes(keyword.toLowerCase())
    )
  );
  
  return {
    eventName: event.name,
    eventNameHindi: event.nameHindi,
    lastYearDate: lastYearEventDate,
    totalSales,
    itemCount,
    specificItemCount: specificItems.length,
    specificItems: specificItems.map(s => s.amount)
  };
}

/**
 * Analyze product-specific seasonal patterns
 * Find which products sell more during specific festivals
 */
async function analyzeProductSeasonalPatterns(userId) {
  const transactions = await Transaction.find({ userId, type: 'income' }).sort({ date: 1 });
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Product categories and their peak festival months
  const productPatterns = {
    'Saree': { peakMonths: [0, 9, 10, 6], festivals: ['New Year', 'Diwali', 'Navratri', 'Raksha Bandhan'] },
    'Dress': { peakMonths: [0, 1, 11], festivals: ["Valentine's Day", 'New Year', 'Christmas'] },
    'Shirt': { peakMonths: [1, 2, 11], festivals: ["Valentine's Day", 'Holi', 'Christmas'] },
    'Blouse': { peakMonths: [7, 8], festivals: ['Ganeshotsav', 'Navratri'] }
  };
  
  const patterns = [];
  
  // Analyze sales for each product category
  for (const [product, productInfo] of Object.entries(productPatterns)) {
    const productSales = transactions.filter(txn => 
      txn.description?.toLowerCase().includes(product.toLowerCase())
    );
    
    if (productSales.length === 0) continue;
    
    // Get sales during peak months (last year)
    let peakMonthSales = 0;
    let normalMonthSales = 0;
    
    for (const sale of productSales) {
      const saleMonth = new Date(sale.date).getMonth();
      if (productInfo.peakMonths.includes(saleMonth)) {
        peakMonthSales += sale.amount;
      } else {
        normalMonthSales += sale.amount;
      }
    }
    
    // Calculate multiplier
    const multiplier = normalMonthSales > 0 ? peakMonthSales / normalMonthSales : 1;
    
    if (multiplier > 2) {  // Product sells 2x more during peak
      patterns.push({
        product,
        peakMonths: productInfo.peakMonths,
        festivals: productInfo.festivals,
        multiplier: parseFloat(multiplier.toFixed(1)),
        peakSales: peakMonthSales,
        normalSales: normalMonthSales,
        avgPeakPrice: (peakMonthSales / productSales.length).toFixed(0)
      });
    }
  }
  
  return patterns;
}

/**
 * Generate gentle nudges based on historical patterns and upcoming events
 */
async function generateNudges(userId, language = 'english') {
  const now = new Date();
  const nudges = [];
  
  try {
    // 1. Analyze stock purchase patterns
    const stockPatterns = await analyzeStockPatterns(userId);
    
    if (stockPatterns.length > 0) {
      // Find the most recent slow-selling stock purchase
      const recentPattern = stockPatterns[stockPatterns.length - 1];
      
      if (recentPattern.monthsToSell >= 3) {
        const title = language === 'hindi' 
          ? '📦 स्टॉक विश्लेषण' 
          : '📦 Stock Analysis';
        
        const message = language === 'hindi'
          ? `पिछली बार जब आपने ₹${recentPattern.purchaseAmount.toLocaleString('en-IN')} का अतिरिक्त स्टॉक खरीदा था, तो इसे बेचने में ${recentPattern.monthsToSell} महीने लगे थे।`
          : `Last time you bought extra stock worth ₹${recentPattern.purchaseAmount.toLocaleString('en-IN')}, it took ${recentPattern.monthsToSell} months to sell.`;
        
        nudges.push({
          type: 'stock_analysis',
          title,
          message,
          messageHindi: message,
          priority: 'medium',
          metadata: {
            category: recentPattern.category,
            amount: recentPattern.purchaseAmount,
            monthsToSell: recentPattern.monthsToSell
          }
        });
      }
    }
    
    // 2. Check for upcoming seasonal events
    for (const [eventKey, event] of Object.entries(SEASONAL_EVENTS)) {
      const daysUntil = getDaysUntilEvent(event.month, event.day, now);
      
      // Show reminder 10-35 days before event (adjusted for better testing)
      if (daysUntil >= 10 && daysUntil <= 35) {
        const seasonalData = await getSeasonalSalesData(userId, eventKey);
        
        if (seasonalData && seasonalData.itemCount > 0) {
          const title = language === 'hindi'
            ? `🎉 ${event.nameHindi} आ रहा है`
            : `🎉 ${event.name} is coming`;
          
          let message;
          if (seasonalData.specificItemCount > 0) {
            // For Ganeshotsav, mention modaks specifically
            const itemName = eventKey === 'Ganeshotsav' 
              ? (language === 'hindi' ? 'मोदक' : 'modaks')
              : (language === 'hindi' ? 'आइटम' : 'items');
            
            message = language === 'hindi'
              ? `${event.nameHindi} ${daysUntil} दिनों में है - पिछले साल आपने ${seasonalData.specificItemCount} ${itemName} बेचे थे, क्या मैं आपको सामान खरीदने की याद दिलाऊं?`
              : `${event.name} is in ${daysUntil} days - last year you sold ${seasonalData.specificItemCount} ${itemName}, should I remind you to buy materials?`;
          } else {
            message = language === 'hindi'
              ? `${event.nameHindi} ${daysUntil} दिनों में है - पिछले साल इस अवधि में आपने ₹${seasonalData.totalSales.toLocaleString('en-IN')} की बिक्री की थी।`
              : `${event.name} is in ${daysUntil} days - last year during this period you made ₹${seasonalData.totalSales.toLocaleString('en-IN')} in sales.`;
          }
          
          nudges.push({
            type: 'seasonal_event',
            title,
            message,
            messageHindi: message,
            actionRequired: 'buy_materials',
            eventDate: new Date(now.getFullYear(), event.month, event.day),
            priority: 'high',
            metadata: {
              daysUntilEvent: daysUntil,
              lastYearSales: seasonalData.totalSales,
              itemCount: seasonalData.itemCount
            }
          });
        }
      }
    }
    
    // 3. Product-specific seasonal recommendations
    const productPatterns = await analyzeProductSeasonalPatterns(userId);
    
    for (const pattern of productPatterns) {
      // Check if any upcoming festival is in the peak months
      const upcomingFestival = pattern.festivals.find(festival => {
        const festivalEvent = Object.values(SEASONAL_EVENTS).find(e => 
          e.name === festival || e.nameHindi === festival
        );
        if (!festivalEvent) return false;
        
        const daysUntil = getDaysUntilEvent(festivalEvent.month, festivalEvent.day, now);
        return daysUntil >= 5 && daysUntil <= 40;
      });
      
      if (upcomingFestival) {
        const title = language === 'hindi'
          ? `📊 ${pattern.product} बिक्री बढ़ेगी`
          : `📊 ${pattern.product} sales will spike`;
        
        const message = language === 'hindi'
          ? `पिछले साल ${upcomingFestival} के दौरान ${pattern.product} की बिक्री ${pattern.multiplier}x बढ़ गई थी। स्टॉक तैयार करने का समय है!`
          : `Last year during ${upcomingFestival}, ${pattern.product} sales increased by ${pattern.multiplier}x. Time to prepare your stock!`;
        
        nudges.push({
          type: 'product_seasonal',
          title,
          message,
          messageHindi: message,
          actionRequired: 'prepare_stock',
          priority: 'high',
          metadata: {
            product: pattern.product,
            festival: upcomingFestival,
            multiplier: pattern.multiplier,
            historicalSales: pattern.peakSales
          }
        });
      }
    }
    
    return nudges;
    
  } catch (error) {
    console.error('❌ Error generating nudges:', error);
    return [];
  }
}

/**
 * Save nudges as reminders in database
 */
async function saveNudgesAsReminders(userId, language = 'english') {
  try {
    // Get existing active reminders
    const existingReminders = await Reminder.find({ 
      userId, 
      isActive: true, 
      isDismissed: false 
    });
    
    // Generate new nudges
    const nudges = await generateNudges(userId, language);
    
    // Filter out nudges that already exist (by type and metadata)
    const newNudges = nudges.filter(nudge => {
      return !existingReminders.some(existing => {
        if (existing.type === nudge.type) {
          // For seasonal events, check if same event and similar days
          if (nudge.type === 'seasonal_event') {
            const existingDays = existing.metadata?.daysUntilEvent;
            const newDays = nudge.metadata?.daysUntilEvent;
            return Math.abs(existingDays - newDays) < 5; // Within 5 days
          }
          // For stock analysis, check if same category
          if (nudge.type === 'stock_analysis') {
            return existing.metadata?.category === nudge.metadata?.category;
          }
        }
        return false;
      });
    });
    
    // Save new reminders
    const savedReminders = [];
    for (const nudge of newNudges) {
      const reminder = await Reminder.create({
        userId,
        ...nudge,
        isActive: true,
        isDismissed: false
      });
      savedReminders.push(reminder);
    }
    
    return savedReminders;
    
  } catch (error) {
    console.error('❌ Error saving nudges:', error);
    return [];
  }
}

module.exports = {
  generateNudges,
  saveNudgesAsReminders,
  analyzeStockPatterns,
  getSeasonalSalesData,
  analyzeProductSeasonalPatterns
};

