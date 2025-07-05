const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Customer = require('../models/Customer');

async function migrateRewards() {
  try {
    console.log('🔄 Starting rewards migration...');
    
    // Connect to MongoDB
    const { connectDB } = require('../lib/mongodb');
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Get all customers
    const customers = await Customer.find({});
    console.log(`📊 Found ${customers.length} customers to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const customer of customers) {
      try {
        // Initialize rewards map if it doesn't exist
        if (!customer.rewards) {
          customer.rewards = new Map();
        }

        // Process existing orders to build category-based rewards
        const categoryStats = {};

        customer.orders.forEach(order => {
          const category = order.drinkType;
          
          if (!categoryStats[category]) {
            categoryStats[category] = {
              paid: 0,
              earned: 0,
              claimed: 0
            };
          }

          if (order.isReward) {
            categoryStats[category].claimed += 1;
          } else {
            categoryStats[category].paid += 1;
            // Calculate earned rewards (every 5 paid drinks = 1 reward)
            const newEarned = Math.floor(categoryStats[category].paid / 5);
            categoryStats[category].earned = newEarned;
          }
        });

        // Update customer rewards map
        for (const [category, stats] of Object.entries(categoryStats)) {
          customer.rewards.set(category, stats);
        }

        // Update total rewards earned
        const totalClaimed = Object.values(categoryStats).reduce((sum, stats) => sum + stats.claimed, 0);
        customer.rewardsEarned = totalClaimed;

        await customer.save();
        migratedCount++;
        console.log(`✅ Migrated customer: ${customer.name} (${customer.phone})`);
        
      } catch (error) {
        console.error(`❌ Failed to migrate customer ${customer.name}:`, error.message);
        skippedCount++;
      }
    }

    console.log('\n🎉 Migration completed!');
    console.log(`✅ Successfully migrated: ${migratedCount} customers`);
    console.log(`❌ Skipped: ${skippedCount} customers`);
    
    // Verify migration
    const verifyCustomers = await Customer.find({});
    let totalRewards = 0;
    let customersWithRewards = 0;

    verifyCustomers.forEach(customer => {
      if (customer.rewards && customer.rewards.size > 0) {
        customersWithRewards++;
        for (const [category, data] of customer.rewards.entries()) {
          totalRewards += data.earned;
        }
      }
    });

    console.log(`\n📊 Verification:`);
    console.log(`- Total customers: ${verifyCustomers.length}`);
    console.log(`- Customers with rewards: ${customersWithRewards}`);
    console.log(`- Total rewards earned: ${totalRewards}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run migration
migrateRewards(); 