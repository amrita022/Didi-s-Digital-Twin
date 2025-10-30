/**
 * Test real Whisper garbles from user's audio transcriptions
 */

const nlpProcessor = require('./utils/nlpProcessor');

console.log('🧪 Testing Real Whisper Garbles from Audio\n');
console.log('=' .repeat(60));

// Test Case 1: "आज मी की ती कर्चो के ला" (first attempt)
console.log('\n📝 Test 1: की ती + कर्चो garbles');
console.log('Input: "आज मी की ती कर्चो के ला"');
console.log('Expected: "आज मी किती खर्च केला" → lang=mr, intent=query_expense\n');

const test1 = "आज मी की ती कर्चो के ला";
const result1 = nlpProcessor.process(test1);
console.log('Result:', JSON.stringify(result1, null, 2));
console.log(`\n${result1.language === 'mr' && result1.intent === 'query_expense' ? '✅ PASS' : '❌ FAIL'}\n`);

// Test Case 2: "आज में किती करत्सा के ला" (second attempt)
console.log('=' .repeat(60));
console.log('\n📝 Test 2: में + करत्सा garbles');
console.log('Input: "आज में किती करत्सा के ला"');
console.log('Expected: "आज मी किती खर्चा केला" → lang=mr, intent=query_expense\n');

const test2 = "आज में किती करत्सा के ला";
const result2 = nlpProcessor.process(test2);
console.log('Result:', JSON.stringify(result2, null, 2));
console.log(`\n${result2.language === 'mr' && result2.intent === 'query_expense' ? '✅ PASS' : '❌ FAIL'}\n`);

// Test Case 3: "आज मी किती करतल केला" (third attempt - detected as MR)
console.log('=' .repeat(60));
console.log('\n📝 Test 3: करतल garble (was correctly detected as MR)');
console.log('Input: "आज मी किती करतल केला"');
console.log('Expected: "आज मी किती खर्च केला" → lang=mr, intent=query_expense\n');

const test3 = "आज मी किती करतल केला";
const result3 = nlpProcessor.process(test3);
console.log('Result:', JSON.stringify(result3, null, 2));
console.log(`\n${result3.language === 'mr' && result3.intent === 'query_expense' ? '✅ PASS' : '❌ FAIL'}\n`);

// Test Case 4: "आज, मी, किती, करतले, खेला" (fourth attempt)
console.log('=' .repeat(60));
console.log('\n📝 Test 4: करतले + commas');
console.log('Input: "आज, मी, किती, करतले, खेला"');
console.log('Expected: "आज मी किती खर्च केला" → lang=mr, intent=query_expense\n');

const test4 = "आज, मी, किती, करतले, खेला";
const result4 = nlpProcessor.process(test4);
console.log('Result:', JSON.stringify(result4, null, 2));
console.log(`\n${result4.language === 'mr' && result4.intent === 'query_expense' ? '✅ PASS' : '❌ FAIL'}\n`);

// Test Case 5: "आज में की ती कारत सकेला" (fifth attempt)
console.log('=' .repeat(60));
console.log('\n📝 Test 5: में + की ती + कारत स + सकेला');
console.log('Input: "आज में की ती कारत सकेला"');
console.log('Expected: "आज मी किती खर्च केला" → lang=mr, intent=query_expense\n');

const test5 = "आज में की ती कारत सकेला";
const result5 = nlpProcessor.process(test5);
console.log('Result:', JSON.stringify(result5, null, 2));
console.log(`\n${result5.language === 'mr' && result5.intent === 'query_expense' ? '✅ PASS' : '❌ FAIL'}\n`);

// Test Case 6: "आज, मी, गिती, खर्टले, खेला" (sixth attempt - गिती!)
console.log('=' .repeat(60));
console.log('\n📝 Test 6: गिती + खर्टले garbles');
console.log('Input: "आज, मी, गिती, खर्टले, खेला"');
console.log('Expected: "आज मी किती खर्च केला" → lang=mr, intent=query_expense\n');

const test6 = "आज, मी, गिती, खर्टले, खेला";
const result6 = nlpProcessor.process(test6);
console.log('Result:', JSON.stringify(result6, null, 2));
console.log(`\n${result6.language === 'mr' && result6.intent === 'query_expense' ? '✅ PASS' : '❌ FAIL'}\n`);

// Test Case 7: "में की दी कर्ष लगेला" (last attempt - detected as Arabic!)
console.log('=' .repeat(60));
console.log('\n📝 Test 7: में + की दी + कर्ष + लगेला (worst garble)');
console.log('Input: "में की दी कर्ष लगेला"');
console.log('Expected: "मी किती खर्च केला" → lang=mr, intent=query_expense\n');

const test7 = "में की दी कर्ष लगेला";
const result7 = nlpProcessor.process(test7);
console.log('Result:', JSON.stringify(result7, null, 2));
console.log(`\n${result7.language === 'mr' && result7.intent === 'query_expense' ? '✅ PASS' : '❌ FAIL'}\n`);

// Summary
console.log('=' .repeat(60));
console.log('\n📊 Summary:');
const passes = [result1, result2, result3, result4, result5, result6, result7].filter(
  r => r.language === 'mr' && r.intent === 'query_expense'
).length;
console.log(`Total: ${passes}/7 passed`);
console.log(passes === 7 ? '\n🎉 ALL TESTS PASSED!' : '\n⚠️  Some tests failed - audio quality may need improvement');
console.log('\n' + '=' .repeat(60));
