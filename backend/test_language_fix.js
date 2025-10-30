/**
 * Test script to verify language detection fixes for Hindi vs Marathi
 * Tests both:
 * 1. Marathi expense with number multipliers: "आज मी 4 हजार चा कपडा घेतला"
 * 2. Hindi query that shouldn't be forced to Marathi: "आज का कितना खर्चा हुआ"
 */

const nlpProcessor = require('./utils/nlpProcessor');

console.log('🧪 Testing Language Detection Fixes\n');
console.log('=' .repeat(60));

// Test Case 1: Marathi expense with 4 thousand (4000 rupees)
console.log('\n📝 Test 1: Marathi expense with multiplier');
console.log('Input (normalized): "आज मी 4 हजार चा कपडा घेतला"');
console.log('Expected: lang=mr, intent=expense, amount=4000\n');

const marathiText = "आज मी 4 हजार चा कपडा घेतला";
const marathiResult = nlpProcessor.process(marathiText);
console.log('Result:', JSON.stringify(marathiResult, null, 2));

const test1Pass = 
  marathiResult.language === 'mr' && 
  marathiResult.intent === 'expense' && 
  marathiResult.amount === 4000;
console.log(`\n${test1Pass ? '✅ PASS' : '❌ FAIL'}: Marathi expense detection`);

// Test Case 2: Hindi query that shouldn't be confused with Marathi
console.log('\n' + '=' .repeat(60));
console.log('\n📝 Test 2: Hindi expense query (should NOT be Marathi)');
console.log('Input: "आज का कितना खर्चा हुआ"');
console.log('Expected: lang=hi, intent=query_expense, amount=null\n');

const hindiText = "आज का कितना खर्चा हुआ";
const hindiResult = nlpProcessor.process(hindiText);
console.log('Result:', JSON.stringify(hindiResult, null, 2));

const test2Pass = 
  hindiResult.language === 'hi' && 
  hindiResult.intent === 'query_expense' && 
  hindiResult.amount === null;
console.log(`\n${test2Pass ? '✅ PASS' : '❌ FAIL'}: Hindi query detection`);

// Test Case 3: Marathi with garbled words (as user reported)
console.log('\n' + '=' .repeat(60));
console.log('\n📝 Test 3: Marathi with garbled input (before normalization)');
console.log('Input (garbled): "आज मी 4 हादार चा कबबडा केतला"');
console.log('Expected after normalization: "4 हजार" → 4000, "कबबडा"→"कपडा", "केतला"→"घेतला"');
console.log('Expected: lang=mr, intent=expense, amount=4000\n');

const garbledMarathi = "आज मी 4 हादार चा कबबडा केतला";
const garbledResult = nlpProcessor.process(garbledMarathi);
console.log('Result:', JSON.stringify(garbledResult, null, 2));

const test3Pass = 
  garbledResult.language === 'mr' && 
  garbledResult.intent === 'expense' && 
  garbledResult.amount === 4000;
console.log(`\n${test3Pass ? '✅ PASS' : '❌ FAIL'}: Garbled Marathi normalization`);

// Test Case 4: Hindi with garbled खरचा (shouldn't trigger Marathi)
console.log('\n' + '=' .repeat(60));
console.log('\n📝 Test 4: Hindi query with garbled "करचा" (should normalize to "खर्चा")');
console.log('Input: "आज का कितना करचा हुआ"');
console.log('Expected: lang=hi, intent=query_expense (चा in करचा should NOT count as Marathi)\n');

const garbledHindi = "आज का कितना करचा हुआ";
const garbledHindiResult = nlpProcessor.process(garbledHindi);
console.log('Result:', JSON.stringify(garbledHindiResult, null, 2));

const test4Pass = 
  garbledHindiResult.language === 'hi' && 
  garbledHindiResult.intent === 'query_expense';
console.log(`\n${test4Pass ? '✅ PASS' : '❌ FAIL'}: Garbled Hindi not confused with Marathi`);

// Test Case 5: Arbitrary number (user's request for "756 rupees")
console.log('\n' + '=' .repeat(60));
console.log('\n📝 Test 5: Arbitrary number extraction (756)');
console.log('Input: "मैंने आज 756 रुपये का सामान लिया"');
console.log('Expected: lang=hi, intent=expense, amount=756\n');

const arbitraryNumber = "मैंने आज 756 रुपये का सामान लिया";
const arbitraryResult = nlpProcessor.process(arbitraryNumber);
console.log('Result:', JSON.stringify(arbitraryResult, null, 2));

const test5Pass = 
  arbitraryResult.language === 'hi' && 
  arbitraryResult.intent === 'expense' && 
  arbitraryResult.amount === 756;
console.log(`\n${test5Pass ? '✅ PASS' : '❌ FAIL'}: Arbitrary number extraction`);

// Summary
console.log('\n' + '=' .repeat(60));
console.log('\n📊 Test Summary:');
const allPassed = test1Pass && test2Pass && test3Pass && test4Pass && test5Pass;
console.log(`Total: ${[test1Pass, test2Pass, test3Pass, test4Pass, test5Pass].filter(x => x).length}/5 passed`);
console.log(allPassed ? '\n🎉 ALL TESTS PASSED!' : '\n⚠️  Some tests failed - check above');
console.log('\n' + '=' .repeat(60));
