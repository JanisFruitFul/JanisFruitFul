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
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiUrl } from "@/lib/config";
import { generatePagination } from "@/lib/utils"
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

interface CustomerData {
  name?: string;
  phone?: string;
  totalOrders?: number;
  drinksUntilReward?: number;
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
  const [showCalendar, setShowCalendar] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [calendarLoading, setCalendarLoading] = useState(false)
  const [activeChart, setActiveChart] = useState<"earnings" | "orders">("earnings")
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



  const fetchStats = async () => {
    try {
      const response = await fetch(getApiUrl('api/dashboard/stats'))
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      
      // Ensure recentCustomers have the required fields
      const processedData = {
        ...data,
        recentCustomers: data.recentCustomers?.map((customer: CustomerData) => ({
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
      const response = await fetch(getApiUrl('api/earnings?period=month'))
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      
      // Use the same data as the calendar
      const chartData = data.dailyEarnings || []
      setDailyChartData(chartData)
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
    const message = `Hey ${customer.name}! 🎉
You're SO close to unlocking your FREE drink reward! 🥤✨
Your loyalty streak is amazing and we can't wait to give you your well-deserved treat! 
Come visit us soon and claim your free drink - you've earned it! 🎁💫
See you at Jani's Fruitful! 😊`
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

  // Chart configuration for interactive bar chart
  const chartConfig = {
    earnings: {
      label: "Earnings",
      color: "var(--chart-1)",
    },
    orders: {
      label: "Orders",
      color: "var(--chart-2)",
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
                {dailyEarnings.slice(0, 12).map((day) => (
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
        <Card className="py-0">
          <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
            <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
              <CardTitle>Weekly Earnings Chart</CardTitle>
              <CardDescription>
                Interactive chart showing daily earnings and orders
              </CardDescription>
            </div>
            <div className="flex">
              {["earnings", "orders"].map((key) => {
                const chart = key as "earnings" | "orders"
                const total = dailyChartData.reduce((acc, curr) => acc + curr[chart], 0)
                return (
                  <button
                    key={chart}
                    data-active={activeChart === chart}
                    className={`relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6 transition-all duration-200 ${
                      activeChart === chart 
                        ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveChart(chart)}
                  >
                    <span className="text-muted-foreground text-xs">
                      {chartConfig[chart].label}
                    </span>
                    <span className="text-lg leading-none font-bold sm:text-3xl">
                      {chart === "earnings" 
                        ? `₹${total.toLocaleString()}`
                        : total.toLocaleString()
                      }
                    </span>
                  </button>
                )
              })}
            </div>
          </CardHeader>
          <CardContent className="px-2 sm:p-6">
            {dailyChartData.length > 0 ? (
              <ChartContainer
                config={chartConfig}
                className="aspect-auto h-[250px] w-full"
              >
                <BarChart
                  accessibilityLayer
                  data={dailyChartData}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        className="w-[150px]"
                        nameKey="earnings"
                        labelFormatter={(value) => {
                          return new Date(value).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        }}
                        formatter={(value, name) => {
                          if (name === "earnings") {
                            return [formatCurrency(Number(value)), "Earnings"]
                          }
                          return [value, "Orders"]
                        }}
                      />
                    }
                  />
                  <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <div className="text-lg font-medium">No earnings data available</div>
                  <div className="text-sm">No earnings data is available for the selected period</div>
                </div>
              </div>
            )}
          </CardContent>
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
                  {generatePagination(currentPage, totalPages).map((page, index) => (
                    <div key={index}>
                      {page === '...' ? (
                        <span className="px-2 py-1 text-sm text-muted-foreground">...</span>
                      ) : (
                        <Button
                          variant={currentPage === page ? "outline" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page as number)}
                          className={`w-8 h-8 p-0 ${
                            currentPage === page 
                              ? 'bg-green-600 text-white border-green-600 hover:bg-green-700 hover:border-green-700' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </Button>
                      )}
                    </div>
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
