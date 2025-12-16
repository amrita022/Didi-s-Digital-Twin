# Testing Guide: Reminders & Nudges Feature

## How to Test the Reminders Feature

### Prerequisites
1. Make sure your backend server is running (`npm start` in backend folder)
2. Make sure your frontend is running (`npm run dev` in frontend folder)
3. You should have some transaction history in your database

### Step 1: Access the Reminders
1. Log in to your application
2. Go to the Dashboard
3. Look for the **Bell icon** (🔔) next to the "Update Data" button in the top-right corner
4. Click the bell icon to open the Reminders modal

### Step 2: Test Stock Analysis Nudges

To trigger a stock analysis nudge, you need:
- At least one expense transaction with category `raw_materials` or description containing "stock", "material", or "सामान"
- The purchase amount should be > ₹5,000
- Sales should be slow (less than 50% of purchase amount sold in 3 months)

**How to create test data:**
1. Add an expense transaction:
   - Type: Expense
   - Amount: ₹10,000
   - Category: `raw_materials`
   - Description: "Bought extra stock" or "सामान खरीदा"
   - Date: 4-6 months ago

2. Add some income transactions after that date (but sales should be slow)

3. Refresh the dashboard and click the bell icon
4. You should see a nudge like: "Last time you bought extra stock worth ₹10,000, it took 4 months to sell."

### Step 3: Test Seasonal Event Reminders

Seasonal reminders appear 15-30 days before festivals. The system checks for:
- Ganeshotsav (August 17)
- Diwali (October 12)
- Holi (February 25)
- Navratri (September 15)
- Raksha Bandhan (July 30)
- Dussehra (September 24)

**To test immediately:**
1. Modify the dates in `backend/utils/nudgeGenerator.js` to be closer to today
2. Or wait for a festival that's 15-30 days away

**How to create test data for seasonal events:**
1. Add income transactions from last year's festival period (2 weeks before and after the festival date)
2. For Ganeshotsav, add transactions with descriptions containing "modak", "मोदक", "ladoo", or "लड्डू"
3. The system will detect these and suggest buying materials

**Example:**
- Add income transaction dated last year's Ganeshotsav period
- Description: "Sold 50 modaks" or "50 मोदक बेचे"
- Amount: ₹2,500

### Step 4: Test Interactive Features

#### Test "Yes, remind me" button:
1. When you see a seasonal event nudge (e.g., "Ganeshotsav is in 15 days...")
2. Click "Yes, remind me"
3. The nudge should convert to an active reminder
4. The reminder should persist until you mark it as "Done" or "Dismiss"

#### Test "Done" button:
1. Click "Done" on an active reminder
2. The reminder should disappear
3. It should not appear again

#### Test "Dismiss" button:
1. Click "Dismiss" on any reminder
2. The reminder should disappear
3. It should not appear again

#### Test "No" button:
1. Click "No" on a seasonal event nudge
2. The nudge should disappear
3. It should not create a reminder

### Step 5: Verify Reminder Persistence

1. Create a reminder by clicking "Yes, remind me"
2. Close the modal
3. Refresh the page
4. Open the reminders modal again
5. The reminder should still be there

### Step 6: Test Multiple Reminders

1. Create multiple reminders (stock analysis + seasonal events)
2. They should all appear in the modal
3. They should be sorted by priority (high > medium > low)
4. Each should have appropriate icons and colors

## Troubleshooting

### No reminders showing?
1. Check browser console for errors
2. Check backend logs for errors
3. Verify you have transaction history
4. Check that the API endpoint `/api/reminders` is working:
   ```bash
   curl http://localhost:5002/api/reminders?userId=YOUR_USER_ID&language=english
   ```

### Reminders not updating?
1. The reminders are generated when you fetch them
2. Try refreshing the dashboard
3. Check if new transactions were added recently

### Modal not opening?
1. Check browser console for JavaScript errors
2. Verify the bell icon is clickable
3. Check that the modal state is being set correctly

## API Testing

You can also test the API directly:

### Get Reminders
```bash
GET http://localhost:5002/api/reminders?userId=YOUR_USER_ID&language=english
```

### Create Reminder
```bash
POST http://localhost:5002/api/reminders
Content-Type: application/json

{
  "userId": "YOUR_USER_ID",
  "type": "custom",
  "title": "Test Reminder",
  "message": "This is a test reminder",
  "messageHindi": "यह एक परीक्षण याददाश्त है",
  "actionRequired": "buy_materials",
  "priority": "high"
}
```

### Dismiss Reminder
```bash
PATCH http://localhost:5002/api/reminders/REMINDER_ID/dismiss
Content-Type: application/json

{
  "userId": "YOUR_USER_ID"
}
```

### Complete Reminder
```bash
PATCH http://localhost:5002/api/reminders/REMINDER_ID/complete
Content-Type: application/json

{
  "userId": "YOUR_USER_ID"
}
```

## Expected Behavior

✅ **Stock Analysis Nudges:**
- Appear when you have slow-selling stock purchases
- Show historical data (amount, months to sell)
- Can be dismissed with "Got it"

✅ **Seasonal Event Nudges:**
- Appear 15-30 days before festivals
- Show last year's sales data
- Have "Yes, remind me" and "No" buttons
- "Yes" creates a persistent reminder

✅ **Active Reminders:**
- Persist until dismissed or completed
- Show "Done" and "Dismiss" buttons
- Display countdown for events

✅ **Modal:**
- Opens when clicking bell icon
- Closes when clicking X or outside
- Scrollable for many reminders
- Shows empty state when no reminders

