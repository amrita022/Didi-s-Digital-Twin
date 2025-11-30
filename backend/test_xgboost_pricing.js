// Test XGBoost Pricing Service
require('dotenv').config();
const mongoose = require('mongoose');
const { generateXGBoostPricingRecommendations } = require('./services/xgboostPricingService');

const MONGODB_URI = process.env.MONGODB_URI;
const USER_ID = 'zj5NVCFe9lh4jzCfT5Kz85RANJq1';

async function test() {
  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Generate recommendations
    console.log('🤖 Generating XGBoost pricing recommendations...\n');
    const result = await generateXGBoostPricingRecommendations(USER_ID);

    console.log('\n📊 RESULTS:');
    console.log('===========\n');
    console.log(JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('\n✅ SUCCESS!');
      console.log(`\n📈 Model Accuracy: ${(result.modelMetrics?.test_r2 * 100)?.toFixed(1)}%`);
      console.log(`💰 Total Potential Increase: ₹${result.insights?.totalPotentialIncrease?.toFixed(0)}/month`);
      console.log(`📦 Products Analyzed: ${result.totalProducts}`);
      console.log(`🔧 Method: ${result.method}`);
      
      if (result.products && result.products.length > 0) {
        console.log('\n🏆 TOP 3 RECOMMENDATIONS:');
        result.products.slice(0, 3).forEach((p, i) => {
          console.log(`\n${i + 1}. ${p.name}`);
          console.log(`   Current: ₹${p.currentPrice}`);
          console.log(`   Suggested: ₹${p.suggestedPrice} (${p.percentDifference > 0 ? '+' : ''}${p.percentDifference.toFixed(1)}%)`);
          console.log(`   Potential: ₹${p.potentialMonthlyIncrease.toFixed(0)}/month`);
          console.log(`   Priority: ${p.priority}`);
        });
      }
    } else {
      console.log('\n❌ FAILED:', result.error);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

test();
