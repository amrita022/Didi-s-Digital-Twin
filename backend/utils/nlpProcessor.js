class NLPProcessor {
  constructor() {
    console.log('🧠 NLP Processor Initialized');
  }

  extractAmount(text) {
    console.log(`🔍 Extracting amount from: "${text}"`);
    
    // SIMPLE: Just find any number
    const numberMatch = text.match(/(\d+)/);
    if (numberMatch) {
      const amount = parseInt(numberMatch[1]);
      console.log(`✅ Amount found: ₹${amount}`);
      return amount;
    }
    
    // Handle common Hindi numbers
    if (text.includes('तीन सौ') || text.includes('300')) return 300;
    if (text.includes('दो सौ') || text.includes('200')) return 200;
    if (text.includes('पांच सौ') || text.includes('500')) return 500;
    
    return null;
  }

  detectIntent(text) {
    console.log(`🎯 Detecting intent from: "${text}"`);
    
    const lowerText = text.toLowerCase();
    
    // SIMPLE INTENT DETECTION
    if (text.includes('लिया') || text.includes('liya') || 
        text.includes('खरीद') || text.includes('kharid') ||
        lowerText.includes('bought') || lowerText.includes('spent')) {
      return 'expense';
    }
    
    if (text.includes('बेच') || text.includes('bech') || 
        text.includes('कमाय') || text.includes('kamai') ||
        lowerText.includes('sold') || lowerText.includes('earned')) {
      return 'income';
    }
    
    if (text.includes('खर्च') && (text.includes('कितना') || text.includes('kitna'))) {
      return 'query_expense';
    }
    
    if (text.includes('कमाई') && (text.includes('कितनी') || text.includes('kitni'))) {
      return 'query_income';
    }
    
    if (text.includes('मुनाफा') || text.includes('profit')) {
      return 'query_profit';
    }
    
    if (text.includes('कीमत') || text.includes('दाम') || lowerText.includes('price')) {
      return 'pricing';
    }
    
    return 'unknown';
  }

  extractCategory(text) {
    console.log(`🏷️ Extracting category from: "${text}"`);
    
    if (text.includes('मसाल') || text.includes('masala')) return 'spices';
    if (text.includes('सब्जी') || text.includes('vegetable')) return 'vegetables';
    if (text.includes('अचार') || text.includes('आचार') || text.includes('pickle')) return 'pickles';
    if (text.includes('कपड़') || text.includes('kapda') || text.includes('cloth')) return 'clothing';
    if (text.includes('साड़ी') || text.includes('saree')) return 'clothing';
    
    return 'general';
  }

  process(text) {
    console.log('\n' + '='.repeat(50));
    console.log('🧠 NLP PROCESSING');
    console.log(`📝 Input: "${text}"`);
    
    const result = {
      originalText: text,
      intent: this.detectIntent(text),
      amount: this.extractAmount(text),
      category: this.extractCategory(text)
    };

    console.log(`📊 Result:`, result);
    console.log('='.repeat(50) + '\n');

    return result;
  }
}

module.exports = new NLPProcessor();