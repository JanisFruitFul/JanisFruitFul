import connectDB from "@/backend/lib/mongodb"
import Admin from "@/backend/models/Admin"
import Customer from "@/backend/models/Customer"
import Shop from "@/backend/models/Shop"
import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/server-auth"

interface Order {
  isReward: boolean
  price: number
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth(request)
    if ('error' in authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Get admin info (assuming single admin for now)
    const admin = await Admin.findOne({}).select("-password")

    // Get or create shop info
    let shop = await Shop.findOne({})
    if (!shop) {
      shop = new Shop({})
      await shop.save()
    }

    // Get business stats
    const customers = await Customer.find({})
    const totalCustomers = customers.length
    const totalOrders = customers.reduce((sum, customer) => sum + customer.totalOrders, 0)
    const totalRevenue = customers.reduce((sum, customer) => {
      return (
        sum +
        customer.orders.reduce((orderSum: number, order: Order) => {
          return orderSum + (order.isReward ? 0 : order.price)
        }, 0)
      )
    }, 0)
    const rewardsGiven = customers.reduce((sum, customer) => sum + customer.rewardsEarned, 0)

    return NextResponse.json({
      admin: {
        name: admin?.username || "Admin User",
        email: admin?.email || "admin@drinks.com",
        role: admin?.role || "Super Admin",
        joinDate: admin?.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "January 1, 2024",
        lastLogin: admin?.lastLogin ? new Date(admin.lastLogin).toLocaleString() : "Today, 2:30 PM",
      },
      shop: {
        name: shop.name,
        phone: shop.phone,
        email: shop.email,
        address: shop.address,
        established: shop.established,
        license: shop.license,
      },
      stats: {
        totalCustomers,
        totalOrders,
        totalRevenue,
        rewardsGiven,
      },
    })
  } catch (error) {
    // Failed to fetch profile data
    return NextResponse.json(
      { error: "Failed to fetch profile data" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const { username, email } = await request.json()

    // Update admin profile (assuming single admin)
    const admin = await Admin.findOneAndUpdate({}, { username, email }, { new: true, upsert: true }).select("-password")

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: { username: admin.username, email: admin.email },
    })
  } catch (error) {
    // Failed to update profile
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    )
  }
}
