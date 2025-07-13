import MenuItem from "@/backend/models/MenuItem";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/server-auth";

interface MenuItemData {
  _id: unknown
  name?: string
  price?: number
  image?: string
  category?: string
  description?: string
  createdAt?: Date
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth(request)
    if ('error' in authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if MongoDB URI is available
    if (!process.env.MONGODB_URI) {
      // MONGODB_URI not set, returning empty array
      return NextResponse.json([])
    }

    // Import connectDB dynamically to avoid build issues
    const { default: connectDB } = await import("@/backend/lib/mongodb");
    
    // Connect to database
    const connection = await connectDB();
    
    if (!connection) {
      // Database connection failed
      return NextResponse.json([])
    }
    
    // Get all active menu items and sort by creation date (newest first)
    // In a real app, you might want to sort by actual sales data
    
    const menuItems = await MenuItem.find({ isActive: true })
      .select('_id name price image category description createdAt') // Only select needed fields
      .sort({ createdAt: -1 })
      .limit(6)
      .lean() // Use lean() for better performance
      .exec();
    
    // Transform the data to match the frontend expectations
    const topSellers = menuItems.map((item: MenuItemData, index: number) => ({
      id: item._id?.toString() || '',
      name: item.name || '',
      price: `₹${(item.price || 0).toFixed(2)}`,
      image: item.image || '',
      category: item.category || '',
      rating: 4.5 + (Math.random() * 0.5), // Mock rating between 4.5-5.0
      orders: Math.floor(Math.random() * 200) + 50, // Mock orders between 50-250
      isPopular: index < 3, // First 3 items are marked as popular
      description: item.description || ''
    }));
    
    return NextResponse.json({
      success: true,
      data: topSellers
    });
    
  } catch {
    // Error fetching top sellers
    return NextResponse.json([])
  }
} 