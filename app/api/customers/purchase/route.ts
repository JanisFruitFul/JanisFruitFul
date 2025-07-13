import connectDB from "@/backend/lib/mongodb"
import Customer from "@/backend/models/Customer"
import MenuItem from "@/backend/models/MenuItem"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { customerName, customerPhone, drinkType, itemId, itemName, price, isReward } = await request.json()

    if (!customerName || !customerPhone || !drinkType || !itemName || (!isReward && price === undefined)) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    // Verify menu item exists (only for non-reward purchases)
    if (!isReward) {
      const menuItem = await MenuItem.findById(itemId)
      if (!menuItem) {
        return NextResponse.json({ success: false, message: "Menu item not found" }, { status: 404 })
      }
    }

    // Find existing customer or create new one
    let customer = await Customer.findOne({ phone: customerPhone })

    if (!customer) {
      customer = new Customer({
        name: customerName,
        phone: customerPhone,
        orders: []
      })
    }

    const order = {
      drinkType,
      itemName,
      itemId: isReward ? null : itemId,
      price: isReward ? 0 : price,
      date: new Date(),
      isReward: !!isReward,
      claimed: !!isReward
    }

    customer.orders.push(order)

    // Initialize rewards map if it doesn't exist
    if (!customer.rewards) customer.rewards = new Map()
    if (!customer.rewards.has(drinkType)) {
      customer.rewards.set(drinkType, { paid: 0, earned: 0, claimed: 0 })
    }

    const rewardData = customer.rewards.get(drinkType)
    
    if (!isReward) {
      // Regular purchase - increment paid drinks
      rewardData.paid += 1
      const newEarned = Math.floor(rewardData.paid / 5)
      rewardData.earned = newEarned
    } else {
      // Reward claim - increment claimed rewards
      rewardData.claimed += 1
    }
    
    customer.rewards.set(drinkType, rewardData)

    // Only increment rewardsEarned if this is a reward
    if (isReward) {
      customer.rewardsEarned = (customer.rewardsEarned || 0) + 1
    }

    await customer.save()

    return NextResponse.json({
      success: true,
      message: isReward ? "Free reward drink recorded!" : "Purchase recorded successfully",
      customer,
      isReward: !!isReward,
    })
  } catch (error) {
    // Purchase error
    return NextResponse.json(
      { error: "Failed to process purchase" },
      { status: 500 }
    )
  }
}
