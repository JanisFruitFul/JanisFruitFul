const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    
    if (!process.env.MONGODB_URI) {
      console.log('❌ MONGODB_URI not found in environment variables');
      return;
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });
    
    console.log('✅ Connected to MongoDB successfully!');
    
    // Test the MenuItem model
    const MenuItem = require('./backend/models/MenuItem');
    
    // Get active items
    const activeItems = await MenuItem.find({ isActive: true }).limit(5);
    console.log(`📋 Active items found: ${activeItems.length}`);
    
    if (activeItems.length > 0) {
      console.log('\n📝 Sample items:');
      activeItems.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name} - ₹${item.price} (${item.category})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testConnection(); 