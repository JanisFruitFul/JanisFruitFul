import connectDB from "@/backend/lib/mongodb";
import MenuItem from "@/backend/models/MenuItem";
import { type NextRequest, NextResponse } from "next/server";

// Import cloudinary with proper path
import cloudinary from "@/backend/cloudinary";

// Update menu item
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const price = formData.get("price") as string;
    const description = formData.get("description") as string;
    const imageFile = formData.get("image") as File;
    
    console.log("Updating menu item:", params.id);

    // Validate required fields
    if (!name || !category || !price) {
      return NextResponse.json(
        { error: "Missing required fields" },
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
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    // Find existing item
    const existingItem = await MenuItem.findById(params.id);
    if (!existingItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    // Update image if new one is provided
    let imageUrl = existingItem.image;
    if (imageFile) {
      try {
        console.log("Uploading new image to Cloudinary...");
        
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const result = await new Promise<{ secure_url?: string }>((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              folder: "menu_items",
              resource_type: "auto",
            },
            (error: Error | null, result: { secure_url?: string } | undefined) => {
              if (error) reject(error);
              else resolve(result || {});
            }
          ).end(buffer);
        });
        
        if (result && result.secure_url) {
          imageUrl = result.secure_url;
          console.log("New image uploaded successfully:", imageUrl);
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

    // Update the item
    const updatedItem = await MenuItem.findByIdAndUpdate(
      params.id,
      {
        name: name.trim(),
        category: category,
        price: priceNum,
        description: description.trim() || undefined,
        image: imageUrl,
      },
      { new: true }
    );

    console.log("Updated menu item:", updatedItem);
    
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating menu item:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update menu item" },
      { status: 500 }
    );
  }
}

// Delete menu item
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    console.log("Deleting menu item:", params.id);

    const deletedItem = await MenuItem.findByIdAndDelete(params.id);
    
    if (!deletedItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    console.log("Deleted menu item:", deletedItem);
    
    return NextResponse.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete menu item" },
      { status: 500 }
    );
  }
}

// Toggle availability (PATCH)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await req.json();
    const { isActive } = body;
    
    console.log("Toggling availability for menu item:", params.id, "to:", isActive);

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: "isActive must be a boolean" },
        { status: 400 }
      );
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(
      params.id,
      { isActive },
      { new: true }
    );
    
    if (!updatedItem) {
      return NextResponse.json(
        { error: "Menu item not found" },
        { status: 404 }
      );
    }

    console.log("Updated menu item availability:", updatedItem);
    
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating menu item availability:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update menu item availability" },
      { status: 500 }
    );
  }
} 