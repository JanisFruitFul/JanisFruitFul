const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

// Test customer data
const testCustomers = [
  { name: 'Test User 1', phone: '9999999991' },
  { name: 'Test User 2', phone: '9999999992' },
  { name: 'Test User 3', phone: '9999999993' }
];

// Test menu items by category (names only, will map to real IDs)
const menuItems = {
  'Mojito': { name: 'Classic Mojito', price: 12 },
  'Ice Cream': { name: 'Vanilla Ice Cream', price: 8 },
  'Milkshake': { name: 'Chocolate Milkshake', price: 10 },
  'Waffle': { name: 'Belgian Waffle', price: 15 }
};

let menuItemIds = {};

async function fetchMenuItemIds() {
  try {
    const response = await axios.get(`${API_BASE}/menu-items`);
    const items = response.data;
    // Map category to the first matching menu item _id
    for (const category in menuItems) {
      const found = items.find(item => item.category.toLowerCase() === category.toLowerCase());
      if (found) {
        menuItemIds[category] = found._id;
        // Optionally update price and name from DB
        menuItems[category].price = found.price;
        menuItems[category].name = found.name;
      }
    }
    console.log('✅ Menu item IDs fetched:', menuItemIds);
  } catch (error) {
    console.error('❌ Failed to fetch menu items:', error.message);
    throw error;
  }
}

async function testPurchase(customer, category, itemName, price) {
  try {
    const itemId = menuItemIds[category];
    if (!itemId) {
      throw new Error(`No menu item ID found for category: ${category}`);
    }
    console.log(`🛒 Making purchase: ${customer.name} - ${category} (${itemName}) - $${price}`);
    
    const response = await axios.post(`${API_BASE}/customers/purchase`, {
      customerName: customer.name,
      customerPhone: customer.phone,
      drinkType: category,
      itemName: itemName,
      price: price,
      isReward: false,
      itemId: itemId // Use real menu item ID
    });

    console.log(`✅ Purchase successful: ${response.data.message}`);
    return response.data.customer;
  } catch (error) {
    console.error(`❌ Purchase failed: ${error.response?.data?.error || error.message}`);
    return null;
  }
}

async function testRewardClaim(customerId, category) {
  try {
    console.log(`🎁 Claiming reward: Customer ${customerId} - ${category}`);
    
    const response = await axios.post(`${API_BASE}/customers/${customerId}/claim-reward`, {
      category: category
    });

    console.log(`✅ Reward claimed: ${response.data.message}`);
    return response.data.customer;
  } catch (error) {
    console.error(`❌ Reward claim failed: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function getRewardsStatus() {
  try {
    console.log('📊 Fetching rewards status...');
    
    const response = await axios.get(`${API_BASE}/rewards`);
    
    console.log('✅ Rewards status fetched successfully');
    console.log(`📈 Total customers: ${response.data.customers.length}`);
    console.log(`🎁 Total rewards given: ${response.data.stats.totalRewardsGiven}`);
    console.log(`⚡ Ready to claim: ${response.data.stats.readyRewards}`);
    console.log(`🚀 Upcoming rewards: ${response.data.stats.upcomingRewards}`);
    
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to fetch rewards: ${error.response?.data?.error || error.message}`);
    return null;
  }
}

