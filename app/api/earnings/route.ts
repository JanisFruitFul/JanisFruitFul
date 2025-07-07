export const dynamic = "force-dynamic";
import connectDB from "@/backend/lib/mongodb"
import Customer from "@/backend/models/Customer"
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/server-auth"

interface Transaction {
  _id: string
  customerName: string
  customerPhone: string
  itemName: string
  drinkType: string
  price: number
  date: string
  isReward: boolean
}

export async function GET(request: Request) {
  try {
    // Check authentication
    const authResult = await requireAuth(request as any)
    if ('error' in authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Get all customers with their orders
    const customers = await Customer.find({}).populate('orders')

    // Collect all transactions from all customers
    const allTransactions: Transaction[] = []
    let totalEarnings = 0
    let totalOrders = 0
    let totalRewards = 0

    customers.forEach(customer => {
      if (customer.orders && Array.isArray(customer.orders)) {
        customer.orders.forEach((order: any) => {
          const transaction = {
            _id: order._id || Math.random().toString(),
            customerName: customer.name,
            customerPhone: customer.phone,
            itemName: order.itemName || 'Unknown Item',
            drinkType: order.drinkType || 'Unknown Type',
            price: order.price || 0,
            date: order.date || new Date().toISOString().split('T')[0],
            isReward: order.isReward || false
          }
          
          allTransactions.push(transaction)
          
          if (order.isReward) {
            totalRewards++
          } else {
            totalOrders++
            totalEarnings += order.price || 0
          }
        })
      }
    })

    // Filter transactions by period if specified
    let filteredTransactions = allTransactions
    if (period !== 'all') {
      const now = new Date()
      let startDateFilter = new Date()
      
      switch (period) {
        case 'today':
          startDateFilter.setHours(0, 0, 0, 0)
          break
        case 'week':
          startDateFilter.setDate(now.getDate() - 7)
          break
        case 'month':
          startDateFilter.setMonth(now.getMonth() - 1)
          break
        case 'year':
          startDateFilter.setFullYear(now.getFullYear() - 1)
          break
      }
      
      filteredTransactions = allTransactions.filter(t => {
        const transactionDate = new Date(t.date)
        return transactionDate >= startDateFilter && transactionDate <= now
      })
    }

    // Calculate daily earnings
    const dailyEarningsMap = new Map()
    filteredTransactions.forEach(transaction => {
      const date = transaction.date
      if (!dailyEarningsMap.has(date)) {
        dailyEarningsMap.set(date, { date, earnings: 0, orders: 0, rewards: 0 })
      }
      const dayData = dailyEarningsMap.get(date)
      if (transaction.isReward) {
        dayData.rewards++
      } else {
        dayData.orders++
        dayData.earnings += transaction.price
      }
    })

    const dailyEarnings = Array.from(dailyEarningsMap.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Calculate monthly earnings
    const monthlyEarningsMap = new Map()
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
      
      if (!monthlyEarningsMap.has(monthKey)) {
        monthlyEarningsMap.set(monthKey, { month: monthName, earnings: 0, orders: 0 })
      }
      const monthData = monthlyEarningsMap.get(monthKey)
      if (!transaction.isReward) {
        monthData.orders++
        monthData.earnings += transaction.price
      }
    })

    const monthlyEarnings = Array.from(monthlyEarningsMap.values())
      .sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime())

    // Calculate yearly earnings
    const yearlyEarningsMap = new Map()
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date)
      const year = date.getFullYear().toString()
      
      if (!yearlyEarningsMap.has(year)) {
        yearlyEarningsMap.set(year, { year, earnings: 0, orders: 0 })
      }
      const yearData = yearlyEarningsMap.get(year)
      if (!transaction.isReward) {
        yearData.orders++
        yearData.earnings += transaction.price
      }
    })

    const yearlyEarnings = Array.from(yearlyEarningsMap.values())
      .sort((a, b) => parseInt(b.year) - parseInt(a.year))

    // Calculate top customers
    const customerEarningsMap = new Map()
    filteredTransactions.forEach(transaction => {
      const customerKey = `${transaction.customerName}-${transaction.customerPhone}`
      if (!customerEarningsMap.has(customerKey)) {
        customerEarningsMap.set(customerKey, {
          name: transaction.customerName,
          phone: transaction.customerPhone,
          totalSpent: 0,
          orderCount: 0
        })
      }
      const customerData = customerEarningsMap.get(customerKey)
      if (!transaction.isReward) {
        customerData.orderCount++
        customerData.totalSpent += transaction.price
      }
    })

    const topCustomers = Array.from(customerEarningsMap.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)

    // Calculate top drinks
    const drinkEarningsMap = new Map()
    filteredTransactions.forEach(transaction => {
      const drinkKey = `${transaction.itemName}-${transaction.drinkType}`
      if (!drinkEarningsMap.has(drinkKey)) {
        drinkEarningsMap.set(drinkKey, {
          name: transaction.itemName,
          category: transaction.drinkType,
          totalSold: 0,
          totalRevenue: 0
        })
      }
      const drinkData = drinkEarningsMap.get(drinkKey)
      if (!transaction.isReward) {
        drinkData.totalSold++
        drinkData.totalRevenue += transaction.price
      }
    })

    const topDrinks = Array.from(drinkEarningsMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10)

    const averageOrderValue = totalOrders > 0 ? totalEarnings / totalOrders : 0

    // Add some debugging
    console.log('Earnings API Debug:', {
      totalCustomers: customers.length,
      totalTransactions: allTransactions.length,
      filteredTransactions: filteredTransactions.length,
      totalEarnings,
      totalOrders,
      sampleTransactions: filteredTransactions.slice(0, 3)
    })

    return NextResponse.json({
      totalEarnings,
      totalOrders,
      averageOrderValue,
      topCustomers,
      topDrinks,
      monthlyEarnings,
      dailyEarnings,
      yearlyEarnings,
      transactions: filteredTransactions
    })

  } catch (error) {
    console.error("Failed to fetch earnings data:", error)
    return NextResponse.json({
      totalEarnings: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      topCustomers: [],
      topDrinks: [],
      monthlyEarnings: [],
      dailyEarnings: [],
      yearlyEarnings: [],
      transactions: []
    })
  }
} 