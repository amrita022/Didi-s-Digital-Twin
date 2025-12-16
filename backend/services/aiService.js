const nlpProcessor = require('../utils/nlpProcessor');
const dbService = require('./dbService');

class AIService {
  constructor() {
    this.initialized = false;
  }

  async initialize() {
    try {
      console.log('🚀 Initializing AI Services...');
      // Web Speech API is handled on the frontend, no backend initialization needed
      this.initialized = true;
      console.log('✅ AI Service Ready!');
    } catch (error) {
      console.error('❌ AI Service initialization failed:', error);
      throw error;
    }
  }

  async processVoiceCommand(text, userId, audioData = null) {
    console.log(`🤖 Processing voice command...`);
    
    // Web Speech API handles transcription on the frontend, so we only receive text
    const finalText = text;
    
    if (!finalText || finalText.trim().length === 0) {
      return {
        success: false,
        error: 'No text to process',
        response_english: "I didn't hear anything. Please speak again.",
        response_hindi: "मैंने कुछ नहीं सुना। कृपया फिर से बोलें।"
      };
    }
    
    console.log(`📝 AI Processing: "${finalText}"`);
    
    // Step 1: NLP Analysis
    const analysis = nlpProcessor.process(finalText);
    console.log('📊 NLP Analysis:', analysis);
    
    // Step 2: Handle based on intent
    let result = {};
    
    switch (analysis.intent) {
      case 'expense':
        result = await this.handleExpense(analysis, userId, finalText);
        break;
      case 'income':
        result = await this.handleIncome(analysis, userId, finalText);
        break;
      case 'query_expense':
        result = await this.handleQueryExpense(analysis, userId);
        break;
      case 'query_income':
        result = await this.handleQueryIncome(analysis, userId);
        break;
      case 'query_profit':
        result = await this.handleQueryProfit(analysis, userId);
        break;
      case 'pricing':
        result = await this.handlePricing(analysis, userId);
        break;
      default:
        result = await this.handleUnknown(analysis, finalText);
    }
    
    return {
      success: true,
      intent: analysis.intent,
      amount: analysis.amount,
      category: analysis.category,
      text: finalText,
      processedWithAI: true,
      ...result
    };
  }

  async handleExpense(analysis, userId, originalText) {
    if (!analysis.amount) {
      return {
        response_english: "How much did you spend? Please include the amount.",
        response_hindi: "आपने कितना खर्च किया? कृपया रकम बताएं।",
        saved: false
      };
    }

    const transaction = await dbService.saveTransaction({
      userId,
      type: 'expense',
      amount: analysis.amount,
      category: analysis.category,
      description: originalText
    });

    const totals = await dbService.getTodaysTotals(userId);
    
    return {
      response_english: `✅ Recorded expense of ₹${analysis.amount} for ${analysis.category}. Total spent today: ₹${totals.expenses}`,
      response_hindi: `✅ ${analysis.category} पर ₹${analysis.amount} का खर्च दर्ज किया। आज कुल खर्च: ₹${totals.expenses}`,
      saved: true,
      transaction
    };
  }

  async handleIncome(analysis, userId, originalText) {
    if (!analysis.amount) {
      return {
        response_english: "How much did you earn? Please include the amount.",
        response_hindi: "आपने कितना कमाया? कृपया रकम बताएं।",
        saved: false
      };
    }

    const transaction = await dbService.saveTransaction({
      userId,
      type: 'income',
      amount: analysis.amount,
      category: analysis.category,
      description: originalText
    });

    const totals = await dbService.getTodaysTotals(userId);
    
    return {
      response_english: `🎉 Recorded income of ₹${analysis.amount} from ${analysis.category}. Total earned today: ₹${totals.income}`,
      response_hindi: `🎉 ${analysis.category} से ₹${analysis.amount} की आय दर्ज की। आज कुल कमाई: ₹${totals.income}`,
      saved: true,
      transaction
    };
  }

  async handleQueryExpense(analysis, userId) {
    const totals = await dbService.getTodaysTotals(userId);
    
    return {
      response_english: `📊 Today's total expenses: ₹${totals.expenses}`,
      response_hindi: `📊 आज का कुल खर्च: ₹${totals.expenses}`,
      data: { totalExpense: totals.expenses }
    };
  }

  async handleQueryIncome(analysis, userId) {
    const totals = await dbService.getTodaysTotals(userId);
    
    return {
      response_english: `📈 Today's total income: ₹${totals.income}`,
      response_hindi: `📈 आज की कुल आय: ₹${totals.income}`,
      data: { totalIncome: totals.income }
    };
  }

  async handleQueryProfit(analysis, userId) {
    const totals = await dbService.getTodaysTotals(userId);
    const profit = totals.income - totals.expenses;
    
    return {
      response_english: `💰 Today's profit: ₹${profit} (Income: ₹${totals.income}, Expenses: ₹${totals.expenses})`,
      response_hindi: `💰 आज का मुनाफा: ₹${profit} (आय: ₹${totals.income}, खर्च: ₹${totals.expenses})`,
      data: { profit, ...totals }
    };
  }

  async handlePricing(analysis, userId) {
    const suggestion = await dbService.getPricingSuggestion(analysis.category, userId);
    
    return {
      response_english: `💡 For ${analysis.category}, charge at least ₹${suggestion.suggestedPrice} to make a good profit.`,
      response_hindi: `💡 ${analysis.category} के लिए कम से कम ₹${suggestion.suggestedPrice} रखें ताकि अच्छा मुनाफा हो।`,
      data: suggestion
    };
  }

  async handleUnknown(analysis, text) {
    return {
      response_english: `🤖 I understand: "${text}". I can help with expenses, sales, profit, and pricing questions.`,
      response_hindi: `🤖 मैं समझ गया: "${text}"। मैं खर्च, बिक्री, मुनाफा और कीमत के बारे में मदद कर सकती हूं।`
    };
  }

  async healthCheck() {
    return {
      status: this.initialized ? 'READY' : 'NOT_READY',
      speechRecognition: 'Web Speech API (Frontend)',
      modelsLoaded: this.initialized,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new AIService();