"use client"

export const dynamic = "force-dynamic";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getApiUrl } from "@/lib/config";
import {
    Activity,
    BarChart3,
    Calendar,
    ChevronDown,
    ChevronUp,
    Coffee,
    DollarSign,
    Filter,
    RefreshCw,
    Search,
    TrendingUp,
    Users,
    X
} from "lucide-react";
import { useEffect, useState } from "react";

interface EarningsData {
  totalEarnings: number;
  totalOrders: number;
  averageOrderValue: number;
  topCustomers: Array<{
    name: string;
    phone: string;
    totalSpent: number;
    orderCount: number;
  }>;
  topDrinks: Array<{
    name: string;
    category: string;
    totalSold: number;
    totalRevenue: number;
  }>;
  monthlyEarnings: Array<{
    month: string;
    earnings: number;
    orders: number;
  }>;
  dailyEarnings: Array<{
    date: string;
    earnings: number;
    orders: number;
  }>;
  yearlyEarnings: Array<{
    year: string;
    earnings: number;
    orders: number;
  }>;
  transactions: Array<{
    _id: string;
    customerName: string;
    customerPhone: string;
    itemName: string;
    drinkType: string;
    price: number;
    date: string;
    isReward: boolean;
  }>;
}

interface TimeFilter {
  period: "today" | "week" | "month" | "year" | "all";
  startDate: string;
  endDate: string;
}

