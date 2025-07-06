import MenuItem from "@/backend/models/MenuItem";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("=== Fetching top sellers ===");
    
    // Check if MongoDB URI is available
    if (!process.env.MONGODB_URI) {
      console.warn("MONGODB_URI not set, returning empty array")
      return NextResponse.json({ 
        success: true, 
        data: [] 
      })
    }

    // Import connectDB dynamically to avoid build issues
    const mongodbModule = await import("@/backend/lib/mongodb.js");
    const connectDB = (mongodbModule as any).connectDB;
    
    // Connect to database
    console.log("Connecting to database...");
    const connection = await connectDB();
    
    if (!connection) {
      console.warn("Database connection failed");
      throw new Error('Database connection failed');
    }
    
    console.log("Database connected successfully");
    
    // Get all active menu items and sort by creation date (newest first)
    // In a real app, you might want to sort by actual sales data
    console.log("Fetching menu items from database...");
    
    const menuItems = await MenuItem.find({ isActive: true })
      .select('_id name price image category description createdAt') // Only select needed fields
      .sort({ createdAt: -1 })
      .limit(6)
      .lean() // Use lean() for better performance
      .exec();
    
    console.log(`Found ${menuItems.length} menu items`);
    
    console.log(`Found ${menuItems.length} top selling items`);
    
    // Transform the data to match the frontend expectations
    const topSellers = menuItems.map((item: any, index: number) => ({
      id: item._id.toString(),
      name: item.name,
      price: `₹${item.price.toFixed(2)}`,
      image: item.image,
      category: item.category,
      rating: 4.5 + (Math.random() * 0.5), // Mock rating between 4.5-5.0
      orders: Math.floor(Math.random() * 200) + 50, // Mock orders between 50-250
      isPopular: index < 3, // First 3 items are marked as popular
      description: item.description
    }));
    
    return NextResponse.json({
      success: true,
      data: topSellers
    });
    
  } catch (error) {
    console.error("Error fetching top sellers:", error);
    
    // Return empty data if database fails
    return NextResponse.json({
      success: true,
      data: [],
      message: "Unable to fetch top sellers at the moment. Please check your database connection."
    });
  }
} 