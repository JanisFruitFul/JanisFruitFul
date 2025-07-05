import connectDB from "@/backend/lib/mongodb";
import MenuItem from "@/backend/models/MenuItem";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("=== Starting SIMPLE POST request to /api/menu-items/simple ===");
    
    const connection = await connectDB();
    console.log("Database connection status:", connection ? "Connected" : "Not connected");
    
    if (!connection) {
      return NextResponse.json({ 
        success: false, 
        message: "Database not connected" 
      }, { status: 500 });
    }
    
    // Parse FormData
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const price = formData.get("price") as string;
    const description = formData.get("description") as string;
    
    console.log("Received form data:", { 
      name, 
      category, 
      price, 
      description
    });

    // Validate required fields
    if (!name || !category || !price) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: name, category, and price are required" },
        { status: 400 }
      );
    }

    // Validate price
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return NextResponse.json(
        { success: false, message: "Price must be a positive number" },
        { status: 400 }
      );
    }

    // Validate category - allow any non-empty string
    if (!category || category.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Category is required and cannot be empty" },
        { status: 400 }
      );
    }

    // Create menu item with placeholder image
    console.log("Attempting to create menu item with data:", {
      name: name.trim(),
      category: category,
      price: priceNum,
      description: description.trim() || undefined,
      image: "/placeholder.svg?height=200&width=200",
      isActive: true,
    });

    const menuItem = await MenuItem.create({
      name: name.trim(),
      category: category,
      price: priceNum,
      description: description.trim() || undefined,
      image: "/placeholder.svg?height=200&width=200",
      isActive: true,
    });

    console.log("Successfully created menu item:", menuItem);
    console.log("Menu item ID:", menuItem._id);
    
    return NextResponse.json({
      success: true,
      message: "Menu item created successfully",
      data: menuItem
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating menu item:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    // Handle MongoDB duplicate key errors
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { success: false, message: "An item with this name already exists" },
        { status: 409 }
      );
    }
    
    // Handle validation errors
    if (error instanceof Error && error.message.includes('validation failed')) {
      return NextResponse.json(
        { success: false, message: "Validation failed: " + error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to create menu item",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 