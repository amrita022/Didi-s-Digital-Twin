// utils/aiInsights.js - Intelligent seasonal insights generator with Prophet AI
const Transaction = require("../models/Transaction");
const prophetAIService = require('../services/prophetAIService');

/**
 * Extract specific clothing items from transaction descriptions
 * Detects: साड़ी, लहंगा, कुर्ती, कुर्ता, दुपट्टा, ब्लाउज, etc.
 */
function extractClothingItem(description) {
  if (!description) return null;
  
  const clothingPatterns = {
    'साड़ी': /साड़ी|saree|sari/i,
    'लहंगा': /लहंगा|लेहंगा|lehenga/i,
    'ब्लाउज': /ब्लाउज|blouse/i,
    'कुर्ती': /कुर्ती|kurti/i,
    'कुर्ता': /कुर्ता|kurta/i,
    'शर्ट': /shirt/i,
    'पैंट': /pant/i,
    'ड्रेस': /dress/i,
    'दुपट्टा': /दुपट्टा|dupatta/i,
    'सलवार': /सलवार|salwar/i,
    'चुड़ीदार': /चुड़ीदार|churidar/i,
  };
  
  for (const [item, pattern] of Object.entries(clothingPatterns)) {
    if (pattern.test(description)) {
      return item;
    }
  }
  
  return 'अन्य'; // Generic clothing
}

/**
 * Generate localized insight text
 */
function getLocalizedInsight(lang = 'english') {
  return {
    bestSeller: lang === 'marathi' ? '⭐ उत्तम विक्रेता' : (lang === 'hindi' ? '⭐ बेस्ट सेलर' : '⭐ Best Seller'),
    generated: lang === 'marathi' ? 'निर्माण' : (lang === 'hindi' ? 'उत्पन्न' : 'generated'),
    keepStock: lang === 'marathi' ? 'स्टॉकमध्ये ठेवा!' : (lang === 'hindi' ? 'स्टॉक में रखें!' : 'Keep this in stock!'),
    festiveTitle: lang === 'marathi' ? '🪔 सण काळ अवसर' : (lang === 'hindi' ? '🪔 त्योहार मौसम अवसर' : '🪔 Festive Season Opportunity'),
    festiveMsg: lang === 'marathi' ? 'गत वर्षी नोव्हेंबर-डिसेंबर विक्रय: ₹%s. लग्न आणि दिवाळी काळ आसन्न!' : (lang === 'hindi' ? 'पिछले साल नवंबर-दिसंबर बिक्री: ₹%s। शादी और दिवाली मौसम आ रहा है!' : 'Last year\'s Nov-Dec sales: ₹%s. Wedding & Diwali season approaching!'),
    weddingTitle: lang === 'marathi' ? '💍 लग्न काळ समीपस्थ' : (lang === 'hindi' ? '💍 शादी का मौसम आ रहा है' : '💍 Wedding Season Approaching'),
    weddingMsg: lang === 'marathi' ? 'गत वर्षी अप्रैल-मे लग्न काळ ₹%s मिळवले. दुलहिन कपडे तयार करा!' : (lang === 'hindi' ? 'पिछले साल अप्रैल-मई शादी के मौसम में ₹%s कमाई हुई। दुल्हन कपड़ों की तैयारी करें!' : 'Apr-May wedding season earned ₹%s last year. Prepare bridal wear!'),
    lastYear: lang === 'marathi' ? 'गत वर्षी' : (lang === 'hindi' ? 'पिछले साल' : 'last year')
  };
}

/**
 * Generate intelligent AI insights based on historical patterns
 * Uses Prophet AI for ML-powered predictions + seasonal analysis
 * Compares current period with same period last year
 */
