/**
 * NLP Processor for Voice-Based Business Intelligence
 * Handles Hindi and English voice commands with better intent detection
 */

class NLPProcessor {
  constructor() {
    // Hindi number words mapping
    this.hindiNumbers = {
      'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पांच': 5, 'छह': 6, 'सात': 7, 'आठ': 8, 'नौ': 9,
      'दस': 10, 'बीस': 20, 'तीस': 30, 'चालीस': 40, 'पचास': 50, 'साठ': 60, 'सत्तर': 70, 'अस्सी': 80, 'नब्बे': 90,
      'सौ': 100, 'हजार': 1000
    };

    // Intent patterns
    this.intents = {
      expense: {
        hindi: ['खर्च', 'खर्चा', 'खर्चे', 'दिया', 'ख़रीदा', 'ख़रीद', 'लिया', 'खरीदा', 'खरीद', 'maine', 'liya'],
        english: ['expense', 'spent', 'bought', 'purchased', 'paid', 'buy', 'spent rs']
      },
      income: {
        hindi: ['बिक्री', 'बेचा', 'बेची', 'कमाया', 'आमदनी', 'मिला', 'आय', 'भेजा', 'बचा', 'बेच'],
        english: ['sale', 'sold', 'earned', 'income', 'revenue', 'made', 'bheja', 'bacha', 'sell']
      },
      query_expense: {
        hindi: ['कितना खर्च', 'कुल खर्च', 'खर्चा कितना', 'खर्च हुआ'],
        english: ['total expense', 'how much spent', 'spending', 'expenses today', 'my total expenses', 'what are my expenses']
      },
      query_income: {
        hindi: ['कितनी कमाई', 'कुल बिक्री', 'कमाई कितनी', 'बिक्री कितनी'],
        english: ['total sales', 'how much earned', 'revenue', 'income today']
      },
      query_profit: {
        hindi: ['मुनाफा', 'लाभ', 'फायदा', 'बचत कितनी'],
        english: ['profit', 'earnings', 'net income', 'savings']
      },
      pricing: {
        hindi: ['कीमत', 'दाम', 'मूल्य', 'price क्या', 'कितने में', 'बेचना', 'बेचूं', 'bechna', 'chahie'],
        english: ['price', 'pricing', 'how much to charge', 'cost', 'should sell', 'sell for']
      },
      demand: {
        hindi: ['मांग', 'demand', 'बिकेगा', 'चलेगा'],
        english: ['demand', 'forecast', 'prediction', 'trend']
      }
    };

    // Category patterns
    this.categories = {
      raw_materials: {
        hindi: ['सामान', 'कपड़ा', 'मसाला', 'सामग्री', 'material', 'masala'],
        english: ['material', 'cloth', 'spices', 'ingredients', 'supplies', 'masala']
      },
      pickles: {
        hindi: ['अचार', 'आचार', 'pickle'],
        english: ['pickle', 'achar']
      },
      clothing: {
        hindi: ['कपड़े', 'ब्लाउज', 'साड़ी', 'सूट'],
        english: ['clothes', 'blouse', 'saree', 'suit', 'dress']
      },
      general: {
        hindi: ['सामान्य', 'अन्य'],
        english: ['general', 'other', 'misc']
      }
    };
  }

  /**
   * Extract amount from Hindi/English text
   */
  extractAmount(text) {
    const lowerText = text.toLowerCase();
    
    // Try to find numeric amount with currency indicators
    const patterns = [
      /(\d+)\s*(रुपये|रुपया|rupees|rupee|rs\.?|₹)/i,
      /₹\s*(\d+)/i,
      /(\d+)\s*का/i, // "100 ka"
      /(\d+)/i // fallback to any number
    ];

    for (const pattern of patterns) {
      const match = lowerText.match(pattern);
      if (match) {
        return parseInt(match[1]);
      }
    }

    // Try to extract Hindi number words
    for (const [word, value] of Object.entries(this.hindiNumbers)) {
      if (lowerText.includes(word)) {
        return value;
      }
    }

    return null;
  }

  /**
   * Detect intent from voice command
   */
  detectIntent(text) {
    const lowerText = text.toLowerCase();
    
    // Priority order: Check queries first, then actions
    const priorityOrder = ['query_expense', 'query_income', 'query_profit', 'pricing', 'demand', 'expense', 'income'];
    
    for (const intent of priorityOrder) {
      const patterns = this.intents[intent];
      if (!patterns) continue;
      
      const allPatterns = [...patterns.hindi, ...patterns.english];
      
      for (const pattern of allPatterns) {
        if (lowerText.includes(pattern)) {
          return intent;
        }
      }
    }

    return 'unknown';
  }

  /**
   * Extract category from text
   */
  extractCategory(text) {
    const lowerText = text.toLowerCase();
    
    for (const [category, patterns] of Object.entries(this.categories)) {
      const allPatterns = [...patterns.hindi, ...patterns.english];
      
      for (const pattern of allPatterns) {
        if (lowerText.includes(pattern)) {
          return category;
        }
      }
    }

    return 'general';
  }

