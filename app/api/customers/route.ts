import connectDB from "@/backend/lib/mongodb"
import Customer from "@/backend/models/Customer"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Check if MongoDB URI is available
    if (!process.env.MONGODB_URI) {
      console.warn("MONGODB_URI not set, returning empty array")
      return NextResponse.json([])
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')

    // If phone number is provided, return customer details with rewards info
    if (phone) {
      const customer = await Customer.findOne({ phone }).populate("orders.itemId", "name category price")
      
      if (!customer) {
        return NextResponse.json({ success: false, message: "Customer not found" }, { status: 404 })
      }

      // Calculate rewards information
      const totalDrinks = customer.orders.length
      const paidDrinks = customer.orders.filter((order: any) => !order.isReward).length
      const rewardsEarned = customer.orders.filter((order: any) => order.isReward).length
      
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

    // If no phone provided, return all customers (for admin dashboard)
    const customers = await Customer.find({}).populate("orders.itemId", "name category price").sort({ updatedAt: -1 })

    return NextResponse.json(customers)
  } catch (error) {
    console.error("Failed to fetch customers:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch customers" }, { status: 500 })
  }
}