async function getCustomerDrinks(customerId, category) {
  try {
    console.log(`📋 Fetching ${category} drinks for customer ${customerId}...`);
    
    const response = await axios.get(`${API_BASE}/customers/${customerId}/drinks/${category}`);
    
    console.log(`✅ Customer drinks fetched: ${response.data.totalOrders} total orders`);
    console.log(`💰 Paid orders: ${response.data.paidOrders}`);
    console.log(`🎁 Reward orders: ${response.data.rewardOrders}`);
    
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to fetch customer drinks: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('🧪 Starting Category-Based Rewards System Tests\n');

  // Fetch menu item IDs first
  await fetchMenuItemIds();
  
  // Test 1: Multiple purchases for different customers
  console.log('=== TEST 1: Multiple Category Purchases ===');
  
  let customer1 = null;
  let customer2 = null;
  let customer3 = null;
  
  // Customer 1: Multiple Mojitos (should earn 1 reward after 5 purchases)
  for (let i = 1; i <= 6; i++) {
    customer1 = await testPurchase(testCustomers[0], 'Mojito', menuItems.Mojito.name, menuItems.Mojito.price);
    if (!customer1) break;
  }
  
  // Customer 2: Mix of Ice Cream and Milkshake
  customer2 = await testPurchase(testCustomers[1], 'Ice Cream', menuItems['Ice Cream'].name, menuItems['Ice Cream'].price);
  customer2 = await testPurchase(testCustomers[1], 'Ice Cream', menuItems['Ice Cream'].name, menuItems['Ice Cream'].price);
  customer2 = await testPurchase(testCustomers[1], 'Milkshake', menuItems.Milkshake.name, menuItems.Milkshake.price);
  customer2 = await testPurchase(testCustomers[1], 'Milkshake', menuItems.Milkshake.name, menuItems.Milkshake.price);
  customer2 = await testPurchase(testCustomers[1], 'Milkshake', menuItems.Milkshake.name, menuItems.Milkshake.price);
  
  // Customer 3: Waffles (should earn 1 reward after 5 purchases)
  for (let i = 1; i <= 5; i++) {
    customer3 = await testPurchase(testCustomers[2], 'Waffle', menuItems.Waffle.name, menuItems.Waffle.price);
    if (!customer3) break;
  }
  
  console.log('\n=== TEST 2: Check Rewards Status ===');
  const rewardsStatus = await getRewardsStatus();
  
  if (rewardsStatus) {
    console.log('\n📋 Detailed Customer Rewards:');
    rewardsStatus.customers.forEach(customer => {
      console.log(`\n👤 ${customer.name} (${customer.phone}):`);
      console.log(`   Total Drinks: ${customer.totalPaidDrinks}`);
      console.log(`   Total Rewards: ${customer.totalRewardsEarned}`);
      
      if (customer.rewards && customer.rewards.length > 0) {
        customer.rewards.forEach(category => {
          console.log(`   🍹 ${category.category}: ${category.paid} paid, ${category.earned} earned, ${category.claimed} claimed (${category.status})`);
        });
      } else {
        console.log('   No category rewards yet');
      }
    });
  }
  
  console.log('\n=== TEST 3: Claim Rewards ===');
  
  // Find customers with ready rewards and claim them
  if (rewardsStatus) {
    for (const customer of rewardsStatus.customers) {
      if (customer.rewards && customer.rewards.length > 0) {
        for (const category of customer.rewards) {
          if (category.status === 'ready' && category.pending > 0) {
            console.log(`\n🎁 Customer ${customer.name} has ${category.pending} ${category.category} rewards ready to claim`);
            await testRewardClaim(customer._id, category.category);
          }
        }
      }
    }
  }
  
  console.log('\n=== TEST 4: Check Customer Drink History ===');
  
  // Check drink history for each customer
  if (customer1) {
    await getCustomerDrinks(customer1._id, 'Mojito');
  }
  if (customer2) {
    await getCustomerDrinks(customer2._id, 'Milkshake');
  }
  if (customer3) {
    await getCustomerDrinks(customer3._id, 'Waffle');
  }
  
  console.log('\n=== TEST 5: Final Rewards Status ===');
  const finalStatus = await getRewardsStatus();
  
  console.log('\n🎉 All tests completed!');
  console.log('\n📊 Final Summary:');
  if (finalStatus) {
    console.log(`- Total customers: ${finalStatus.customers.length}`);
    console.log(`- Total rewards earned: ${finalStatus.stats.totalRewardsGiven}`);
    console.log(`- Customers with rewards: ${finalStatus.stats.customersWithRewards}`);
    console.log(`- Ready to claim: ${finalStatus.stats.readyRewards}`);
    console.log(`- Upcoming rewards: ${finalStatus.stats.upcomingRewards}`);
  }
}

// Run the tests
runTests().catch(console.error); 