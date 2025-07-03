import cloudinary from "@/backend/cloudinary";
import connectDB from "@/backend/lib/mongodb";
import MenuItem from "@/backend/models/MenuItem";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();
    
    // Parse FormData
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const price = formData.get("price") as string;
    const description = formData.get("description") as string;
    const imageFile = formData.get("image") as File;
    
    console.log("Received form data:", { name, category, price, description, imageFile: imageFile?.name });

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

    // Validate category
    const validCategories = ["Mojito", "Ice Cream", "Milkshake", "Waffle"];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: "Invalid category. Must be one of: " + validCategories.join(", ") },
        { status: 400 }
      );
    }

    // Upload image to Cloudinary
    let imageUrl = "/placeholder.svg?height=200&width=200";
    
    if (imageFile) {
      try {
        console.log("Uploading image to Cloudinary...");
        
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
              if (error) reject(error);
              else resolve(result);
            }
          ).end(buffer);
        });
        
        if (result && typeof result === 'object' && 'secure_url' in result) {
          imageUrl = result.secure_url as string;
          console.log("Image uploaded successfully:", imageUrl);
        } else {
          throw new Error("Failed to get secure URL from Cloudinary");
        }
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload image to Cloudinary" },
          { status: 500 }
        );
      }
    }

    // Create menu item
    const menuItem = await MenuItem.create({
      name: name.trim(),
      category: category,
      price: priceNum,
      description: description.trim() || undefined,
      image: imageUrl,
      isActive: true,
    });

    console.log("Created menu item:", menuItem);
    
    return NextResponse.json(menuItem, { status: 201 });
  } catch (error) {
    console.error("Error creating menu item:", error);
    
    // Handle MongoDB duplicate key errors
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: "An item with this name already exists" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create menu item" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
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