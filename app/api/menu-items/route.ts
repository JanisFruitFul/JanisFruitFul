import cloudinary from "@/backend/cloudinary";
import MenuItem from "@/backend/models/MenuItem";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    
    // Parse FormData
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const price = formData.get("price") as string;
    const description = formData.get("description") as string;
    const imageFile = formData.get("image") as File;

    // Validate required fields
    if (!name || !category || !price || !imageFile) {
      return NextResponse.json(
        { error: "Missing required fields: name, category, price, and image are required" },
        { status: 400 }
      );
    }

    // Validate price
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return NextResponse.json(
        { error: "Price must be a positive number" },
        { status: 400 }
      );
    }

    // Validate category - allow any non-empty string
    if (!category || category.trim().length === 0) {
      return NextResponse.json(
        { error: "Category is required and cannot be empty" },
        { status: 400 }
      );
    }

    // Upload image to Cloudinary
    let imageUrl = "/placeholder.svg?height=200&width=200";
    
    if (imageFile) {
      // Check if Cloudinary credentials are available
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;
      
      if (!cloudName || !apiKey || !apiSecret) {
        imageUrl = "/placeholder.svg?height=200&width=200";
      } else {
        try {
          // Convert File to buffer
          const bytes = await imageFile.arrayBuffer();
          const buffer = Buffer.from(bytes);
          
          // Upload to Cloudinary
          const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              {
                folder: "menu_items",
                resource_type: "auto",
              },
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            ).end(buffer);
          });
          
          if (result && typeof result === 'object' && 'secure_url' in result) {
            imageUrl = result.secure_url as string;
          } else {
            throw new Error("Failed to get secure URL from Cloudinary");
          }
        } catch {
          // Continue with placeholder image instead of failing
          imageUrl = "/placeholder.svg?height=200&width=200";
        }
      }
    }

    const menuItem = await MenuItem.create({
      name: name.trim(),
      category: category,
      price: priceNum,
      description: description.trim() || undefined,
      image: imageUrl,
      isActive: true,
    });
    
    return NextResponse.json(menuItem, { status: 201 });
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

export async function GET() {
  try {
    
    const menuItems = await MenuItem.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json(menuItems);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    );
  }
} 