async function generateAIInsights(userId, currentTransactions = [], language = 'english') {
  const insights = [];
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-11
  const currentYear = now.getFullYear();
  const localized = getLocalizedInsight(language);
  
  try {
    // Get all transactions for analysis
    const allTransactions = await Transaction.find({ userId }).sort({ date: 1 });
    
    if (allTransactions.length === 0) {
      return [{
        type: 'info',
        title: language === 'marathi' ? '📊 अंतर्दृष्टी पाहण्यासाठी ट्रॅकिंग सुरू करा' : (language === 'hindi' ? '📊 अंतर्दृष्टि देखने के लिए ट्रैकिंग शुरू करें' : '📊 Start tracking to see insights'),
        message: language === 'marathi' ? 'वैयक्तिकृत शिफारसींसाठी अधिक व्यवहार जोडा!' : (language === 'hindi' ? 'व्यक्तिगत सिफारिशों के लिए अधिक लेनदेन जोड़ें!' : 'Add more transactions to get personalized recommendations!'),
        priority: 'low'
      }];
    }
    
    // === PROPHET AI INSIGHT: ML-Powered Forecast ===
    try {
      console.log('🤖 Fetching Prophet AI predictions for insights...');
      const prophetPredictions = await prophetAIService.generateDemandPredictions(userId, language);
      
      if (prophetPredictions.success && prophetPredictions.model === 'prophet_ai' && prophetPredictions.predictions?.length > 0) {
        // Use the first FULL prediction (should be next month, not partial current month)
        const nextMonth = prophetPredictions.predictions[0];
        const monthName = nextMonth.month;
        const revenue = nextMonth.predictedRevenue;
        const demand = nextMonth.demand;
        const monthMap = {
          english: {
            January: 'January', February: 'February', March: 'March', April: 'April', May: 'May', June: 'June',
            July: 'July', August: 'August', September: 'September', October: 'October', November: 'November', December: 'December'
          },
          hindi: {
            January: 'जनवरी', February: 'फ़रवरी', March: 'मार्च', April: 'अप्रैल', May: 'मई', June: 'जून',
            July: 'जुलाई', August: 'अगस्त', September: 'सितंबर', October: 'अक्टूबर', November: 'नवंबर', December: 'दिसंबर'
          },
          marathi: {
            January: 'जानेवारी', February: 'फेब्रुवारी', March: 'मार्च', April: 'एप्रिल', May: 'मे', June: 'जून',
            July: 'जुलै', August: 'ऑगस्ट', September: 'सप्टेंबर', October: 'ऑक्टोबर', November: 'नोव्हेंबर', December: 'डिसेंबर'
          }
        };
        const localizedMonth = monthMap[language]?.[monthName] || monthName;
        const demandText = (language === 'marathi')
          ? (demand === 'very-high' ? 'खूप उच्च' : demand === 'high' ? 'उच्च' : demand === 'medium' ? 'मध्यम' : 'कमी')
          : (language === 'hindi'
            ? (demand === 'very-high' ? 'बहुत अधिक' : demand === 'high' ? 'अधिक' : demand === 'medium' ? 'मध्यम' : 'कम')
            : demand);
        const approachingText = language === 'marathi' ? 'आसन्न!' : (language === 'hindi' ? 'आ रहा है!' : 'approaching!');
        
        // Skip if revenue seems too low (likely partial month data)
        if (revenue < 5000) {
          console.log('⚠️ Skipping Prophet insight - revenue too low (partial month)');
        } else {
          let demandEmoji = '📈';
          if (demand === 'very-high') demandEmoji = '🔥';
          else if (demand === 'high') demandEmoji = '📈';
          else if (demand === 'medium') demandEmoji = '📊';
          
          const titleText = (language === 'marathi')
            ? `${demandEmoji} प्रोफेट एआय: ${localizedMonth} अंदाज`
            : (language === 'hindi')
              ? `${demandEmoji} प्रोफेट एआई: ${localizedMonth} पूर्वानुमान`
              : `${demandEmoji} Prophet AI: ${localizedMonth} Forecast`;
          const messageText = (language === 'marathi')
            ? `एआय पुढील महिन्यात ₹${revenue.toLocaleString('en-IN')} उत्पन्न भाकीत करते (${demandText} मागणी).${nextMonth.festival ? ' ' + nextMonth.festival + ' ' + approachingText : ''}`
            : (language === 'hindi')
              ? `एआई अगले महीने ₹${revenue.toLocaleString('en-IN')} राजस्व का पूर्वानुमान करता है (${demandText} मांग).${nextMonth.festival ? ' ' + nextMonth.festival + ' ' + approachingText : ''}`
              : `AI predicts ₹${revenue.toLocaleString('en-IN')} revenue next month with ${demand} demand.${nextMonth.festival ? ' ' + nextMonth.festival + ' approaching!' : ''}`;

          insights.push({
            type: 'prophet',
            title: titleText,
            message: messageText,
            priority: 'high',
            model: 'prophet_ai'
          });
          
          console.log('✅ Added Prophet AI insight');
        }
      }
    } catch (prophetError) {
      console.log('⚠️ Prophet AI insight generation failed:', prophetError.message);
      // Continue with other insights even if Prophet fails
    }
    
    // Separate historical (last year) and current year data
    const lastYearTransactions = allTransactions.filter(t => {
      const year = new Date(t.date).getFullYear();
      return year === currentYear - 1;
    });
    
    const currentYearTransactions = allTransactions.filter(t => {
      const year = new Date(t.date).getFullYear();
      return year === currentYear;
    });
    
    // === INSIGHT 1: Seasonal Pattern Analysis ===
    if (lastYearTransactions.length > 0) {
      const sameMonthLastYear = lastYearTransactions.filter(t => {
        return new Date(t.date).getMonth() === currentMonth;
      });
      
      if (sameMonthLastYear.length > 0) {
        // Analyze top-selling items in this month last year
        const itemSales = {};
        sameMonthLastYear
          .filter(t => t.type === 'income' && t.category === 'clothing')
          .forEach(t => {
            const item = extractClothingItem(t.description);
            itemSales[item] = (itemSales[item] || 0) + t.amount;
          });
        
        // Find top item
        const sortedItems = Object.entries(itemSales).sort((a, b) => b[1] - a[1]);
        if (sortedItems.length > 0) {
          const [topItem, amount] = sortedItems[0];
          const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                             'July', 'August', 'September', 'October', 'November', 'December'];
          
          const monthMapAlert = {
            english: {
              January: 'January', February: 'February', March: 'March', April: 'April', May: 'May', June: 'June',
              July: 'July', August: 'August', September: 'September', October: 'October', November: 'November', December: 'December'
            },
            hindi: {
              January: 'जनवरी', February: 'फ़रवरी', March: 'मार्च', April: 'अप्रैल', May: 'मई', June: 'जून',
              July: 'जुलाई', August: 'अगस्त', September: 'सितंबर', October: 'अक्टूबर', November: 'नवंबर', December: 'दिसंबर'
            },
            marathi: {
              January: 'जानेवारी', February: 'फेब्रुवारी', March: 'मार्च', April: 'एप्रिल', May: 'मे', June: 'जून',
              July: 'जुलै', August: 'ऑगस्ट', September: 'सप्टेंबर', October: 'ऑक्टोबर', November: 'नोव्हेंबर', December: 'डिसेंबर'
            }
          };
          const alertMonthName = monthNames[currentMonth];
          const localizedAlertMonth = monthMapAlert[language]?.[alertMonthName] || alertMonthName;
          const seasonalTitle = language === 'marathi'
            ? `📅 ${localizedAlertMonth} पीक सिझन सूचना!`
            : (language === 'hindi'
              ? `📅 ${localizedAlertMonth} पीक सीजन अलर्ट!`
              : `📅 ${alertMonthName} Peak Season Alert!`);
          const seasonalMsg = language === 'marathi'
            ? `${localized.lastYear} तुम्ही ${localizedAlertMonth} मध्ये ₹${amount.toLocaleString('en-IN')} किमतीचे ${topItem} विकले. आत्ताच साठा वाढवा!`
            : (language === 'hindi'
              ? `पिछले साल आपने ${localizedAlertMonth} में ₹${amount.toLocaleString('en-IN')} के ${topItem} बेचे। अभी स्टॉक बढ़ाएँ!`
              : `Last year you sold ₹${amount.toLocaleString('en-IN')} worth of ${topItem} in ${alertMonthName}. Stock up now!`);

          insights.push({
            type: 'seasonal',
            title: seasonalTitle,
            message: seasonalMsg,
            priority: 'high'
          });
        }
      }
    }
    
    // === INSIGHT 2: Festive Season Analysis (Nov-Dec) ===
    if (currentMonth >= 9) { // October onwards
      const festiveMonths = lastYearTransactions.filter(t => {
        const month = new Date(t.date).getMonth();
        return month === 10 || month === 11; // Nov-Dec
      });
      
      const festiveIncome = festiveMonths
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      if (festiveIncome > 10000) {
        insights.push({
          type: 'festive',
          title: localized.festiveTitle,
          message: localized.festiveMsg.replace('%s', festiveIncome.toLocaleString('en-IN')),
          priority: 'high'
        });
      }
    }
    
    // === INSIGHT 3: Best-Selling Item Analysis ===
    const allClothingIncome = lastYearTransactions.filter(
      t => t.type === 'income' && t.category === 'clothing'
    );
    
    if (allClothingIncome.length > 0) {
      const itemTotals = {};
      allClothingIncome.forEach(t => {
        const item = extractClothingItem(t.description);
        itemTotals[item] = (itemTotals[item] || 0) + t.amount;
      });
      
      const topSeller = Object.entries(itemTotals).sort((a, b) => b[1] - a[1])[0];
      if (topSeller) {
        insights.push({
          type: 'trend',
          title: `${localized.bestSeller}: ${topSeller[0]}`,
          message: `${topSeller[0]} ${localized.generated} ₹${topSeller[1].toLocaleString('en-IN')} ${localized.lastYear}. ${localized.keepStock}`,
          priority: 'medium'
        });
      }
    }
    
    // === INSIGHT 4: Wedding Season Alert (Apr-May) ===
    if (currentMonth >= 2 && currentMonth <= 4) { // Mar-May
      const weddingSeason = lastYearTransactions.filter(t => {
        const month = new Date(t.date).getMonth();
        return (month === 3 || month === 4) && t.type === 'income'; // Apr-May
      });
      
      const weddingIncome = weddingSeason.reduce((sum, t) => sum + t.amount, 0);
      
      if (weddingIncome > 5000) {
        insights.push({
          type: 'seasonal',
          title: localized.weddingTitle,
          message: localized.weddingMsg.replace('%s', weddingIncome.toLocaleString('en-IN')),
          priority: 'high'
        });
      }
    }
    
    // === INSIGHT 5: Current Performance vs Last Year ===
    if (currentYearTransactions.length > 0 && lastYearTransactions.length > 0) {
      const currentYearIncome = currentYearTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const lastYearIncome = lastYearTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const growth = ((currentYearIncome - lastYearIncome) / lastYearIncome * 100).toFixed(1);
      
      if (growth > 0) {
        const growthTitle = language === 'marathi'
          ? `📈 ${growth}% वाढ!`
          : (language === 'hindi' ? `📈 ${growth}% वृद्धि!` : `📈 ${growth}% Growth!`);
        const growthMsg = language === 'marathi'
          ? `तुम्ही मागील वर्षाच्या तुलनेत ${growth}% पुढे आहात. गती कायम ठेवा!`
          : (language === 'hindi'
            ? `आप पिछले साल से ${growth}% आगे हैं। गति बनाए रखें!`
            : `You're ${growth}% ahead of last year. Keep up the momentum!`);

        insights.push({
          type: 'growth',
          title: growthTitle,
          message: growthMsg,
          priority: 'medium'
        });
      }
    }
    
    // === Default insight if no patterns found ===
    if (insights.length === 0) {
      const infoTitle = language === 'marathi'
        ? '📊 तुमच्या अंतर्दृष्टी तयार करीत आहोत'
        : (language === 'hindi' ? '📊 आपकी अंतर्दृष्टि तैयार की जा रही है' : '📊 Building your insights');
      const infoMsg = language === 'marathi'
        ? 'हंगामी नमुने आणि प्रवृत्ती शोधण्यासाठी व्यवहार जोडत रहा!'
        : (language === 'hindi'
          ? 'मौसमी पैटर्न और रुझान खोजने के लिए लेनदेन जोड़ते रहें!'
          : 'Keep adding transactions to discover seasonal patterns and trends!');

      insights.push({
        type: 'info',
        title: infoTitle,
        message: infoMsg,
        priority: 'low'
      });
    }
    
    // Prioritize Prophet AI insights first, then others
    const prophetInsights = insights.filter(i => i.model === 'prophet_ai');
    const otherInsights = insights.filter(i => i.model !== 'prophet_ai');
    const sortedInsights = [...prophetInsights, ...otherInsights];
    
    return sortedInsights.slice(0, 4); // Return top 4 insights with Prophet first
    
  } catch (error) {
    console.error('❌ Error generating AI insights:', error);
    return [{
      type: 'error',
      title: language === 'marathi' ? '⚠️ अंतर्दृष्टी तयार करता आले नाहीत' : (language === 'hindi' ? '⚠️ अंतर्दृष्टि उत्पन्न नहीं हो सकीं' : '⚠️ Unable to generate insights'),
      message: language === 'marathi' ? 'वैयक्तिकृत शिफारसींसाठी व्यवहार ट्रॅक करत रहा.' : (language === 'hindi' ? 'व्यक्तिगत सिफारिशों के लिए लेनदेन ट्रैक करना जारी रखें।' : 'Continue tracking transactions for personalized recommendations.'),
      priority: 'low'
    }];
  }
}

// Legacy function for basic insights (kept for backward compatibility)
async function generateBasicInsights(userId, transactions = []) {
  if (!transactions.length) return;

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const profit = totalIncome - totalExpenses;
  const insights = [];

  if (profit < 0) {
    insights.push({
      type: "savings",
      title: "Your expenses exceed income this month",
      message: "Try reducing unnecessary costs or increasing revenue.",
      priority: "high"
    });
  } else if (profit > 0 && profit < totalIncome * 0.2) {
    insights.push({
      type: "savings",
      title: "Low profit margin detected",
      message: "You're earning but saving very little. Consider a goal-based saving plan.",
      priority: "medium"
    });
  } else {
    insights.push({
      type: "general",
      title: "Good financial health",
      message: "Your business is doing well this month. Keep it up!",
      priority: "low"
    });
  }

  for (const insight of insights) {
    await AIInsight.create({
      userId,
      ...insight,
      date: new Date()
    });
  }
}

module.exports = { generateAIInsights, generateBasicInsights };