"use client"

export const dynamic = "force-dynamic";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getApiUrl } from "@/lib/config";
import {
    Activity,
    BarChart3,
    ChevronDown,
    ChevronUp,
    Coffee,
    DollarSign,
    Filter,
    RefreshCw,
    Search,
    TrendingUp,
    Users,
    X,
    Gift,
    ArrowUpRight,
    Download
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Line, LineChart } from "recharts";
import { toast } from "@/components/ui/use-toast";

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
  
  // Drinks scroll container - no pagination needed

  const fetchEarningsData = useCallback(async () => {
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
      // Failed to fetch earnings data
      toast({
        title: "Error",
        description: "Failed to fetch earnings data",
        variant: "destructive",
      })
    } finally {
      setLoading(false);
    }
  }, [timeFilter]);

  useEffect(() => {
    fetchEarningsData();
  }, [fetchEarningsData]);

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

  // Drinks data - show all drinks in scrollable container
  const allDrinks = earningsData?.topDrinks || [];

  // Export filtered transactions to CSV
  const exportToCSV = () => {
    const filteredData = getFilteredTransactions();
    
    if (filteredData.length === 0) {
      alert('No data to export');
      return;
    }

    // Define CSV headers
    const headers = [
      'Transaction ID',
      'Customer Name',
      'Customer Phone',
      'Item Name',
      'Drink Type',
      'Price (₹)',
      'Date',
      'Transaction Type'
    ];

    // Convert data to CSV format
    const csvContent = [
      headers.join(','),
      ...filteredData.map(transaction => [
        transaction._id,
        `"${transaction.customerName}"`,
        transaction.customerPhone,
        `"${transaction.itemName}"`,
        `"${transaction.drinkType}"`,
        transaction.price,
        transaction.date,
        transaction.isReward ? 'Reward' : 'Purchase'
      ].join(','))
    ].join('\n');

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Modern Header */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                    Earnings Dashboard
                  </h1>
                  <p className="text-slate-600 text-lg mt-1">Comprehensive revenue analytics and insights</p>
                </div>
              </div>
            </div>
            
            {/* Enhanced Time Filter */}
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="flex items-center gap-2 bg-slate-100 rounded-2xl p-1">
                <Select 
                  value={timeFilter.period} 
                  onValueChange={(value) => setTimeFilter(prev => ({ ...prev, period: value as "today" | "week" | "month" | "year" | "all" }))}
                >
                  <SelectTrigger className="w-48 h-12 border-0 bg-transparent focus:ring-0">
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
              </div>
              <Button 
                variant="outline" 
                size="lg"
                onClick={fetchEarningsData}
                className="shrink-0 h-12 px-6 bg-white hover:bg-slate-50 border-slate-200"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Modern Overview Cards */}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-emerald-500 to-teal-600 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-teal-700/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6" />
                </div>
                <ArrowUpRight className="h-5 w-5 opacity-60" />
              </div>
              <div>
                <p className="text-emerald-100 text-sm font-medium mb-2">Total Earnings</p>
                <p className="text-3xl lg:text-4xl font-bold mb-1">
                  {formatCurrency(earningsData.totalEarnings)}
                </p>
                <p className="text-emerald-100 text-sm">
                  {getPeriodLabel(timeFilter.period)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-500 to-indigo-600 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-700/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Activity className="h-6 w-6" />
                </div>
                <ArrowUpRight className="h-5 w-5 opacity-60" />
              </div>
              <div>
                <p className="text-blue-100 text-sm font-medium mb-2">Total Orders</p>
                <p className="text-3xl lg:text-4xl font-bold mb-1">
                  {formatNumber(earningsData.totalOrders)}
                </p>
                <p className="text-blue-100 text-sm">
                  Orders placed
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-500 to-violet-600 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-violet-700/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <ArrowUpRight className="h-5 w-5 opacity-60" />
              </div>
              <div>
                <p className="text-purple-100 text-sm font-medium mb-2">Average Order</p>
                <p className="text-3xl lg:text-4xl font-bold mb-1">
                  {formatCurrency(earningsData.averageOrderValue)}
                </p>
                <p className="text-purple-100 text-sm">
                  Per order
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-orange-500 to-amber-600 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-amber-700/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
                <ArrowUpRight className="h-5 w-5 opacity-60" />
              </div>
              <div>
                <p className="text-orange-100 text-sm font-medium mb-2">Top Customers</p>
                <p className="text-3xl lg:text-4xl font-bold mb-1">
                  {earningsData.topCustomers.length}
                </p>
                <p className="text-orange-100 text-sm">
                  High-value customers
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modern Analytics Tabs */}
        <Card className="shadow-lg border-0 rounded-3xl overflow-hidden bg-white">
          <Tabs defaultValue="overview" className="w-full">
            <CardHeader className="pb-0 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h2>
                  <p className="text-slate-600">Detailed insights and performance metrics</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white border-slate-200 hover:bg-slate-50"
                  onClick={exportToCSV}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto p-1 bg-white rounded-2xl shadow-sm border border-slate-200">
                <TabsTrigger value="overview" className="text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white rounded-xl transition-all">Overview</TabsTrigger>
                <TabsTrigger value="customers" className="text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-xl transition-all">Customers</TabsTrigger>
                <TabsTrigger value="drinks" className="text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-600 data-[state=active]:text-white rounded-xl transition-all">Drinks</TabsTrigger>
                <TabsTrigger value="trends" className="text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white rounded-xl transition-all">Trends</TabsTrigger>
                <TabsTrigger value="transactions" className="text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-500 data-[state=active]:to-gray-600 data-[state=active]:text-white rounded-xl transition-all">Transactions</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="p-8">
              <TabsContent value="overview" className="space-y-8 m-10">
                {/* Charts Section */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <Card className="border-0 shadow-lg rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100">
                    <CardHeader className="pb-6">
                      <CardTitle className="flex items-center gap-3 text-xl text-slate-900">
                        <BarChart3 className="h-6 w-6 text-emerald-600" />
                        Revenue Trends
                      </CardTitle>
                      <CardDescription className="text-slate-600">
                        Monthly earnings performance
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={earningsData.monthlyEarnings.slice(0, 6)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis 
                              dataKey="month" 
                              tick={{ fontSize: 12, fill: '#64748b' }}
                              tickLine={false}
                            />
                            <YAxis 
                              tick={{ fontSize: 12, fill: '#64748b' }}
                              tickLine={false}
                              axisLine={false}
                              tickFormatter={(value) => `₹${value}`}
                            />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                              }}
                              formatter={(value: number) => [`₹${value}`, 'Earnings']}
                            />
                            <Bar 
                              dataKey="earnings" 
                              fill="url(#colorGradient)"
                              radius={[4, 4, 0, 0]}
                            />
                            <defs>
                              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" />
                                <stop offset="100%" stopColor="#059669" />
                              </linearGradient>
                            </defs>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100">
                    <CardHeader className="pb-6">
                      <CardTitle className="flex items-center gap-3 text-xl text-slate-900">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                        Daily Performance
                      </CardTitle>
                      <CardDescription className="text-slate-600">
                        Last 7 days earnings trend
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={earningsData.dailyEarnings.slice(0, 7)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 12, fill: '#64748b' }}
                              tickLine={false}
                            />
                            <YAxis 
                              tick={{ fontSize: 12, fill: '#64748b' }}
                              tickLine={false}
                              axisLine={false}
                              tickFormatter={(value) => `₹${value}`}
                            />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                              }}
                              formatter={(value: number) => [`₹${value}`, 'Earnings']}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="earnings" 
                              stroke="url(#lineGradient)"
                              strokeWidth={3}
                              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                            />
                            <defs>
                              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#1d4ed8" />
                              </linearGradient>
                            </defs>
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="customers" className="space-y-8">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                  {/* Top Customers Table */}
                  <Card className="border-0 shadow-lg rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100">
                    <CardHeader className="pb-6">
                      <CardTitle className="flex items-center gap-3 text-xl text-slate-900">
                        <Users className="h-6 w-6 text-emerald-600" />
                        Top Customers
                      </CardTitle>
                      <CardDescription className="text-slate-600">
                        Customers who have spent the most money
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {earningsData.topCustomers.map((customer, index) => (
                          <div key={customer.phone} className="flex items-center justify-between p-4 bg-white rounded-2xl hover:shadow-md transition-all duration-200 border border-slate-100">
                            <div className="flex items-center gap-4">
                              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center ${
                                index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                                index === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500' :
                                index === 2 ? 'bg-gradient-to-br from-amber-600 to-orange-600' :
                                'bg-gradient-to-br from-blue-500 to-indigo-600'
                              }`}>
                                <span className="text-white font-bold text-xs sm:text-sm">
                                  {index + 1}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 text-sm sm:text-base">{customer.name}</p>
                                <p className="text-slate-500 text-xs sm:text-sm">{customer.phone}</p>
                                <p className="text-xs sm:text-sm text-emerald-600 font-medium">{customer.orderCount} orders</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg sm:text-xl font-bold text-emerald-600">
                                {formatCurrency(customer.totalSpent)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="drinks" className="space-y-8">
                <Card className="border-0 shadow-lg rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-3 text-xl text-slate-900">
                      <Coffee className="h-6 w-6 text-purple-600" />
                      Top Performing Drinks
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      Drinks that generate the most revenue
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
                      {allDrinks.map((drink, index) => (
                        <div key={drink.name} className="flex items-center justify-between p-5 bg-white rounded-2xl hover:shadow-md transition-all duration-200 border border-slate-100">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center ${
                              index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                              index === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500' :
                              index === 2 ? 'bg-gradient-to-br from-amber-600 to-orange-600' :
                              'bg-gradient-to-br from-purple-500 to-violet-600'
                            }`}>
                              <span className="text-white font-bold text-base sm:text-lg">
                                {index + 1}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 text-base sm:text-lg">{drink.name}</p>
                              <Badge variant="secondary" className="text-xs sm:text-sm mt-1 bg-purple-100 text-purple-700 border-purple-200">
                                {drink.category}
                              </Badge>
                              <p className="text-xs sm:text-sm text-slate-500 mt-1">{drink.totalSold} sold</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg sm:text-2xl font-bold text-purple-600">
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
                        {earningsData.yearlyEarnings.map((year) => (
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

              <TabsContent value="transactions" className="space-y-8">
                <Card className="border-0 shadow-lg rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100">
                  <CardHeader>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                      <div>
                        <CardTitle className="flex items-center gap-3 text-2xl text-slate-900">
                          <Activity className="h-7 w-7 text-emerald-600" />
                          Transaction History
                        </CardTitle>
                        <CardDescription className="text-slate-600 text-lg">
                          Complete list of all transactions. Showing {filteredTransactions.length} of {earningsData.transactions.length} transactions.
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-3">
                        {hasActiveFilters() && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={clearTransactionFilters}
                            className="shrink-0 bg-white border-slate-200 hover:bg-slate-50"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Clear Filters
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowFilters(!showFilters)}
                          className="shrink-0 bg-white border-slate-200 hover:bg-slate-50"
                        >
                          <Filter className="h-4 w-4 mr-2" />
                          {showFilters ? 'Hide' : 'Show'} Filters
                          {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Enhanced Transaction Filters */}
                    {showFilters && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 p-6 bg-white rounded-2xl border border-slate-200">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                          <Input
                            placeholder="Search transactions..."
                            value={transactionSearch}
                            onChange={(e) => setTransactionSearch(e.target.value)}
                            className="pl-10 h-12 border-slate-200 focus:border-emerald-500"
                          />
                        </div>

                        <Select value={transactionType} onValueChange={setTransactionType}>
                          <SelectTrigger className="h-12 border-slate-200 focus:border-emerald-500">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="paid">Paid Orders</SelectItem>
                            <SelectItem value="reward">Rewards</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select value={transactionCategory} onValueChange={setTransactionCategory}>
                          <SelectTrigger className="h-12 border-slate-200 focus:border-emerald-500">
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
                          <SelectTrigger className="h-12 border-slate-200 focus:border-emerald-500">
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

                    {/* Mobile-Responsive Transactions Table with Scroll */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                      {/* Desktop Table */}
                      <div className="hidden md:block">
                        <div className="max-h-96 overflow-y-auto">
                          <Table>
                            <TableHeader className="bg-slate-50 sticky top-0 z-10">
                              <TableRow>
                                <TableHead className="text-slate-700 font-semibold bg-slate-50">Customer</TableHead>
                                <TableHead className="text-slate-700 font-semibold bg-slate-50">Item</TableHead>
                                <TableHead className="text-slate-700 font-semibold bg-slate-50">Category</TableHead>
                                <TableHead className="text-slate-700 font-semibold bg-slate-50">Type</TableHead>
                                <TableHead className="text-slate-700 font-semibold bg-slate-50">Date</TableHead>
                                <TableHead className="text-slate-700 font-semibold text-right bg-slate-50">Amount</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredTransactions.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={6} className="text-center py-16">
                                    <div className="text-slate-500">
                                      <Activity className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                                      <p className="text-lg">No transactions found matching your filters.</p>
                                      {hasActiveFilters() && (
                                        <Button 
                                          variant="outline" 
                                          onClick={clearTransactionFilters}
                                          className="mt-4 bg-white border-slate-200"
                                        >
                                          Clear all filters
                                        </Button>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ) : (
                                filteredTransactions.map((transaction) => (
                                  <TableRow key={transaction._id} className="hover:bg-slate-50 transition-colors">
                                    <TableCell>
                                      <div>
                                        <p className="font-semibold text-slate-900">{transaction.customerName}</p>
                                        <p className="text-slate-500 text-sm">{transaction.customerPhone}</p>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <p className="font-medium text-slate-900">{transaction.itemName}</p>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
                                        {transaction.drinkType}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      {transaction.isReward ? (
                                        <Badge className="bg-green-100 text-green-700 border-green-200">
                                          <Gift className="h-3 w-3 mr-1" />
                                          Reward
                                        </Badge>
                                      ) : (
                                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                          Paid
                                        </Badge>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <p className="text-slate-600">{transaction.date}</p>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <p className={`font-bold text-lg ${
                                        transaction.isReward ? 'text-green-600' : 'text-emerald-600'
                                      }`}>
                                        {transaction.isReward ? 'FREE' : formatCurrency(transaction.price)}
                                      </p>
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>

                      {/* Mobile Cards */}
                      <div className="md:hidden">
                        {filteredTransactions.length === 0 ? (
                          <div className="text-center py-16">
                            <div className="text-slate-500">
                              <Activity className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                              <p className="text-lg">No transactions found matching your filters.</p>
                              {hasActiveFilters() && (
                                <Button 
                                  variant="outline" 
                                  onClick={clearTransactionFilters}
                                  className="mt-4 bg-white border-slate-200"
                                >
                                  Clear all filters
                                </Button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="max-h-96 overflow-y-auto p-4">
                            <div className="space-y-3">
                              {filteredTransactions.map((transaction) => (
                                <div key={transaction._id} className="bg-slate-50 rounded-xl p-4 space-y-3">
                                  {/* Customer Info */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-slate-900 text-sm truncate">{transaction.customerName}</p>
                                      <p className="text-slate-500 text-xs">{transaction.customerPhone}</p>
                                    </div>
                                    <div className="ml-2">
                                      {transaction.isReward ? (
                                        <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                                          <Gift className="h-2 w-2 mr-1" />
                                          FREE
                                        </Badge>
                                      ) : (
                                        <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                                          Paid
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  {/* Item Info */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-slate-900 text-sm truncate">{transaction.itemName}</p>
                                      <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 text-xs mt-1">
                                        {transaction.drinkType}
                                      </Badge>
                                    </div>
                                    <div className="ml-2 text-right">
                                      <p className={`font-bold text-base ${
                                        transaction.isReward ? 'text-green-600' : 'text-emerald-600'
                                      }`}>
                                        {transaction.isReward ? 'FREE' : formatCurrency(transaction.price)}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Date */}
                                  <div className="text-xs text-slate-500 border-t border-slate-200 pt-2">
                                    {transaction.date}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
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