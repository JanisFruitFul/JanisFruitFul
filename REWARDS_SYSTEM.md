# 🎁 Category-Based Rewards System

## Overview

The new rewards system tracks customer purchases by category (Mojito, Ice Cream, Milkshake, Waffle) and awards free drinks based on category-specific progress. For every 5 paid drinks in a category, customers unlock 1 free reward in that same category.

## 🏗️ Schema Changes

### Customer Model Updates

```javascript
// New fields added to Customer schema
orders: [
  {
    drinkType: String,        // category (e.g., "Mojito", "Ice Cream")
    itemName: String,
    itemId: ObjectId,
    price: Number,
    date: Date,
    isReward: Boolean,
    claimed: Boolean          // NEW: tracks if reward was claimed
  }
],
rewards: {                    // NEW: category-based reward tracking
  type: Map,
  of: {
    paid: Number,             // count of paid drinks in category
    earned: Number,           // rewards unlocked in category
    claimed: Number           // rewards claimed in category
  }
}
```

## 🔄 Logic Flow

### 1. Purchase Recording (`/api/customers/purchase`)

When a customer makes a purchase:

```javascript
// Initialize rewards map for the category
if (!customer.rewards) customer.rewards = new Map();
if (!customer.rewards.has(drinkType)) {
  customer.rewards.set(drinkType, { paid: 0, earned: 0, claimed: 0 });
}

const rewardData = customer.rewards.get(drinkType);

if (!isReward) {
  // Regular purchase - increment paid drinks
  rewardData.paid += 1;
  const newEarned = Math.floor(rewardData.paid / 5);
  rewardData.earned = newEarned;
} else {
  // Reward claim - increment claimed rewards
  rewardData.claimed += 1;
}

customer.rewards.set(drinkType, rewardData);
```

### 2. Reward Status Calculation

For each category, the system calculates:

- **Progress**: `paid % 5` (how many drinks toward next reward)
- **Pending**: `earned - claimed` (available rewards to claim)
- **Status**: 
  - `"ready"` - has pending rewards to claim
  - `"upcoming"` - 4 out of 5 drinks (close to reward)
  - `"progress"` - still building up drinks

### 3. Reward Claiming (`/api/customers/:id/claim-reward`)

```javascript
const reward = customer.rewards.get(category);
if (reward.earned > reward.claimed) {
  // Create reward order
  customer.orders.push({
    drinkType: category,
    itemName: `${category} (Reward)`,
    price: 0,
    isReward: true,
    claimed: true,
    date: new Date()
  });
  
  reward.claimed += 1;
  customer.rewards.set(category, reward);
}
```

## 📊 API Endpoints

### GET `/api/rewards`
Returns customers with category-based reward progress:

```json
{
  "customers": [
    {
      "_id": "customer_id",
      "name": "John Doe",
      "phone": "1234567890",
      "totalPaidDrinks": 15,
      "totalRewardsEarned": 3,
      "rewards": [
        {
          "category": "Mojito",
          "paid": 7,
          "earned": 1,
          "claimed": 0,
          "pending": 1,
          "progress": 2,
          "drinksUntilReward": 3,
          "status": "ready"
        }
      ]
    }
  ],
  "stats": {
    "totalRewardsGiven": 25,
    "customersWithRewards": 10,
    "upcomingRewards": 5,
    "readyRewards": 8
  }
}
```

### POST `/api/customers/:id/claim-reward`
Claim a reward for a specific category:

```json
{
  "category": "Mojito"
}
```

### GET `/api/customers/:id/drinks/:category`
Get drink history for a specific category:

```json
{
  "customer": {
    "name": "John Doe",
    "phone": "1234567890"
  },
  "category": "Mojito",
  "orders": [...],
  "totalOrders": 10,
  "paidOrders": 7,
  "rewardOrders": 3
}
```

## 🎨 Frontend Features

### Rewards Dashboard
- **Category Cards**: Each customer shows progress for each category
- **Visual Progress**: Progress bars showing drinks toward next reward
- **Status Indicators**: Color-coded status (ready, upcoming, progress)
- **Category Icons**: Emoji icons for each drink category
- **Action Buttons**: Claim rewards and send WhatsApp reminders

### Key UI Components
- **Category Progress**: Shows paid/earned/claimed for each category
- **Progress Bars**: Visual representation of progress toward next reward
- **Status Badges**: Clear indication of reward availability
- **WhatsApp Integration**: Send personalized reminders by category

## 🚀 Migration

### Running the Migration

```bash
cd backend
node scripts/migrate-rewards.js
```

The migration script:
1. Connects to MongoDB
2. Processes all existing customers
3. Analyzes their order history by category
4. Builds the new rewards map structure
5. Updates total rewards earned
6. Verifies the migration

### Migration Output

```
🔄 Starting rewards migration...
✅ Connected to MongoDB
📊 Found 25 customers to migrate
✅ Migrated customer: John Doe (1234567890)
✅ Migrated customer: Jane Smith (0987654321)
...

🎉 Migration completed!
✅ Successfully migrated: 25 customers
❌ Skipped: 0 customers

📊 Verification:
- Total customers: 25
- Customers with rewards: 15
- Total rewards earned: 45
```

## 🔧 Configuration

### Environment Variables
No new environment variables required. The system uses existing MongoDB connection.

### Category Configuration
Categories are defined in the Customer model enum:
- "Mojito"
- "Ice Cream" 
- "Milkshake"
- "Waffle"
- "Reward"

To add new categories, update the enum in both `Customer.js` and `Customer.ts`.

## 🧪 Testing

### Test Scenarios
1. **New Customer Purchase**: Verify rewards map initialization
2. **Category Progress**: Test 5-drink progression to reward
3. **Reward Claiming**: Verify reward order creation and claimed tracking
4. **Multiple Categories**: Test independent category tracking
5. **Migration**: Verify existing data conversion

### Sample Test Data
```javascript
// Customer with mixed category purchases
const customer = {
  name: "Test User",
  phone: "9999999999",
  orders: [
    { drinkType: "Mojito", price: 10, isReward: false },
    { drinkType: "Mojito", price: 10, isReward: false },
    { drinkType: "Ice Cream", price: 8, isReward: false },
    { drinkType: "Mojito", price: 0, isReward: true, claimed: true }
  ]
};
```

## 📈 Benefits

1. **Category-Specific Tracking**: Customers earn rewards in the categories they prefer
2. **Flexible Reward System**: Different categories can have different reward rules
3. **Better Customer Engagement**: Targeted messaging by category
4. **Detailed Analytics**: Track performance by drink category
5. **Scalable Architecture**: Easy to add new categories or modify rules

## 🔮 Future Enhancements

1. **Category-Specific Rules**: Different reward thresholds per category
2. **Time-Based Rewards**: Seasonal or limited-time category bonuses
3. **Tier System**: Premium categories with different reward structures
4. **Cross-Category Rewards**: Earn rewards in one category, claim in another
5. **Personalized Recommendations**: Suggest categories based on purchase history 