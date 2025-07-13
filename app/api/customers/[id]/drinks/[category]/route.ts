import connectDB from "@/backend/lib/mongodb"
import Customer from "@/backend/models/Customer"
import { NextRequest, NextResponse } from "next/server"

interface Order {
  drinkType: string
  isReward: boolean
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; category: string } }
) {
  try {
    await connectDB()
    const { id, category } = params
    
    const customer = await Customer.findById(id)
    if (!customer) {
      return NextResponse.json(
        { success: false, message: "Customer not found" },
        { status: 404 }
      )
    }

    const categoryOrders = customer.orders.filter((order: Order) => order.drinkType === category)
    
    return NextResponse.json({
      success: true,
      customer: {
        name: customer.name,
        phone: customer.phone,
      },
      category,
      orders: categoryOrders,
      totalOrders: categoryOrders.length,
      paidOrders: categoryOrders.filter((order: Order) => !order.isReward).length,
      rewardOrders: categoryOrders.filter((order: Order) => order.isReward).length,
    })
  } catch {
    // Error fetching customer drinks
    return NextResponse.json(
      { error: "Failed to fetch customer drinks" },
      { status: 500 }
    )
  }
} 