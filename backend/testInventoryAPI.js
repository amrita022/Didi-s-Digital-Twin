// testInventoryAPI.js - Test the inventory management system
const http = require('http');

const BASE_URL = 'http://localhost:5002';
// Use a unique test user for this test run to avoid conflicts
const TEST_USER = `inventory_test_${Date.now()}`;

let testsPassed = 0;
let testsFailed = 0;

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test(name, fn) {
  try {
    process.stdout.write(`\n🧪 ${name}... `);
    await fn();
    console.log('✅ PASSED');
    testsPassed++;
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
    testsFailed++;
  }
}

async function runTests() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('🏭 INVENTORY MANAGEMENT API TESTS');
  console.log(`🔑 Using test user: ${TEST_USER}`);
  console.log('═══════════════════════════════════════════════════════════');

  // Test 1: Add items to inventory
  await test('Add Sarees to inventory', async () => {
    const res = await makeRequest('POST', '/api/inventory', {
      userId: TEST_USER,
      itemName: 'Sarees',
      quantity: 50,
      price: 1500,
      minStockLevel: 5
    });
    if (res.status !== 200 || !res.data.success) throw new Error(`Status: ${res.status}`);
    if (!res.data.item) throw new Error('No item returned');
    console.log(`\n        Item ID: ${res.data.item._id}`);
  });

  // Test 2: Add more items
  await test('Add Dresses to inventory', async () => {
    const res = await makeRequest('POST', '/api/inventory', {
      userId: TEST_USER,
      itemName: 'Dresses',
      quantity: 75,
      price: 800,
      minStockLevel: 8
    });
    if (res.status !== 200 || !res.data.success) throw new Error(`Status: ${res.status}`);
  });

  // Test 3: Add Jewelry
  await test('Add Jewelry to inventory', async () => {
    const res = await makeRequest('POST', '/api/inventory', {
      userId: TEST_USER,
      itemName: 'Jewelry',
      quantity: 120,
      price: 2500,
      minStockLevel: 10
    });
    if (res.status !== 200 || !res.data.success) throw new Error(`Status: ${res.status}`);
  });

  // Test 4: Get all inventory
  await test('Get all inventory items', async () => {
    const res = await makeRequest('GET', `/api/inventory/${TEST_USER}`);
    if (res.status !== 200 || !res.data.success) throw new Error(`Status: ${res.status}`);
    if (res.data.count < 3) throw new Error(`Expected at least 3 items, got ${res.data.count}`);
    console.log(`\n        Found ${res.data.count} items`);
  });

  // Test 5: Get specific item
  await test('Get specific inventory item (Sarees)', async () => {
    const res = await makeRequest('GET', `/api/inventory/${TEST_USER}/Sarees`);
    if (res.status !== 200 || !res.data.success) throw new Error(`Status: ${res.status}`);
    if (res.data.item.itemName !== 'Sarees') throw new Error('Wrong item returned');
    console.log(`\n        Sarees in stock: ${res.data.item.quantity}`);
  });

  // Test 6: Deduct inventory (simulate sale)
  await test('Deduct Sarees on sale (sold 3)', async () => {
    const res = await makeRequest('POST', '/api/inventory/deduct', {
      userId: TEST_USER,
      itemName: 'Sarees',
      quantity: 3
    });
    if (res.status !== 200 || !res.data.success) throw new Error(`Status: ${res.status}`);
    if (res.data.item.quantity !== 47) throw new Error(`Expected 47, got ${res.data.item.quantity}`);
    console.log(`\n        Remaining: ${res.data.item.quantity}`);
  });

  // Test 7: Update inventory (add more Dresses)
  await test('Restock Dresses (add 50 more)', async () => {
    const res = await makeRequest('POST', '/api/inventory', {
      userId: TEST_USER,
      itemName: 'Dresses',
      quantity: 50,
      price: 800,
      minStockLevel: 8
    });
    if (res.status !== 200 || !res.data.success) throw new Error(`Status: ${res.status}`);
    if (res.data.item.quantity !== 125) throw new Error(`Expected 125, got ${res.data.item.quantity}`);
    console.log(`\n        New stock: ${res.data.item.quantity}`);
  });

  // Test 8: Update sales statistics
  await test('Update sales statistics', async () => {
    const res = await makeRequest('POST', `/api/inventory/update-stats/${TEST_USER}`);
    if (res.status !== 200 || !res.data.success) throw new Error(`Status: ${res.status}`);
    console.log(`\n        Updated ${res.data.itemsUpdated} items`);
  });

  // Test 9: Calculate restock quantities
  await test('Calculate suggested restock amounts', async () => {
    const res = await makeRequest('POST', `/api/inventory/calculate-restock/${TEST_USER}`);
    if (res.status !== 200 || !res.data.success) throw new Error(`Status: ${res.status}`);
    console.log(`\n        Calculated for ${res.data.items.length} items`);
    if (res.data.items.length > 0) {
      const item = res.data.items[0];
      console.log(`        Example: ${item.itemName} - Suggested qty: ${item.suggestedRestockQty}`);
    }
  });

  // Test 10: Get inventory alerts
  await test('Get inventory alerts/notifications', async () => {
    const res = await makeRequest('GET', `/api/inventory/alerts/${TEST_USER}`);
    if (res.status !== 200 || !res.data.success) throw new Error(`Status: ${res.status}`);
    console.log(`\n        Found ${res.data.count} alerts`);
    if (res.data.alerts.length > 0) {
      res.data.alerts.slice(0, 2).forEach(alert => {
        console.log(`        - [${alert.type}] ${alert.message.substring(0, 50)}...`);
      });
    }
  });

  // Test 11: Transaction with auto-deduction
  await test('Create income transaction (should auto-deduct inventory)', async () => {
    const initialRes = await makeRequest('GET', `/api/inventory/${TEST_USER}/Jewelry`);
    const initialQty = initialRes.data.item.quantity;
    
    const txnRes = await makeRequest('POST', '/api/transaction', {
      userId: TEST_USER,
      type: 'income',
      amount: 2500,
      category: 'sales',
      description: 'Sold 2 Jewelry'
    });
    
    if (txnRes.status !== 200) throw new Error(`Transaction failed: ${txnRes.status}`);
    
    // Wait a moment for deduction
    await new Promise(r => setTimeout(r, 500));
    
    const afterRes = await makeRequest('GET', `/api/inventory/${TEST_USER}/Jewelry`);
    const finalQty = afterRes.data.item.quantity;
    
    console.log(`\n        Before: ${initialQty}, After: ${finalQty}`);
    if (finalQty !== initialQty - 2) {
      throw new Error(`Expected ${initialQty - 2}, got ${finalQty}`);
    }
  });

  // Test 12: Deduct with low stock check
  await test('Deduct until low stock (Sarees remaining: 47)', async () => {
    // Deduct 42 to leave only 5 (at minimum level)
    const res = await makeRequest('POST', '/api/inventory/deduct', {
      userId: TEST_USER,
      itemName: 'Sarees',
      quantity: 42
    });
    
    if (res.status !== 200) throw new Error(`Status: ${res.status}`);
    
    const item = res.data.item;
    console.log(`\n        Sarees remaining: ${item.quantity}`);
    console.log(`        Status: ${item.status}`);
    console.log(`        Min level: ${item.minStockLevel}`);
    
    if (item.status !== 'low_stock' && item.status !== 'in_stock') {
      throw new Error(`Unexpected status: ${item.status}`);
    }
  });

  // Test 13: Get updated inventory
  await test('Get all inventory items (updated)', async () => {
    const res = await makeRequest('GET', `/api/inventory/${TEST_USER}`);
    if (res.status !== 200) throw new Error(`Status: ${res.status}`);
    
    console.log(`\n        Total items: ${res.data.count}`);
    res.data.inventory.forEach(item => {
      const statusEmoji = {
        'in_stock': '✅',
        'low_stock': '⚠️',
        'out_of_stock': '❌',
        'overstock': '📦'
      }[item.status] || '❓';
      console.log(`        ${statusEmoji} ${item.itemName}: ${item.quantity} units (Min: ${item.minStockLevel})`);
    });
  });

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(`📊 Total: ${testsPassed + testsFailed}`);
  console.log('═══════════════════════════════════════════════════════════\n');
  
  process.exit(testsFailed > 0 ? 1 : 0);
}

console.log('⏳ Waiting 2 seconds for server to be ready...');
setTimeout(runTests, 2000);
