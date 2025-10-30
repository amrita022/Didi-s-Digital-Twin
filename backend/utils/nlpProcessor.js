class NLPProcessor {
  constructor() {
    console.log('🧠 NLP Processor Initialized');
  }

  // Normalize noisy transcripts: collapse repeated diacritics, fix common garbles
  normalizeText(text) {
    if (!text) return '';
    let t = String(text);
    // Normalize Indic numerals to ASCII 0-9
    const mapDeva = {
      '०':'0','१':'1','२':'2','३':'3','४':'4','५':'5','६':'6','७':'7','८':'8','९':'9'
    };
    const mapBeng = {
      '০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9'
    };
    t = t.replace(/[०१२३४५६७८९]/g, d => mapDeva[d] || d);
    t = t.replace(/[০১২৩৪৫৬৭৮৯]/g, d => mapBeng[d] || d);
    // Collapse repeated nasalization/diacritics
    t = t.replace(/[ँं]+/g, 'ं');
    t = t.replace(/[\u0900-\u097F]\u094D\u094D/g, m => m.replace(/\u094D\u094D/g, '\u094D')); // remove double halant
    // Fix common Whisper garbles around खर्च/खर्चा
    t = t.replace(/खरचा/g, 'खर्चा');
    t = t.replace(/खरच/g, 'खर्च');
    t = t.replace(/करचा/g, 'खर्चा');
    t = t.replace(/करच/g, 'खर्च');
    t = t.replace(/खल्चा/g, 'खर्चा');
    t = t.replace(/खल्च/g, 'खर्च');
    t = t.replace(/खर्तल/g, 'खर्च');
    t = t.replace(/करतले/g, 'खर्च');
    t = t.replace(/करतल/g, 'खर्च');
    t = t.replace(/कारत\s*स/g, 'खर्च');
    t = t.replace(/खरत\s*स/g, 'खर्च');
    t = t.replace(/खर्ट्सो/g, 'खर्च');
    t = t.replace(/खर्टले/g, 'खर्च');
    t = t.replace(/कर्चो/g, 'खर्च');
    t = t.replace(/करत्सा/g, 'खर्चा');
    t = t.replace(/कर्ष/g, 'खर्च');
    t = t.replace(/खेला/g, 'केला');
    t = t.replace(/सकेला/g, 'केला');
    t = t.replace(/लगेला/g, 'केला');
    // Fix Marathi "how much" - किती garbles
    t = t.replace(/की\s*ती/g, 'किती');  // Split words: "की ती" → "किती"
    t = t.replace(/गिती/g, 'किती');      // Wrong letter: "गिती" → "किती"
    t = t.replace(/कि\s*ती/g, 'किती');   // Split: "कि ती" → "किती"
    t = t.replace(/की\s*दी/g, 'किती');   // Severe garble: "की दी" → "किती"
    // Fix मी (I in Marathi) garbles
    t = t.replace(/\sमें\s/g, ' मी ');    // Hindi मैं mistaken as में, should be Marathi मी
    t = t.replace(/^में\s/g, 'मी ');     // At start of sentence
    // Fix today forms
    t = t.replace(/आज्च्चा|आज्छा|आज्चा/g, 'आजचा'); // Marathi today-possessive
  t = t.replace(/आज्छ|आज्का|आज्च्का/g, 'आज');     // noisy "आज"
  t = t.replace(/आजका/g, 'आज का');                // Hindi spacing
    
  // Marathi/Hindi noisy thousand and clothing words
  t = t.replace(/हादार|हाजार|हझार/g, 'हजार');     // thousand garbles
  t = t.replace(/कबबडा/g, 'कपडा');                 // clothing garble
  t = t.replace(/केतला/g, 'घेतला');                 // took/bought garble
    // Hindi variants
  t = t.replace(/हुवा|हूंआ|हूँआ|हूआ/g, 'हुआ');
    t = t.replace(/कि\s*तना/g, 'कितना');
    t = t.replace(/कि\s*तनी/g, 'कितनी');
    // Space cleanups
    t = t.replace(/\s+/g, ' ').trim();
    return t;
  }

  // ADD THIS METHOD - LANGUAGE DETECTION
  detectLanguage(text) {
    const t = this.normalizeText(text);
    // Bengali - unique script: if any Bengali chars, it's bn
    if (/[\u0980-\u09FF]/.test(t)) return 'bn';

    // Scoring-based detection between Hindi and Marathi
    const hiIndicators = [
      'मैं', 'मैंने', 'हुआ', 'मेरा', 'लिया', 'खरीद', 'बेच',
      'का', 'की', 'के', 'कितना', 'कितनी', 'आज', 'खर्च', 'खर्चा', 'है'
    ];
    const mrIndicators = [
      'मी', 'झाला', 'जाला', 'घेतल', 'गेतल', 'गित्ल', 'गेदल', 'विक्री', 'विकल',
      'चा', 'ची', 'चे', 'किती', 'आजचा', 'खर्च', 'खर्चा', 'आहे'
    ];

    let hiScore = 0, mrScore = 0;
    for (const w of hiIndicators) if (t.includes(w)) hiScore++;
    for (const w of mrIndicators) if (t.includes(w)) mrScore++;

    // Tie-breakers using strongly distinctive markers
    if (t.includes('कितना') || t.includes('कितनी')) hiScore += 2;
    if (t.includes('किती')) mrScore += 2;
    if (t.includes('का ') || t.includes(' की ') || t.includes(' के ')) hiScore += 1;
    if (t.includes('चा') || t.includes('ची') || t.includes('चे')) mrScore += 1;

    // Decide
    if (mrScore > hiScore) return 'mr';
    return 'hi';
  }

  extractAmount(text) {
    const t = this.normalizeText(text);
    console.log(`🔍 Extracting amount from: "${t}"`);
    
    const language = this.detectLanguage(t);
    
  // Helper: find all digit sequences (allowing commas and internal spaces), also capture single digits
  const candidates = [];
  // 1) Numbers with optional commas and embedded spaces: e.g., "7 56", "7,56", "12 345" or single digits like "4"
  const spacedNumRegex = /(\d[\d\s,\.]{0,12}\d|\d)/g; // capture multi-digit or single-digit numbers
    let m;
    while ((m = spacedNumRegex.exec(t)) !== null) {
      let raw = m[1];
      // Keep only digits
      const normalized = raw.replace(/[^0-9]/g, '');
      if (normalized.length >= 1) {
        const value = parseInt(normalized, 10);
        candidates.push({ value, index: m.index, raw });
      }
    }
    
    // If we found numbers, prefer one closest to currency, else take the largest
    if (candidates.length > 0) {
      const currencyRegex = /(₹|rs\.?|रु|रुप|रुपय|रुपये|रुपया|टाका|টাকা|taka|rupees|rupess|rupes)/i;
      let chosen = null;
      const currencyMatch = currencyRegex.exec(t);
      if (currencyMatch) {
        const cIdx = currencyMatch.index;
        // pick candidate with minimal distance to currency keyword
        let bestDist = Infinity;
        for (const c of candidates) {
          const dist = Math.abs(c.index - cIdx);
          if (dist < bestDist) { bestDist = dist; chosen = c; }
        }
      } else {
        // choose the largest value as a heuristic
        chosen = candidates.reduce((a, b) => (a.value >= b.value ? a : b));
      }
      if (chosen) {
        let amount = chosen.value;
        // Multiplier rule: if single digit captured and unit word nearby
        const hundredRe = /(सौ|सो|शे|sho)/;
        const thousandRe = /(हज़ार|हजार|हादार|হাজার)/;
        const lakhRe = /(लाख|लक्ष|লাখ)/;
        const croreRe = /(करोड़|कोटी|কোটি)/;
        if (amount < 10) {
          if (hundredRe.test(t)) {
            amount = amount * 100;
            console.log(`✅ Amount found (x100): ₹${amount}`);
            return amount;
          }
          if (thousandRe.test(t)) {
            amount = amount * 1000;
            console.log(`✅ Amount found (x1000): ₹${amount}`);
            return amount;
          }
          if (lakhRe.test(t)) {
            amount = amount * 100000;
            console.log(`✅ Amount found (x1e5): ₹${amount}`);
            return amount;
          }
          if (croreRe.test(t)) {
            amount = amount * 10000000;
            console.log(`✅ Amount found (x1e7): ₹${amount}`);
            return amount;
          }
        }
        console.log(`✅ Amount found: ₹${amount}`);
        return amount;
      }
    }
    
    // PRIORITY 2: Handle word-based numbers with common garbled patterns
    if (language === 'hi') {
      // Perfect matches
      if (t.includes('तीन सौ') || t.includes('तीनसौ')) return 300;
      if (t.includes('दो सौ') || t.includes('दोसौ')) return 200;
      if (t.includes('पांच सौ') || t.includes('पाँच सौ')) return 500;
      if (t.includes('चार सौ')) return 400;
      if (t.includes('एक सौ')) return 100;
      
      // Broken/garbled patterns (whisper mistakes)
      if ((t.includes('तीं') || t.includes('तीन')) && (t.includes('सो') || t.includes('सौ'))) return 300;
      if ((t.includes('दो') || t.includes('द')) && (t.includes('सो') || t.includes('सौ'))) return 200;
      if ((t.includes('पांच') || t.includes('पाच')) && (t.includes('सो') || t.includes('सौ'))) return 500;
      if ((t.includes('चार')) && (t.includes('सो') || t.includes('सौ'))) return 400;
    }
    else if (language === 'mr') {
      if (t.includes('তিনশো') || t.includes('তিন শো')) return 300;
      if (t.includes('দুইশো') || t.includes('দুই শো')) return 200;
      if (t.includes('পাঁচশো') || t.includes('পাঁচ শো')) return 500;
      if (t.includes('চারশো') || t.includes('চার শো')) return 400;
      if (t.includes('चारशे') || t.includes('चार शे')) return 400;
      if (t.includes('শंभर') || t.includes('शंभर') || t.includes('एकशे')) return 100;
      
      // Broken/garbled patterns (whisper mistakes)
      if ((t.includes('तीन') || t.includes('ती')) && (t.includes('शे') || t.includes('्चे'))) return 300;
      if ((t.includes('दोन') || t.includes('दो')) && (t.includes('शे') || t.includes('्चे'))) return 200;
      if ((t.includes('पाच') || t.includes('पा')) && (t.includes('शे') || t.includes('्चे'))) return 500;
      if ((t.includes('चार')) && (t.includes('शे') || t.includes('्चे'))) return 400;
    }
    else if (language === 'bn') {
      if (t.includes('তিনশো') || t.includes('তিন শো')) return 300;
      if (t.includes('দুইশো') || t.includes('দুই शো')) return 200;
      if (t.includes('পাঁচशো') || t.includes('পাঁচ শো')) return 500;
      if (t.includes('চারशো') || t.includes('চার शো')) return 400;
      if (t.includes('শো') || t.includes('একশো')) return 100;
    }
    
    console.log(`⚠️ Could not extract amount from: "${text}"`);
    return null;
  }

  detectIntent(text) {
    const t = this.normalizeText(text);
    console.log(`🎯 Detecting intent from: "${t}"`);
    
    const lowerText = t.toLowerCase();
    const language = this.detectLanguage(t); // ADD THIS LINE

    // HINDI INTENTS
    if (language === 'hi') {
      // EXPENSE QUERY - "खर्च कितना" or garbled variants
      if ((lowerText.includes('खर्च') || lowerText.includes('खर्चा') || lowerText.includes('kharch')) && 
          (lowerText.includes('कितना') || lowerText.includes('कितनी') || lowerText.includes('kitna'))) {
        return 'query_expense';
      }
      
      // INCOME QUERY
      if ((lowerText.includes('कमाई') || lowerText.includes('kamai')) && 
          (lowerText.includes('कितनी') || lowerText.includes('kitni'))) {
        return 'query_income';
      }
      
      // SIMPLE INTENT DETECTION
      if (lowerText.includes('लिया') || lowerText.includes('liya') || 
          lowerText.includes('खरीद') || lowerText.includes('kharid') ||
          lowerText.includes('bought') || lowerText.includes('spent')) {
        return 'expense';
      }
      
      if (lowerText.includes('बेच') || lowerText.includes('bech') || 
          lowerText.includes('कमाय') || lowerText.includes('kamai') ||
          lowerText.includes('sold') || lowerText.includes('earned')) {
        return 'income';
      }
      
      if (lowerText.includes('मुनाफा') || lowerText.includes('profit')) {
        return 'query_profit';
      }
      
      if (lowerText.includes('कीमत') || lowerText.includes('दाम') || lowerText.includes('price')) {
        return 'pricing';
      }
    }

    // MARATHI INTENTS
    else if (language === 'mr') {
      // EXPENSE QUERY
      if ((lowerText.includes('खर्च') || lowerText.includes('खर्चा') || lowerText.includes('kharch')) && 
          (lowerText.includes('किती') || lowerText.includes('kiti') || lowerText.includes('झाला') || lowerText.includes('जाला'))) {
        return 'query_expense';
      }
      
      // INCOME QUERY
      if ((lowerText.includes('कमाई') || lowerText.includes('kamai')) && 
          (lowerText.includes('कितनी') || lowerText.includes('kiti'))) {
        return 'query_income';
      }
      
      // SIMPLE INTENT DETECTION
      // घेतला variations: घेतल, गेतल, गित्ल, गेदल, केतल (whisper mistakes)
      if (lowerText.includes('घेतल') || lowerText.includes('गेतल') || lowerText.includes('गित्ल') || lowerText.includes('गेदल') || lowerText.includes('केतल') ||
          lowerText.includes('ghetla') || lowerText.includes('getla') || lowerText.includes('gitla') || lowerText.includes('gedla') || lowerText.includes('ketla') ||
          lowerText.includes('खरेदी') || lowerText.includes('kharedi') ||
          lowerText.includes('विकत घेतल') || lowerText.includes('विकत गेतल') || 
          lowerText.includes('bought') || lowerText.includes('spent')) {
        return 'expense';
      }
      
      if (lowerText.includes('विकल') || lowerText.includes('vikal') || 
          lowerText.includes('विक्री') || lowerText.includes('vikri') ||
          lowerText.includes('मिळाल') || lowerText.includes('mihal') ||
          lowerText.includes('sold') || lowerText.includes('earned')) {
        return 'income';
      }
      
      if (lowerText.includes('नफा') || lowerText.includes('nfa') || lowerText.includes('profit')) {
        return 'query_profit';
      }
      
      if (lowerText.includes('किंमत') || lowerText.includes('दर') || lowerText.includes('भाव') || lowerText.includes('price')) {
        return 'pricing';
      }
    }

    // BENGALI INTENTS
    else if (language === 'bn') {
      // EXPENSE QUERY
      if ((lowerText.includes('খরচ') || lowerText.includes('kharch')) && 
          (lowerText.includes('কত') || lowerText.includes('koto'))) {
        return 'query_expense';
      }
      
      // INCOME QUERY
      if ((lowerText.includes('আয়') || lowerText.includes('aay')) && 
          (lowerText.includes('কত') || lowerText.includes('koto'))) {
        return 'query_income';
      }
      
      // SIMPLE INTENT DETECTION
      if (lowerText.includes('কিনল') || lowerText.includes('kinlam') || 
          lowerText.includes('খরিদ') || lowerText.includes('kharid') ||
          lowerText.includes('কেনা') || lowerText.includes('kena') ||
          lowerText.includes('bought') || lowerText.includes('spent')) {
        return 'expense';
      }
      
      if (lowerText.includes('বিক্রি') || lowerText.includes('bikri') || 
          lowerText.includes('বেচল') || lowerText.includes('bechlam') ||
          lowerText.includes('বিক্রয়') || lowerText.includes('bikroy') ||
          lowerText.includes('sold') || lowerText.includes('earned')) {
        return 'income';
      }
      
      if (lowerText.includes('লাভ') || lowerText.includes('labh') || lowerText.includes('profit')) {
        return 'query_profit';
      }
      
      if (lowerText.includes('দাম') || lowerText.includes('dam') || lowerText.includes('মূল্য') || lowerText.includes('price')) {
        return 'pricing';
      }
    }

    return 'unknown';
  }

  extractCategory(text) {
    console.log(`🏷️ Extracting category from: "${text}"`);
    
    const language = this.detectLanguage(text); // ADD THIS LINE

    // HINDI CATEGORIES
    if (language === 'hi') {
      if (text.includes('मसाल') || text.includes('masala')) return 'spices';
      if (text.includes('सब्जी') || text.includes('vegetable')) return 'vegetables';
      if (text.includes('अचार') || text.includes('आचार') || text.includes('pickle')) return 'pickles';
      if (text.includes('कपड़') || text.includes('kapda') || text.includes('cloth')) return 'clothing';
      if (text.includes('साड़ी') || text.includes('saree')) return 'clothing';
    }
    // MARATHI CATEGORIES
    else if (language === 'mr') {
      if (text.includes('मसाल') || text.includes('masala')) return 'spices';
      if (text.includes('भाजी') || text.includes('bhaaji') || text.includes('vegetable')) return 'vegetables';
      if (text.includes('लोणच') || text.includes('loncha') || text.includes('pickle')) return 'pickles';
      if (text.includes('कपड') || text.includes('kapda') || text.includes('cloth')) return 'clothing';
      if (text.includes('साडी') || text.includes('sadi') || text.includes('saree')) return 'clothing';
    }
    // BENGALI CATEGORIES
    else if (language === 'bn') {
      if (text.includes('মশলা') || text.includes('moshla') || text.includes('masala')) return 'spices';
      if (text.includes('সবজি') || text.includes('shobji') || text.includes('vegetable')) return 'vegetables';
      if (text.includes('আচার') || text.includes('achar') || text.includes('pickle')) return 'pickles';
      if (text.includes('কাপড়') || text.includes('kapod') || text.includes('cloth')) return 'clothing';
      if (text.includes('শাড়ি') || text.includes('sari') || text.includes('saree')) return 'clothing';
    }
    
    return 'general';
  }

  process(text) {
    console.log('\n' + '='.repeat(50));
    console.log('🧠 MULTI-LANGUAGE NLP PROCESSING');
    
    const detectedLanguage = this.detectLanguage(text); // ADD THIS
    console.log(`🌐 Detected Language: ${detectedLanguage}`);
    console.log(`📝 Input: "${text}"`);
    
    const result = {
      originalText: text,
      detectedLanguage: detectedLanguage,
      language: detectedLanguage, // alias for older callers
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