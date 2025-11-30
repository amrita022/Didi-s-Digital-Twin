/* API utilities for communicating with backend */

import offlineStorage from './offlineStorage';
const API_BASE_URL = 'http://localhost:5002/api';

/* Savings Goals API */
export async function listSavingsGoals(userId) {
  if (!userId) throw new Error('userId is required');
  
  const response = await fetch(`${API_BASE_URL}/savings-goal?userId=${encodeURIComponent(userId)}`);
  if (!response.ok) throw new Error('Failed to fetch savings goals');
  
  const data = await response.json();
  return data.goals;
}

export async function getSavingsGoal(goalId, userId) {
  if (!userId || !goalId) throw new Error('userId and goalId are required');
  
  const response = await fetch(`${API_BASE_URL}/savings-goal/${goalId}?userId=${encodeURIComponent(userId)}`);
  if (!response.ok) throw new Error('Failed to fetch savings goal');
  
  const data = await response.json();
  return data.goal;
}

export async function createSavingsGoal(goalData, userId) {
  if (!userId) throw new Error('userId is required');
  
  const response = await fetch(`${API_BASE_URL}/savings-goal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...goalData, userId })
  });
  
  if (!response.ok) throw new Error('Failed to create savings goal');
  
  const data = await response.json();
  return data.goal;
}

export async function updateSavingsGoal(goalId, currentAmount, userId) {
  if (!userId || !goalId) throw new Error('userId and goalId are required');
  
  const response = await fetch(`${API_BASE_URL}/savings-goal/${goalId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, currentAmount })
  });
  
  if (!response.ok) throw new Error('Failed to update savings goal');
  
  const data = await response.json();
  return data.goal;
}

export async function deleteSavingsGoal(goalId, userId) {
  if (!userId || !goalId) throw new Error('userId is required');
  
  const response = await fetch(`${API_BASE_URL}/savings-goal/${goalId}?userId=${encodeURIComponent(userId)}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) throw new Error('Failed to delete savings goal');
  
  return true;
}

export async function incrementSavingsGoal(goalId, amount, userId) {
  if (!userId || !goalId) throw new Error('userId and goalId are required');
  
  const response = await fetch(`${API_BASE_URL}/savings-goal/${goalId}/progress`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, amount })
  });
  
  if (!response.ok) throw new Error('Failed to increment savings goal');
  
  const data = await response.json();
  return data.goal;
}

/* Process voice command */
export async function processVoiceCommand(text, userId) {
  // REQUIRE userId - no default fallback!
  if (!userId) {
    console.error('❌ ERROR: processVoiceCommand called without userId!');
    throw new Error('userId is required for processVoiceCommand');
  }
  
  console.log('📞 API: processVoiceCommand called with:', { text, userId });
  
  try {
    const response = await fetch(`${API_BASE_URL}/process-voice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, userId })
    });

    if (!response.ok) {
      throw new Error('Failed to process voice command');
    }

    const data = await response.json();
    console.log('🔍 Backend response:', data);
    
    // RETURN THE ACTUAL RESPONSE FIELDS
    return {
      success: data.success,
      response_english: data.response_english,
      response_hindi: data.response_hindi,
      response: data.response_english, // Fallback for frontend
      intent: data.intent,
      amount: data.amount,
      category: data.category,
      offline: false
    };

  } catch (error) {
    console.error('❌ API Error:', error);
    
    // If offline, queue the transaction
    if (!navigator.onLine) {
      console.log('📴 Offline - attempting to save locally...');
      
      // Try to extract transaction data locally
      const localResult = await processOffline(text);
      return localResult;
    }
    throw error;
  }
}

/* Process voice command offline */
async function processOffline(text) {
  console.log('💾 Processing offline:', text);
  
  // Simple local processing
  const lowerText = text.toLowerCase();
  let type = 'expense';
  let amount = null;
  let category = 'general';
  
  // Extract amount
  const amountMatch = text.match(/(\d+)/);
  if (amountMatch) {
    amount = parseInt(amountMatch[1]);
  }
  
  // Detect type
  if (lowerText.includes('sale') || lowerText.includes('बिक्री') || lowerText.includes('sold')) {
    type = 'income';
  }
  
  // Detect category
  if (lowerText.includes('pickle') || lowerText.includes('अचार')) {
    category = 'pickles';
  } else if (lowerText.includes('cloth') || lowerText.includes('कपड़')) {
    category = 'clothing';
  } else if (lowerText.includes('material') || lowerText.includes('सामान')) {
    category = 'raw_materials';
  }
  
  if (amount && (type === 'expense' || type === 'income')) {
    // Save offline
    await offlineStorage.addTransaction({
      type,
      amount,
      category,
      description: text
    });
    
    return {
      success: true,
      offline: true,
      response_english: `📴 Offline: Saved ${type} of ₹${amount}. Will sync when online.`,
      response_hindi: `📴 ऑफलाइन: ₹${amount} का ${type} सहेजा गया। ऑनलाइन होने पर सिंक होगा।`,
      response: `📴 Offline: Saved ${type} of ₹${amount}. Will sync when online.`,
      intent: type,
      amount,
      category
    };
  }
  
  return {
    success: true,
    offline: true,
    response_english: '📴 You are offline. Transaction will be saved when you come back online.',
    response_hindi: '📴 आप ऑफलाइन हैं। लेन-देन ऑनलाइन आने पर सहेजा जाएगा।',
    response: '📴 You are offline. Transaction will be saved when you come back online.',
    intent: 'unknown'
  };
}

/* Get dashboard data */
export async function getDashboardData(userId) {
  // REQUIRE userId - no default fallback!
  if (!userId) {
    console.error('❌ ERROR: getDashboardData called without userId!');
    throw new Error('userId is required for getDashboardData');
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('❌ Dashboard API Error:', error);
    
    // Return cached/demo data if offline
    return {
      offline: true,
      user: { name: 'Demo User', businessType: 'Pickle Making' },
      totalExpenses: 0,
      totalIncome: 0,
      profit: 0,
      transactionCount: 0,
      recentTransactions: [],
      aiInsights: [{
        type: 'info',
        message: '📴 You are offline. Data will be synced when online.'
      }]
    };
  }
}

/* Sync offline transactions */
export async function syncOfflineTransactions() {
  if (!navigator.onLine) {
    return { success: false, message: 'Still offline' };
  }

  return await offlineStorage.syncOfflineData();
}

/* Get sync status */
export async function getSyncStatus() {
  return await offlineStorage.getSyncStatus();
}

/* Check online status */
export function isOnline() {
  return navigator.onLine;
}

/* Setup auto-sync when coming online */
export function setupAutoSync() {
  window.addEventListener('online', async () => {
    console.log('🌐 Back online! Auto-syncing...');
    await syncOfflineTransactions();
  });
}

/* Get business analytics */
export async function fetchAnalytics(userId) {
  if (!userId) {
    console.error('❌ ERROR: fetchAnalytics called without userId!');
    throw new Error('userId is required for fetchAnalytics');
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/analytics?userId=${userId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch analytics data');
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('❌ Analytics API Error:', error);
    
    // Return empty analytics if offline or error
    return {
      success: false,
      offline: true,
      error: error.message,
      last6MonthsData: [],
      keyMetrics: {
        totalIncome: 0,
        incomeChange: 0,
        totalExpenses: 0,
        expensesChange: 0,
        netProfit: 0,
        profitChange: 0,
        profitMargin: 0,
        marginChange: 0
      },
      categorySpending: [],
      monthlyProfitTrend: [],
      insights: []
    };
  }
}
