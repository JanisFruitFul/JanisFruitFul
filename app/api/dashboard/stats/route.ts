export const dynamic = "force-dynamic";
import connectDB from "@/backend/lib/mongodb"
import Customer from "@/backend/models/Customer"
import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/server-auth"

interface Order {
  isReward: boolean
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth(request)
    if ('error' in authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // Get recent customers (last 5) with drinks until reward calculation
    const recentCustomers = customers.slice(0, 5).map((customer) => {
      // Calculate drinks until next reward
      const paidDrinks = customer.orders ? customer.orders.filter((order: Order) => !order.isReward).length : 0
      const effectivePaidDrinks = paidDrinks - (customer.rewardsEarned * 5)
      const progressTowardReward = effectivePaidDrinks % 5
      const drinksUntilReward = progressTowardReward === 0 && effectivePaidDrinks > 0 ? 0 : 5 - progressTowardReward
      
      return {
        name: customer.name,
        phone: customer.phone,
        totalOrders: customer.totalOrders,
        drinksUntilReward: drinksUntilReward
      }
    })

    return NextResponse.json({
      totalCustomers,
      totalDrinksSold,
      upcomingRewards,
      rewardsEarned,
      recentCustomers,
    })
  } catch (error) {
    // Failed to fetch dashboard stats
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}
