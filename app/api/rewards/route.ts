import connectDB from "@/backend/lib/mongodb"
import Customer from "@/backend/models/Customer"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if MongoDB URI is available
    if (!process.env.MONGODB_URI) {
      console.warn("MONGODB_URI not set, returning empty rewards data")
      return NextResponse.json({
        customers: [],
        stats: {
          totalRewardsGiven: 0,
          customersWithRewards: 0,
          upcomingRewards: 0,
          readyRewards: 0,
        },
      })
    }

    await connectDB()

    const customers = await Customer.find({})

    // Process customers for reward status (new logic: every 5 paid drinks = 1 free)
    const rewardCustomers = customers.map((customer) => {
      // Calculate paid drinks (excluding free rewards)
      const paidDrinks = customer.orders.filter((order: any) => !order.isReward).length
      
      // Calculate effective paid drinks (subtract claimed rewards)
      // Each claimed reward "consumes" 5 paid drinks
      const effectivePaidDrinks = paidDrinks - (customer.rewardsEarned * 5)
      
      // Calculate progress toward next reward (every 5 paid drinks = 1 free)
      const progressTowardReward = effectivePaidDrinks % 5
      const drinksUntilReward = progressTowardReward === 0 && effectivePaidDrinks > 0 ? 0 : 5 - progressTowardReward
      
      // Determine status
      let status: "earned" | "upcoming" | "progress" | "ready"
      if (effectivePaidDrinks <= 0) {
        status = "progress"
      } else if (progressTowardReward === 0 && effectivePaidDrinks > 0) {
        // Show "ready" when they have exactly 5 effective paid drinks (or multiples of 5)
        status = "ready" // Ready to claim reward
      } else if (progressTowardReward >= 4) {
        status = "upcoming"
      } else {
        status = "progress"
      }

      return {
        _id: customer._id,
        name: customer.name,
        phone: customer.phone,
        totalOrders: customer.totalOrders,
        paidDrinks: paidDrinks,
        rewardsEarned: customer.rewardsEarned,
        status,
        drinksUntilReward,
        progressTowardReward,
      }
    })

    // Calculate stats
    const totalRewardsGiven = customers.reduce((sum, customer) => sum + customer.rewardsEarned, 0)
    const customersWithRewards = customers.filter((customer) => customer.rewardsEarned > 0).length
    const upcomingRewards = rewardCustomers.filter((customer) => customer.status === "upcoming").length
    const readyRewards = rewardCustomers.filter((customer) => customer.status === "ready").length

    return NextResponse.json({
      customers: rewardCustomers,
      stats: {
        totalRewardsGiven,
        customersWithRewards,
        upcomingRewards,
        readyRewards,
      },
    })
  } catch (error) {
    console.error("Failed to fetch reward data:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch reward data" }, { status: 500 })
  }
}
