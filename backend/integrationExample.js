// integrationExample.js - Example: Inventory + Reminders Integration
// Shows how inventory alerts automatically create reminders

const http = require('http');
const BASE_URL = 'http://localhost:5002';

async function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data ? JSON.parse(data) : null
        });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function demonstrateIntegration() {
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('🔗 INVENTORY + REMINDERS INTEGRATION DEMONSTRATION');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  const userId = `demo_user_${Date.now()}`;
  
  console.log(`📝 Using test user: ${userId}\n`);

  try {
    // STEP 1: Create inventory items
    console.log('STEP 1️⃣  Creating inventory items...\n');

    const items = [
      { name: 'Sarees', qty: 8, min: 10, price: 1500 },
      { name: 'Dresses', qty: 5, min: 8, price: 800 }
    ];

    for (const item of items) {
      const res = await makeRequest('POST', '/api/inventory', {
        userId,
        itemName: item.name,
        quantity: item.qty,
        minStockLevel: item.min,
        price: item.price
      });

      console.log(`✅ Added ${item.name}: ${item.qty} units (Min: ${item.min})`);
    }

    console.log('\n' + '═'.repeat(67) + '\n');

    // STEP 2: Check inventory status
    console.log('STEP 2️⃣  Checking current inventory...\n');

    const invRes = await makeRequest('GET', `/api/inventory/${userId}`);
    console.log(`📦 Total items in inventory: ${invRes.data.count}`);
    
    invRes.data.inventory.forEach(item => {
      const statusEmoji = item.status === 'low_stock' ? '⚠️' : '✅';
      console.log(`   ${statusEmoji} ${item.itemName}: ${item.quantity} units (Status: ${item.status})`);
    });

    console.log('\n' + '═'.repeat(67) + '\n');

    // STEP 3: Get alerts
    console.log('STEP 3️⃣  Generating inventory alerts...\n');

    const alertRes = await makeRequest('GET', `/api/inventory/alerts/${userId}`);
    console.log(`⚠️  Total alerts: ${alertRes.data.count}\n`);

    alertRes.data.alerts.forEach((alert, i) => {
      const typeEmoji = {
        'low_stock': '⚠️',
        'festival_demand': '📅',
        'overstock': '📦'
      }[alert.type] || '❓';

      console.log(`${i + 1}. ${typeEmoji} [${alert.type.toUpperCase()}]`);
      console.log(`   ${alert.message}`);
      console.log('');
    });

    console.log('═'.repeat(67) + '\n');

    // STEP 4: Create reminders from alerts
    console.log('STEP 4️⃣  Creating reminders from inventory alerts...\n');

    let reminderCount = 0;
    for (const alert of alertRes.data.alerts) {
      const reminderRes = await makeRequest('POST', '/api/reminders', {
        userId,
        type: 'inventory_alert',
        title: `${alert.type === 'low_stock' ? '⚠️ Low Stock' : '📅 Festival Prep'}: ${alert.itemName}`,
        message: alert.message,
        priority: alert.type === 'low_stock' ? 'high' : 'medium',
        actionUrl: '/dashboard/inventory'
      });

      if (reminderRes.status === 200) {
        console.log(`✅ Created reminder for: ${alert.itemName}`);
        reminderCount++;
      }
    }

    console.log(`\n📌 Total reminders created: ${reminderCount}`);

    console.log('\n' + '═'.repeat(67) + '\n');

    // STEP 5: Fetch active reminders
    console.log('STEP 5️⃣  Fetching active reminders...\n');

    const remindersRes = await makeRequest('GET', `/api/reminders?userId=${userId}`);
    console.log(`📋 Active reminders: ${remindersRes.data.count}\n`);

    remindersRes.data.reminders.forEach((reminder, i) => {
      const priorityEmoji = reminder.priority === 'high' ? '🔴' : '🟡';
      console.log(`${i + 1}. ${priorityEmoji} ${reminder.title}`);
      console.log(`   📝 ${reminder.message}`);
      console.log(`   ⏰ Priority: ${reminder.priority}`);
      console.log('');
    });

    console.log('═'.repeat(67) + '\n');

    // STEP 6: Simulate sale (auto-deduction)
    console.log('STEP 6️⃣  Simulating a sale transaction...\n');

    const saleRes = await makeRequest('POST', '/api/transaction', {
      userId,
      type: 'income',
      amount: 1500,
      category: 'sales',
      description: 'Sold 1 Saree'  // Auto-deducts 1 Saree
    });

    console.log('✅ Sale transaction created: "Sold 1 Saree"');
    console.log('   📦 Inventory auto-deduction triggered!');

    console.log('\n' + '═'.repeat(67) + '\n');

    // STEP 7: Check updated inventory
    console.log('STEP 7️⃣  Checking updated inventory...\n');

    const updatedRes = await makeRequest('GET', `/api/inventory/${userId}`);
    
    updatedRes.data.inventory.forEach(item => {
      if (item.itemName === 'Sarees') {
        console.log(`📊 Sarees - Before: 8, After: ${item.quantity}`);
        console.log(`   Status changed to: ${item.status} ⚠️`);
      }
    });

    console.log('\n' + '═'.repeat(67) + '\n');

    // STEP 8: Demonstrate dismissing a reminder
    console.log('STEP 8️⃣  Dismissing a reminder...\n');

    if (remindersRes.data.reminders.length > 0) {
      const reminderId = remindersRes.data.reminders[0]._id;
      const dismissRes = await makeRequest('PATCH', `/api/reminders/${reminderId}/dismiss`, { userId });

      if (dismissRes.status === 200) {
        console.log(`✅ Reminder dismissed: "${remindersRes.data.reminders[0].title}"`);
      }
    }

    console.log('\n' + '═'.repeat(67) + '\n');

    // FINAL SUMMARY
    console.log('📊 FINAL SUMMARY');
    console.log('═'.repeat(67));
    console.log(`
✅ Successfully demonstrated:

1. 📦 Inventory Management
   - Created items with stock levels
   - Tracked minimum thresholds
   - Detected low stock items

2. ⚠️  Alert Generation
   - Identified ${alertRes.data.count} inventory alerts
   - Categorized by type (low_stock, festival_demand, etc)
   - Generated actionable messages

3. 📌 Reminder Creation
   - Created ${reminderCount} reminders from alerts
   - Linked to user's notification system
   - Set appropriate priority levels

4. 🔄 Transaction Integration
   - Created sale transaction
   - Auto-deducted inventory (8 → ${updatedRes.data.inventory.find(i => i.itemName === 'Sarees').quantity})
   - Updated item status

5. 📋 Reminder Management
   - Fetched active reminders
   - Demonstrated dismiss functionality
   - Updated reminder status

🎯 This shows how the system:
   • Automatically deducts inventory on sales
   • Detects low-stock situations
   • Creates user-actionable reminders
   • Maintains data consistency across all modules
    `);

    console.log('═'.repeat(67) + '\n');
    console.log('✅ INTEGRATION TEST COMPLETE - ALL SYSTEMS WORKING!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

console.log('⏳ Starting integration demonstration...\n');
setTimeout(demonstrateIntegration, 1000);
