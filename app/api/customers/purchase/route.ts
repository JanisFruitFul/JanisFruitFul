import connectDB from "@/backend/lib/mongodb"
import Customer from "@/backend/models/Customer"
import MenuItem from "@/backend/models/MenuItem"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { customerName, customerPhone, drinkType, itemId, itemName, price } = await request.json()

    if (!customerName || !customerPhone || !drinkType || !itemId || !itemName || price === undefined) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    // Verify menu item exists
    const menuItem = await MenuItem.findById(itemId)
    if (!menuItem) {
      return NextResponse.json({ success: false, message: "Menu item not found" }, { status: 404 })
    }

    // Find existing customer or create new one
    const customer = await Customer.findOne({ phone: customerPhone })

    const newOrder = {
      drinkType,
      itemName,
      itemId,
      price,
      date: new Date(),
      isReward: false,
    }

    if (customer) {
      // Existing customer - check for reward eligibility
      const ordersAfterLastReward = customer.totalOrders % 6

      if (ordersAfterLastReward === 5) {
        // This is the 6th drink, make it a reward
        newOrder.isReward = true
        newOrder.price = 0
        customer.rewardsEarned += 1
      }

      customer.orders.push(newOrder)
      await customer.save()

      return NextResponse.json({
        success: true,
        message: "Purchase added successfully",
        customer,
        isReward: newOrder.isReward,
      })
    } else {
      // New customer
      const newCustomer = new Customer({
        name: customerName,
        phone: customerPhone,
        orders: [newOrder],
        totalOrders: 1,
        rewardsEarned: 0,
      })

      await newCustomer.save()

      return NextResponse.json({
        success: true,
        message: "New customer added successfully",
        customer: newCustomer,
        isReward: false,
      })
    }
  } catch (error) {
    console.error("Purchase error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