  /**
   * Extract time reference (today, yesterday, this week)
   */
  extractTimeReference(text) {
    const lowerText = text.toLowerCase();
    
    const timePatterns = {
      today: ['आज', 'today', 'aaj'],
      yesterday: ['कल', 'yesterday', 'kal'],
      this_week: ['इस हफ्ते', 'this week', 'week'],
      this_month: ['इस महीने', 'this month', 'month']
    };

    for (const [time, patterns] of Object.entries(timePatterns)) {
      for (const pattern of patterns) {
        if (lowerText.includes(pattern)) {
          return time;
        }
      }
    }

    return 'today'; // default
  }

  /**
   * Main processing function
   */
  process(text) {
    const result = {
      originalText: text,
      intent: this.detectIntent(text),
      amount: this.extractAmount(text),
      category: this.extractCategory(text),
      timeReference: this.extractTimeReference(text),
      language: this.detectLanguage(text)
    };

    return result;
  }

  /**
   * Detect if text is primarily Hindi or English
   */
  detectLanguage(text) {
    const lowerText = text.toLowerCase();
    
    // Check for Devanagari script
    const hindiPattern = /[\u0900-\u097F]/;
    if (hindiPattern.test(text)) {
      return 'hindi';
    }
    
    // Check for common Romanized Hindi words
    const hinglishWords = ['maine', 'aaj', 'kitna', 'liya', 'ka', 'ki', 'kya', 
                           'mein', 'hai', 'tha', 'rupaye', 'kharcha', 'kamai'];
    for (const word of hinglishWords) {
      if (lowerText.includes(word)) {
        return 'hindi';
      }
    }
    
    return 'english';
  }

  /**
   * Generate appropriate response based on intent and language
   */
  generateResponse(intent, amount, category, language, data = {}) {
    const responses = {
      expense: {
        hindi: `✅ ₹${amount} का खर्च ${category} में दर्ज हो गया। ${data.totalExpense ? `आज का कुल खर्च: ₹${data.totalExpense}` : ''}`,
        english: `✅ Expense of ₹${amount} recorded for ${category}. ${data.totalExpense ? `Total expense today: ₹${data.totalExpense}` : ''}`
      },
      income: {
        hindi: `🎉 बहुत बढ़िया! ₹${amount} की बिक्री ${category} में दर्ज हो गई। ${data.totalIncome ? `आज की कुल बिक्री: ₹${data.totalIncome}` : ''}`,
        english: `🎉 Great! Sale of ₹${amount} recorded for ${category}. ${data.totalIncome ? `Total sales today: ₹${data.totalIncome}` : ''}`
      },
      query_expense: {
        hindi: `📊 ${data.timeReference === 'today' ? 'आज' : 'इस समय'} का कुल खर्च: ₹${data.totalExpense || 0}`,
        english: `📊 Total expense ${data.timeReference === 'today' ? 'today' : 'so far'}: ₹${data.totalExpense || 0}`
      },
      query_income: {
        hindi: `📈 ${data.timeReference === 'today' ? 'आज' : 'इस समय'} की कुल बिक्री: ₹${data.totalIncome || 0}`,
        english: `📈 Total sales ${data.timeReference === 'today' ? 'today' : 'so far'}: ₹${data.totalIncome || 0}`
      },
      query_profit: {
        hindi: `💰 आपका मुनाफा: ₹${data.profit || 0}। ${data.profit > 0 ? 'बहुत अच्छा!' : 'खर्च कम करने की कोशिश करें।'}`,
        english: `💰 Your profit: ₹${data.profit || 0}. ${data.profit > 0 ? 'Great job!' : 'Try to reduce expenses.'}`
      },
      pricing: {
        hindi: `💡 ${category} के लिए सुझाव: कम से कम ₹${data.suggestedPrice || 100} रखें। आपका खर्च ₹${data.cost || 50} है, तो 30-50% मुनाफा जोड़ें।`,
        english: `💡 Pricing suggestion for ${category}: Charge at least ₹${data.suggestedPrice || 100}. Your cost is ₹${data.cost || 50}, add 30-50% profit.`
      },
      demand: {
        hindi: `📊 ${category} की मांग ${data.season || 'आने वाले समय'} में ${data.demandLevel || 'अच्छी'} होगी। ${data.advice || 'तैयारी शुरू करें!'}`,
        english: `📊 Demand for ${category} will be ${data.demandLevel || 'good'} in ${data.season || 'upcoming season'}. ${data.advice || 'Start preparing!'}`
      },
      unknown: {
        hindi: `🤔 मैं खर्च, बिक्री, मुनाफा, कीमत और मांग के बारे में बता सकती हूं। कुछ और पूछें?`,
        english: `🤔 I can help with expenses, sales, profit, pricing, and demand. Ask me something else?`
      }
    };

    const response = responses[intent] || responses.unknown;
    return response[language] || response['english'];
  }
}

module.exports = new NLPProcessor();
