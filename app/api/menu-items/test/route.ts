import connectDB from "@/backend/lib/mongodb";
import MenuItem from "@/backend/models/MenuItem";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("=== Testing database connection and schema ===");
    
    const connection = await connectDB();
    console.log("Database connection status:", connection ? "Connected" : "Not connected");
    
    if (!connection) {
      return NextResponse.json({ error: "Database not connected" }, { status: 500 });
    }
    
    // Test creating a simple menu item
    const testItem = await MenuItem.create({
      name: "Test Item",
      category: "Test Category",
      price: 10.99,
      description: "Test description",
      image: "/test-image.jpg",
      isActive: true,
    });
    
    console.log("Test item created:", testItem);
    
    // Find the test item
    const foundItem = await MenuItem.findById(testItem._id);
    console.log("Test item found:", foundItem);
    
    // Delete the test item
    await MenuItem.findByIdAndDelete(testItem._id);
    console.log("Test item deleted");
    
    return NextResponse.json({
      success: true,
      message: "Database connection and schema working correctly",
      testItemCreated: !!testItem,
      testItemFound: !!foundItem,
    });
    
  } catch (error) {
    console.error("Test failed:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 