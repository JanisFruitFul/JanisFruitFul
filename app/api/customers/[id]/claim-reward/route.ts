import connectDB from "@/backend/lib/mongodb"
import Customer from "@/backend/models/Customer"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const { category } = await request.json()
    const customer = await Customer.findById(params.id)

    if (!customer || !category) {
      return NextResponse.json(
        { success: false, message: "Invalid request" },
        { status: 400 }
      )
    }

    // Initialize rewards map if it doesn't exist
    if (!customer.rewards) customer.rewards = new Map()
    if (!customer.rewards.has(category)) {
      customer.rewards.set(category, { paid: 0, earned: 0, claimed: 0 })
    }

    const reward = customer.rewards.get(category)
    if (!reward || reward.earned <= reward.claimed) {
      return NextResponse.json(
        { success: false, message: "No rewards available to claim" },
        { status: 400 }
      )
    }

    // Create reward order
    customer.orders.push({
      drinkType: category,
      itemName: `${category} (Reward)`,
      itemId: null,
      price: 0,
      isReward: true,
      claimed: true,
      date: new Date(),
    })

    // Update reward data
    reward.claimed += 1
    customer.rewards.set(category, reward)
    
    // Increment total rewards earned
    customer.rewardsEarned = (customer.rewardsEarned || 0) + 1

    await customer.save()

    return NextResponse.json({
      success: true,
      message: "Reward claimed successfully",
      customer,
      claimedCategory: category,
    })
  } catch (error) {
    // Error claiming reward
    return NextResponse.json(
      { error: "Failed to claim reward" },
      { status: 500 }
    )
  }
} 