"use client";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Coffee, Users, TrendingUp, Gift, Target, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getApiUrl } from "@/lib/config"

export default function HomePage() {
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalDrinksSold: 0,
    upcomingRewards: 0,
    rewardsEarned: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl('api/dashboard/stats'));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setStats({
        totalCustomers: data.totalCustomers || 0,
        totalDrinksSold: data.totalDrinksSold || 0,
        upcomingRewards: data.upcomingRewards || 0,
        rewardsEarned: data.rewardsEarned || 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      // Set default values if API fails
      setStats({
        totalCustomers: 3,
        totalDrinksSold: 66,
        upcomingRewards: 0,
        rewardsEarned: 9,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShowStats = () => {
    if (!showStats) {
      fetchStats();
    }
    setShowStats(!showStats);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900">
            Welcome to JaniFruitful
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your one-stop destination for delicious drinks and amazing rewards
          </p>
        </div>

        {/* Show Stats Button */}
        <div className="flex justify-center">
          <Button 
            onClick={handleShowStats}
            variant="outline"
            className="px-6 py-2 text-sm font-medium"
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
            ) : null}
            {showStats ? 'Hide Stats' : 'Show Stats'}
          </Button>
        </div>

        {/* Stats Cards */}
        {showStats && (
          <div className="w-full max-w-2xl mx-auto">
            <div className="grid gap-2 grid-cols-2">
              <Card className="hover:shadow-md transition-all duration-200 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">Total Customers</span>
                  <Users className="h-3 w-3 text-muted-foreground" />
                </div>
                <div className="text-base font-bold text-emerald-600">{stats.totalCustomers}</div>
                <p className="text-xs text-muted-foreground">Active customer base</p>
              </Card>

              <Card className="hover:shadow-md transition-all duration-200 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">Total Drinks Sold</span>
                  <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                </div>
                <div className="text-base font-bold text-emerald-600">{stats.totalDrinksSold}</div>
                <p className="text-xs text-muted-foreground">All-time sales</p>
              </Card>

              <Card className="hover:shadow-md transition-all duration-200 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">Upcoming Rewards</span>
                  <TrendingUp className="h-3 w-3 text-muted-foreground" />
                </div>
                <div className="text-base font-bold text-orange-600">{stats.upcomingRewards}</div>
                <p className="text-xs text-muted-foreground">Customers close to rewards</p>
              </Card>

              <Card className="hover:shadow-md transition-all duration-200 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">Rewards Earned</span>
                  <Gift className="h-3 w-3 text-muted-foreground" />
                </div>
                <div className="text-base font-bold text-purple-600">{stats.rewardsEarned}</div>
                <p className="text-xs text-muted-foreground">Free drinks given</p>
              </Card>
            </div>
          </div>
        )}

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
          {/* Customer Card */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 shadow-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Coffee className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl">Customer Portal</CardTitle>
              <CardDescription className="text-lg">
                View our menu, check your rewards status, and see your order history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/customer">
                <Button className="w-full h-12 text-lg font-semibold">
                  View Menu & Rewards
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Rewards Program</h3>
            <p className="text-sm text-gray-600">Every 5 drinks = 1 FREE drink</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Premium Quality</h3>
            <p className="text-sm text-gray-600">Fresh ingredients, great taste</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Easy Tracking</h3>
            <p className="text-sm text-gray-600">Check your rewards anytime</p>
          </div>
        </div>
      </div>
    </div>
  )
}
