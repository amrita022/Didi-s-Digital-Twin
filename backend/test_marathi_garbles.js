/**
 * Test Marathi garbled expense query normalization
 */

const nlpProcessor = require('./utils/nlpProcessor');

console.log('🧪 Testing Marathi Garbled Expense Queries\n');
console.log('=' .repeat(60));

// Test Case 1: खल्चा garble
console.log('\n📝 Test 1: खल्चा → खर्चा normalization');
console.log('Input: "आज मी किती खल्चा केला"');
console.log('Expected: lang=mr, intent=query_expense\n');

const test1 = "आज मी किती खल्चा केला";
const result1 = nlpProcessor.process(test1);
console.log('Result:', JSON.stringify(result1, null, 2));

const pass1 = result1.language === 'mr' && result1.intent === 'query_expense';
console.log(`\n${pass1 ? '✅ PASS' : '❌ FAIL'}: Marathi खल्चा detection\n`);

// Test Case 2: खर्तल garble
console.log('=' .repeat(60));
console.log('\n📝 Test 2: खर्तल → खर्च normalization');
console.log('Input: "आज मी किती खर्तल केला"');
console.log('Expected: lang=mr, intent=query_expense\n');

const test2 = "आज मी किती खर्तल केला";
const result2 = nlpProcessor.process(test2);
console.log('Result:', JSON.stringify(result2, null, 2));

const pass2 = result2.language === 'mr' && result2.intent === 'query_expense';
console.log(`\n${pass2 ? '✅ PASS' : '❌ FAIL'}: Marathi खर्तल detection\n`);

// Test Case 3: खेला → केला garble
console.log('=' .repeat(60));
console.log('\n📝 Test 3: खेला → केला normalization');
console.log('Input: "आज मी किती खर्च खेला"');
console.log('Expected: lang=mr, intent=query_expense\n');

const test3 = "आज मी किती खर्च खेला";
const result3 = nlpProcessor.process(test3);
console.log('Result:', JSON.stringify(result3, null, 2));

const pass3 = result3.language === 'mr' && result3.intent === 'query_expense';
console.log(`\n${pass3 ? '✅ PASS' : '❌ FAIL'}: Marathi खेला detection\n`);

// Test Case 4: Combined garbles (user's actual input)
console.log('=' .repeat(60));
console.log('\n📝 Test 4: Multiple garbles (आज मी किती खल्चा केला)');
console.log('Input: "आज मी किती खल्चा केला"');
console.log('Expected: lang=mr, intent=query_expense\n');

const test4 = "आज मी किती खल्चा केला";
const result4 = nlpProcessor.process(test4);
console.log('Result:', JSON.stringify(result4, null, 2));

const pass4 = result4.language === 'mr' && result4.intent === 'query_expense';
console.log(`\n${pass4 ? '✅ PASS' : '❌ FAIL'}: Combined garbles detection\n`);

// Summary
console.log('=' .repeat(60));
console.log('\n📊 Test Summary:');
const allPassed = pass1 && pass2 && pass3 && pass4;
console.log(`Total: ${[pass1, pass2, pass3, pass4].filter(x => x).length}/4 passed`);
console.log(allPassed ? '\n🎉 ALL TESTS PASSED!' : '\n⚠️  Some tests failed');
console.log('\n' + '=' .repeat(60));
