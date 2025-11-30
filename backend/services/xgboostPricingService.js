// xgboostPricingService.js - XGBoost-based pricing recommendations
const { spawn } = require('child_process');
const path = require('path');
const Transaction = require('../models/Transaction');

/**
 * Generate pricing recommendations using XGBoost ML model
 */
async function generateXGBoostPricingRecommendations(userId, language = 'hindi') {
  try {
    console.log('🤖 Generating XGBoost pricing recommendations for:', userId);
    
    // Get all income transactions (sales) for the user
    const salesTransactions = await Transaction.find({
      userId,
      type: 'income',
      category: 'clothing'
    }).sort({ date: -1 }).limit(500); // Limit to last 500 transactions for performance

    if (!salesTransactions.length) {
      const noDataMessage = language === 'english' 
        ? 'No sales data found. Add transactions.'
        : 'कोई बिक्री डेटा नहीं मिला। लेनदेन जोड़ें।';
      return {
        success: false,
        error: 'No sales data found',
        products: [],
        insights: {
          totalPotentialIncrease: 0,
          message: noDataMessage
        }
      };
    }

    console.log(`📊 Analyzing ${salesTransactions.length} sales transactions...`);

    // Prepare transaction data for Python script
    const transactionData = salesTransactions.map(t => ({
      date: t.date.toISOString(),
      amount: t.amount,
      description: t.description,
      category: t.category
    }));

    // Call Python XGBoost service
    const result = await callXGBoostService(transactionData, language);

    if (!result.success) {
      console.error('❌ XGBoost service error:', result.error);
      // Fallback to rule-based recommendations
      return generateFallbackRecommendations(salesTransactions, language);
    }

    console.log('✅ XGBoost recommendations generated successfully');
    console.log(`📈 Model accuracy: ${(result.modelMetrics.test_r2 * 100).toFixed(1)}%`);
    console.log(`💰 Potential increase: ₹${result.insights.totalPotentialIncrease.toFixed(0)}/month`);

    return {
      success: true,
      products: result.recommendations,
      insights: result.insights,
      modelMetrics: result.modelMetrics,
      method: 'xgboost',
      totalProducts: result.recommendations.length
    };

  } catch (error) {
    console.error('❌ Error in XGBoost pricing service:', error);
    
    // Fallback to rule-based recommendations
    const salesTransactions = await Transaction.find({
      userId,
      type: 'income',
      category: 'clothing'
    }).sort({ date: -1 });

    return generateFallbackRecommendations(salesTransactions, language);
  }
}

/**
 * Call Python XGBoost service
 */
function callXGBoostService(transactions, language = 'hindi') {
  return new Promise((resolve, reject) => {
    const fs = require('fs');
    const os = require('os');
    
    const scriptPath = path.join(__dirname, '..', 'whisper_service', 'xgboost_pricing.py');
    const venvPython = path.join(__dirname, '..', 'whisper_service', 'whisper-venv', 'Scripts', 'python.exe');
    
    // Use venv Python if available, otherwise system Python
    const pythonCmd = require('fs').existsSync(venvPython) ? venvPython : 'python';
    
    // Write transactions and language to temp file (avoid command line length limits)
    const tempFile = path.join(os.tmpdir(), `xgboost_data_${Date.now()}.json`);
    
    try {
      // Include language in data sent to Python
      fs.writeFileSync(tempFile, JSON.stringify({
        transactions: transactions,
        language: language
      }), 'utf8');
    } catch (error) {
      resolve({
        success: false,
        error: `Failed to write temp file: ${error.message}`
      });
      return;
    }
    
    console.log('🐍 Calling Python XGBoost service...');
    
    // Pass temp file path as argument
    const pythonProcess = spawn(pythonCmd, [scriptPath, `@${tempFile}`]);
    
    let output = '';
    let errorOutput = '';
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      // Clean up temp file
      try {
        fs.unlinkSync(tempFile);
      } catch (e) {
        // Ignore cleanup errors
      }
      
      if (code !== 0) {
        console.error('❌ Python script error:', errorOutput);
        resolve({
          success: false,
          error: errorOutput || 'XGBoost service failed'
        });
        return;
      }
      
      try {
        const result = JSON.parse(output);
        resolve(result);
      } catch (error) {
        console.error('❌ Failed to parse Python output:', output);
        resolve({
          success: false,
          error: 'Invalid response from XGBoost service'
        });
      }
    });
    
    pythonProcess.on('error', (error) => {
      console.error('❌ Failed to start Python process:', error);
      resolve({
        success: false,
        error: `Failed to start Python: ${error.message}`
      });
    });
    
    // Timeout after 30 seconds
    setTimeout(() => {
      pythonProcess.kill();
      resolve({
        success: false,
        error: 'XGBoost service timeout'
      });
    }, 30000);
  });
}

/**
 * Fallback rule-based recommendations (when XGBoost fails)
 */
