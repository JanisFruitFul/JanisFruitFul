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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart } from "recharts";
import { getApiUrl } from "@/lib/config";
import {
  ChevronLeft,
  ChevronRight,
  DollarSign,
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
  totalRevenue: number
  rewardsEarned: number
  recentCustomers: Array<{
    name: string
    phone: string
    totalOrders: number
    drinksUntilReward: number
  }>
}

interface ChartData {
  date: string
  paidOrders: number
  rewardOrders: number
  totalOrders: number
}

interface ProfileData {
  admin: {
    name: string
    email: string
    role: string
    joinDate: string
    lastLogin: string
  }
  shop: {
    name: string
    phone: string
    email: string
    address: string
    established: string
    license: string
  }
  stats: {
    totalCustomers: number
    totalOrders: number
    totalRevenue: number
    rewardsGiven: number
  }
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
    totalRevenue: 0,
    rewardsEarned: 0,
    recentCustomers: [],
  })
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [dailyChartData, setDailyChartData] = useState<ChartData[]>([])
  const [showStats, setShowStats] = useState(true)
  const [showChart, setShowChart] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const customersPerPage = 3

  useEffect(() => {
    fetchStats()
    fetchProfileData()
    fetchChartData()
  }, [])

  useEffect(() => {
    console.log('Daily chart data updated:', dailyChartData)
  }, [dailyChartData])

  useEffect(() => {
    console.log('Stats data updated:', stats)
  }, [stats])

  const fetchStats = async () => {
    try {
      const response = await fetch(getApiUrl('api/dashboard/stats'))
      const data = await response.json()
      console.log('Dashboard stats received:', data)
      
      // Ensure recentCustomers have the required fields
      const processedData = {
        ...data,
        recentCustomers: data.recentCustomers?.map((customer: any) => ({
          name: customer.name || 'Unknown',
          phone: customer.phone || 'N/A',
          totalOrders: customer.totalOrders || 0,
          drinksUntilReward: customer.drinksUntilReward || 0
        })) || []
      }
      
      setStats(processedData)
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
      // Set fallback data if API fails
      setStats({
        totalCustomers: 0,
        totalDrinksSold: 0,
        totalRevenue: 0,
        rewardsEarned: 0,
        recentCustomers: []
      })
    }
  }

  const fetchProfileData = async () => {
    try {
      const response = await fetch(getApiUrl('api/admin/profile'))
      const data = await response.json()
      setProfileData(data)
    } catch (error) {
      console.error("Failed to fetch profile data:", error)
    }
  }

  const fetchChartData = async () => {
    try {
      const response = await fetch(getApiUrl('api/dashboard/chart-data'))
      const data = await response.json()
      console.log('Chart data received:', data)
      setDailyChartData(data)
    } catch (error) {
      console.error("Failed to fetch chart data:", error)
      // Set fallback data if API fails
      const fallbackData = [
        { date: 'Dec 15', paidOrders: 5, rewardOrders: 1, totalOrders: 6 },
        { date: 'Dec 16', paidOrders: 7, rewardOrders: 2, totalOrders: 9 },
        { date: 'Dec 17', paidOrders: 4, rewardOrders: 0, totalOrders: 4 }
      ]
      setDailyChartData(fallbackData)
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

  // Calculate pagination
  const totalPages = Math.ceil(stats.recentCustomers.length / customersPerPage)
  const startIndex = (currentPage - 1) * customersPerPage
  const endIndex = startIndex + customersPerPage
  const currentCustomers = stats.recentCustomers.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Chart configuration
  const chartConfig = {
    paidOrders: {
      label: "Paid Orders",
      color: "hsl(var(--chart-1))",
    },
    rewardOrders: {
      label: "Reward Orders",
      color: "hsl(var(--chart-2))",
    },
    totalOrders: {
      label: "Total Orders",
      color: "hsl(var(--chart-3))",
    },
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Stats</h2>
        <Button
          variant="outline"
          onClick={() => setShowStats(!showStats)}
          className="flex items-center gap-2"
        >
          {showStats ? "Hide Stats" : "Show Stats"}
        </Button>
      </div>

      {/* Stats Cards */}
      {showStats && (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{(profileData?.stats.totalRevenue || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total earnings</p>
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
      )}

      {/* Stats Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Last 3 Days Orders</CardTitle>
              <CardDescription>Daily order counts - paid orders, reward orders, and total orders</CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowChart(!showChart)}
              className="flex items-center gap-2"
            >
              {showChart ? "Hide Chart" : "Show Chart"}
            </Button>
          </div>
        </CardHeader>
        {showChart && (
          <CardContent>
            {dailyChartData.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <ChartContainer config={chartConfig}>
                    <BarChart data={dailyChartData}>
                    <ChartTooltip
                      cursor={{
                        fill: "hsl(var(--muted))",
                        opacity: 0.1,
                      }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <ChartTooltipContent
                              active={active}
                              payload={payload}
                              label={payload[0].payload.date}
                              formatter={(value, name) => {
                                return [value, chartConfig[name as keyof typeof chartConfig]?.label || name]
                              }}
                            />
                          )
                        }
                        return null
                      }}
                    />
                    <Bar
                      dataKey="paidOrders"
                      fill="hsl(var(--chart-1))"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="rewardOrders"
                      fill="hsl(var(--chart-2))"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="totalOrders"
                      fill="hsl(var(--chart-3))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2">Chart Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Paid Orders:</span>
                        <span className="font-medium">{dailyChartData.reduce((sum, day) => sum + day.paidOrders, 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Reward Orders:</span>
                        <span className="font-medium">{dailyChartData.reduce((sum, day) => sum + day.rewardOrders, 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Orders:</span>
                        <span className="font-medium">{dailyChartData.reduce((sum, day) => sum + day.totalOrders, 0)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-lg mb-2 text-blue-800">Daily Breakdown</h3>
                    <div className="space-y-2">
                      {dailyChartData.map((day, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm font-medium">{day.date}</span>
                          <div className="flex gap-2 text-xs">
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">P: {day.paidOrders}</span>
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded">R: {day.rewardOrders}</span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">T: {day.totalOrders}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <div className="text-lg font-medium">Loading order data...</div>
                  <div className="text-sm">Please wait while we fetch the latest order statistics</div>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Recent Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Customers</CardTitle>
          <CardDescription>Latest customer activity and reward status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentCustomers.map((customer, index) => {
              return (
                <div
                  key={startIndex + index}
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
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
