import cloudinary from "@/backend/cloudinary";
import connectDB from "@/backend/lib/mongodb";
import MenuItem from "@/backend/models/MenuItem";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("=== Starting POST request to /api/menu-items ===");
    
    const connection = await connectDB();
    console.log("Database connection status:", connection ? "Connected" : "Not connected");
    
    // Parse FormData
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const price = formData.get("price") as string;
    const description = formData.get("description") as string;
    const imageFile = formData.get("image") as File;
    
    console.log("Received form data:", { 
      name, 
      category, 
      price, 
      description, 
      imageFile: imageFile?.name,
      imageFileSize: imageFile?.size 
    });

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
      
      console.log("Cloudinary credentials check:", {
        cloudName: !!cloudName,
        apiKey: !!apiKey,
        apiSecret: !!apiSecret
      });
      
      if (!cloudName || !apiKey || !apiSecret) {
        console.log("Cloudinary credentials not found, using placeholder image");
        imageUrl = "/placeholder.svg?height=200&width=200";
      } else {
        try {
          console.log("Uploading image to Cloudinary...");
          console.log("Image file details:", {
            name: imageFile.name,
            size: imageFile.size,
            type: imageFile.type
          });
          
          // Convert File to buffer
          const bytes = await imageFile.arrayBuffer();
          const buffer = Buffer.from(bytes);
          console.log("Buffer created, size:", buffer.length);
          
          // Upload to Cloudinary
          const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              {
                folder: "menu_items",
                resource_type: "auto",
              },
              (error, result) => {
                if (error) {
                  console.error("Cloudinary upload callback error:", error);
                  reject(error);
                } else {
                  console.log("Cloudinary upload callback success:", result);
                  resolve(result);
                }
              }
            ).end(buffer);
          });
          
          if (result && typeof result === 'object' && 'secure_url' in result) {
            imageUrl = result.secure_url as string;
            console.log("Image uploaded successfully:", imageUrl);
          } else {
            console.error("Invalid Cloudinary result:", result);
            throw new Error("Failed to get secure URL from Cloudinary");
          }
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
          console.error("Upload error stack:", uploadError instanceof Error ? uploadError.stack : "No stack trace");
          
          // Continue with placeholder image instead of failing
          console.log("Using placeholder image due to upload failure");
          imageUrl = "/placeholder.svg?height=200&width=200";
        }
      }
    }

    // Create menu item
    console.log("Attempting to create menu item with data:", {
      name: name.trim(),
      category: category,
      price: priceNum,
      description: description.trim() || undefined,
      image: imageUrl,
      isActive: true,
    });

    const menuItem = await MenuItem.create({
      name: name.trim(),
      category: category,
      price: priceNum,
      description: description.trim() || undefined,
      image: imageUrl,
      isActive: true,
    });

    console.log("Successfully created menu item:", menuItem);
    console.log("Menu item ID:", menuItem._id);
    
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
    console.log("=== Starting GET request to /api/menu-items ===");
    
    const connection = await connectDB();
    console.log("Database connection status:", connection ? "Connected" : "Not connected");
    
    const menuItems = await MenuItem.find({}).sort({ createdAt: -1 });
    console.log(`Found ${menuItems.length} menu items in database`);
    
    return NextResponse.json(menuItems);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    );
  }
} 