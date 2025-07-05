import connectDB from "@/backend/lib/mongodb"
import Customer from "@/backend/models/Customer"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    await connectDB()
    
    const customers = await Customer.find()
    const now = new Date()
    
    console.log(`Found ${customers.length} customers`)
    
    // Calculate data for last 3 days
    const last3Days = []
    for (let i = 2; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
      
      let dailyPaidOrders = 0
      let dailyRewardOrders = 0
      let dailyTotalOrders = 0
      
      customers.forEach(customer => {
        if (customer.orders && customer.orders.length > 0) {
          customer.orders.forEach(order => {
            const orderDate = new Date(order.date)
            const isSameDay = orderDate.toDateString() === date.toDateString()
            
            if (isSameDay) {
              dailyTotalOrders++
              if (!order.isReward) {
                dailyPaidOrders++
              } else {
                dailyRewardOrders++
              }
            }
          })
        }
      })
      
      last3Days.push({
        date: dateStr,
        paidOrders: dailyPaidOrders,
        rewardOrders: dailyRewardOrders,
        totalOrders: dailyTotalOrders
      })
      
      console.log(`Date: ${dateStr}, Paid Orders: ${dailyPaidOrders}, Reward Orders: ${dailyRewardOrders}, Total: ${dailyTotalOrders}`)
    }
    
    console.log('Returning chart data:', last3Days)
    return NextResponse.json(last3Days)
  } catch (error) {
    console.error("Failed to fetch chart data:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch chart data" }, { status: 500 })
  }
} 