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
import { Skeleton } from "@/components/ui/skeleton";
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
  Calendar,
  Activity,
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
  orders: number
  earnings: number
}

interface DailyEarnings {
  date: string;
  earnings: number;
  orders: number;
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
  const [dailyEarnings, setDailyEarnings] = useState<DailyEarnings[]>([])
  const [showStats, setShowStats] = useState(true)
  const [showChart, setShowChart] = useState(true)
  const [showCalendar, setShowCalendar] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [calendarLoading, setCalendarLoading] = useState(false)
  const customersPerPage = 3

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([
          fetchStats(),
          fetchProfileData(),
          fetchChartData(),
          fetchDailyEarnings()
        ])
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
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
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
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
      // Show real empty state instead of fallback data
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
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setProfileData(data)
    } catch (error) {
      console.error("Failed to fetch profile data:", error)
      // Don't set any fallback data - let it remain null
    }
  }

  const fetchChartData = async () => {
    try {
      const response = await fetch(getApiUrl('api/dashboard/chart-data'))
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('Chart data received:', data)
      
      // Ensure we have real data, not empty array
      if (Array.isArray(data) && data.length > 0) {
        setDailyChartData(data)
      } else {
        // If no real data, show empty state instead of mock data
        setDailyChartData([])
      }
    } catch (error) {
      console.error("Failed to fetch chart data:", error)
      // Don't set fallback data - show empty state instead
      setDailyChartData([])
    }
  }

  const fetchDailyEarnings = async () => {
    try {
      setCalendarLoading(true);
      const response = await fetch(getApiUrl('api/earnings?period=month'));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setDailyEarnings(data.dailyEarnings || []);
    } catch (error) {
      console.error("Failed to fetch daily earnings:", error);
      // Set default sample data if API fails
      setDailyEarnings([
        { date: "2024-01-15", earnings: 2500, orders: 12 },
        { date: "2024-01-16", earnings: 3200, orders: 15 },
        { date: "2024-01-17", earnings: 1800, orders: 8 },
        { date: "2024-01-18", earnings: 4100, orders: 20 },
        { date: "2024-01-19", earnings: 2900, orders: 14 },
        { date: "2024-01-20", earnings: 3600, orders: 18 },
        { date: "2024-01-21", earnings: 2200, orders: 11 },
      ]);
    } finally {
      setCalendarLoading(false);
    }
  };

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  // Chart configuration
  const chartConfig = {
    orders: {
      label: "Orders",
      color: "hsl(var(--chart-1))",
    },
    earnings: {
      label: "Earnings (₹)",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {isLoading && (
        <div className="space-y-6 ">
          {/* Stats Cards Skeleton */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4 ">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="bg-gray-100">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 ">
                  <Skeleton className="h-4 w-24 bg-gray-200" />
                  <Skeleton className="h-4 w-4 rounded-full bg-gray-200" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20 mb-2 bg-gray-200" />
                  <Skeleton className="h-3 w-32 bg-gray-200" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Calendar Skeleton */}
          <Card className="shadow-lg border-0 bg-gray-100">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-6 rounded bg-gray-200" />
                  <Skeleton className="h-8 w-48 bg-gray-200" />
                </div>
                <Skeleton className="h-10 w-32 bg-gray-200" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[...Array(9)].map((_, index) => (
                  <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 bg-gray-100">
                    <div className="text-center space-y-3">
                      <Skeleton className="h-8 w-20 mx-auto bg-gray-200" />
                      <Skeleton className="h-6 w-16 mx-auto bg-gray-200" />
                      <Skeleton className="h-4 w-12 mx-auto bg-gray-200" />
                      <Skeleton className="h-2 w-full bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chart Skeleton */}
          <Card className="bg-gray-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-6 w-48 mb-2 bg-gray-200" />
                  <Skeleton className="h-4 w-64 bg-gray-200" />
                </div>
                <Skeleton className="h-10 w-24 bg-gray-200" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-64 w-full bg-gray-200" />
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full bg-gray-200" />
                  <Skeleton className="h-32 w-full bg-gray-200" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customers Skeleton */}
          <Card className="bg-gray-100">
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2 bg-gray-200" />
              <Skeleton className="h-4 w-48 bg-gray-200" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-gray-100">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32 bg-gray-200" />
                      <Skeleton className="h-3 w-24 bg-gray-200" />
                      <Skeleton className="h-3 w-28 bg-gray-200" />
                    </div>
                    <Skeleton className="h-8 w-20 bg-gray-200" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Stats Cards Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Stats</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setIsLoading(true)
              Promise.all([
                fetchStats(),
                fetchProfileData(),
                fetchChartData(),
                fetchDailyEarnings()
              ]).finally(() => setIsLoading(false))
            }}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            {isLoading ? "Refreshing..." : "Refresh Data"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2"
          >
            {showStats ? "Hide Stats" : "Show Stats"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {!isLoading && showStats && (
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

      {/* Weekly Earnings Calendar */}
      {!isLoading && (
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Calendar className="h-6 w-6 text-emerald-600" />
                Weekly Earnings Calendar
              </CardTitle>
              <Button
                variant="outline"
                onClick={() => setShowCalendar(!showCalendar)}
                className="flex items-center gap-2"
              >
                {showCalendar ? "Hide Calendar" : "Show Calendar"}
              </Button>
            </div>
          </CardHeader>
          {showCalendar && (
          <CardContent>
            {calendarLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Loading calendar data...</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {dailyEarnings.slice(0, 12).map((day, index) => (
                  <div 
                    key={day.date} 
                    className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:scale-105"
                  >
                    <div className="text-center space-y-3">
                      {/* Date */}
                      <div className="bg-emerald-100 rounded-lg p-2">
                        <p className="text-sm font-semibold text-emerald-800">
                          {formatDate(day.date)}
                        </p>
                      </div>
                      
                      {/* Earnings */}
                      <div className="flex items-center justify-center gap-2">
                        <p className="text-lg font-bold text-green-700">
                          {formatCurrency(day.earnings)}
                        </p>
                      </div>
                      
                      {/* Orders */}
                      <div className="flex items-center justify-center gap-2">
                        <Activity className="h-4 w-4 text-blue-600" />
                        <p className="text-sm font-medium text-blue-700">
                          {day.orders} orders
                        </p>
                      </div>
                      
                      {/* Performance indicator */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-emerald-400 to-teal-500 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min((day.earnings / Math.max(...dailyEarnings.map(d => d.earnings))) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!calendarLoading && dailyEarnings.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No daily earnings data available.</p>
              </div>
            )}
          </CardContent>
          )}
        </Card>
      )}

      {/* Stats Chart */}
      {!isLoading && (
        <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Last 4 Days Performance</CardTitle>
              <CardDescription>Daily orders and earnings for the past 4 days</CardDescription>
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
                      dataKey="orders"
                      fill="hsl(var(--chart-1))"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="earnings"
                      fill="hsl(var(--chart-2))"
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
                        <span className="text-sm text-gray-600">Total Orders:</span>
                        <span className="font-medium">{dailyChartData.reduce((sum, day) => sum + day.orders, 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Earnings:</span>
                        <span className="font-medium">₹{dailyChartData.reduce((sum, day) => sum + day.earnings, 0).toLocaleString()}</span>
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
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Orders: {day.orders}</span>
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded">₹{day.earnings}</span>
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
                  <div className="text-lg font-medium">No order data available</div>
                  <div className="text-sm">No orders have been placed in the last 4 days</div>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
      )}

      {/* Recent Customers */}
      {!isLoading && (
        <Card>
        <CardHeader>
          <CardTitle>Recent Customers</CardTitle>
          <CardDescription>Latest customer activity and reward status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentCustomers.length > 0 ? (
              currentCustomers.map((customer, index) => {
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
              })
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <div className="text-center">
                  <div className="text-lg font-medium">No customers yet</div>
                  <div className="text-sm">Start adding customers to see their activity here</div>
                </div>
              </div>
            )}
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
      )}
    </div>
  )
}
