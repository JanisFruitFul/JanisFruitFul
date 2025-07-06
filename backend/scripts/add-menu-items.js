const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const MenuItem = require('../models/MenuItem');

const sampleMenuItems = [
  {
    name: "Berry Blast Smoothie",
    category: "Smoothie",
    price: 199,
    description: "Refreshing blend of strawberries, blueberries, and raspberries with yogurt",
    image: "/placeholder.svg?height=200&width=200",
    isActive: true
  },
  {
    name: "Caramel Macchiato",
    category: "Coffee",
    price: 149,
    description: "Rich espresso with steamed milk and caramel sauce",
    image: "/placeholder.svg?height=200&width=200",
    isActive: true
  },
  {
    name: "Mango Tango Juice",
    category: "Juice",
    price: 129,
    description: "Fresh mango juice with a hint of mint",
    image: "/placeholder.svg?height=200&width=200",
    isActive: true
  },
  {
    name: "Chocolate Waffle",
    category: "Waffle",
    price: 179,
    description: "Crispy waffle topped with chocolate sauce and whipped cream",
    image: "/placeholder.svg?height=200&width=200",
    isActive: true
  },
  {
    name: "Mint Mojito",
    category: "Mojito",
    price: 249,
    description: "Classic mojito with fresh mint, lime, and rum",
    image: "/placeholder.svg?height=200&width=200",
    isActive: true
  },
  {
    name: "Vanilla Ice Cream",
    category: "Ice Cream",
    price: 99,
    description: "Creamy vanilla ice cream with chocolate sprinkles",
    image: "/placeholder.svg?height=200&width=200",
    isActive: true
  },
  {
    name: "Strawberry Milkshake",
    category: "Milkshake",
    price: 159,
    description: "Thick strawberry milkshake with fresh strawberries",
    image: "/placeholder.svg?height=200&width=200",
    isActive: true
  },
  {
    name: "Mixed Fruit Plate",
    category: "Fruit Plate",
    price: 189,
    description: "Assorted fresh fruits with honey drizzle",
    image: "/placeholder.svg?height=200&width=200",
    isActive: true
  }
];

async function addMenuItems() {
  try {
    console.log('🔄 Adding sample menu items...');
    
    // Connect to MongoDB
    const { connectDB } = require('../lib/mongodb');
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Check if items already exist
    const existingCount = await MenuItem.countDocuments();
    console.log(`📊 Found ${existingCount} existing menu items`);

    if (existingCount > 0) {
      console.log('⚠️  Menu items already exist. Skipping...');
      return;
    }

    // Add menu items
    const createdItems = await MenuItem.insertMany(sampleMenuItems);
    console.log(`✅ Successfully added ${createdItems.length} menu items`);

    // Display created items
    console.log('\n📋 Created Menu Items:');
    createdItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} - ₹${item.price} (${item.category})`);
    });

    console.log('\n🎉 Sample menu items added successfully!');
    console.log('You can now test the top sellers feature on the customer page.');

  } catch (error) {
    console.error('❌ Failed to add menu items:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
addMenuItems(); 