export default function EarningsPage() {
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>({
    period: "month",
    startDate: "",
    endDate: ""
  });
  
  // Transaction filters
  const [transactionSearch, setTransactionSearch] = useState("");
  const [transactionType, setTransactionType] = useState<string>("all");
  const [transactionCategory, setTransactionCategory] = useState<string>("all");
  const [transactionSort, setTransactionSort] = useState<string>("date-desc");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchEarningsData();
  }, [timeFilter]);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        period: timeFilter.period,
        ...(timeFilter.startDate && { startDate: timeFilter.startDate }),
        ...(timeFilter.endDate && { endDate: timeFilter.endDate })
      });

      const response = await fetch(getApiUrl(`api/earnings?${params}`));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setEarningsData(data);
    } catch (error) {
      console.error("Failed to fetch earnings data:", error);
      setError(error instanceof Error ? error.message : 'Failed to fetch earnings data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "today": return "Today";
      case "week": return "This Week";
      case "month": return "This Month";
      case "year": return "This Year";
      case "all": return "All Time";
      default: return period;
    }
  };

  // Filter and sort transactions
  const getFilteredTransactions = () => {
    if (!earningsData?.transactions) return [];
    
    let filtered = [...earningsData.transactions];
    
    // Search filter
    if (transactionSearch.trim()) {
      const searchLower = transactionSearch.toLowerCase();
      filtered = filtered.filter(t => 
        t.customerName.toLowerCase().includes(searchLower) ||
        t.customerPhone.includes(searchLower) ||
        t.itemName.toLowerCase().includes(searchLower) ||
        t.drinkType.toLowerCase().includes(searchLower)
      );
    }
    
    // Type filter
    if (transactionType !== "all") {
      filtered = filtered.filter(t => 
        transactionType === "paid" ? !t.isReward : t.isReward
      );
    }
    
    // Category filter
    if (transactionCategory !== "all") {
      filtered = filtered.filter(t => t.drinkType === transactionCategory);
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (transactionSort) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "price-desc":
          return b.price - a.price;
        case "price-asc":
          return a.price - b.price;
        case "name-asc":
          return a.customerName.localeCompare(b.customerName);
        case "name-desc":
          return b.customerName.localeCompare(a.customerName);
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const clearTransactionFilters = () => {
    setTransactionSearch("");
    setTransactionType("all");
    setTransactionCategory("all");
    setTransactionSort("date-desc");
  };

  const hasActiveFilters = () => {
    return transactionSearch.trim() || transactionType !== "all" || transactionCategory !== "all";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mx-auto"></div>
            <p className="text-gray-600 mt-4 text-lg">Loading earnings data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="text-red-600 text-2xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Earnings</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <Button 
                  onClick={fetchEarningsData}
                  variant="outline"
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!earningsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No earnings data available.</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredTransactions = getFilteredTransactions();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Earnings Analytics</h1>
              <p className="text-gray-600 text-lg">Track your revenue and performance metrics</p>
            </div>
            
            {/* Time Filter */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <Select 
                value={timeFilter.period} 
                onValueChange={(value) => setTimeFilter(prev => ({ ...prev, period: value as any }))}
              >
                <SelectTrigger className="w-full lg:w-48 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="lg"
                onClick={fetchEarningsData}
                className="shrink-0 h-12 px-4"
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-800 mb-2">Total Earnings</p>
                  <p className="text-3xl lg:text-4xl font-bold text-green-700 mb-1">
                    {formatCurrency(earningsData.totalEarnings)}
                  </p>
                  <p className="text-sm text-green-600">
                    {getPeriodLabel(timeFilter.period)}
                  </p>
                </div>
                <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center">
                  <DollarSign className="h-7 w-7 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-800 mb-2">Total Orders</p>
                  <p className="text-3xl lg:text-4xl font-bold text-blue-700 mb-1">
                    {formatNumber(earningsData.totalOrders)}
                  </p>
                  <p className="text-sm text-blue-600">
                    Orders placed
                  </p>
                </div>
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Activity className="h-7 w-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50 border-purple-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-purple-800 mb-2">Average Order</p>
                  <p className="text-3xl lg:text-4xl font-bold text-purple-700 mb-1">
                    {formatCurrency(earningsData.averageOrderValue)}
                  </p>
                  <p className="text-sm text-purple-600">
                    Per order
                  </p>
                </div>
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="h-7 w-7 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-orange-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-orange-800 mb-2">Top Customers</p>
                  <p className="text-3xl lg:text-4xl font-bold text-orange-700 mb-1">
                    {earningsData.topCustomers.length}
                  </p>
                  <p className="text-sm text-orange-600">
                    High-value customers
                  </p>
                </div>
                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center">
                  <Users className="h-7 w-7 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics Tabs */}
        <Card className="shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
          <Tabs defaultValue="overview" className="w-full">
            <CardHeader className="pb-0 bg-gray-50">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto p-2 bg-white rounded-xl shadow-sm">
                <TabsTrigger value="overview" className="text-sm font-medium data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">Overview</TabsTrigger>
                <TabsTrigger value="customers" className="text-sm font-medium data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">Customers</TabsTrigger>
                <TabsTrigger value="drinks" className="text-sm font-medium data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">Drinks</TabsTrigger>
                <TabsTrigger value="trends" className="text-sm font-medium data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">Trends</TabsTrigger>
                <TabsTrigger value="transactions" className="text-sm font-medium data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700">Transactions</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="p-6">
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <Card className="border border-gray-200 rounded-xl shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <Calendar className="h-6 w-6 text-emerald-600" />
                        Monthly Earnings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {earningsData.monthlyEarnings.slice(0, 6).map((month, index) => (
                          <div key={month.month} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <div>
                              <p className="font-semibold text-gray-900 text-lg">{month.month}</p>
                              <p className="text-sm text-gray-500">{month.orders} orders</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600 text-lg">
                                {formatCurrency(month.earnings)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200 rounded-xl shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                        Daily Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {earningsData.dailyEarnings.slice(0, 7).map((day, index) => (
                          <div key={day.date} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <div>
                              <p className="font-semibold text-gray-900 text-lg">{day.date}</p>
                              <p className="text-sm text-gray-500">{day.orders} orders</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-blue-600 text-lg">
                                {formatCurrency(day.earnings)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="customers" className="space-y-6">
                <Card className="border border-gray-200 rounded-xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <Users className="h-6 w-6 text-emerald-600" />
                      Top Customers by Revenue
                    </CardTitle>
                    <CardDescription className="text-lg">
                      Customers who have spent the most money
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {earningsData.topCustomers.map((customer, index) => (
                        <div key={customer.phone} className="flex items-center justify-between p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                              <span className="text-emerald-600 font-bold text-lg">
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-lg">{customer.name}</p>
                              <p className="text-gray-500">{customer.phone}</p>
                              <p className="text-sm text-emerald-600 font-medium">{customer.orderCount} orders</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">
                              {formatCurrency(customer.totalSpent)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="drinks" className="space-y-6">
                <Card className="border border-gray-200 rounded-xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <Coffee className="h-6 w-6 text-purple-600" />
                      Top Performing Drinks
                    </CardTitle>
                    <CardDescription className="text-lg">
                      Drinks that generate the most revenue
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {earningsData.topDrinks.map((drink, index) => (
                        <div key={drink.name} className="flex items-center justify-between p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                              <span className="text-purple-600 font-bold text-lg">
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-lg">{drink.name}</p>
                              <Badge variant="secondary" className="text-sm mt-1 bg-purple-100 text-purple-700">
                                {drink.category}
                              </Badge>
                              <p className="text-sm text-gray-500 mt-1">{drink.totalSold} sold</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-purple-600">
                              {formatCurrency(drink.totalRevenue)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trends" className="space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <Card className="border border-gray-200 rounded-xl shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <TrendingUp className="h-6 w-6 text-emerald-600" />
                        Yearly Trends
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {earningsData.yearlyEarnings.map((year, index) => (
                          <div key={year.year} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <div>
                              <p className="font-semibold text-gray-900 text-lg">{year.year}</p>
                              <p className="text-sm text-gray-500">{year.orders} orders</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-emerald-600 text-lg">
                                {formatCurrency(year.earnings)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border border-gray-200 rounded-xl shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <Activity className="h-6 w-6 text-blue-600" />
                        Performance Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <span className="text-lg font-medium text-gray-700">Conversion Rate</span>
                          <span className="text-lg font-bold text-green-600">
                            {earningsData.totalOrders > 0 ? 
                              ((earningsData.topCustomers.length / earningsData.totalOrders) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <span className="text-lg font-medium text-gray-700">Revenue per Customer</span>
                          <span className="text-lg font-bold text-blue-600">
                            {earningsData.topCustomers.length > 0 ? 
                              formatCurrency(earningsData.totalEarnings / earningsData.topCustomers.length) : 
                              formatCurrency(0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <span className="text-lg font-medium text-gray-700">Best Day</span>
                          <span className="text-lg font-bold text-purple-600">
                            {earningsData.dailyEarnings.length > 0 ? 
                              earningsData.dailyEarnings[0].date : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="transactions" className="space-y-6">
                <Card className="border border-gray-200 rounded-xl shadow-sm">
                  <CardHeader>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-3 text-xl">
                          <Activity className="h-6 w-6 text-emerald-600" />
                          All Transactions
                        </CardTitle>
                        <CardDescription className="text-lg">
                          Complete list of all transactions. Showing {filteredTransactions.length} of {earningsData.transactions.length} transactions.
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-3">
                        {hasActiveFilters() && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={clearTransactionFilters}
                            className="shrink-0"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Clear Filters
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowFilters(!showFilters)}
                          className="shrink-0"
                        >
                          <Filter className="h-4 w-4 mr-2" />
                          {showFilters ? 'Hide' : 'Show'} Filters
                          {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Transaction Filters */}
                    {showFilters && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <Input
                            placeholder="Search transactions..."
                            value={transactionSearch}
                            onChange={(e) => setTransactionSearch(e.target.value)}
                            className="pl-10 h-12"
                          />
                        </div>

                        <Select value={transactionType} onValueChange={setTransactionType}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="paid">Paid Orders</SelectItem>
                            <SelectItem value="reward">Rewards</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={transactionCategory} onValueChange={setTransactionCategory}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="Mojito">Mojito</SelectItem>
                            <SelectItem value="Ice Cream">Ice Cream</SelectItem>
                            <SelectItem value="Milkshake">Milkshake</SelectItem>
                            <SelectItem value="Waffle">Waffle</SelectItem>
                            <SelectItem value="Reward">Reward</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={transactionSort} onValueChange={setTransactionSort}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="date-desc">Date (Newest)</SelectItem>
                            <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                            <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                            <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Transactions List */}
                    <div className="space-y-3">
                      {filteredTransactions.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                          <Activity className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg">No transactions found matching your filters.</p>
                          {hasActiveFilters() && (
                            <Button 
                              variant="outline" 
                              onClick={clearTransactionFilters}
                              className="mt-4"
                            >
                              Clear all filters
                            </Button>
                          )}
                        </div>
                      ) : (
                        filteredTransactions.map((transaction, index) => (
                          <div 
                            key={transaction._id} 
                            className={`flex flex-col lg:flex-row items-start lg:items-center justify-between p-5 border rounded-xl transition-all duration-200 hover:shadow-lg gap-4 ${
                              transaction.isReward ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                                transaction.isReward ? 'bg-green-100' : 'bg-blue-100'
                              }`}>
                                <span className={`font-bold text-lg ${
                                  transaction.isReward ? 'text-green-600' : 'text-blue-600'
                                }`}>
                                  {index + 1}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <p className="font-semibold text-gray-900 text-lg truncate">{transaction.customerName}</p>
                                  {transaction.isReward && (
                                    <Badge variant="secondary" className="text-sm bg-green-100 text-green-700 shrink-0">
                                      Reward
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-gray-500 mb-2">{transaction.customerPhone}</p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-lg font-medium text-gray-700">{transaction.itemName}</p>
                                  <Badge variant="outline" className="text-sm">
                                    {transaction.drinkType}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className={`text-2xl font-bold ${
                                transaction.isReward ? 'text-green-600' : 'text-blue-600'
                              }`}>
                                {transaction.isReward ? 'FREE' : formatCurrency(transaction.price)}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">{transaction.date}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
} 