function generateFallbackRecommendations(salesTransactions, language = 'hindi') {
  console.log('⚠️ Using fallback rule-based recommendations');
  
  if (!salesTransactions.length) {
    return {
      success: false,
      products: [],
      insights: {
        totalPotentialIncrease: 0,
        message: 'कोई बिक्री डेटा नहीं मिला'
      },
      method: 'fallback'
    };
  }
  
  // Simple rule-based analysis
  const products = {};
  const items = ['साड़ी', 'लहंगा', 'कुर्ती', 'कुर्ता', 'दुपट्टा', 'ब्लाउज', 'शर्ट', 'पैंट', 'ड्रेस'];
  
  items.forEach(item => {
    products[item] = [];
  });
  
  // Categorize transactions
  salesTransactions.forEach(t => {
    const desc = t.description.toLowerCase();
    for (const item of items) {
      if (desc.includes(item.toLowerCase())) {
        products[item].push(t.amount);
        break;
      }
    }
  });
  
  // Calculate total sales volumes and find max
  const itemSales = [];
  for (const [item, prices] of Object.entries(products)) {
    if (prices.length > 0) {
      itemSales.push({ item, count: prices.length, prices });
    }
  }
  
  // Sort by sales volume
  itemSales.sort((a, b) => b.count - a.count);
  const maxSales = itemSales.length > 0 ? itemSales[0].count : 0;
  const minSalesThreshold = 10; // Minimum sales to recommend increase
  
  // Generate recommendations
  const recommendations = [];
  const marketPrices = {
    'साड़ी': 1800,
    'लहंगा': 2400,
    'कुर्ती': 1200,
    'कुर्ता': 2100,
    'दुपट्टा': 1500,
    'ब्लाउज': 800,
    'शर्ट': 600,
    'पैंट': 700,
    'ड्रेस': 900
  };
  
  for (const { item, count: totalSales, prices } of itemSales) {
    // Skip items with very low sales
    if (totalSales < minSalesThreshold) {
      continue;
    }
    
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    let suggestedPrice = marketPrices[item] || avgPrice * 1.15;
    
    // Calculate dynamic max increase based on sales volume
    const salesRatio = totalSales / maxSales;
    let maxIncreasePercent;
    
    if (salesRatio >= 0.9) {
      // Top sellers: 30% max increase
      maxIncreasePercent = 30;
    } else if (salesRatio >= 0.7) {
      // High performers: 25% max
      maxIncreasePercent = 25;
    } else if (salesRatio >= 0.5) {
      // Medium sellers: 20% max
      maxIncreasePercent = 20;
    } else if (salesRatio >= 0.3) {
      // Lower medium: 15% max
      maxIncreasePercent = 15;
    } else {
      // Low sellers but above threshold: 10% max
      maxIncreasePercent = 10;
    }
    
    // Cap increase at dynamic max for this item
    const maxPrice = avgPrice * (1 + maxIncreasePercent / 100);
    if (suggestedPrice > maxPrice) {
      suggestedPrice = maxPrice;
    }
    
    const diff = suggestedPrice - avgPrice;
    const percentDiff = (diff / avgPrice) * 100;
    
    // Create sales performance context
    let salesContext;
    if (salesRatio >= 0.9) {
      salesContext = 'सबसे ज्यादा बिकने वाला आइटम';
    } else if (salesRatio >= 0.7) {
      salesContext = 'यह आइटम बहुत अच्छा बिकता है';
    } else if (salesRatio >= 0.5) {
      salesContext = 'यह आइटम अच्छा बिकता है';
    } else if (salesRatio >= 0.3) {
      salesContext = 'यह आइटम ठीक बिकता है';
    } else {
      salesContext = 'यह आइटम कम बिकता है';
    }
    
    // Conservative priority levels
    let priority, reason;
    if (percentDiff > 25) {
      priority = 'high';
      reason = `${salesContext} - कीमत ${Math.round(percentDiff)}% बढ़ाएं (धीरे-धीरे)`;
    } else if (percentDiff > 15) {
      priority = 'medium';
      reason = `${salesContext} - कीमत ${Math.round(percentDiff)}% बढ़ाने की सिफारिश`;
    } else if (percentDiff > 5) {
      priority = 'low';
      reason = `${salesContext} - थोड़ी कीमत बढ़ाएं (${Math.round(percentDiff)}%)`;
    } else {
      priority = 'low';
      reason = `${salesContext} - कीमत बाजार के अनुसार है`;
    }
    
    recommendations.push({
      name: item,
      currentPrice: Math.round(avgPrice),
      suggestedPrice: Math.round(suggestedPrice),
      priceDifference: Math.round(diff),
      percentDifference: Math.round(percentDiff),
      reason,
      priority,
      totalSales: prices.length,
      potentialMonthlyIncrease: Math.max(0, Math.round(diff * 10))
    });
  }
  
    const totalPotential = recommendations.reduce((sum, r) => sum + r.potentialMonthlyIncrease, 0);
  
  // Generate bilingual fallback message
  const fallbackMessage = language === 'english'
    ? `Adjusting prices could yield ₹${totalPotential}/month additional profit.`
    : `कीमतें समायोजित करने से ₹${totalPotential}/माह अतिरिक्त लाभ हो सकता है।`;
  
  return {
    success: true,
    products: recommendations.sort((a, b) => b.potentialMonthlyIncrease - a.potentialMonthlyIncrease),
    insights: {
      totalPotentialIncrease: totalPotential,
      message: fallbackMessage,
      averageUnderpricing: 0
    },
    method: 'fallback',
    totalProducts: recommendations.length
  };
}module.exports = {
  generateXGBoostPricingRecommendations
};
