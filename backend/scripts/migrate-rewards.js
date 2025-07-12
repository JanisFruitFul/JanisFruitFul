const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Customer = require('../models/Customer');

async function migrateRewards() {
  try {
    // Connect to MongoDB
    const { connectDB } = require('../lib/mongodb');
    await connectDB();

    // Get all customers
    const customers = await Customer.find({});

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
        
      } catch (error) {
        console.error(`❌ Failed to migrate customer ${customer.name}:`, error.message);
        skippedCount++;
      }
    }

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

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();

    process.exit(0);
  }
}

// Run migration
migrateRewards(); 