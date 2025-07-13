import connectDB from "@/backend/lib/mongodb"
import MenuItem from "@/backend/models/MenuItem"
import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/server-auth"

export async function GET() {
  try {
    // Check if MongoDB URI is available
    if (!process.env.MONGODB_URI) {
      // MONGODB_URI not set, returning empty array
      return NextResponse.json([])
    }

    await connectDB()

    const menuItems = await MenuItem.find({}).sort({ category: 1, name: 1 })

    return NextResponse.json(menuItems)
  } catch {
    // Failed to fetch menu items
    return NextResponse.json(
      { error: "Failed to fetch menu items" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication for admin operations
    const authResult = await requireAuth(request)
    if ('error' in authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if MongoDB URI is available
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ success: false, message: "Database not configured" }, { status: 503 })
    }

    await connectDB()

    const { name, category, price, image, description } = await request.json()

    if (!name || !category || !price) {
      return NextResponse.json({ success: false, message: "Name, category, and price are required" }, { status: 400 })
    }

    const menuItem = new MenuItem({
      name,
      category,
      price,
      image: image || "/placeholder.svg?height=200&width=200",
      description,
    })

    await menuItem.save()

    return NextResponse.json({
      success: true,
      message: "Menu item created successfully",
      menuItem,
    })
  } catch {
    // Failed to create menu item
    return NextResponse.json(
      { error: "Failed to create menu item" },
      { status: 500 }
    )
  }
}
