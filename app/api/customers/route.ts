import connectDB from "@/backend/lib/mongodb"
import Customer from "@/backend/models/Customer"
import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/server-auth"

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic'

interface Order {
  isReward: boolean
  price: number
}

export async function GET(
  request: NextRequest,
  { searchParams }: { searchParams: URLSearchParams }
) {
  try {
    // Check if MongoDB URI is available
    if (!process.env.MONGODB_URI) {
      // MONGODB_URI not set, returning empty array
      return NextResponse.json([])
    }

    await connectDB()

    // Handle static generation - if searchParams is not available, return empty array
    if (!searchParams) {
      return NextResponse.json([])
    }

    const phone = searchParams.get('phone')

    // If phone number is provided, return customer details with rewards info
    if (phone) {
      const customer = await Customer.findOne({ phone }).populate("orders.itemId", "name category price")
      
      if (!customer) {
        return NextResponse.json({ success: false, message: "Customer not found" }, { status: 404 })
      }

      // Calculate rewards information
      const totalDrinks = customer.orders.length
      const paidDrinks = customer.orders.filter((order: Order) => !order.isReward).length
      const rewardsEarned = customer.orders.filter((order: Order) => order.isReward).length
      
      // Calculate drinks needed for next reward (every 5 paid drinks = 1 reward)
      const effectivePaidDrinks = paidDrinks - (rewardsEarned * 5)
      const drinksToNextReward = Math.max(0, 5 - (effectivePaidDrinks % 5))
      const upcomingReward = effectivePaidDrinks >= 5 ? 1 : 0

      const customerData = {
        name: customer.name,
        phone: customer.phone,
        totalDrinks,
        rewardsEarned,
        upcomingReward,
        drinksToNextReward,
        lastOrderDate: customer.orders.length > 0 ? customer.orders[customer.orders.length - 1].createdAt : null
      }

      return NextResponse.json(customerData)
    }

    // If no phone provided, require authentication for admin access
    const authResult = await requireAuth(request)
    if ('error' in authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // If no phone provided, return all customers (for admin dashboard)
    const customers = await Customer.find({}).populate("orders.itemId", "name category price").sort({ updatedAt: -1 })

    return NextResponse.json(customers)
  } catch (error) {
    // Failed to fetch customers
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    )
  }
}
