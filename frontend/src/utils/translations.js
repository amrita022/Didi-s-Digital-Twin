export const translations = {
  english: {
    // Navigation
    dashboard: 'Dashboard',
    voiceAssistant: 'Voice Assistant',
    businessAnalytics: 'Business Analytics',
    pricingAdvisor: 'Pricing Advisor',
    demandPredictions: 'Demand Predictions',
    savingsGoals: 'Savings Goals',
    settings: 'Settings',
    
    // Dashboard
    welcome: 'Namaste',
    businessHealth: 'Business Health',
    totalSales: 'Total Sales',
    monthlyProfit: 'Monthly Profit',
    expenses: 'Expenses',
    savings: 'Savings',
    recentTransactions: 'Recent Transactions',
    aiInsights: 'AI Insights',
    todayIncome: "Today's Income",
    savingsProgress: 'Savings Progress',
    
    // Voice Assistant
    speakNow: 'Speak Now',
    listening: 'Listening...',
    quickCommands: 'Quick Commands',
    logExpense: 'Log Expense',
    recordSale: 'Record Sale',
    pricingHelp: 'Pricing Help',
    showSavings: 'Show Savings',
    
    // Business Analytics
    incomeVsExpenses: 'Income vs Expenses',
    categorySpending: 'Category-wise Spending',
    monthlyTrend: 'Monthly Profit Trend',
    exportReport: 'Export Report',
    printReport: 'Print Report',
    
    // Pricing Advisor
    currentPrices: 'Current Prices',
    suggestedPrices: 'Suggested Prices',
    competitorPricing: 'Competitor Pricing',
    profitMargin: 'Profit Margin',
    updatePrice: 'Update Price',
    
    // Demand Predictions
    seasonalCalendar: 'Seasonal Calendar',
    stockRecommendations: 'Stock Recommendations',
    festivalAlerts: 'Festival Alerts',
    marketInsights: 'Market Insights',
    
    // Savings Goals
    myGoals: 'My Goals',
    addGoal: 'Add Goal',
    milestone: 'Milestone',
    achievement: 'Achievement',
    congratulations: 'Congratulations',
    
    // Settings
    language: 'Language',
    english: 'English',
    hindi: 'Hindi',
    notifications: 'Notifications',
    darkMode: 'Dark Mode',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    done: 'Done',
  },
  
  hindi: {
    // Navigation
    dashboard: 'डैशबोर्ड',
    voiceAssistant: 'आवाज सहायक',
    businessAnalytics: 'व्यापार विश्लेषण',
    pricingAdvisor: 'मूल्य सलाहकार',
    demandPredictions: 'मांग पूर्वानुमान',
    savingsGoals: 'बचत लक्ष्य',
    settings: 'सेटिंग्स',
    
    // Dashboard
    welcome: 'नमस्ते',
    businessHealth: 'व्यापार स्वास्थ्य',
    totalSales: 'कुल बिक्री',
    monthlyProfit: 'मासिक लाभ',
    expenses: 'खर्चे',
    savings: 'बचत',
    recentTransactions: 'हाल के लेनदेन',
    aiInsights: 'AI सुझाव',
    todayIncome: 'आज की आय',
    savingsProgress: 'बचत प्रगति',
    
    // Voice Assistant
    speakNow: 'अब बोलें',
    listening: 'सुन रहे हैं...',
    quickCommands: 'त्वरित आदेश',
    logExpense: 'खर्च दर्ज करें',
    recordSale: 'बिक्री दर्ज करें',
    pricingHelp: 'मूल्य सहायता',
    showSavings: 'बचत दिखाएं',
    
    // Business Analytics
    incomeVsExpenses: 'आय बनाम खर्च',
    categorySpending: 'श्रेणीवार खर्च',
    monthlyTrend: 'मासिक लाभ प्रवृत्ति',
    exportReport: 'रिपोर्ट निर्यात करें',
    printReport: 'रिपोर्ट प्रिंट करें',
    
    // Pricing Advisor
    currentPrices: 'वर्तमान मूल्य',
    suggestedPrices: 'सुझाए गए मूल्य',
    competitorPricing: 'प्रतिस्पर्धी मूल्य',
    profitMargin: 'लाभ मार्जिन',
    updatePrice: 'मूल्य अपडेट करें',
    
    // Demand Predictions
    seasonalCalendar: 'मौसमी कैलेंडर',
    stockRecommendations: 'स्टॉक सुझाव',
    festivalAlerts: 'त्योहार अलर्ट',
    marketInsights: 'बाजार अंतर्दृष्टि',
    
    // Savings Goals
    myGoals: 'मेरे लक्ष्य',
    addGoal: 'लक्ष्य जोड़ें',
    milestone: 'माइलस्टोन',
    achievement: 'उपलब्धि',
    congratulations: 'बधाई हो',
    
    // Settings
    language: 'भाषा',
    english: 'अंग्रेजी',
    hindi: 'हिंदी',
    notifications: 'सूचनाएं',
    darkMode: 'डार्क मोड',
    
    // Common
    save: 'सहेजें',
    cancel: 'रद्द करें',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    add: 'जोड़ें',
    close: 'बंद करें',
    back: 'वापस',
    next: 'अगला',
    done: 'हो गया',
  }
};

export const getTranslation = (key, language = 'english') => {
  return translations[language]?.[key] || key;
};
