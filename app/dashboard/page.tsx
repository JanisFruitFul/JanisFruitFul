"use client"

export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getApiUrl } from "@/lib/config";
import {
  Gift,
  MessageCircle,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalCustomers: number
  totalDrinksSold: number
  upcomingRewards: number
  rewardsEarned: number
  recentCustomers: Array<{
    name: string
    phone: string
    totalOrders: number
    drinksUntilReward: number
  }>
}

interface Customer {
  name: string
  phone: string
  totalOrders: number
  drinksUntilReward: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalDrinksSold: 0,
    upcomingRewards: 0,
    rewardsEarned: 0,
    recentCustomers: [],
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch(getApiUrl('api/dashboard/stats'))
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
    }
  }

  const sendWhatsAppReminder = (customer: Customer) => {
    const message = `Hi ${customer.name}, You're just ${
      customer.drinksUntilReward
    } drink${
      customer.drinksUntilReward > 1 ? "s" : ""
    } away from a FREE reward! 🥤🎁  
Keep the streak going and claim your free drink! 💥  
We can't wait to see you again 😊`
    const whatsappUrl = `https://api.whatsapp.com/send?phone=91${customer.phone}&text=${encodeURIComponent(
      message
    )}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Active customer base</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drinks Sold</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.totalDrinksSold}</div>
            <p className="text-xs text-muted-foreground">All-time sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Rewards</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.upcomingRewards}</div>
            <p className="text-xs text-muted-foreground">Customers close to rewards</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rewards Earned</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.rewardsEarned}</div>
            <p className="text-xs text-muted-foreground">Free drinks given</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Customers</CardTitle>
          <CardDescription>Latest customer activity and reward status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentCustomers.map((customer, index) => {

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">{customer.phone}</p>
                    <p className="text-sm text-emerald-600">
                      {customer.totalOrders} drinks purchased
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => sendWhatsAppReminder(customer)}
                    className="text-green-600 border-green-600 hover:bg-green-50"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
