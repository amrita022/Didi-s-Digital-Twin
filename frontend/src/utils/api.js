/* API utilities for communicating with backend */

import offlineStorage from './offlineStorage';
const API_BASE_URL = 'http://localhost:5002/api';

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