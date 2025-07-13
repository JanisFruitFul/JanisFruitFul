import connectDB from "@/backend/lib/mongodb";
import MenuItem from "@/backend/models/MenuItem";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const connection = await connectDB();
    
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
    
    // Find the test item
    const foundItem = await MenuItem.findById(testItem._id);
    
    // Delete the test item
    await MenuItem.findByIdAndDelete(testItem._id);
    
    return NextResponse.json({
      success: true,
      message: "Database connection and schema working correctly",
      testItemCreated: !!testItem,
      testItemFound: !!foundItem,
    });
    
  } catch (error) {
    // Test failed
    return NextResponse.json(
      { error: "Test failed" },
      { status: 500 }
    )
  }
} 