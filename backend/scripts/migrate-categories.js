const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Customer = require('../models/Customer');

async function migrateCategories() {
  try {
    // Connect to MongoDB
    const { connectDB } = require('../lib/mongodb');
    await connectDB();

    // Get all customers
    const customers = await Customer.find({});

    let migratedCount = 0;
    let skippedCount = 0;
    let updatedOrdersCount = 0;

    for (const customer of customers) {
      try {
        let hasChanges = false;

        // Update order category names
        customer.orders.forEach(order => {
          if (order.drinkType === 'Juices') {
            order.drinkType = 'Juice';
            hasChanges = true;
            updatedOrdersCount++;
          } else if (order.drinkType === 'Fruit plates') {
            order.drinkType = 'Fruit Plate';
            hasChanges = true;
            updatedOrdersCount++;
          }
        });

        // Update rewards map keys if they exist
        if (customer.rewards && customer.rewards.size > 0) {
          const newRewards = new Map();
          
          for (const [category, data] of customer.rewards.entries()) {
            let newCategory = category;
            if (category === 'Juices') {
              newCategory = 'Juice';
              hasChanges = true;
            } else if (category === 'Fruit plates') {
              newCategory = 'Fruit Plate';
              hasChanges = true;
            }
            newRewards.set(newCategory, data);
          }
          
          if (hasChanges) {
            customer.rewards = newRewards;
          }
        }

        if (hasChanges) {
          await customer.save();
          migratedCount++;
        } else {
          skippedCount++;
        }
        
      } catch (error) {
        console.error(`❌ Failed to migrate customer ${customer.name}:`, error.message);
        skippedCount++;
      }
    }

    // Verify migration
    const verifyCustomers = await Customer.find({});
    let oldCategoryOrders = 0;

    verifyCustomers.forEach(customer => {
      customer.orders.forEach(order => {
        if (order.drinkType === 'Juices' || order.drinkType === 'Fruit plates') {
          oldCategoryOrders++;
        }
      });
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();

    process.exit(0);
  }
}

// Run migration
migrateCategories(); 