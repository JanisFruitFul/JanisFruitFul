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
    // Connect to MongoDB
    const { connectDB } = require('../lib/mongodb');
    await connectDB();

    // Check if items already exist
    // Removed: const existingCount = await MenuItem.countDocuments();

    if (existingCount > 0) {
      return;
    }

    // Add menu items
    const createdItems = await MenuItem.insertMany(sampleMenuItems);



  } catch (error) {
    // Failed to add menu items
    process.exit(1)
  } finally {
    await mongoose.disconnect();

    process.exit(0);
  }
}

// Run the script
addMenuItems(); 