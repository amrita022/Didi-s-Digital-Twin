/* Inventory API utilities */

const API_BASE_URL = 'http://localhost:5002/api';

// Get all inventory items for a user
export async function getInventory(userId) {
  if (!userId) throw new Error('userId is required');
  
  const response = await fetch(`${API_BASE_URL}/inventory/${encodeURIComponent(userId)}`);
  if (!response.ok) throw new Error('Failed to fetch inventory');
  
  const data = await response.json();
  return data.inventory || data;
}

// Get specific inventory item
export async function getInventoryItem(userId, itemName) {
  if (!userId || !itemName) throw new Error('userId and itemName are required');
  
  const response = await fetch(`${API_BASE_URL}/inventory/${encodeURIComponent(userId)}/${encodeURIComponent(itemName)}`);
  if (!response.ok) throw new Error('Failed to fetch inventory item');
  
  const data = await response.json();
  return data;
}

// Add or update inventory item
export async function addOrUpdateInventory(userId, itemName, quantity, price, minStockLevel = 5) {
  if (!userId || !itemName || !quantity) throw new Error('userId, itemName, and quantity are required');
  
  const response = await fetch(`${API_BASE_URL}/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      itemName,
      quantity: parseInt(quantity),
      price: price ? parseFloat(price) : 0,
      minStockLevel: parseInt(minStockLevel)
    })
  });
  
  if (!response.ok) throw new Error('Failed to add/update inventory');
  
  const data = await response.json();
  return data;
}

// Deduct inventory (on sale)
export async function deductInventory(userId, itemName, quantity = 1) {
  if (!userId || !itemName) throw new Error('userId and itemName are required');
  
  const response = await fetch(`${API_BASE_URL}/inventory/deduct`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      itemName,
      quantity: parseInt(quantity)
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to deduct inventory');
  }
  
  const data = await response.json();
  return data;
}

// Get inventory alerts
export async function getInventoryAlerts(userId) {
  if (!userId) throw new Error('userId is required');
  
  const response = await fetch(`${API_BASE_URL}/inventory/alerts/${encodeURIComponent(userId)}`);
  if (!response.ok) throw new Error('Failed to fetch inventory alerts');
  
  const data = await response.json();
  return data.alerts || data;
}

// Update sales statistics
export async function updateInventoryStats(userId) {
  if (!userId) throw new Error('userId is required');
  
  const response = await fetch(`${API_BASE_URL}/inventory/update-stats/${encodeURIComponent(userId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  
  if (!response.ok) throw new Error('Failed to update inventory stats');
  
  const data = await response.json();
  return data;
}

// Calculate suggested restock quantities
export async function calculateRestockSuggestions(userId) {
  if (!userId) throw new Error('userId is required');
  
  const response = await fetch(`${API_BASE_URL}/inventory/calculate-restock/${encodeURIComponent(userId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  
  if (!response.ok) throw new Error('Failed to calculate restock suggestions');
  
  const data = await response.json();
  return data;
}

// Extract quantity from transaction description
export function extractQuantityFromDescription(description) {
  if (!description) return 1;
  
  // Match patterns like "sold 2 sarees", "bought 50 items", "3 pieces", etc
  // First try to match quantity with a specific item name
  const specificPatterns = [
    /(\d+)\s+(sarees?|saris?|sadis?)/i,
    /(\d+)\s+(dresses?|gowns?)/i,
    /(\d+)\s+(blouses?|cholis?)/i,
    /(\d+)\s+(shirts?)/i,
    /(\d+)\s+(pants?|trousers?)/i,
    /(\d+)\s+(items?|pieces?|units?|qty|quantities)/i,
    /(\d+)\s+(?:x|×)\s/,
    /sold\s+(\d+)/i,  // "sold 3" pattern
    /bought\s+(\d+)/i,  // "bought 5" pattern
    /^(\d+)/  // Just a number at the start
  ];
  
  for (const pattern of specificPatterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      return parseInt(match[1]);
    }
  }
  
  return 1;
}

// Extract item name from description
export function extractItemNameFromDescription(description) {
  if (!description) return null;
  
  // Expanded list with all shop items including Hindi/Marathi terms
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
      // Normalize to canonical name
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

// Format inventory status for display
export function formatInventoryStatus(item) {
  const statusColors = {
    'in_stock': '✅',
    'low_stock': '⚠️',
    'out_of_stock': '❌',
    'overstock': '📦'
  };
  
  return `${statusColors[item.status] || '❓'} ${item.itemName}: ${item.quantity} units`;
}

// Format alert message
export function formatAlertMessage(alert) {
  switch (alert.type) {
    case 'low_stock':
      return `⚠️ Low stock: ${alert.itemName} (${alert.current}/${alert.minLevel})`;
    case 'festival_demand':
      return `📅 ${alert.itemName} peaks ${alert.daysUntil} days before ${alert.festival}. Stock ${alert.suggestedStock} units.`;
    case 'overstock':
      return `📦 ${alert.itemName} has ${alert.current} units. Consider promotional sale.`;
    default:
      return alert.message;
  }
}
