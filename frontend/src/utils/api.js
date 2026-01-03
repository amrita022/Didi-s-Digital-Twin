/* API utilities for communicating with backend */

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
    throw error;
  }
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


/* Get business analytics */
export async function fetchAnalytics(userId, language = 'english') {
  if (!userId) {
    console.error('❌ ERROR: fetchAnalytics called without userId!');
    throw new Error('userId is required for fetchAnalytics');
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/analytics?userId=${userId}&language=${encodeURIComponent(language)}`);
    
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

/* Get reminders/nudges */
export async function getReminders(userId, language = 'english') {
  if (!userId) {
    throw new Error('userId is required for getReminders');
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/reminders?userId=${userId}&language=${language}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch reminders');
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('❌ Get reminders error:', error);
    return {
      success: false,
      reminders: [],
      count: 0
    };
  }
}

/* Create a reminder */
export async function createReminder(reminderData) {
  if (!reminderData.userId) {
    throw new Error('userId is required for createReminder');
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/reminders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reminderData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create reminder');
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('❌ Create reminder error:', error);
    throw error;
  }
}

/* Dismiss a reminder */
export async function dismissReminder(reminderId, userId) {
  if (!userId || !reminderId) {
    throw new Error('userId and reminderId are required');
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/reminders/${reminderId}/dismiss`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId })
    });
    
    if (!response.ok) {
      throw new Error('Failed to dismiss reminder');
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('❌ Dismiss reminder error:', error);
    throw error;
  }
}

/* Mark reminder as completed */
export async function completeReminder(reminderId, userId) {
  if (!userId || !reminderId) {
    throw new Error('userId and reminderId are required');
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/reminders/${reminderId}/complete`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId })
    });
    
    if (!response.ok) {
      throw new Error('Failed to complete reminder');
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('❌ Complete reminder error:', error);
    throw error;
  }
}
