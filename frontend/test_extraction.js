// Quick test for quantity and item extraction

function extractQuantityFromDescription(description) {
  if (!description) return 1;
  
  const specificPatterns = [
    /(\d+)\s+(sarees?|saris?|sadis?)/i,
    /(\d+)\s+(dresses?|gowns?)/i,
    /(\d+)\s+(blouses?|cholis?)/i,
    /(\d+)\s+(shirts?)/i,
    /(\d+)\s+(pants?|trousers?)/i,
    /(\d+)\s+(items?|pieces?|units?|qty|quantities)/i,
    /(\d+)\s+(?:x|×)\s/,
    /sold\s+(\d+)/i,
    /bought\s+(\d+)/i,
    /^(\d+)/
  ];
  
  for (const pattern of specificPatterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      return parseInt(match[1]);
    }
  }
  
  return 1;
}

function extractItemNameFromDescription(description) {
  if (!description) return null;
  
  const commonItems = [
    'sarees', 'saree', 'sari', 'sadi', 'साड़ी',
    'dresses', 'dress', 'gown', 'फ्रॉक',
    'blouses', 'blouse', 'choli', 'ब्लाउज',
    'shirts', 'shirt', 'कमीज', 'शर्ट',
    'pants', 'pant', 'trousers', 'trouser', 'पैंट',
    'jewelry', 'jewellery', 'bangles', 'bangle', 'kurta', 'kurtas', 'lehenga', 'lehengas'
  ];
  
  const lowerDesc = description.toLowerCase();
  for (const item of commonItems) {
    if (lowerDesc.includes(item)) {
      if (item.includes('saree') || item.includes('sari') || item.includes('sadi') || item.includes('साड़ी')) return 'Saree';
      if (item.includes('dress') || item.includes('gown') || item.includes('फ्रॉक')) return 'Dress';
      if (item.includes('blouse') || item.includes('choli') || item.includes('ब्लाउज')) return 'Blouse';
      if (item.includes('shirt') || item.includes('कमीज') || item.includes('शर्ट')) return 'Shirt';
      if (item.includes('pant') || item.includes('trouser') || item.includes('पैंट')) return 'Pant';
      return item.charAt(0).toUpperCase() + item.slice(1);
    }
  }
  
  return null;
}

// Test cases
const testCases = [
  'sold 1 shirt',
  'sold 2 blouses',
  'sold 3 pants',
  'I sold 5 sarees',
  'sold 3 items',
  '1 blouse sold for 150',
  'shirt sold',
  'sold 10 dresses'
];

console.log('Testing extraction functions:\n');
testCases.forEach(test => {
  const qty = extractQuantityFromDescription(test);
  const item = extractItemNameFromDescription(test);
  console.log(`"${test}"`);
  console.log(`  → Quantity: ${qty}, Item: ${item || 'NOT FOUND'}`);
  console.log();
});
