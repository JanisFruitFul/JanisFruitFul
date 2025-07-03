import connectDB from "@/backend/lib/mongodb"
import Customer from "@/backend/models/Customer"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if MongoDB URI is available
    if (!process.env.MONGODB_URI) {
      console.warn("MONGODB_URI not set, returning empty stats")
      return NextResponse.json({
        totalCustomers: 0,
        totalDrinksSold: 0,
        upcomingRewards: 0,
        rewardsEarned: 0,
        recentCustomers: [],
      })
    }

    await connectDB()

    const customers = await Customer.find({}).sort({ createdAt: -1 })

    // Calculate stats
    const totalCustomers = customers.length
    const totalDrinksSold = customers.reduce((sum, customer) => sum + customer.totalOrders, 0)
    const rewardsEarned = customers.reduce((sum, customer) => sum + customer.rewardsEarned, 0)

    // Count customers who are close to rewards (5+ drinks, not at reward milestone)
    const upcomingRewards = customers.filter((customer) => {
      const ordersAfterLastReward = customer.totalOrders % 6
      return ordersAfterLastReward >= 5 && ordersAfterLastReward !== 0
    }).length

    // Get recent customers (last 5)
    const recentCustomers = customers.slice(0, 5).map((customer) => ({
      name: customer.name,
      phone: customer.phone,
      totalOrders: customer.totalOrders,
    }))

    return NextResponse.json({
      totalCustomers,
      totalDrinksSold,
      upcomingRewards,
      rewardsEarned,
      recentCustomers,
    })
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
