const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Customer = require('../models/Customer');

async function migrateCategories() {
  try {
    console.log('🔄 Starting category name migration...');
    
    // Connect to MongoDB
    const { connectDB } = require('../lib/mongodb');
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Get all customers
    const customers = await Customer.find({});
    console.log(`📊 Found ${customers.length} customers to migrate`);

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
          console.log(`✅ Migrated customer: ${customer.name} (${customer.phone})`);
        } else {
          skippedCount++;
          console.log(`⏭️  No changes needed for: ${customer.name} (${customer.phone})`);
        }
        
      } catch (error) {
        console.error(`❌ Failed to migrate customer ${customer.name}:`, error.message);
        skippedCount++;
      }
    }

    console.log('\n🎉 Category migration completed!');
    console.log(`✅ Successfully migrated: ${migratedCount} customers`);
    console.log(`⏭️  Skipped (no changes): ${skippedCount} customers`);
    console.log(`📝 Total orders updated: ${updatedOrdersCount}`);
    
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

    console.log(`\n📊 Verification:`);
    console.log(`- Total customers: ${verifyCustomers.length}`);
    console.log(`- Orders with old category names: ${oldCategoryOrders}`);
    
    if (oldCategoryOrders === 0) {
      console.log('✅ All category names have been successfully updated!');
    } else {
      console.log('⚠️  Some orders still have old category names');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run migration
migrateCategories(); 