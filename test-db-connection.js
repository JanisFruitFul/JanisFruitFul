const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    if (!process.env.MONGODB_URI) {
      return;
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });
    
    // Test the MenuItem model
    const MenuItem = require('./backend/models/MenuItem');
    
    // Get active items
    const activeItems = await MenuItem.find({ isActive: true }).limit(5);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await mongoose.disconnect();

  }
}

testConnection(); 